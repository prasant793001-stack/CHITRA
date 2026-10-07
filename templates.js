/* Chitra Studio – template library. ~1,500 designs generated from hand-built layouts x colour palettes x font pairs x copy.
   Nothing is stored: each template is a small recipe that draws itself (so the library costs ~0 KB and thumbnails render lazily). */
(() => {
  const C = window.chitra, K = C.kit;
  const cap = s => s.replace(/\b\w/g, m => m.toUpperCase());

  /* ================= colour ================= */
  const h2 = (h, s, l) => { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, '0'); }; return `#${f(0)}${f(8)}${f(4)}`; };
  const lum = c => { const n = parseInt(c.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
  const onCol = c => lum(c) > 0.6 ? '#15131f' : '#ffffff';
  const HUES = ['Ruby', 'Ember', 'Amber', 'Lime', 'Fern', 'Jade', 'Aqua', 'Sky', 'Cobalt', 'Iris', 'Orchid', 'Rose'];
  const PALS = [
    // curated (name, bg, alt, ink, accent, accent2, soft)
    ['Cream & Ink', '#f6f0e4', '#ebe2cf', '#17140f', '#ff5a36', '#1d4ed8', '#e0d5bd'], ['Midnight Neon', '#10132b', '#1b1f45', '#f4f5ff', '#ff3d9a', '#31e1f7', '#2a2f63'],
    ['Peach Fizz', '#fff1e8', '#ffd9c2', '#3a1d12', '#ff6b4a', '#ffb703', '#ffc9aa'], ['Mint Chip', '#e9fbf2', '#c8f2dc', '#0f3a2a', '#12b76a', '#ff7a59', '#a8e6c6'],
    ['Lavender Haze', '#f1ebff', '#ddd0ff', '#22164f', '#7c4dff', '#ff80bf', '#c9b8ff'], ['Sunny Side', '#fff8d6', '#ffec99', '#2b2200', '#ff8a00', '#e63946', '#ffe066'],
    ['Ocean Deep', '#0b2a4a', '#123c66', '#eaf6ff', '#2ec4ff', '#ffd166', '#1f527f'], ['Berry Blast', '#2d0a3d', '#471263', '#fff0fb', '#ff4fd8', '#ffd23f', '#6a1f8f'],
    ['Forest Walk', '#173d2e', '#1f5440', '#f1f7e8', '#b7e04a', '#ffb347', '#2c6b53'], ['Candy Pop', '#ffe3f1', '#ffc4e1', '#431133', '#ff3d94', '#3d8bff', '#ffa6d3'],
    ['Terracotta', '#f7e6d8', '#ecc9ae', '#3b1c10', '#c8553d', '#2f6f6a', '#dba98a'], ['Mono Bold', '#ffffff', '#ececec', '#0c0c0c', '#0c0c0c', '#ff3b30', '#d9d9d9'],
    ['Royal Gold', '#14122b', '#1f1c44', '#fbf3dc', '#e8b931', '#c1457d', '#332f66'], ['Blush & Sage', '#fdeeea', '#f6d6cd', '#3c2a26', '#d9728c', '#7a9e7e', '#efbeb3'],
    ['Electric Lime', '#0e0e10', '#1b1b20', '#f6fff0', '#c6ff2e', '#7c5cff', '#2d2d36'], ['Coral Reef', '#ffeee8', '#ffd4c7', '#0e3b43', '#ff5d5d', '#0fb5ae', '#ffbba8'],
    ['Sky Pastel', '#e8f6ff', '#cfe9ff', '#14315a', '#3b82f6', '#ff9f68', '#b4dbff'], ['Retro Diner', '#fff3d6', '#ffe09a', '#2a1710', '#d62828', '#0077b6', '#ffd166'],
    ['Slate & Sun', '#232a34', '#303947', '#f7f9fc', '#ffb703', '#4dd4ac', '#3f4b5e'], ['Grape Soda', '#efe6ff', '#d9c7ff', '#2a0f55', '#8f2bff', '#00c2a8', '#c3aaff'],
    ['Saffron', '#fff2d9', '#ffdc9f', '#3b1e05', '#ff7b00', '#7a1f5c', '#ffc673'], ['Teal Dream', '#0e3b43', '#145560', '#ebfffb', '#2dd4bf', '#ff9e7a', '#1f6f7c'],
    ['Cherry Cola', '#3a0d14', '#561521', '#fff1e8', '#ff4d5e', '#ffc857', '#7a2232'], ['Paper Blue', '#f4f7ff', '#e1e9ff', '#101a40', '#3347ff', '#ff6a3d', '#c8d4ff'],
  ];
  const pal = i => {
    if (i < PALS.length) { const p = PALS[i]; return { n: p[0], bg: p[1], alt: p[2], ink: p[3], a: p[4], b: p[5], soft: p[6] }; }
    i -= PALS.length; const h = (i % 12) * 30 + ((i / 12 | 0) % 2) * 9, tone = (i / 24 | 0) % 3, off = [150, 40, 210, 90][(i / 72 | 0) % 4], hn = HUES[(i % 12)];
    if (tone === 0) return { n: hn + ' Light', bg: h2(h, 85, 95), alt: h2(h, 75, 88), ink: h2(h, 55, 13), a: h2(h, 90, 52), b: h2(h + off, 92, 56), soft: h2(h, 65, 80) };
    if (tone === 1) return { n: hn + ' Night', bg: h2(h, 52, 11), alt: h2(h, 46, 18), ink: h2(h, 70, 96), a: h2(h, 95, 62), b: h2(h + off, 96, 62), soft: h2(h, 40, 28) };
    { const bgc = h2(h, 74, 50), light = lum(bgc) > 0.5; return { n: hn + ' Pop', bg: bgc, alt: h2(h, 66, 40), ink: light ? '#17131f' : '#ffffff', a: h2(h + 180, 92, light ? 40 : 62), b: '#fff3bf', soft: h2(h, 70, 62) }; }
  };
  const NPAL = PALS.length + 12 * 2 * 3 * 4;

  /* ================= fonts ================= */
  const MOOD = {
    bold: [['Anton', 'Montserrat'], ['Bebas Neue', 'Poppins'], ['Bangers', 'Poppins'], ['Archivo Black', 'Inter'], ['Alfa Slab One', 'Lato'], ['Bowlby One', 'Work Sans'], ['Passion One', 'Open Sans'], ['Russo One', 'Roboto'], ['Titan One', 'Nunito'], ['Luckiest Guy', 'Quicksand']],
    fun: [['Lilita One', 'Nunito'], ['Chewy', 'Fredoka'], ['Fredoka', 'Nunito'], ['Paytone One', 'Poppins'], ['Shrikhand', 'Poppins'], ['Fugaz One', 'Quicksand'], ['Rammetto One', 'Work Sans'], ['Bungee', 'DM Sans']],
    elegant: [['Playfair Display', 'Lato'], ['Cormorant Garamond', 'Montserrat'], ['Cinzel', 'Lato'], ['DM Serif Display', 'Inter'], ['Abril Fatface', 'Raleway'], ['Libre Baskerville', 'Open Sans'], ['Lora', 'Poppins'], ['Spectral', 'Work Sans']],
    script: [['Pacifico', 'Poppins'], ['Lobster', 'Montserrat'], ['Great Vibes', 'Lato'], ['Sacramento', 'Raleway'], ['Yellowtail', 'Montserrat'], ['Dancing Script', 'Poppins'], ['Kaushan Script', 'Open Sans'], ['Allura', 'Lato'], ['Satisfy', 'Josefin Sans'], ['Parisienne', 'Lato']],
    modern: [['Sora', 'Inter'], ['Outfit', 'Inter'], ['Manrope', 'Inter'], ['Urbanist', 'DM Sans'], ['Plus Jakarta Sans', 'Inter'], ['Lexend', 'Inter'], ['Poppins', 'Inter'], ['Montserrat', 'Lato'], ['Archivo', 'Inter']],
    hand: [['Caveat', 'Poppins'], ['Amatic SC', 'Montserrat'], ['Permanent Marker', 'Nunito'], ['Patrick Hand', 'Lato'], ['Shadows Into Light', 'Open Sans'], ['Gloria Hallelujah', 'Quicksand']],
    retro: [['Shrikhand', 'Josefin Sans'], ['Righteous', 'Poppins'], ['Fugaz One', 'Montserrat'], ['Bungee', 'Raleway'], ['Monoton', 'Poppins']],
  };
  const NOCASE = new Set(['Pacifico', 'Lobster', 'Great Vibes', 'Sacramento', 'Yellowtail', 'Dancing Script', 'Kaushan Script', 'Allura', 'Satisfy', 'Parisienne', 'Caveat', 'Shadows Into Light', 'Gloria Hallelujah', 'Monoton']);
  const SCRIPT_BOOST = new Set(['Great Vibes', 'Sacramento', 'Allura', 'Parisienne', 'Yellowtail', 'Caveat']);
  const BODY_BOLD = new Set(['Montserrat', 'Poppins', 'Nunito', 'Inter', 'Lato', 'Work Sans', 'Open Sans', 'Roboto', 'Quicksand', 'Fredoka', 'DM Sans', 'Raleway', 'Josefin Sans']);

  /* ================= copy ================= */
  const L = s => s.split('\n').filter(Boolean).map(r => { const [t, st, tg] = r.split('|'); return { t, s: st || '', g: tg || '' }; });
  const QUOTES = L(`But first, coffee|Fuel for the day|coffee
World's best dad|Official title since day one|dad fathers day
Best mom ever|Made with love|mom mothers day
Hello sunshine|Rise & shine|morning
Boss mode|Running on caffeine|boss office
Cheers to you|Sip happens|cheers
Dream big|Then drink more coffee|motivation
Good vibes only|Pour some positivity|vibes
Tea time|Steep. Sip. Smile.|tea
Hot chocolate season|Cosy mode on|winter
Grandma's kitchen|Made with love|grandma
Teacher's pet|Thanks for everything|teacher
Nurse life|Heroes wear scrubs|nurse
Wake up & be awesome|Rinse. Repeat.|morning
Mama bear|Fierce & loving|mom
Papa bear|Protector of snacks|dad
Best friends|Better together|friends
Love you more|Forever & always|love valentine
Mr & Mrs|Just married|wedding
Happy birthday|Make a wish|birthday
Gym fuel|Lift. Sip. Repeat.|gym fitness
Book lover|One more chapter|books
Plant mom|Grow with the flow|plants
Cat person|Purrfectly caffeinated|cat pets
Dog dad|Fur & coffee|dog pets
Sarcasm loading|Please wait|funny
Not a morning person|Coffee helps|funny
Adventure awaits|Take me there|travel
Wanderlust|Collect moments|travel
Namaste|Breathe in, breathe out|yoga
Chai lover|Cutting chai, big mood|chai tea
Eid Mubarak|Blessed celebrations|eid festival
Happy Diwali|Festival of lights|diwali festival
Merry Christmas|Ho ho hold my coffee|christmas festival
Happy new year|Cheers to new beginnings|newyear
Team spirit|Together we win|team
Super mom|Cape not included|mom
Super dad|Dad-joke loading|dad
My sunshine|You make me happy|love
Stay wild|Free spirit|wild
Hustle hard|Never quit|motivation
Born to create|Make it happen|creative
Less drama, more llama|Spit happens|funny
Pizza is life|Slice of heaven|food
Summer vibes|Sun · Sea · Sand|summer
Be kind|Always|kindness
Rock & roll|Live loud|music
Gamer mode|Level up|gaming
Mountain calling|Go explore|travel
Ocean soul|Salty hair, don't care|beach
Stay humble|Work hard|motivation
Positive energy|Good things coming|vibes
Music is life|Turn it up|music
Taco Tuesday|Every day|food
Sunset lover|Golden hour|sunset
Self love club|You are enough|selflove
Future legend|Coming soon|kids
Eat sleep repeat|Coder edition|coder
Cricket fever|Play hard|sports
Football is life|Goal!|sports
Bike life|Ride on|bike
Family reunion|Est. 2025|family`);
  const PROMO = L(`Mega sale|Up to 70% off|sale
Weekend sale|Don't miss out|sale
New arrival|Just dropped|launch
Grand opening|Join the party|launch
Quote of the day|Stay inspired|quote
Happy birthday|Make a wish|birthday
Thank you|For 10K followers|thanks
We're hiring|Join our team|jobs
Coming soon|Stay tuned|launch
Giveaway|Win big|giveaway
Flash deal|24 hours only|sale
Monday motivation|Start strong|quote
Self care Sunday|Take a pause|selfcare
Good morning|Have a great day|greeting
Limited offer|Buy 1 get 1|sale
Free delivery|On all orders|sale
New menu|Taste the difference|food
Book now|Limited slots|booking
Tip of the day|Save this post|tips
Behind the scenes|Meet the team|team
Customer love|5-star reviews|review
Festival offer|Celebrate with savings|festival sale
Black Friday|Biggest deals of the year|sale
Summer collection|Hot picks|fashion
Happy anniversary|Celebrating you|anniversary
Workshop alert|Register today|event
Podcast out now|New episode|podcast
Open for orders|DM to order|shop
Pack your bags|Trip of a lifetime|travel
Fresh & healthy|Eat better|food
Sold out|Thank you!|thanks
Fitness challenge|30 days to a new you|fitness
Photography tips|Save for later|tips
Wedding season|Book your date|wedding
Mother's day|With love|mothers day
Father's day|Celebrate dad|fathers day
Independence day|Jai Hind|festival
Eid Mubarak|Warm wishes|eid festival
Diwali wishes|Light up your life|diwali festival
Christmas offer|Season of giving|christmas sale
New year goals|Make it count|newyear
Skin care routine|Glow every day|beauty
Real estate|Your dream home awaits|property
Meet our new chef|Taste of tradition|food
Learn something new|Online course|education`);
  const EVENTS = L(`Music festival|Live on stage · Two nights|music
Art exhibition|Open to everyone|art
Yoga retreat|Weekend of calm|yoga
Food fair|Taste the city|food
Tech summit|Ideas that move us|tech
Charity run|Run for a cause|charity
Book fair|Stories for all ages|books
Garage sale|Everything must go|sale
Movie night|Under the stars|movie
Farmers market|Fresh · Local · Seasonal|market
Dance night|Shake it all night|dance
Open mic night|Your stage awaits|music
Science fair|Curious minds welcome|school
Comedy night|Laugh out loud|comedy
Talent show|Show us what you've got|school
City marathon|Every step counts|sports
Job fair|Find your next role|jobs
Bake sale|Sweet treats for a cause|food
School reunion|Class of 2005|reunion
Rock concert|One night only|music
Pool party|Splash into summer|party
Wine tasting|An evening of flavours|food
Neighbourhood cleanup|Together for a greener street|community
Grand opening|Ribbon cutting at noon|launch
Winter carnival|Rides · Games · Snacks|festival
Fashion show|Runway live|fashion
Startup pitch night|Meet the founders|business
Photography expo|Through the lens|art
Kids fun day|Games & prizes|kids
Diwali mela|Lights · Sweets · Joy|festival`);
  const SERVICES = L(`Hair & Beauty Salon|Book your glow-up today|salon
Fitness Studio|First class free|gym
Cozy Corner Café|Fresh coffee, warm smiles|cafe
Maths Tuition|Grades 6–12 · Small batches|education
Sparkle Cleaning|Spotless homes, happy people|cleaning
Dream Home Realty|Find the keys to your future|property
Happy Paws Grooming|Because pets deserve pampering|pets
Quick Fix Plumbing|24/7 emergency service|services
Moments Photography|Weddings · Portraits · Events|photography
Zen Yoga Classes|Find your balance|yoga
Bright Smile Dental|Gentle care for the whole family|clinic
Golden Crust Bakery|Fresh from the oven daily|bakery
Shine Car Wash|Showroom finish every time|cars
Taste Truck|Street food, big flavour|food
Easy Movers|Stress-free moving|services
Stitch Perfect Tailoring|Made to fit you|fashion
Mobile Repair Hub|Screens fixed in 30 minutes|repair
Royal Catering|Menus for every occasion|food
Little Stars Daycare|Safe · Fun · Caring|kids
Serenity Spa|Relax. Restore. Renew.|spa`);
  const INVITES = L(`Birthday party|You're invited|birthday
Baby shower|Join us to celebrate|baby
Wedding invitation|Together with their families|wedding
Engagement party|She said yes!|engagement
Housewarming|Come see our new home|home
Anniversary dinner|25 years of love|anniversary
Graduation party|The tassel was worth the hassle|graduation
Bridal shower|Celebrate the bride-to-be|wedding
Retirement party|Cheers to the next chapter|retirement
Naming ceremony|Welcome little one|baby
Garden party|Tea, flowers & friends|party
High tea|An afternoon of elegance|party
Halloween bash|Costumes required|halloween
Christmas dinner|Join us for festive cheer|christmas
Eid dinner|Iftar & celebration|eid
Diwali party|An evening of lights|diwali
New year's eve|Countdown to midnight|newyear
Kids birthday|Cake, games & fun|birthday kids
Pool party|Bring your swimsuit|party
Farewell party|We'll miss you|farewell`);
  const CARDS = L(`Alex Morgan|Creative Director|design
Priya Sharma|Photographer|photography
Sam Carter|Software Engineer|tech
Maya Patel|Interior Designer|design
Leo Fernandez|Fitness Coach|gym
Zara Khan|Makeup Artist|beauty
Noah Williams|Real Estate Agent|property
Ava Johnson|Marketing Manager|business
Ethan Brown|Chef & Owner|food
Mia Davis|Wedding Planner|wedding
Rohan Mehta|Financial Advisor|finance
Sofia Rossi|Fashion Stylist|fashion
Liam O'Connor|Architect|design
Isha Nair|Yoga Instructor|yoga
Omar Hassan|Lawyer|business`);
  const CERTS = L(`Certificate of Achievement|This certificate is proudly presented to|achievement
Certificate of Excellence|In recognition of outstanding performance|excellence
Certificate of Participation|For active participation and effort|participation
Certificate of Appreciation|With heartfelt thanks for your contribution|appreciation
Certificate of Completion|Has successfully completed the course|course
Employee of the Month|Awarded for dedication and teamwork|employee
Winner|First place · Well deserved|winner
Honour Roll|For academic distinction|school
Perfect Attendance|Never missed a day|school
Volunteer Award|For generous service to the community|volunteer`);
  const MENUS = [
    ['Pizza House', 'Wood-fired · Hand-stretched', [['Margherita', '9'], ['Pepperoni', '11'], ['Veggie Supreme', '12'], ['BBQ Chicken', '13'], ['Four Cheese', '12'], ['Garlic Bread', '5']]],
    ['Burger Joint', 'Stacked high · Served hot', [['Classic Burger', '8'], ['Double Cheese', '11'], ['Crispy Chicken', '9'], ['Veggie Patty', '8'], ['Loaded Fries', '5'], ['Milkshake', '6']]],
    ['Morning Café', 'Coffee · Pastries · Brunch', [['Espresso', '3'], ['Cappuccino', '4'], ['Iced Latte', '5'], ['Avocado Toast', '8'], ['Croissant', '4'], ['Pancakes', '7']]],
    ['Sushi Bar', 'Fresh daily · Chef selection', [['Salmon Nigiri', '6'], ['Dragon Roll', '12'], ['Miso Soup', '4'], ['Edamame', '5'], ['Tuna Sashimi', '10'], ['Green Tea', '3']]],
    ['Sweet Tooth', 'Desserts made with love', [['Chocolate Cake', '6'], ['Cheesecake', '7'], ['Brownie Sundae', '7'], ['Tiramisu', '7'], ['Ice Cream', '4'], ['Macarons', '5']]],
    ['Juice Bar', 'Cold-pressed · No sugar added', [['Orange Boost', '5'], ['Green Detox', '6'], ['Berry Blast', '6'], ['Mango Lassi', '5'], ['Watermelon', '4'], ['Coconut Water', '4']]],
    ['Biryani Kitchen', 'Slow-cooked dum biryani', [['Chicken Biryani', '10'], ['Mutton Biryani', '13'], ['Veg Biryani', '8'], ['Raita', '2'], ['Kebab Platter', '9'], ['Gulab Jamun', '4']]],
    ['BBQ Smokehouse', 'Low & slow since 1999', [['Pulled Pork', '12'], ['Beef Ribs', '16'], ['Smoked Wings', '9'], ['Coleslaw', '3'], ['Mac & Cheese', '5'], ['Cornbread', '3']]],
    ['Green Plate', 'Plant-based goodness', [['Buddha Bowl', '10'], ['Falafel Wrap', '8'], ['Lentil Soup', '6'], ['Quinoa Salad', '9'], ['Smoothie', '6'], ['Hummus Plate', '7']]],
    ['Breakfast Club', 'Served all day', [['Eggs Benedict', '9'], ['Waffles', '8'], ['Omelette', '7'], ['Granola Bowl', '6'], ['Bacon Roll', '6'], ['Fresh Juice', '4']]],
  ];
  const YT = L(`I TRIED IT|You won't believe what happened|vlog
10 TIPS|That changed everything|tips
HOW TO|Step by step guide|tutorial
MY ROUTINE|A day in my life|vlog
TOP 5|Ranked & reviewed|list
FULL REVIEW|Is it worth it?|review
SECRET REVEALED|Nobody tells you this|tips
CHALLENGE|24 hours only|challenge
BEFORE & AFTER|The real results|makeover
BEGINNER GUIDE|Start here|tutorial
GAME ON|Epic moments|gaming
BEHIND THE SCENES|Never before seen|vlog
Q&A|Ask me anything|vlog
UNBOXING|First look|review
MISTAKES|Avoid these|tips
COOKING|Easy recipes|food
TRAVEL VLOG|Hidden gems|travel
WORKOUT|No equipment|fitness
MONEY TALK|Save more, stress less|finance
LEVEL UP|Pro strategies|gaming`);
  const SLIDES = L(`Pitch deck|Presented by your name|business
Quarterly review|Q3 results & highlights|business
Project proposal|Goals · Plan · Budget|business
Our story|Where we began|brand
Meet the team|The people behind the work|team
Product launch|Introducing the next big thing|launch
Marketing plan|Strategy for growth|marketing
Class presentation|Topic overview|education
Portfolio|Selected works 2025|portfolio
Annual report|A year in numbers|business
Workshop|Learn · Practise · Share|education
Thank you|Questions?|thanks
Roadmap|What's next|business
Case study|Challenge · Solution · Result|business
Welcome|Let's get started|greeting`);
  const PIN = L(`10 ideas|You'll want to save|ideas
Easy recipes|Dinner in 20 minutes|food
Home decor|Cosy corners|home
Wedding inspo|Dreamy details|wedding
Study tips|Ace every exam|education
Travel guide|Hidden gems|travel
Skin care|Glow naturally|beauty
Budget planner|Save smarter|finance
Workout plan|Home edition|fitness
Gift ideas|For everyone|gifts
Outfit ideas|Style it your way|fashion
DIY crafts|Make it yourself|diy
Healthy snacks|Quick bites|food
Party planning|Checklist inside|party
Morning routine|Start your day right|selfcare`);
  const MISC = L(`Hello world|Say it with style|greeting
Thank you|With all my heart|thanks
Happy birthday|Make it a great one|birthday
You've got this|Keep going|quote
Stay curious|Always learning|quote
Home sweet home|Where love lives|home
Bloom|Grow where you are planted|plants
Wander|Find your adventure|travel`);

  /* ================= drawing kit ================= */
  function hashSeed(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } return h >>> 0; }
  const mulberry = a => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

  function draw(spec) {
    const W = K.W, H = K.H, k = Math.min(W, H), P = spec.pal, c = spec.c, f = spec.f, rnd = mulberry(spec.seed), B = () => K.B;
    const wide = W / H > 1.5, tall = W / H < 0.8, flip = rnd() < 0.5;
    const add = o => { B().add(o); return o; };
    const rect = (x, y, w, h, fill, o = {}) => add(new fabric.Rect({ left: x, top: y, width: w, height: h, fill, ...o }));
    const circ = (cx, cy, r, fill, o = {}) => add(new fabric.Circle({ left: cx, top: cy, radius: r, originX: 'center', originY: 'center', fill, ...o }));
    const poly = (pts, fill, o = {}) => add(new fabric.Polygon(pts.map(p => ({ x: p[0], y: p[1] })), { fill, objectCaching: true, ...o }));
    const star = (cx, cy, ro, ri, n, fill, rot = 0, o = {}) => { const pts = []; for (let i = 0; i < n * 2; i++) { const a = rot + (Math.PI * i) / n - Math.PI / 2, r = i % 2 ? ri : ro; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return poly(pts, fill, o); };
    const spark = (cx, cy, r, fill) => star(cx, cy, r, r * 0.24, 4, fill);
    const ringO = (cx, cy, r, stroke, sw, o = {}) => circ(cx, cy, r, 'transparent', { stroke, strokeWidth: sw, ...o });
    const grad = (c1, c2, ang = 45) => { const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a); return new fabric.Gradient({ type: 'linear', gradientUnits: 'pixels', coords: { x1: W / 2 - dx * W / 2, y1: H / 2 - dy * H / 2, x2: W / 2 + dx * W / 2, y2: H / 2 + dy * H / 2 }, colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }] }); };
    const bg = fill => rect(0, 0, W, H, fill, { selectable: true });
    const dotsField = (x, y, cols, rows, step, r0, fill, fade = true) => { const cs = []; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const t = fade ? 1 - (i / cols + j / rows) / 2 : 1, r = Math.max(0.4, r0 * (0.25 + 0.75 * t)); cs.push(new fabric.Circle({ left: x + i * step, top: y + j * step, radius: r, fill })); } return add(new fabric.Group(cs, { objectCaching: true })); };
    const wave = (y0, amp, fill, ph = 0) => { const pts = [[0, H]]; for (let i = 0; i <= 48; i++) { const x = (W * i) / 48; pts.push([x, y0 + Math.sin((i / 48) * Math.PI * 2 * 1.5 + ph) * amp]); } pts.push([W, H]); return poly(pts, fill); };
    const rays = (cx, cy, n, f1, f2) => { const R = Math.hypot(W, H); for (let i = 0; i < n; i++) { const a0 = (i / n) * Math.PI * 2, a1 = ((i + 1) / n) * Math.PI * 2; poly([[cx, cy], [cx + Math.cos(a0) * R, cy + Math.sin(a0) * R], [cx + Math.cos(a1) * R, cy + Math.sin(a1) * R]], i % 2 ? f2 : f1); } };

    /* ---- text block: [overline] title [subtitle], measured with the real font and shrunk to fit its box ---- */
    function text(b, o = {}) {
      const al = o.align || 'center', cx = al === 'left' ? b.x : b.x + b.w / 2, org = al === 'left' ? 'left' : 'center';
      const tFont = o.tFont || f.d, canUp = o.up && !NOCASE.has(tFont), boost = SCRIPT_BOOST.has(tFont) ? 1.35 : 1;
      const mk = (s, font, size, fill, extra = {}) => new fabric.Textbox(s, { left: cx, top: 0, originX: org, originY: 'top', width: b.w, fontFamily: font, fontSize: size, fill, textAlign: al, lineHeight: 1.04, ...extra });
      const bw = BODY_BOLD.has(f.b) ? { fontWeight: 'bold' } : {};
      const items = [], gap = k * 0.025;
      const over = c.o ? mk(c.o.toUpperCase(), f.b, Math.min(k * 0.034, b.h * 0.07), o.oFill || P.a, { charSpacing: 260, ...bw }) : null;
      const sub = c.s && !o.noSub ? mk(c.s, f.b, Math.min(k * 0.062, b.h * 0.15), o.sFill || P.ink, { ...bw, opacity: 0.9 }) : null;
      const title = mk(canUp ? c.t.toUpperCase() : c.t, tFont, Math.min(b.h, (o.maxT || 0.34) * k * boost), o.tFill || P.ink, {
        lineHeight: o.lh || 1.0, charSpacing: o.ls || 0, shadow: o.shadow || null, ...(o.stroke ? { stroke: o.stroke, strokeWidth: k * 0.012, paintFirst: 'stroke', strokeLineJoin: 'round' } : {}),
      });
      const lw = t => { let m = 0; for (let i = 0; i < (t._textLines || []).length; i++) m = Math.max(m, t.getLineWidth(i)); return m; };
      const total = () => (over ? over.height + gap * 0.7 : 0) + title.height + (sub ? sub.height + gap : 0);
      for (let g = 0; g < 60 && (total() > b.h || lw(title) > b.w * 1.002) && title.fontSize > k * 0.016; g++) title.set('fontSize', title.fontSize * 0.93);
      if (sub) for (let g = 0; g < 30 && (lw(sub) > b.w * 1.002 || sub.height > b.h * 0.3) && sub.fontSize > k * 0.012; g++) sub.set('fontSize', sub.fontSize * 0.93);
      let y = b.y + Math.max(0, (b.h - total()) / 2);
      const place = (t, h) => { t.set('top', y); y += h; add(t); items.push(t); };
      if (over) place(over, over.height + gap * 0.7);
      place(title, title.height + gap);
      if (sub) {
        if (o.pill) {
          const pw = lw(sub) + k * 0.06, ph = sub.height + k * 0.03, px = al === 'left' ? b.x - k * 0.03 : cx - pw / 2;
          const pl = rect(px, y - k * 0.015, pw, ph, o.pill, { rx: ph / 2, ry: ph / 2 }); B().remove(pl); B().insertAt(pl, B().getObjects().indexOf(title) + 1);
          sub.set('fill', onCol(o.pill));
        }
        place(sub, sub.height);
      }
      return { top: b.y + Math.max(0, (b.h - total()) / 2), bottom: y };
    }
    const extra = (fill = P.ink) => { if (!c.x) return; const w = Math.min(W * 0.8, k * 1.6), h = k * 0.07; const t = new fabric.Textbox(c.x, { left: W / 2, top: H - k * 0.075 - h * 0.15, originX: 'center', originY: 'top', width: w, fontFamily: f.b, fontSize: k * 0.032, fill: onCol(fill), textAlign: 'center' }); const pl = rect(W / 2 - Math.min(w, t.getLineWidth(0) + k * 0.1) / 2, H - k * 0.09, Math.min(w, t.getLineWidth(0) + k * 0.1), h, fill, { rx: h / 2, ry: h / 2 }); add(pl); add(t); };
    const sparkles = col => { [[.08, .12], [.92, .2], [.1, .86], [.9, .9]].forEach(([x, y], i) => spark(W * (flip && i % 2 ? 1 - x : x), H * y, k * (0.035 + rnd() * 0.03), i % 2 ? col : P.b)); };
    const tb = (x, y, w, h) => ({ x: W * x, y: H * y, w: W * w, h: H * h });
    const slot = (x, y, w, h, rx = 0) => { const sl = C.makeSlotPx({ label: 'Photo', kind: 'plain', left: x, top: y, width: w, height: h, rx }); sl.set({ fill: P.soft, lockMovementX: true }); B().add(sl); return sl; };

    /* ================= layouts ================= */
    const LAY = {
      bold() { bg(P.bg); circ(W * (wide ? 0.9 : 0.9), H * (wide ? 0.5 : 0.1), k * (wide ? 0.45 : 0.4), P.a); circ(W * 0.08, H * 0.94, k * 0.2, P.b); rect(0, 0, W, k * 0.04, P.ink); text(wide ? tb(0.07, 0.1, 0.58, 0.8) : tb(0.08, 0.24, 0.84, 0.52), { align: wide ? 'left' : 'center', up: 1, pill: P.ink }); extra(); },
      split() { bg(P.bg); if (wide) { rect(0, 0, W * 0.55, H, P.a); circ(W * 0.55, H * 0.5, k * 0.26, P.b); text(tb(0.05, 0.1, 0.45, 0.8), { align: 'left', up: 1, tFill: onCol(P.a), sFill: onCol(P.a), oFill: onCol(P.a) }); } else { rect(0, 0, W, H * 0.62, P.a); circ(W * (flip ? 0.2 : 0.8), H * 0.62, k * 0.17, P.b); text(tb(0.08, 0.06, 0.84, 0.5), { up: 1, tFill: onCol(P.a), sFill: onCol(P.a), oFill: onCol(P.a), noSub: 1 }); const sb = tb(0.1, 0.7, 0.8, 0.2); const s = new fabric.Textbox(c.s || '', { left: W / 2, top: sb.y, originX: 'center', width: sb.w, fontFamily: f.b, fontSize: k * 0.06, fill: P.ink, textAlign: 'center', ...(BODY_BOLD.has(f.b) ? { fontWeight: 'bold' } : {}) }); add(s); } extra(); },
      frame() { bg(P.bg); const m = k * 0.045; rect(m, m, W - 2 * m, H - 2 * m, 'transparent', { stroke: P.ink, strokeWidth: k * 0.006 }); rect(m * 1.8, m * 1.8, W - 3.6 * m, H - 3.6 * m, 'transparent', { stroke: P.a, strokeWidth: k * 0.012 }); [[1, 1], [W - 1.8 * m - k * 0.03, 1], [1, H - 1.8 * m - k * 0.03], [W - 1.8 * m - k * 0.03, H - 1.8 * m - k * 0.03]].forEach(([x, y]) => rect(x === 1 ? 1.8 * m - k * 0.015 : x, y === 1 ? 1.8 * m - k * 0.015 : y, k * 0.03, k * 0.03, P.b, { angle: 45 })); text(tb(0.14, 0.17, 0.72, 0.66), { up: 1, maxT: 0.2 }); extra(); },
      stripes() { bg(P.alt); for (let i = -4; i < 14; i++) rect(i * k * 0.22 - k * 0.1, -k * 0.3, k * 0.11, Math.hypot(W, H) * 1.1, P.bg, { angle: 28, originX: 'left' }); const m = k * 0.09; rect(W * 0.08 + k * 0.012, H * 0.2 + k * 0.012, W * 0.84, H * 0.6, P.ink); rect(W * 0.08, H * 0.2, W * 0.84, H * 0.6, P.bg, { stroke: P.ink, strokeWidth: k * 0.008 }); text(tb(0.12, 0.23, 0.76, 0.54), { up: 1, maxT: 0.28, oFill: P.a }); extra(); },
      dots() { bg(P.bg); if (wide) dotsField(W * 0.68, H * 0.06, 9, Math.max(4, Math.round(H * 0.88 / (k * 0.07))), k * 0.07, k * 0.028, P.a); else dotsField(W * 0.08, -k * 0.01, 12, 4, k * 0.075, k * 0.03, P.a); rect(flip ? W - k * 0.05 : 0, H * (wide ? 0.1 : 0.34), k * 0.05, H * (wide ? 0.8 : 0.5), P.b); text(wide ? tb(0.07, 0.12, 0.55, 0.76) : tb(0.09, 0.3, 0.8, 0.5), { align: 'left', up: 1, pill: P.a }); extra(); },
      burst() { bg(P.a); rays(W / 2, H / 2, 24, P.a, P.b === '#fff6c9' ? P.alt : P.alt); circ(W / 2, H / 2, k * (wide ? 0.42 : 0.4), P.bg, { stroke: P.ink, strokeWidth: k * 0.012 }); text(wide ? tb(0.3, 0.2, 0.4, 0.6) : tb(0.2, 0.3, 0.6, 0.4), { up: 1, maxT: 0.2 }); extra(P.ink); },
      blobs() { bg(P.soft); circ(W * 0.02, H * 0.04, k * 0.2, P.a); circ(W * 0.98, H * 0.96, k * 0.22, P.b); circ(W * 0.9, H * 0.07, k * 0.07, P.alt); circ(W * 0.07, H * 0.93, k * 0.05, P.ink); text(tb(0.12, 0.24, 0.76, 0.52), { up: 1, pill: P.ink }); extra(); },
      arch() { bg(P.alt); const w = W * (wide ? 0.4 : 0.7), x = W / 2 - w / 2, top = H * 0.1; circ(W / 2, top + w / 2, w / 2, P.bg); rect(x, top + w / 2, w, H * 0.9 - top - w / 2, P.bg); circ(W / 2, top + w * 0.28, w * 0.13, P.a); text({ x: x + w * 0.08, y: top + w * 0.46, w: w * 0.84, h: H * 0.9 - top - w * 0.55 }, { maxT: 0.2, oFill: P.b }); extra(); },
      orbs() { bg(grad(P.a, P.b, 135)); circ(W * 0.15, H * 0.2, k * 0.3, 'rgba(255,255,255,.22)'); circ(W * 0.88, H * 0.82, k * 0.38, 'rgba(255,255,255,.16)'); circ(W * 0.7, H * 0.12, k * 0.12, 'rgba(255,255,255,.25)'); rect(W * 0.1, H * 0.22, W * 0.8, H * 0.56, 'rgba(255,255,255,.88)', { rx: k * 0.06, ry: k * 0.06 }); text(tb(0.14, 0.26, 0.72, 0.48), { maxT: 0.24, tFill: '#15131f', sFill: '#15131f', oFill: P.a }); extra('#15131f'); },
      corner() { bg(P.bg); poly(flip ? [[W, 0], [W, H * 0.5], [W * 0.5, 0]] : [[0, 0], [W * 0.5, 0], [0, H * 0.5]], P.a); poly(flip ? [[0, H], [0, H * 0.55], [W * 0.45, H]] : [[W, H], [W * 0.55, H], [W, H * 0.45]], P.b); text(tb(0.1, 0.24, 0.8, 0.52), { align: 'left', up: 1 }); extra(); },
      editorial() { bg(P.bg); rect(W * 0.07, H * 0.07, W * 0.86, k * 0.008, P.ink); rect(W * 0.07, H * 0.93 - k * 0.008, W * 0.86, k * 0.008, P.ink); text(wide ? tb(0.07, 0.15, 0.6, 0.7) : tb(0.07, 0.15, 0.86, 0.7), { align: 'left', maxT: wide ? 0.34 : 0.3, lh: 0.95, tFill: P.ink, sFill: P.ink, oFill: P.ink }); const t = new fabric.Textbox(c.g ? '— ' + c.g.split(' ')[0].toUpperCase() : '', { left: W * 0.93, top: H * 0.12, originX: 'right', width: W * 0.3, fontFamily: f.b, fontSize: k * 0.028, fill: P.ink, textAlign: 'right', charSpacing: 200 }); add(t); circ(W * 0.9, H * 0.84, k * 0.07, P.a); extra(); },
      brutal() { bg(P.a); dotsField(W * 0.04, H * 0.04, 8, 5, k * 0.06, k * 0.014, onCol(P.a) === '#ffffff' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.2)', false); const x = W * 0.09, y = H * 0.2, w = W * 0.82, h = H * 0.6, d = k * 0.025; rect(x + d, y + d, w, h, P.ink); rect(x, y, w, h, P.bg, { stroke: P.ink, strokeWidth: k * 0.01 }); rect(x, y, w, k * 0.07, P.b, { stroke: P.ink, strokeWidth: k * 0.01 }); [0.04, 0.09, 0.14].forEach(t => circ(x + k * t * 1.2 + k * 0.02, y + k * 0.035, k * 0.015, P.ink)); text(tb(0.13, 0.31, 0.74, 0.46), { up: 1, maxT: 0.26, pill: P.a }); extra(P.ink); },
      wave() { bg(P.bg); wave(H * 0.72, k * 0.04, P.b); wave(H * 0.78, k * 0.035, P.a, 1.4); circ(W * (flip ? 0.2 : 0.8), H * 0.16, k * 0.1, P.a); text(tb(0.08, 0.2, 0.84, 0.46), { up: 1 }); extra(P.ink); },
      checker() { bg(P.bg); const n = wide ? 14 : 8, s = W / n, rows = wide ? 1 : 2, sy = Math.min(s, H * 0.2); for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) if ((i + j) % 2 === 0) rect(i * s, j * sy, s, sy, P.a); for (let j = 0; j < rows; j++) for (let i = 0; i < n; i++) if ((i + j) % 2 === 0) rect(i * s, H - (j + 1) * sy, s, sy, P.b); text(tb(0.1, 0.1 + rows * sy / H, 0.8, 0.8 - 2 * rows * sy / H), { up: 1, maxT: 0.3 }); extra(); },
      ticket() { bg(P.alt); const x = W * 0.07, y = H * 0.2, w = W * 0.86, h = H * 0.6; rect(x, y, w, h, P.a, { rx: k * 0.04, ry: k * 0.04 }); circ(x, y + h / 2, k * 0.06, P.alt); circ(x + w, y + h / 2, k * 0.06, P.alt); rect(x + w * 0.72, y + k * 0.04, 0, h - k * 0.08, 'transparent', { stroke: onCol(P.a), strokeWidth: k * 0.004, strokeDashArray: [k * 0.02, k * 0.015] }); text({ x: x + w * 0.1, y: y + h * 0.1, w: w * 0.58, h: h * 0.8 }, { align: 'left', up: 1, tFill: onCol(P.a), sFill: onCol(P.a), oFill: onCol(P.a), maxT: 0.24 }); star(x + w * 0.86, y + h / 2, k * 0.11, k * 0.07, 12, P.b); extra(); },
      sunrise() { bg(P.bg); const r = k * (wide ? 0.55 : 0.42), cx = wide ? W * 0.76 : W / 2, cy = H + (wide ? -r * 0.15 : r * 0.12); const g = new fabric.Group([new fabric.Rect({ left: cx - r, top: cy - r, width: r * 2, height: r * 0.7, fill: P.b }), new fabric.Rect({ left: cx - r, top: cy - r * 0.3, width: r * 2, height: r * 0.7, fill: P.a }), new fabric.Rect({ left: cx - r, top: cy + r * 0.4, width: r * 2, height: r * 0.6, fill: P.ink })], { clipPath: new fabric.Circle({ left: cx, top: cy, radius: r, originX: 'center', originY: 'center', absolutePositioned: true }) }); add(g); for (let i = 1; i < 5; i++) rect(cx - r, cy - r + r * 0.34 * i * 1.0, r * 2, r * 0.03 * i, P.bg, { clipPath: new fabric.Circle({ left: cx, top: cy, radius: r, originX: 'center', originY: 'center', absolutePositioned: true }) }); text(wide ? tb(0.06, 0.12, 0.4, 0.76) : tb(0.08, 0.07, 0.84, 0.46), { align: wide ? 'left' : 'center', up: 1, maxT: 0.2 }); extra(); },
      hello() { bg(P.soft); const t = text(wide ? tb(0.06, 0.16, 0.88, 0.68) : tb(0.06, 0.28, 0.88, 0.44), { align: 'left', maxT: 0.5, lh: 0.9, tFill: P.ink, sFill: P.ink, oFill: P.a }); circ(W * (flip ? 0.12 : 0.88), H * 0.14, k * 0.06, P.a); extra(); },
      catalog() { bg(P.bg); rect(W * 0.06, H * 0.06, W * 0.88, H * 0.04, P.ink); const hh = H * 0.5, y0 = H * 0.46; rect(W * 0.06, y0, W * 0.88, hh, P.a); circ(W * 0.3, y0 + hh * 0.5, k * 0.2, P.b); rect(W * 0.52, y0 + hh * 0.15, k * 0.28, k * 0.28, P.alt, { angle: 12 }); text(tb(0.06, 0.12, 0.88, 0.3), { align: 'left', maxT: 0.2, lh: 0.95 }); extra(); },
      memphis() { bg(P.bg); const zone = (x, y) => x > W * 0.14 && x < W * 0.86 && y > H * 0.2 && y < H * 0.8; let n = 0; for (let i = 0; i < 90 && n < 16; i++) { const x = rnd() * W, y = rnd() * H; if (zone(x, y)) continue; n++; const col = [P.a, P.b, P.ink, P.soft][n % 4], r = k * (0.025 + rnd() * 0.045), kind = n % 4; if (kind === 0) circ(x, y, r, col); else if (kind === 1) poly([[x, y - r], [x + r, y + r], [x - r, y + r]], col, { angle: rnd() * 90 }); else if (kind === 2) rect(x - r, y - r * 0.25, r * 2.2, r * 0.5, col, { angle: rnd() * 180, rx: r * 0.25, ry: r * 0.25 }); else ringO(x, y, r * 0.8, col, k * 0.012); } text(tb(0.14, 0.22, 0.72, 0.56), { up: 1, maxT: 0.26, pill: P.a }); extra(); },
      mesh() { const dk = true; bg(grad(P.a, P.b, 120)); circ(W * 0.2, H * 0.25, k * 0.4, P.soft, { opacity: 0.45 }); circ(W * 0.85, H * 0.75, k * 0.45, P.bg, { opacity: 0.3 }); circ(W * 0.8, H * 0.15, k * 0.2, P.b, { opacity: 0.6 }); const x = W * 0.09, y = H * 0.24, w = W * 0.82, h = H * 0.52; rect(x, y, w, h, 'rgba(255,255,255,.7)', { rx: k * 0.05, ry: k * 0.05, stroke: 'rgba(255,255,255,.9)', strokeWidth: k * 0.004 }); text({ x: x + w * 0.06, y: y + h * 0.08, w: w * 0.88, h: h * 0.84 }, { maxT: 0.24, tFill: '#15131f', sFill: '#15131f', oFill: dk ? P.a : P.b }); extra('#15131f'); },
      neon() { const d = '#0c0a1f', glow = new fabric.Shadow({ color: P.a, blur: k * 0.03, offsetX: 0, offsetY: 0 }); bg(d); const hz = H * (wide ? 0.7 : 0.66); circ(W / 2, hz, k * (wide ? 0.22 : 0.26), P.b, { opacity: 0.9 }); rect(0, hz, W, H - hz, d); for (let i = 0; i <= 10; i++) { const yy = hz + (H - hz) * Math.pow(i / 10, 1.8); rect(0, yy, W, Math.max(2, k * 0.004), P.a, { opacity: 0.8 }); } for (let i = -8; i <= 8; i++) poly([[W / 2 + i * W * 0.012, hz], [W / 2 + i * W * 0.11, H], [W / 2 + i * W * 0.11 + k * 0.004, H], [W / 2 + i * W * 0.012 + k * 0.004, hz]], P.a, { opacity: 0.7 }); text(tb(0.08, 0.06, 0.84, wide ? 0.5 : 0.4), { up: 1, maxT: 0.22, tFill: '#ffffff', sFill: '#ffffff', oFill: P.a, shadow: glow }); },
      newspaper() { bg('#f3eee0'); const ink = '#1a1712', m = W * 0.06; rect(m, H * 0.06, W - 2 * m, k * 0.006, ink); rect(m, H * 0.06 + k * 0.014, W - 2 * m, k * 0.002, ink); const mh = new fabric.Textbox((c.g || 'daily').split(' ')[0].toUpperCase() + ' TIMES', { left: W / 2, top: H * 0.085, originX: 'center', width: W - 2 * m, fontFamily: f.b, fontSize: k * 0.03, fill: ink, textAlign: 'center', charSpacing: 400 }); add(mh); rect(m, H * 0.085 + k * 0.05, W - 2 * m, k * 0.002, ink); text(tb(0.06, 0.2, 0.88, 0.4), { align: 'left', maxT: 0.2, tFill: ink, sFill: '#4a443a', lh: 0.95 }); const cols = wide ? 4 : 3, cw = (W - 2 * m - (cols - 1) * k * 0.03) / cols; for (let ci = 0; ci < cols; ci++) for (let li = 0; li < 7; li++) rect(m + ci * (cw + k * 0.03), H * 0.66 + li * k * 0.035, cw * (li === 6 ? 0.6 : 1), k * 0.012, '#c9c1ad'); extra(ink); },
      confetti() { bg(P.a); const cols = [P.b, '#ffffff', P.ink, P.soft, P.alt]; for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, r = k * (0.012 + rnd() * 0.022); if (x > W * 0.12 && x < W * 0.88 && y > H * 0.2 && y < H * 0.8) continue; rect(x, y, r * 2, r * (i % 3 ? 0.7 : 2), cols[i % cols.length], { angle: rnd() * 180, rx: r * 0.3, ry: r * 0.3 }); } const x = W * 0.1, y = H * 0.24, w = W * 0.8, h = H * 0.52; rect(x, y, w, h, P.bg, { rx: k * 0.05, ry: k * 0.05 }); text({ x: x + w * 0.06, y: y + h * 0.08, w: w * 0.88, h: h * 0.84 }, { up: 1, maxT: 0.22 }); extra(P.ink); },
      diagonal() { bg(P.bg); const bh = k * (wide ? 0.34 : 0.3); const ang = wide ? 0 : -8; rect(-W * 0.1, H * 0.5 - bh / 2, W * 1.2, bh, P.a, { angle: ang, originX: 'left' }); rect(-W * 0.1, H * 0.5 - bh / 2 + bh * 1.12, W * 1.2, k * 0.02, P.b, { angle: ang, originX: 'left' }); text({ x: W * 0.1, y: H * 0.5 - bh * 0.4 - H * 0.04, w: W * 0.8, h: bh * 0.8 }, { up: 1, noSub: 1, maxT: 0.2, tFill: onCol(P.a), oFill: onCol(P.a) }); if (c.s) { const s = new fabric.Textbox(c.s, { left: W / 2, top: H * 0.5 + bh * 0.95, originX: 'center', width: W * 0.8, fontFamily: f.b, fontSize: k * 0.055, fill: P.ink, textAlign: 'center', ...(BODY_BOLD.has(f.b) ? { fontWeight: 'bold' } : {}) }); add(s); } sparkles(P.a); extra(); },
      bubbles() { bg(P.soft); for (let i = 0; i < 22; i++) { const x = rnd() * W, y = rnd() * H, r = k * (0.03 + rnd() * 0.09); if (x > W * 0.1 && x < W * 0.9 && y > H * 0.22 && y < H * 0.78) continue; circ(x, y, r, i % 3 === 0 ? P.a : i % 3 === 1 ? P.b : 'rgba(255,255,255,.55)', { opacity: i % 3 === 2 ? 1 : 0.85, stroke: '#ffffff', strokeWidth: k * 0.006 }); } text(tb(0.12, 0.24, 0.76, 0.52), { up: 1, maxT: 0.26, pill: P.ink }); extra(); },
      /* ----- photo templates: a real print slot the user's photo drops into (auto-fit, stays under the text) ----- */
      photoTop() { bg(P.bg); const sl = wide ? [0, 0, W * 0.52, H] : [0, 0, W, H * 0.6]; slot(...sl); rect(wide ? W * 0.52 : 0, wide ? 0 : H * 0.6, wide ? k * 0.02 : W, wide ? H : k * 0.02, P.a); text(wide ? tb(0.57, 0.12, 0.38, 0.76) : tb(0.08, 0.64, 0.84, 0.3), { align: wide ? 'left' : 'center', up: 1, maxT: 0.2, oFill: P.a }); extra(); },
      photoCard() { bg(P.a); const m = k * 0.07; slot(m, m, W - 2 * m, wide ? H - 2 * m : H * 0.62, k * 0.03); spark(W * 0.9, H * 0.08, k * 0.05, P.b); text(wide ? tb(0.08, 0.1, 0.4, 0.8) : tb(0.08, 0.7, 0.84, 0.24), { up: 1, maxT: 0.18, tFill: onCol(P.a), sFill: onCol(P.a), oFill: onCol(P.a), align: wide ? 'left' : 'center' }); extra(P.ink); },
      photoCircle() { bg(P.soft); const r = k * (wide ? 0.4 : 0.3), cx = wide ? W * 0.27 : W / 2, cy = wide ? H / 2 : H * 0.33; circ(cx, cy, r + k * 0.025, P.a); slot(cx - r, cy - r, r * 2, r * 2, r); circ(cx + r * 0.78, cy - r * 0.78, k * 0.05, P.b); text(wide ? tb(0.52, 0.14, 0.42, 0.72) : tb(0.08, 0.66, 0.84, 0.28), { align: wide ? 'left' : 'center', up: 1, maxT: 0.18 }); extra(); },
      photoPolaroid() { bg(P.alt); const w = k * (wide ? 0.62 : 0.74), h = w * 1.14, x = wide ? W * 0.08 : (W - w) / 2, y = wide ? (H - h) / 2 : H * 0.07, d = k * 0.015; rect(x + d, y + d, w, h, 'rgba(0,0,0,.18)'); rect(x, y, w, h, '#ffffff'); slot(x + w * 0.06, y + w * 0.06, w * 0.88, w * 0.88); text(wide ? tb(0.58, 0.14, 0.36, 0.72) : { x: x, y: y + w * 0.98, w: w, h: h - w * 1.0 }, { align: wide ? 'left' : 'center', maxT: 0.1, tFill: wide ? P.ink : '#15131f', sFill: wide ? P.ink : '#444' }); extra(); },
      photoDuo() { bg(P.bg); const g = k * 0.03; if (wide) { const w = (W - g * 3) / 2; slot(g, g, w, H - 2 * g - k * 0.2); slot(w + 2 * g, g, w, H - 2 * g - k * 0.2); } else { const h = (H * 0.66 - g * 3) / 2; slot(g, g, W - 2 * g, h); slot(g, h + 2 * g, W - 2 * g, h); } rect(0, H - (wide ? k * 0.2 : H * 0.3), W, wide ? k * 0.2 : H * 0.3, P.a); text(wide ? tb(0.05, 0.84, 0.9, 0.14) : tb(0.06, 0.71, 0.88, 0.26), { up: 1, maxT: 0.12, tFill: onCol(P.a), sFill: onCol(P.a), oFill: onCol(P.a), noSub: wide }); },
      photoOverlay() { slot(0, 0, W, H); const bh = H * (wide ? 0.4 : 0.34); rect(0, H - bh, W, bh, P.bg); rect(0, H - bh - k * 0.012, W, k * 0.012, P.a); text(tb(0.07, 1 - (wide ? 0.38 : 0.32), 0.86, wide ? 0.34 : 0.28), { align: 'left', up: 1, maxT: 0.16 }); extra(); },
      photoPill() { bg(P.bg); const w = k * (wide ? 0.36 : 0.52), h = k * (wide ? 0.8 : 0.72), x = wide ? W * 0.12 : (W - w) / 2, y = wide ? (H - h) / 2 : H * 0.05; rect(x - k * 0.02, y - k * 0.02, w + k * 0.04, h + k * 0.04, P.a, { rx: w / 2 + k * 0.02, ry: w / 2 + k * 0.02 }); slot(x, y, w, h, w / 2); text(wide ? tb(0.5, 0.14, 0.44, 0.72) : tb(0.08, 0.05 + 0.72 * k / H + 0.03, 0.84, 1 - (0.08 + 0.72 * k / H) - 0.04), { align: wide ? 'left' : 'center', maxT: 0.16 }); extra(); },
      photoGrid3() { bg(P.alt); const g = k * 0.025, m = k * 0.05; if (wide) { const w = (W - 2 * m - 2 * g) / 3; [0, 1, 2].forEach(i => slot(m + i * (w + g), m, w, H * 0.58, k * 0.02)); } else { const w = (W - 2 * m - g) / 2, h = (H * 0.5) ; slot(m, m, w, h * 0.9, k * 0.02); slot(m + w + g, m, w, h * 0.9 * 0.55, k * 0.02); slot(m + w + g, m + h * 0.9 * 0.55 + g, w, h * 0.9 * 0.45 - g, k * 0.02); } text(wide ? tb(0.05, 0.66, 0.9, 0.3) : tb(0.07, 0.6, 0.86, 0.34), { up: 1, maxT: 0.2 }); extra(); },
      /* ----- transparent-safe (no full-bleed background): tees, stickers, tumblers ----- */
      badge() { const r = k * 0.4, cx = W / 2, cy = H / 2; circ(cx, cy, r, P.a, { stroke: P.ink, strokeWidth: k * 0.014 }); ringO(cx, cy, r * 0.86, P.b, k * 0.008, { strokeDashArray: [k * 0.02, k * 0.014] }); [[0.2, 0.1], [0.82, 0.14], [0.85, 0.82], [0.16, 0.86]].forEach(([x, y], i) => spark(W * x, H * y, k * 0.04, i % 2 ? P.b : P.a)); text({ x: cx - r * 0.72, y: cy - r * 0.62, w: r * 1.44, h: r * 1.24 }, { up: 1, maxT: 0.2, tFill: onCol(P.a), sFill: onCol(P.a), oFill: onCol(P.a) }); },
      stack() { const words = c.t.split(' '); const lines = words.length > 4 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : words; const dk = lum(P.ink) < 0.5 ? P.ink : (lum(P.bg) < 0.5 ? P.bg : '#15131f'), lt = lum(P.ink) >= 0.5 ? P.ink : '#ffffff', fills = [P.a, lt, P.b], font = f.d, up = !NOCASE.has(font); let y = H * 0.16; const avail = H * 0.56, size = Math.min(k * 0.3, (avail / lines.length) * 0.92); lines.forEach((ln, i) => { const t = new fabric.Textbox(up ? ln.toUpperCase() : ln, { left: W / 2, top: 0, originX: 'center', originY: 'top', width: W * 0.86, fontFamily: font, fontSize: size, fill: fills[i % 3], textAlign: 'center', lineHeight: 0.95, stroke: dk, strokeWidth: k * 0.014, paintFirst: 'stroke', strokeLineJoin: 'round', shadow: new fabric.Shadow({ color: dk, offsetX: k * 0.012, offsetY: k * 0.012, blur: 0 }) }); for (let g = 0; g < 40 && t.getLineWidth(0) > W * 0.86 && t.fontSize > k * 0.02; g++) t.set('fontSize', t.fontSize * 0.93); t.set('top', y); y += t.height * 0.95; add(t); }); if (c.s) { const s = new fabric.Textbox(c.s.toUpperCase(), { left: W / 2, top: y + k * 0.03, originX: 'center', width: W * 0.8, fontFamily: f.b, fontSize: k * 0.06, fill: lt, textAlign: 'center', charSpacing: 300, stroke: dk, strokeWidth: k * 0.008, paintFirst: 'stroke', ...(BODY_BOLD.has(f.b) ? { fontWeight: 'bold' } : {}) }); add(s); } sparkles(P.a); },
      seal() { const cx = W / 2, cy = H / 2, r = k * 0.42; star(cx, cy, r, r * 0.9, 28, P.a, 0, { stroke: P.ink, strokeWidth: k * 0.01, strokeLineJoin: 'round' }); circ(cx, cy, r * 0.76, P.bg, { stroke: P.ink, strokeWidth: k * 0.008 }); ringO(cx, cy, r * 0.68, P.a, k * 0.006); text({ x: cx - r * 0.56, y: cy - r * 0.5, w: r * 1.12, h: r }, { up: 1, maxT: 0.16, oFill: P.a }); },
      plate() { const x = W * 0.1, y = H * 0.24, w = W * 0.8, h = H * 0.5, d = k * 0.03; rect(x + d, y + d, w, h, P.ink, { rx: k * 0.04, ry: k * 0.04 }); rect(x, y, w, h, P.bg, { rx: k * 0.04, ry: k * 0.04, stroke: P.ink, strokeWidth: k * 0.012 }); spark(x + w * 0.9, y + h * 0.1, k * 0.07, P.a); spark(x + w * 0.08, y + h * 0.9, k * 0.05, P.b); text({ x: x + w * 0.08, y: y + h * 0.1, w: w * 0.84, h: h * 0.8 }, { up: 1, maxT: 0.2, pill: P.a }); },
      ribbon() { const cx = W / 2, cy = H * 0.46, bw = W * 0.96, bh = k * 0.26; rect(cx - bw / 2, cy - bh / 2, bw, bh, P.a, { angle: -6, originX: 'left', left: cx - bw / 2, stroke: P.ink, strokeWidth: k * 0.012 }); const t = text({ x: W * 0.1, y: H * 0.32, w: W * 0.8, h: H * 0.28 }, { up: 1, noSub: 1, tFill: onCol(P.a), maxT: 0.18, shadow: null }); if (c.s) { const sb = rect(cx - W * 0.3, H * 0.66, W * 0.6, k * 0.1, P.ink, { rx: k * 0.05, ry: k * 0.05, angle: 3, originX: 'left', left: cx - W * 0.3 }); const s = new fabric.Textbox(c.s.toUpperCase(), { left: cx, top: H * 0.66 + k * 0.02, originX: 'center', width: W * 0.56, fontFamily: f.b, fontSize: k * 0.05, fill: onCol(P.ink), textAlign: 'center', charSpacing: 200, ...(BODY_BOLD.has(f.b) ? { fontWeight: 'bold' } : {}) }); add(s); } sparkles(P.a); },
      retrosun() { const cx = W / 2, cy = H * 0.42, r = k * 0.3; const g = new fabric.Group([new fabric.Rect({ left: cx - r, top: cy - r, width: r * 2, height: r * 0.7, fill: P.b }), new fabric.Rect({ left: cx - r, top: cy - r * 0.3, width: r * 2, height: r * 0.7, fill: P.a }), new fabric.Rect({ left: cx - r, top: cy + r * 0.4, width: r * 2, height: r * 0.6, fill: P.ink })], { clipPath: new fabric.Circle({ left: cx, top: cy, radius: r, originX: 'center', originY: 'center', absolutePositioned: true }) }); add(g); text({ x: W * 0.08, y: cy + r * 1.15, w: W * 0.84, h: H * 0.3 }, { up: 1, maxT: 0.16, stroke: lum(P.ink) < 0.5 ? '#ffffff' : '#15131f', tFill: lum(P.ink) < 0.5 ? P.ink : '#ffffff', sFill: lum(P.ink) < 0.5 ? P.ink : '#ffffff' }); },
    };
    LAY[spec.layout]();
    return LAY;
  }
  const FREE = ['badge', 'stack', 'seal', 'plate', 'ribbon', 'retrosun'];
  const FULL = ['memphis', 'mesh', 'neon', 'newspaper', 'confetti', 'diagonal', 'bubbles', 'bold', 'split', 'frame', 'stripes', 'dots', 'burst', 'blobs', 'arch', 'orbs', 'corner', 'editorial', 'brutal', 'wave', 'checker', 'ticket', 'sunrise', 'hello', 'catalog'];
  const FULL_SAFE_NARROW = FULL.filter(n => !['catalog', 'split'].includes(n));
  const PHOTO = ['photoTop', 'photoCard', 'photoCircle', 'photoPolaroid', 'photoDuo', 'photoOverlay', 'photoPill', 'photoGrid3'];
  const PHOTO_FAM = new Set(['mug', 'ig', 'igp', 'fb', 'story', 'pin', 'poster', 'flyer', 'invite', 'yt', 'slide', 'li', 'etsy', 'wall', 'post', 'pad', 'case', 'pillow', 'coast']);

  /* ================= template families ================= */
  // [prefix, category, product, copy pool, count, moods, layout pool, flags]
  const FAM = [
    ['mug', 'mug', '11 oz mug wrap', QUOTES, 200, ['fun', 'script', 'bold', 'hand', 'retro', 'elegant'], 'full+free'],
    ['tee', 'tshirt', 'T-shirt front', QUOTES, 240, ['bold', 'retro', 'fun', 'hand', 'script'], 'free'],
    ['ig', 'social', 'Instagram post', PROMO, 220, ['modern', 'bold', 'fun', 'elegant', 'script'], 'full'],
    ['igp', 'social', 'Instagram portrait', PROMO, 60, ['modern', 'bold', 'fun'], 'full'],
    ['fb', 'social', 'Facebook post', PROMO, 60, ['modern', 'bold', 'fun'], 'full'],
    ['story', 'story', 'Story / Reel / TikTok', PROMO, 150, ['bold', 'modern', 'fun', 'script'], 'full'],
    ['pin', 'pinterest', 'Pinterest pin', PIN, 75, ['elegant', 'modern', 'script', 'fun'], 'full'],
    ['poster', 'poster', 'A4', EVENTS, 120, ['bold', 'modern', 'elegant', 'retro', 'fun'], 'full'],
    ['flyer', 'flyer', 'Flyer', SERVICES, 80, ['bold', 'modern', 'elegant', 'fun'], 'full'],
    ['invite', 'invite', 'Invitation', INVITES, 100, ['script', 'elegant', 'hand', 'fun'], 'full'],
    ['card', 'card', 'Business card', CARDS, 75, ['modern', 'elegant', 'bold'], 'full'],
    ['yt', 'youtube', 'YouTube thumbnail', YT, 100, ['bold', 'fun'], 'full'],
    ['slide', 'slides', 'Presentation 16:9', SLIDES, 75, ['modern', 'elegant', 'bold'], 'full'],
    ['li', 'social', 'LinkedIn banner', SLIDES, 30, ['modern', 'bold'], 'full'],
    ['etsy', 'social', 'Etsy listing', PROMO, 30, ['modern', 'elegant', 'fun'], 'full'],
    ['wall', 'wallpaper', 'Desktop wallpaper', QUOTES, 40, ['modern', 'script', 'bold'], 'full'],
    ['post', 'card', 'Postcard', MISC, 50, ['script', 'elegant', 'fun'], 'full'],
    ['tumb', 'merch', '20 oz tumbler', QUOTES, 40, ['fun', 'script', 'bold', 'retro'], 'free'],
    ['pad', 'merch', 'Mouse pad', QUOTES, 30, ['bold', 'fun', 'modern'], 'full+free'],
    ['case', 'merch', 'Phone case', QUOTES, 30, ['fun', 'bold', 'script'], 'full+free'],
    ['coast', 'merch', 'Coaster', QUOTES, 30, ['fun', 'elegant', 'script'], 'free'],
    ['tote', 'merch', 'Tote bag', QUOTES, 30, ['bold', 'hand', 'retro'], 'free'],
    ['pillow', 'merch', 'Pillow 16×16 in', QUOTES, 30, ['script', 'fun', 'elegant'], 'full+free'],
    ['sticker', 'sticker', 'Label / sticker 3×3 in', QUOTES, 60, ['fun', 'bold', 'retro', 'hand'], 'free'],
  ];
  const TAGS = { mug: 'mug cup sublimation', tshirt: 'tshirt tee dtf shirt', social: 'instagram facebook post', story: 'story reel tiktok', pinterest: 'pinterest pin', poster: 'poster print a4', flyer: 'flyer business', invite: 'invitation invite', card: 'card', youtube: 'youtube thumbnail', slides: 'presentation slides deck', wallpaper: 'wallpaper desktop', merch: 'merch gift', sticker: 'sticker label' };
  const CAT_LABEL = { mug: 'Mugs', tshirt: 'T-shirts', social: 'Social posts', story: 'Stories', pinterest: 'Pinterest', poster: 'Posters', flyer: 'Flyers', invite: 'Invitations', card: 'Cards', cert: 'Certificates', menu: 'Menus', youtube: 'YouTube', slides: 'Presentations', wallpaper: 'Wallpapers', merch: 'Merch', sticker: 'Stickers' };

  const TEMPLATES = C.TEMPLATES, META = C.TEMPLATE_META;
  function register(id, name, cat, prod, spec, tags, pro) {
    META[id] = { n: name, cat, p: prod, t: tags, f: [spec.f.d, spec.f.b], pro, gen: 1 };
    TEMPLATES[id] = () => { K.clearAll(spec.free ? '' : ''); draw(spec); };
  }
  let total = 0;
  FAM.forEach(([pre, cat, prod, pool, count, moods, mode], fi) => {
    const free = mode === 'free', both = mode === 'full+free';
    for (let i = 0; i < count; i++) {
      const v = Math.floor(i / pool.length), c0 = pool[i % pool.length], id = `${pre}-${i + 1}`, seed = hashSeed(id);
      const mood = moods[(i * 3 + v + fi) % moods.length], pairs = MOOD[mood], f = pairs[(i * 7 + v * 5 + fi) % pairs.length];
      const base = free ? FREE : both ? (v % 2 ? FREE : FULL_SAFE_NARROW) : FULL_SAFE_NARROW, layouts = PHOTO_FAM.has(pre) && !free ? [...base, ...PHOTO, ...PHOTO, ...base.slice(0, 4)] : base;
      const layout = layouts[(i * 5 + v * 3 + fi * 2) % layouts.length];
      const p = pal((i * 11 + v * 7 + fi * 5) % NPAL);
      const c = { t: c0.t, s: c0.s, g: c0.g };
      if (cat === 'invite') c.o = "You're invited"; else if (cat === 'poster') c.o = 'Live · Local · Loud'; else if (pre === 'card') { c.x = '+1 234 567 890 · hello@email.com'; delete c.o; } else if (cat === 'flyer') { c.o = 'Now open'; c.x = 'www.yourwebsite.com · +1 234 567 890'; }
      const isPhoto = PHOTO.includes(layout), name = isPhoto ? `${c0.t} · Photo ${p.n}` : `${c0.t} · ${p.n}`;
      register(id, name, cat, prod, { layout, pal: p, c, f: { d: f[0], b: f[1] }, seed, free }, `${c0.g} ${TAGS[cat] || ''} ${mood} ${p.n} ${layout} ${isPhoto ? 'photo picture image frame' : ''}`.toLowerCase(), (i % 6) === 5);
      total++;
    }
  });
  // certificates + menus use their own structured layouts
  const certLayout = (spec) => { const W = K.W, H = K.H, k = Math.min(W, H), P = spec.pal, f = spec.f, c = spec.c, add = o => K.B.add(o), v = spec.v; const tx = (s, y, size, font, fill, o = {}) => { const t = new fabric.Textbox(s, { left: W / 2, top: H * y, originX: 'center', originY: 'center', width: W * 0.78, fontFamily: font, fontSize: size, fill, textAlign: 'center', ...o }); for (let g = 0; g < 40 && t.getLineWidth(0) > W * 0.78 && t.fontSize > 10; g++) t.set('fontSize', t.fontSize * 0.93); add(t); return t; };
    add(new fabric.Rect({ left: 0, top: 0, width: W, height: H, fill: v === 1 ? P.ink : P.bg })); const ink = v === 1 ? P.bg : P.ink, m = k * 0.045;
    add(new fabric.Rect({ left: m, top: m, width: W - 2 * m, height: H - 2 * m, fill: 'transparent', stroke: P.a, strokeWidth: k * 0.016 })); add(new fabric.Rect({ left: m * 1.7, top: m * 1.7, width: W - 3.4 * m, height: H - 3.4 * m, fill: 'transparent', stroke: ink, strokeWidth: k * 0.004 }));
    if (v === 2) { add(new fabric.Rect({ left: 0, top: 0, width: W * 0.14, height: H, fill: P.a })); add(new fabric.Rect({ left: W * 0.14, top: 0, width: W * 0.012, height: H, fill: P.b })); }
    tx(c.t.toUpperCase(), 0.26, k * 0.095, f.d, ink, { charSpacing: 120 }); tx(c.s, 0.4, k * 0.035, f.b, ink, { opacity: .8 });
    tx('Your Name Here', 0.55, k * 0.14, spec.script, P.a); add(new fabric.Rect({ left: W * 0.3, top: H * 0.64, width: W * 0.4, height: k * 0.004, fill: ink }));
    tx('for outstanding effort and dedication', 0.7, k * 0.032, f.b, ink, { opacity: .75 });
    [[0.26, 'DATE'], [0.74, 'SIGNATURE']].forEach(([x, l]) => { add(new fabric.Rect({ left: W * x - W * 0.11, top: H * 0.86, width: W * 0.22, height: k * 0.003, fill: ink })); add(new fabric.Textbox(l, { left: W * x, top: H * 0.875, originX: 'center', width: W * 0.22, fontFamily: f.b, fontSize: k * 0.026, fill: ink, textAlign: 'center', charSpacing: 200 })); });
    const sx = W / 2, sy = H * 0.84, sr = k * 0.075; const pts = []; for (let i = 0; i < 32; i++) { const r = i % 2 ? sr * 0.88 : sr, a = (Math.PI * i) / 16; pts.push({ x: sx + Math.cos(a) * r, y: sy + Math.sin(a) * r }); } add(new fabric.Polygon(pts, { fill: P.a })); add(new fabric.Circle({ left: sx, top: sy, radius: sr * 0.62, originX: 'center', originY: 'center', fill: 'transparent', stroke: onCol(P.a), strokeWidth: k * 0.004 })); };
  CERTS.forEach((c0, ci) => { for (let v = 0; v < 4; v++) { const id = `cert-${ci * 4 + v + 1}`, p = pal([12, 22, 6, 18, 25, 4, 10, 1][(ci + v * 3) % 8] + (v === 3 ? 0 : 0)), pr = MOOD.elegant[(ci + v) % MOOD.elegant.length], sc = MOOD.script[(ci * 2 + v) % MOOD.script.length][0]; const spec = { pal: p, c: c0, f: { d: pr[0], b: pr[1] }, v: v % 3, script: sc }; META[id] = { n: `${c0.t} · ${p.n}`, cat: 'cert', p: 'Certificate', t: `certificate award ${c0.g} ${p.n}`.toLowerCase(), f: [pr[0], pr[1], sc], gen: 1, pro: v === 3 }; TEMPLATES[id] = () => { K.clearAll(''); certLayout(spec); }; total++; } });
  const menuLayout = (spec) => { const W = K.W, H = K.H, k = Math.min(W, H), P = spec.pal, f = spec.f, m = spec.m, v = spec.v, add = o => K.B.add(o); const dark = v === 1;
    add(new fabric.Rect({ left: 0, top: 0, width: W, height: H, fill: dark ? P.ink : P.bg })); const ink = dark ? P.bg : P.ink;
    add(new fabric.Rect({ left: 0, top: 0, width: W, height: H * 0.2, fill: P.a })); add(new fabric.Circle({ left: W * 0.88, top: H * 0.2, radius: k * 0.1, originX: 'center', originY: 'center', fill: P.b }));
    const t = new fabric.Textbox(m[0].toUpperCase(), { left: W / 2, top: H * 0.085, originX: 'center', originY: 'center', width: W * 0.8, fontFamily: f.d, fontSize: k * 0.16, fill: onCol(P.a), textAlign: 'center' }); for (let g = 0; g < 40 && (t.getLineWidth(0) > W * 0.8 || t.height > H * 0.16) && t.fontSize > 10; g++) t.set('fontSize', t.fontSize * 0.93); add(t);
    add(new fabric.Textbox(m[1], { left: W / 2, top: H * 0.235, originX: 'center', width: W * 0.8, fontFamily: f.b, fontSize: k * 0.045, fill: ink, textAlign: 'center', opacity: .8 }));
    const items = m[2], rowH = H * 0.093, y0 = H * 0.31, sz = Math.min(k * 0.058, W * 0.06);
    items.forEach(([n, pr], i) => { const y = y0 + i * rowH; const a = new fabric.Textbox(n, { left: W * 0.1, top: y, width: W * 0.58, fontFamily: f.b, fontSize: sz, fill: ink, ...(BODY_BOLD.has(f.b) ? { fontWeight: 'bold' } : {}) }); const b = new fabric.Textbox('$' + pr, { left: W * 0.9, top: y, originX: 'right', width: W * 0.2, fontFamily: f.d, fontSize: sz * 1.1, fill: P.a, textAlign: 'right' }); add(a); add(b); add(new fabric.Rect({ left: W * 0.1, top: y + sz * 1.45, width: W * 0.8, height: k * 0.003, fill: ink, opacity: .25 })); });
    add(new fabric.Rect({ left: W * 0.1, top: H * 0.92, width: W * 0.8, height: H * 0.05, fill: P.b, rx: k * 0.02, ry: k * 0.02 })); add(new fabric.Textbox('Order now · +1 234 567 890', { left: W / 2, top: H * 0.927, originX: 'center', width: W * 0.8, fontFamily: f.b, fontSize: k * 0.036, fill: onCol(P.b), textAlign: 'center' })); };
  MENUS.forEach((m, mi) => { for (let v = 0; v < 4; v++) { const id = `menu-${mi * 4 + v + 1}`, p = pal([2, 10, 17, 21, 7, 22, 3, 9][(mi + v * 2) % 8]), pr = MOOD[['elegant', 'retro', 'fun', 'bold'][(mi + v) % 4]], pair = pr[(mi * 3 + v) % pr.length]; const spec = { pal: p, m, f: { d: pair[0], b: pair[1] }, v: v % 3 }; META[id] = { n: `${m[0]} · ${p.n}`, cat: 'menu', p: 'Menu', t: `menu restaurant food ${m[0]} ${p.n}`.toLowerCase(), f: [pair[0], pair[1]], gen: 1, pro: v === 3 }; TEMPLATES[id] = () => { K.clearAll(''); menuLayout(spec); }; total++; } });

  /* ================= fonts must be ready before a template is drawn ================= */
  const fontOk = {};
  C.ensureTplFonts = async (names = []) => {
    let all = true;
    await Promise.all(names.filter(Boolean).map(async n => {
      if (fontOk[n]) return; await C.loadFont?.(n);
      try { const r = await Promise.race([document.fonts.load(`700 40px "${n}"`), new Promise(r => setTimeout(() => r(null), 2500))]); const r2 = await document.fonts.load(`40px "${n}"`); if ((r && r.length) || r2.length) fontOk[n] = 1; else all = false; } catch { all = false; }
    }));
    return all;
  };
  C.TPL_VERSION = '4.4'; C.CAT_LABEL = CAT_LABEL; C.GEN_COUNT = total;
  console.info('[chitra] templates ready:', Object.keys(META).length);
})();
