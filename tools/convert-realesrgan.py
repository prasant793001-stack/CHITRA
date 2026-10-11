#!/usr/bin/env python3
# Usage: python3 tools/convert-realesrgan.py RealESRGAN_x4plus.pth desktop/models/realesrgan_x4plus.onnx
# Official weights: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth (BSD-3-Clause)
# sha256 of the weights 4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1 -> ONNX 44dbcca6c91af21435e787e768528b44427693fabe54912c30d358db92f2f61d. Needs: pip install onnx numpy
"""Real-ESRGAN x4plus (RRDBNet 23 blocks, 64 feat, 32 grow) .pth -> ONNX, without PyTorch.
Reads the torch zip/pickle checkpoint directly, then writes the same network as an ONNX graph (opset 17)."""
import sys, zipfile, pickle, numpy as np, onnx
from onnx import helper, TensorProto, numpy_helper
src, dst = sys.argv[1:3]
zf = zipfile.ZipFile(src); root = zf.namelist()[0].split('/')[0]
DT = {'FloatStorage': np.float32, 'HalfStorage': np.float16}
class Storage:  # placeholder for a persistent storage reference
    def __init__(s, key, dtype): s.key, s.dtype = key, dtype
def rebuild(storage, offset, size, stride, *a):
    buf = np.frombuffer(zf.read(f'{root}/data/{storage.key}'), dtype=storage.dtype)
    n = int(np.prod(size)) if size else 1
    if not size: return buf[offset:offset + 1].reshape(())
    arr = np.lib.stride_tricks.as_strided(buf[offset:], shape=size, strides=[s * buf.itemsize for s in stride])
    return np.ascontiguousarray(arr).astype(np.float32)
class U(pickle.Unpickler):
    def find_class(s, mod, name):
        if name == '_rebuild_tensor_v2': return rebuild
        if name.endswith('Storage'): return name
        if mod == 'collections' and name == 'OrderedDict': import collections; return collections.OrderedDict
        if name == '_rebuild_parameter': return lambda t, *a: t
        return super().find_class(mod, name)
    def persistent_load(s, pid):  # ('storage', storage_type, key, location, numel)
        _, st, key, *_ = pid; return Storage(key, DT[st if isinstance(st, str) else st.__name__])
sd = U(zf.open(f'{root}/data.pkl')).load()
if 'params_ema' in sd: sd = sd['params_ema']
elif 'params' in sd: sd = sd['params']
nodes, inits, cnt = [], [], [0]
def nm(p): cnt[0] += 1; return f'{p}_{cnt[0]}'
def conv(x, key, act=False):
    w, b = sd[key + '.weight'], sd[key + '.bias']; wn, bn = key + '.weight', key + '.bias'
    inits.extend([numpy_helper.from_array(w, wn), numpy_helper.from_array(b, bn)])
    y = nm('conv'); nodes.append(helper.make_node('Conv', [x, wn, bn], [y], pads=[1, 1, 1, 1], kernel_shape=[3, 3]))
    if act: z = nm('lrelu'); nodes.append(helper.make_node('LeakyRelu', [y], [z], alpha=0.2)); return z
    return y
def cat(xs): y = nm('cat'); nodes.append(helper.make_node('Concat', xs, [y], axis=1)); return y
def add(a, b): y = nm('add'); nodes.append(helper.make_node('Add', [a, b], [y])); return y
inits.append(numpy_helper.from_array(np.array(0.2, np.float32), 'k02'))
def mul02(x): y = nm('mul'); nodes.append(helper.make_node('Mul', [x, 'k02'], [y])); return y
def rdb(x, p):
    x1 = conv(x, p + '.conv1', True); x2 = conv(cat([x, x1]), p + '.conv2', True); x3 = conv(cat([x, x1, x2]), p + '.conv3', True)
    x4 = conv(cat([x, x1, x2, x3]), p + '.conv4', True); x5 = conv(cat([x, x1, x2, x3, x4]), p + '.conv5'); return add(mul02(x5), x)
def rrdb(x, p): o = rdb(rdb(rdb(x, p + '.rdb1'), p + '.rdb2'), p + '.rdb3'); return add(mul02(o), x)
inits.append(numpy_helper.from_array(np.array([1, 1, 2, 2], np.float32), 'scales2'))
def up2(x): y = nm('up'); nodes.append(helper.make_node('Resize', [x, '', 'scales2'], [y], mode='nearest')); return y
feat = conv('input', 'conv_first'); body = feat
nb = len({k.split('.')[1] for k in sd if k.startswith('body.')})
for i in range(nb): body = rrdb(body, f'body.{i}')
feat = add(feat, conv(body, 'conv_body'))
feat = conv(up2(feat), 'conv_up1', True); feat = conv(up2(feat), 'conv_up2', True)
out = conv(conv(feat, 'conv_hr', True), 'conv_last')
nodes.append(helper.make_node('Identity', [out], ['output']))
g = helper.make_graph(nodes, 'RealESRGAN_x4plus', [helper.make_tensor_value_info('input', TensorProto.FLOAT, [1, 3, 'h', 'w'])],
                      [helper.make_tensor_value_info('output', TensorProto.FLOAT, [1, 3, 'H', 'W'])], inits)
m = helper.make_model(g, opset_imports=[helper.make_opsetid('', 17)], producer_name='chitra-pth2onnx'); m.ir_version = 8
onnx.checker.check_model(m); onnx.save(m, dst); print('blocks', nb, 'params', sum(v.size for v in sd.values()), 'nodes', len(nodes))
