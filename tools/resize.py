"""Resize a JPEG: python3 resize.py in out max_side quality  (used by harvest-photos.mjs when `sharp` is not installed)."""
import sys
from PIL import Image, ImageOps
src, dst, mx, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB'); im.thumbnail((mx, mx), Image.LANCZOS); im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True)
