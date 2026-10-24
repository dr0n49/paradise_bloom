"""Generate the Sky Drop heroine for the runtime (Spine 4.3 JSON: weighted meshes + physics).

The heroine is the V28 painting (base + hair and cloth pieces) flattened into two layers:
body_back (cloth, hair, body) and body_front (head, torso, chin hand), with the halo and head
wings between them, as in the V28 draw order. Both layers are weighted meshes on the same bones
and the same weight field, so the body bends smoothly with no seams. Hair, sleeve and cloth
chains carry physics, the lids squash for blinks, and a glowing wisp lives in her open hand
(the reference game's companion bird does the same job: rests on her hand, flies around her head).

Spine Essential cannot open meshes, weights or physics, so this script is the source of truth:
run spine/tools/make_character.sh (generate + pack). Masters: spine/character/src
(v28_layout.json keeps the V28 placement of the pieces). Run with /usr/bin/python3 (needs PIL).
"""
import json, math, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CH = os.path.join(ROOT, "character")
SRC = os.path.join(CH, "src")
IMG = os.path.join(CH, "images")
FPS = 30
TAU = 2 * math.pi

# P = pixel space of the V28 base painting (y down). S = skeleton space (y up, origin at the
# rig's bottom centre). V28 placed base.png so that:
def S(p):
    return (p[0] - 552.5, 1417.0 - p[1])

def P(s):
    return (s[0] + 552.5, 1417.0 - s[1])

# ---------------------------------------------------------------- layers
BACK = ["cloth_drape_L", "cloth_tail_R", "hair_left_low", "hair_left_main", "hair_curl_bottom",
        "hair_curl_top", "hair_right_c", "hair_right_b", "hair_right_a", "base"]
FRONT = ["torso", "hand_open", "head"]


def v28_centres():
    d = json.load(open(os.path.join(SRC, "v28_layout.json")))
    bones = {b["name"]: b for b in d["bones"]}

    def wp(n):
        b = bones[n]
        x, y = b.get("x", 0), b.get("y", 0)
        if "parent" in b:
            px, py = wp(b["parent"])
            return px + x, py + y
        return x, y

    att = d["skins"][0]["attachments"]
    out = {}
    for s in d["slots"]:
        a = s.get("attachment")
        if a:
            info = att[s["name"]][a]
            bx, by = wp(s["bone"])
            out[a] = P((bx + info.get("x", 0), by + info.get("y", 0)))
    return out


def flatten(names, centres, out):
    ox, oy, W, H = -200, -200, 1500, 1800
    c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for n in names:
        im = Image.open(os.path.join(SRC, n + ".png")).convert("RGBA")
        cx, cy = centres[n]
        c.alpha_composite(im, (round(cx - im.width / 2 - ox), round(cy - im.height / 2 - oy)))
    bx0, by0, bx1, by1 = c.getbbox()
    c = c.crop((bx0, by0, bx1, by1))
    c.save(os.path.join(IMG, out + ".png"))
    return {"x0": ox + bx0, "y0": oy + by0, "w": c.width, "h": c.height, "img": c}


# ---------------------------------------------------------------- bones
# (name, parent, at P, tip P or None, world rotation if no tip)
EYE_ROT = math.degrees(math.atan2(31, 72))  # the face is tilted: the eye line rises to her left
DEFS = [
    ("root", None, None, None, 0),
    ("character_root", "root", None, None, 0),
    ("cloud_root", "character_root", (540, 1030), None, 0),
    ("cloud_L", "cloud_root", (330, 1040), None, 0),
    ("cloud_C", "cloud_root", (540, 1000), None, 0),
    ("cloud_R", "cloud_root", (760, 1040), None, 0),
    ("hips", "character_root", (640, 800), None, 0),
    ("legs", "hips", (540, 1000), None, 0),
    ("spine", "hips", (660, 760), (680, 560), 0),
    ("chest", "spine", (680, 560), (700, 410), 0),
    ("neck", "chest", (700, 410), (690, 360), 0),
    ("head", "neck", (690, 360), (640, 140), 0),
    ("eyeL", "head", (602, 278), None, EYE_ROT),
    ("eyeR", "head", (674, 247), None, EYE_ROT),
    ("halo", "head", (608, 93), None, 0),
    ("halo_spark1", "halo", (500, 60), None, 0),
    ("halo_spark2", "halo", (720, 40), None, 0),
    ("wing_L", "head", (495, 250), None, 0),
    ("wing_R", "head", (760, 185), None, 0),
    ("hairL1", "head", (500, 190), (410, 330), 0),
    ("hairL2", "chest", (410, 330), (300, 460), 0),
    ("hairL3", "hairL2", (300, 460), (200, 620), 0),
    ("hairL4", "hairL3", (200, 620), (130, 830), 0),
    ("hairR1", "head", (790, 230), (880, 340), 0),
    ("hairR2", "chest", (880, 340), (990, 470), 0),
    ("hairR3", "hairR2", (990, 470), (1050, 630), 0),
    ("hairR4", "hairR3", (1050, 630), (960, 840), 0),
    ("armL", "chest", (440, 615), (485, 440), 0),
    ("handL", "head", (485, 440), (620, 330), 0),
    ("armR_up", "chest", (800, 430), (785, 600), 0),
    ("armR_fore", "armR_up", (785, 600), (840, 550), 0),
    ("handR", "armR_fore", (840, 550), (1000, 615), 0),
    ("palm", "handR", (910, 505), None, 0),
    ("sleeve1", "chest", (800, 620), (880, 760), 0),
    ("sleeve2", "sleeve1", (880, 760), (940, 880), 0),
    ("skirtR", "hips", (720, 780), (860, 960), 0),
    ("drapeL1", "hips", (300, 890), (300, 1080), 0),
    ("drapeL2", "drapeL1", (300, 1080), (330, 1270), 0),
    ("tailR1", "hips", (880, 940), (960, 1090), 0),
    ("tailR2", "tailR1", (960, 1090), (1010, 1270), 0),
    ("wisp", "character_root", (910, 505), None, 0),
    ("wisp_spin", "wisp", (910, 505), None, 0),
    ("wisp_wL", "wisp", (890, 500), None, 0),
    ("wisp_wR", "wisp", (930, 500), None, 0),
    ("burst1", "wisp", (910, 505), None, 0),
    ("burst2", "wisp", (910, 505), None, 0),
    ("burst3", "wisp", (910, 505), None, 0),
    ("burst4", "wisp", (910, 505), None, 0),
    ("trail1", "character_root", (910, 505), None, 0),
    ("trail2", "character_root", (910, 505), None, 0),
]
ORDER = [d[0] for d in DEFS]
PARENT = {d[0]: d[1] for d in DEFS}
WORLD = {}  # name -> (x, y, rot) in S, setup pose
LOCAL = {}  # name -> (x, y, rot)
LENGTH = {}


def rot2(x, y, deg):
    r = math.radians(deg)
    return x * math.cos(r) - y * math.sin(r), x * math.sin(r) + y * math.cos(r)


for name, parent, at, tip, rot in DEFS:
    pos = S(at) if at else (0.0, 0.0)
    wr = rot
    if tip:
        t = S(tip)
        wr = math.degrees(math.atan2(t[1] - pos[1], t[0] - pos[0]))
        LENGTH[name] = math.hypot(t[0] - pos[0], t[1] - pos[1])
    WORLD[name] = (pos[0], pos[1], wr)
    if parent:
        px, py, pr = WORLD[parent]
        lx, ly = rot2(pos[0] - px, pos[1] - py, -pr)
        LOCAL[name] = (lx, ly, wr - pr)
    else:
        LOCAL[name] = (pos[0], pos[1], wr)
BONE_INDEX = {n: i for i, n in enumerate(ORDER)}

# ---------------------------------------------------------------- weight field (P space)
HAND_R = [(835, 525), (880, 505), (960, 520), (1010, 560), (1030, 615), (1005, 640), (940, 640), (870, 615), (840, 595)]
ARM_R_FORE = [(770, 560), (810, 520), (850, 515), (860, 560), (845, 610), (800, 640), (760, 630)]
ARM_R_UP = [(745, 395), (840, 390), (860, 470), (840, 540), (800, 600), (745, 600), (735, 500)]
HAND_L = [(470, 330), (530, 300), (600, 300), (665, 330), (670, 365), (620, 380), (560, 410), (505, 455), (465, 440)]
ARM_L = [(450, 430), (510, 440), (520, 500), (500, 580), (470, 640), (420, 640), (400, 600), (420, 520)]
HEAD = [(470, 170), (520, 110), (600, 80), (700, 80), (780, 110), (840, 170), (860, 245), (820, 300), (770, 350),
        (720, 385), (680, 390), (640, 360), (590, 340), (530, 320), (490, 280), (470, 220)]
NECK = [(640, 350), (730, 340), (760, 420), (700, 440), (640, 420)]
SLEEVE = [(720, 600), (800, 610), (870, 620), (960, 700), (1000, 780), (940, 800), (860, 860), (760, 900), (700, 820)]
SKIRT_R = [(700, 760), (860, 780), (900, 940), (860, 1000), (740, 980), (700, 900)]
DRAPE_L = [(220, 880), (320, 880), (420, 1000), (440, 1270), (300, 1290), (200, 1130)]
TAIL_R = [(860, 930), (960, 930), (1060, 1100), (1060, 1290), (960, 1260), (880, 1080)]
TORSO = [(470, 400), (760, 390), (790, 600), (740, 700), (700, 760), (560, 760), (470, 640)]
LEGS = [(280, 660), (420, 640), (560, 700), (700, 720), (720, 1000), (720, 1380), (430, 1380), (380, 1100), (300, 900)]
HAIR_L = [(500, 190), (410, 330), (300, 460), (200, 620), (130, 830)]
HAIR_R = [(790, 230), (880, 340), (990, 470), (1050, 630), (960, 840)]
EYES = [("eyeL", (598, 269)), ("eyeR", (670, 238))]
EYE_U = (math.cos(math.radians(EYE_ROT)), -math.sin(math.radians(EYE_ROT)))  # along the eye line (P)
EYE_N = (-EYE_U[1], EYE_U[0])  # down the face (P)


def smooth(a, b, x):
    if a == b:
        return 1.0 if x >= b else 0.0
    k = min(1.0, max(0.0, (x - a) / (b - a)))
    return k * k * (3 - 2 * k)


def seg_dist(p, a, b):
    ax, ay = a; bx, by = b
    dx, dy = bx - ax, by - ay
    L2 = dx * dx + dy * dy
    t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - ax) * dx + (p[1] - ay) * dy) / L2))
    return math.hypot(p[0] - ax - t * dx, p[1] - ay - t * dy), t


def inside(poly, p):
    x, y = p
    c = False
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def member(poly, p, f):
    d = min(seg_dist(p, a, b)[0] for a, b in zip(poly, poly[1:] + poly[:1]))
    sd = d if inside(poly, p) else -d
    return smooth(-f, f, sd)


def chain(points, bones, p):
    best = None
    for i, (a, b) in enumerate(zip(points, points[1:])):
        d, t = seg_dist(p, a, b)
        if best is None or d < best[0]:
            best = (d, i + t)
    d, s = best
    w = {}
    for k, bn in enumerate(bones):
        c = k + 0.5
        v = 1 - abs(s - c) / 0.75
        if k == 0 and s < c:
            v = 1
        if k == len(bones) - 1 and s > c:
            v = 1
        if v > 0:
            w[bn] = v
    tot = sum(w.values())
    return d, {k: v / tot for k, v in w.items()}


def body(p):
    y = p[1]
    hips = smooth(700, 820, y)
    chest = 1 - smooth(520, 640, y)
    spine = max(0.0, 1 - hips - chest)
    legs = smooth(980, 1080, y)
    return {"chest": chest, "spine": spine, "hips": hips * (1 - legs), "legs": hips * legs}


REGIONS = [
    (HAND_R, 16, {"handR": 1}),
    (ARM_R_FORE, 16, {"armR_fore": 1}),
    (ARM_R_UP, 18, {"armR_up": 1}),
    (HAND_L, 14, {"handL": 1}),
    (ARM_L, 16, {"armL": 1}),
    (HEAD, 20, "head"),
    (NECK, 20, {"neck": 1}),
    (SLEEVE, 24, ("chain", [(800, 620), (880, 760), (940, 880)], ["sleeve1", "sleeve2"])),
    (SKIRT_R, 24, {"skirtR": 1}),
    (DRAPE_L, 24, ("chain", [(300, 890), (300, 1080), (330, 1270)], ["drapeL1", "drapeL2"])),
    (TAIL_R, 24, ("chain", [(880, 940), (960, 1090), (1010, 1270)], ["tailR1", "tailR2"])),
    (TORSO, 24, "body"),
    (LEGS, 24, "body"),
]


def head_weights(p):
    w = {"head": 1.0}
    for bone, c in EYES:
        du = (p[0] - c[0]) * EYE_U[0] + (p[1] - c[1]) * EYE_U[1]
        dn = (p[0] - c[0]) * EYE_N[0] + (p[1] - c[1]) * EYE_N[1]
        r = math.hypot(du / 24.0, dn / 18.0)
        m = 1 - smooth(0.7, 1.25, r)
        if dn > 10:  # below the lower lid the cheek stays put
            m *= max(0.0, 1 - (dn - 10) / 8.0)
        if m > 0:
            w[bone] = m
            w["head"] -= m
    return w


def weights(p):
    out = {}
    left = 1.0

    def give(spec, amount):
        if amount <= 0:
            return
        if spec == "head":
            spec = head_weights(p)
        elif spec == "body":
            spec = body(p)
        elif isinstance(spec, tuple):
            spec = chain(spec[1], spec[2], p)[1]
        for b, v in spec.items():
            out[b] = out.get(b, 0) + v * amount

    for poly, f, spec in REGIONS:
        m = member(poly, p, f)
        if m > 0 and left > 1e-4:
            give(spec, m * left)
            left -= m * left
    if left > 1e-4:
        hair = []
        for pts, bones in ((HAIR_L, ["hairL1", "hairL2", "hairL3", "hairL4"]), (HAIR_R, ["hairR1", "hairR2", "hairR3", "hairR4"])):
            d, w = chain(pts, bones, p)
            m = 1 - smooth(110, 190, d)
            if m > 0:
                hair.append((m, w))
        if hair:
            tot = sum(m for m, _ in hair)
            share = min(1.0, max(m for m, _ in hair))
            for m, w in hair:
                give(w, left * share * m / tot)
            left -= left * share
        give("body", left)
    top = sorted(((v, b) for b, v in out.items() if v > 0.01), reverse=True)[:4]
    tot = sum(v for v, _ in top)
    return [(b, v / tot) for v, b in top]


# ---------------------------------------------------------------- meshes
EYE_ZONE = (570, 712, 214, 300)


def grid_lines(lo, size, step, dlo, dhi, dstep):
    lines = set(range(0, size, step)) | {size}
    lines |= {v - lo for v in range(dlo, dhi + 1, dstep) if 0 < v - lo < size}
    out = []
    for v in sorted(lines):
        if not out or v - out[-1] >= 3 or v == size:
            if out and v == size and size - out[-1] < 3:
                out[-1] = size
            else:
                out.append(v)
    return out


def mesh(layer, step, weight_fn, dense=True):
    x0, y0, w, h, img = layer["x0"], layer["y0"], layer["w"], layer["h"], layer["img"]
    if dense:
        xs = grid_lines(x0, w, step, EYE_ZONE[0], EYE_ZONE[1], 6)
        ys = grid_lines(y0, h, step, EYE_ZONE[2], EYE_ZONE[3], 6)
    else:
        xs = grid_lines(x0, w, step, 0, -1, 1)
        ys = grid_lines(y0, h, step, 0, -1, 1)
    alpha = img.split()[3]
    used = set()
    tris_cells = []
    for j in range(len(ys) - 1):
        for i in range(len(xs) - 1):
            box = (xs[i], ys[j], max(xs[i + 1], xs[i] + 1), max(ys[j + 1], ys[j] + 1))
            if alpha.crop(box).getbbox():
                tris_cells.append((i, j))
                used |= {(i, j), (i + 1, j), (i, j + 1), (i + 1, j + 1)}
    idx = {}
    uvs, verts = [], []
    for (i, j) in sorted(used, key=lambda v: (v[1], v[0])):
        idx[(i, j)] = len(idx)
        vx, vy = xs[i], ys[j]
        uvs += [round(vx / w, 5), round(vy / h, 5)]
        p = (x0 + vx, y0 + vy)
        s = S(p)
        ws = weight_fn(p)
        verts.append(len(ws))
        for b, v in ws:
            bx, by, br = WORLD[b]
            lx, ly = rot2(s[0] - bx, s[1] - by, -br)
            verts += [BONE_INDEX[b], round(lx, 2), round(ly, 2), round(v, 4)]
    tris = []
    for (i, j) in tris_cells:
        a, b, c, d = idx[(i, j)], idx[(i + 1, j)], idx[(i + 1, j + 1)], idx[(i, j + 1)]
        tris += [a, b, c, a, c, d]
    return {"type": "mesh", "uvs": uvs, "triangles": tris, "vertices": verts, "hull": 0, "width": w, "height": h}


def cloud_weights(p):
    x = p[0]
    l = 1 - smooth(250, 500, x)
    r = smooth(580, 830, x)
    out = [("cloud_L", l), ("cloud_R", r), ("cloud_C", max(0.0, 1 - l - r))]
    out = [(b, v) for b, v in out if v > 0.01]
    tot = sum(v for _, v in out)
    return [(b, v / tot) for b, v in out]


# ---------------------------------------------------------------- pose helpers
def sm(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def back_out(x):
    x = min(1.0, max(0.0, x))
    c = 1.7
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def track(t, keys, ease=sm):
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, v0), (t1, v1) in zip(keys, keys[1:]):
        if t <= t1:
            k = ease((t - t0) / (t1 - t0)) if t1 > t0 else 1.0
            if isinstance(v0, tuple):
                return tuple(a + (b - a) * k for a, b in zip(v0, v1))
            return v0 + (v1 - v0) * k
    return keys[-1][1]


def bump(t, a, b, edge=0.25):
    return sm((t - a) / edge) * sm((b - t) / edge)


def catmull(t, pts):
    """pts: [(time, (x, y))]; uniform Catmull-Rom through the points, timed per segment."""
    if t <= pts[0][0]:
        return pts[0][1]
    if t >= pts[-1][0]:
        return pts[-1][1]
    for i in range(len(pts) - 1):
        if pts[i][0] <= t <= pts[i + 1][0]:
            break
    p0 = pts[max(0, i - 1)][1]; p1 = pts[i][1]; p2 = pts[i + 1][1]; p3 = pts[min(len(pts) - 1, i + 2)][1]
    u = (t - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
    u2, u3 = u * u, u * u * u
    return tuple(0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3)
                 for a, b, c, d in zip(p0, p1, p2, p3))


class Pose(dict):
    def add(self, bone, r=0.0, x=0.0, y=0.0, sx=1.0, sy=1.0):
        e = self.setdefault(bone, [0.0, 0.0, 0.0, 1.0, 1.0])
        e[0] += r; e[1] += x; e[2] += y; e[3] *= sx; e[4] *= sy


def fk(pose):
    W = {}
    for name in ORDER:
        lx, ly, lr = LOCAL[name]
        o = pose.get(name, (0, 0, 0, 1, 1))
        r = math.radians(lr + o[0])
        a, b, c, d = math.cos(r) * o[3], -math.sin(r) * o[4], math.sin(r) * o[3], math.cos(r) * o[4]
        x, y = lx + o[1], ly + o[2]
        par = PARENT[name]
        if par:
            pa, pb, pc, pd, px, py = W[par]
            W[name] = (pa * a + pb * c, pa * b + pb * d, pc * a + pd * c, pc * b + pd * d, pa * x + pb * y + px, pc * x + pd * y + py)
        else:
            W[name] = (a, b, c, d, x, y)
    return W


def palm_P(pose):
    W = fk(pose)["palm"]
    return P((W[4], W[5]))


CYAN = (0x8f, 0xe9, 0xff)
CYAN_HOT = (0xc4, 0xf7, 0xff)
GOLD = (0xff, 0xe2, 0x7a)
WHITE = (0xff, 0xff, 0xff)


def life(pose, t, b, s, h, e=1.0):
    """Breathing, sway, floating, hair and cloth waves, cloud morph. Periods divide the loop."""
    sb, ss = math.sin(TAU * t / b), math.sin(TAU * t / s)
    pose.add("hips", y=8 * e * math.sin(TAU * t / b + 0.6))
    pose.add("spine", r=2.0 * e * ss)
    pose.add("chest", r=0.9 * e * math.sin(TAU * t / s - 0.7), sx=1 + 0.008 * sb, sy=1 + 0.018 * sb)
    pose.add("neck", r=-0.8 * e * ss)
    pose.add("head", r=2.5 * e * math.sin(TAU * t / s - 1.3))
    for i in range(4):
        pose.add(f"hairL{i + 1}", r=(2.0 + 1.5 * i) * e * math.sin(TAU * t / h - 0.9 * i))
        pose.add(f"hairR{i + 1}", r=(1.8 + 1.6 * i) * e * math.sin(TAU * t / h - 0.9 * i + 1.7))
    for i in range(2):
        pose.add(f"sleeve{i + 1}", r=1.5 * e * math.sin(TAU * t / h - 0.6 * i + 0.8))
        pose.add(f"drapeL{i + 1}", r=1.6 * e * math.sin(TAU * t / h - 0.7 * i + 0.3))
        pose.add(f"tailR{i + 1}", r=2.0 * e * math.sin(TAU * t / h - 0.8 * i + 1.1))
    pose.add("skirtR", r=1.2 * e * math.sin(TAU * t / h + 2.2))
    pose.add("wing_L", r=3 * e * math.sin(TAU * t / (b / 2)))
    pose.add("wing_R", r=-3 * e * math.sin(TAU * t / (b / 2) + 0.4))
    pose.add("halo", r=1.5 * ss, y=5 * math.sin(TAU * t / b + 1.2))
    pose.add("armL", r=0.6 * math.sin(TAU * t / b + 0.3))
    pose.add("handL", r=0.8 * math.sin(TAU * t / b - 0.4))
    pose.add("armR_up", r=0.8 * e * math.sin(TAU * t / s + 0.5))
    pose.add("armR_fore", r=0.8 * math.sin(TAU * t / b + 1.0))
    pose.add("handR", r=1.0 * math.sin(TAU * t / b + 1.6))
    k = 1 + 0.025 * sb
    pose.add("cloud_L", x=4 * ss, sx=k, sy=k)
    pose.add("cloud_C", y=5 * math.sin(TAU * t / b + 1.5), sx=1 + 0.015 * math.sin(TAU * t / s + 1))
    k = 1 + 0.025 * math.sin(TAU * t / b + 2.4)
    pose.add("cloud_R", x=-4 * math.sin(TAU * t / s + 0.5), sx=k, sy=k)


def flutter(pose, t, env, amp=9, hz=6):
    if env > 0:
        pose.add("wing_L", r=amp * env * math.sin(TAU * hz * t))
        pose.add("wing_R", r=-amp * env * math.sin(TAU * hz * t + 0.5))


def blink(t, times):
    v = 1.0
    for tb in times:
        d = t - tb
        if 0 <= d < 0.07:
            v *= 1 - 0.92 * sm(d / 0.07)
        elif 0.07 <= d < 0.11:
            v *= 0.08
        elif 0.11 <= d < 0.23:
            v *= 0.08 + 0.92 * sm((d - 0.11) / 0.12)
    return v


def eyes(pose, sy):
    pose.add("eyeL", sy=sy)
    pose.add("eyeR", sy=sy)


def look(pose, amount):
    """Head, neck and a bit of the body turn toward the wisp (+ = toward her left)."""
    pose.add("head", r=amount)
    pose.add("neck", r=0.35 * amount)
    pose.add("chest", r=0.2 * amount)
    pose.add("spine", r=0.25 * amount)


def look_at(wx):
    return max(-5.5, min(5.5, (690 - wx) / 55.0))


def twinkle(slots, pose, slot, bone, t, starts, dur=0.5, size=0.55):
    a = 0.0
    for t0 in starts:
        if t0 <= t < t0 + dur:
            a = max(a, math.sin(math.pi * (t - t0) / dur))
    pose.add(bone, r=90 * t, sx=max(0.01, a * size), sy=max(0.01, a * size))
    slots[slot] = (WHITE, a)


def bursts(slots, pose, t, starts, dist=150, dur=0.45):
    best = (0.0, 0.0)
    for t0 in starts:
        if t0 <= t < t0 + dur:
            d = (t - t0) / dur
            best = max(best, (math.sin(math.pi * d), back_out(d)))
    a, d = best
    for k in range(4):
        ang = math.radians(45 + 90 * k)
        pose.add(f"burst{k + 1}", x=dist * d * math.cos(ang), y=dist * d * math.sin(ang), r=180 * d,
                 sx=max(0.01, 0.6 * a), sy=max(0.01, 0.6 * a))
        slots[f"burst{k + 1}"] = (WHITE, a)


# ---------------------------------------------------------------- animations
# Each animation: body(t) -> Pose (no wisp); wisp(t, pose) -> (P position, scale, rgb, glow alpha, look?)
IDLE = dict(b=3.0, s=6.0, h=3.0)
FEAT = dict(b=1.5, s=3.0, h=1.5)


def landed(t, pose, lift=0.0):
    x, y = palm_P(pose)
    return (x, y - lift - 4 * math.sin(TAU * t / 0.75))


def anim_idle_01():
    dur = 6.0

    def body_(t):
        p = Pose()
        life(p, t, **IDLE)
        p.add("armR_fore", r=track(t, [(0, 0), (1.2, 0), (1.32, -4), (1.5, 7), (1.9, 0), (4.6, 0), (4.95, 5), (5.35, -1), (6, 0)]))
        p.add("handR", r=track(t, [(0, 0), (1.2, 0), (1.32, -6), (1.5, 10), (1.9, 0), (4.6, 0), (4.95, 8), (5.35, -2), (6, 0)]))
        flutter(p, t, bump(t, 2.0, 3.4))
        eyes(p, blink(t, [0.7, 3.25]))
        return p

    start, end = landed(1.4, body_(1.4)), landed(5.3, body_(5.3))
    path = [(1.4, start), (1.8, (930, 360)), (2.2, (850, 190)), (2.6, (705, 85)), (3.0, (545, 95)), (3.4, (455, 200)),
            (3.8, (560, 55)), (4.2, (760, 110)), (4.6, (890, 290)), (5.0, (925, 430)), (5.3, end)]

    def wisp(t, p):
        pos = landed(t, p) if (t < 1.4 or t >= 5.3) else catmull(t, path)
        on = track(t, [(0, 1), (1.4, 1), (1.7, 0), (5.0, 0), (5.3, 1), (6, 1)])
        scale = track(t, [(0, 1), (1.35, 1), (1.6, 0.85), (5.1, 0.85), (5.3, 1.35), (5.8, 1.0), (6, 1)]) * (1 + 0.06 * on * math.sin(TAU * t / 0.75))
        rgb = track(t, [(0, CYAN), (1.35, CYAN), (1.6, GOLD), (5.15, GOLD), (5.35, CYAN), (6, CYAN)])
        lk = on * -3.5 + (1 - on) * look_at(pos[0])
        return pos, scale, rgb, 0.7 + 0.2 * on, lk

    def extra(t, p, slots):
        twinkle(slots, p, "halo_spark1", "halo_spark1", t, [1.0, 4.0])
        twinkle(slots, p, "halo_spark2", "halo_spark2", t, [2.5, 5.2])
        bursts(slots, p, t, [5.3])

    return dur, True, body_, wisp, extra


def anim_idle_02():
    dur = 6.0
    halo_c = (608, 70)

    def body_(t):
        p = Pose()
        life(p, t, **IDLE)
        p.add("armR_up", r=track(t, [(0, 0), (0.6, 0), (1.3, 16), (3.4, 16), (4.3, 0), (6, 0)]))
        p.add("armR_fore", r=track(t, [(0, 0), (0.6, 0), (1.3, 10), (3.4, 10), (4.3, 0), (6, 0)]))
        p.add("handR", r=track(t, [(0, 0), (0.6, 0), (1.0, -4), (1.4, 12), (3.4, 8), (4.3, 0), (6, 0)]))
        p.add("spine", r=track(t, [(0, 0), (1.2, 0), (1.8, -1.8), (3.6, -1.8), (4.4, 0), (6, 0)]))
        p.add("halo", r=track(t, [(0, 0), (1.8, 0), (2.6, 12), (3.4, -6), (4.0, 0), (6, 0)]))
        flutter(p, t, bump(t, 1.8, 3.6), amp=7)
        eyes(p, blink(t, [1.0, 4.9, 5.15]))
        return p

    start, end = landed(1.45, body_(1.45)), landed(4.6, body_(4.6))
    circle = []
    for i in range(13):
        tt = 1.9 + 1.6 * i / 12
        th = math.pi * 3 * i / 12
        circle.append((tt, (halo_c[0] + 170 * math.cos(th), halo_c[1] + 60 + 70 * math.sin(th))))
    path = [(1.45, start), (1.7, (870, 300))] + circle + [(3.95, (820, 250)), (4.3, (900, 380)), (4.6, end)]

    def wisp(t, p):
        pos = landed(t, p) if (t < 1.45 or t >= 4.6) else catmull(t, path)
        on = track(t, [(0, 1), (1.45, 1), (1.7, 0), (4.3, 0), (4.6, 1), (6, 1)])
        scale = track(t, [(0, 1), (1.4, 1), (1.7, 0.85), (4.4, 0.85), (4.6, 1.3), (5.1, 1.0), (6, 1)]) * (1 + 0.06 * on * math.sin(TAU * t / 0.75))
        rgb = track(t, [(0, CYAN), (1.4, CYAN), (1.7, GOLD), (4.45, GOLD), (4.65, CYAN), (6, CYAN)])
        lk = on * -3.5 + (1 - on) * look_at(pos[0])
        return pos, scale, rgb, 0.7 + 0.2 * on, lk

    def extra(t, p, slots):
        slots["halo_glow"] = ((0xff, 0xe9, 0xa0), track(t, [(0, 0.0), (1.8, 0.0), (2.4, 0.9), (3.6, 0.9), (4.2, 0.0), (6, 0.0)]))
        twinkle(slots, p, "halo_spark1", "halo_spark1", t, [2.2, 3.0])
        twinkle(slots, p, "halo_spark2", "halo_spark2", t, [2.6, 3.4])
        bursts(slots, p, t, [4.6])

    return dur, True, body_, wisp, extra


def simple(dur, keys_fn, wisp_fn, extra_fn=None, per=IDLE, e=1.0):
    def body_(t):
        p = Pose()
        life(p, t, e=e, **per)
        keys_fn(t, p)
        return p
    return dur, False, body_, wisp_fn, extra_fn or (lambda t, p, s: None)


def anim_spin_ack():
    def keys(t, p):
        p.add("spine", r=track(t, [(0, 0), (0.15, 2.2), (0.5, 0)]))
        p.add("hips", y=track(t, [(0, 0), (0.12, -4), (0.35, 1), (0.5, 0)]))
        p.add("armR_fore", r=track(t, [(0, 0), (0.1, -3), (0.24, 6), (0.5, 0)]))
        p.add("handR", r=track(t, [(0, 0), (0.1, -4), (0.24, 8), (0.5, 0)]))

    def wisp(t, p):
        x, y = landed(t, p)
        hop = 55 * math.sin(math.pi * min(1, max(0, (t - 0.08) / 0.4)))
        return (x, y - hop), 1 + 0.25 * math.sin(math.pi * min(1, t / 0.4)), CYAN_HOT, 0.95, -3.5
    return simple(0.5, keys, wisp)


def anim_cascade():
    def keys(t, p):
        p.add("hips", y=track(t, [(0, 0), (0.12, 8), (0.4, 0)]))
        p.add("head", r=track(t, [(0, 0), (0.15, 2), (0.4, 0)]))

    def wisp(t, p):
        x, y = landed(t, p)
        hop = 35 * math.sin(math.pi * min(1, t / 0.4))
        return (x, y - hop), 1 + 0.3 * math.sin(math.pi * min(1, t / 0.4)), CYAN_HOT, 0.95, -3.5

    def extra(t, p, slots):
        bursts(slots, p, t, [0.08], dist=100, dur=0.32)
    return simple(0.4, keys, wisp, extra)


def anim_small_win():
    def keys(t, p):
        p.add("hips", y=track(t, [(0, 0), (0.2, 16), (0.5, 0), (0.62, 4), (0.8, 0)]))
        p.add("spine", r=track(t, [(0, 0), (0.2, 2), (0.8, 0)]))
        p.add("head", r=track(t, [(0, 0), (0.25, 5), (0.8, 0)]))
        p.add("halo", y=track(t, [(0, 0), (0.25, 10), (0.8, 0)]))
        flutter(p, t, bump(t, 0.1, 0.6, 0.1), amp=10, hz=7)
        eyes(p, track(t, [(0, 1), (0.12, 0.5), (0.5, 0.5), (0.7, 1)]))

    def wisp(t, p):
        x, y = landed(t, p)
        hop = 90 * track(t, [(0, 0), (0.3, 1), (0.75, 0)], ease=lambda k: k)
        hop = 90 * (math.sin(math.pi * min(1, t / 0.75)))
        rgb = track(t, [(0, CYAN), (0.22, WHITE), (0.5, CYAN)])
        return (x, y - hop), track(t, [(0, 1), (0.3, 1.4), (0.8, 1)]), rgb, 0.95, -3.5

    def extra(t, p, slots):
        bursts(slots, p, t, [0.25], dist=130)
    return simple(0.8, keys, wisp, extra)


def anim_medium_win():
    def keys(t, p):
        p.add("hips", y=track(t, [(0, 0), (0.25, 20), (0.6, 0), (0.75, 6), (1.1, 0)]))
        p.add("armR_up", r=track(t, [(0, 0), (0.3, 15), (0.8, 15), (1.1, 0)]))
        p.add("armR_fore", r=track(t, [(0, 0), (0.3, 8), (0.8, 8), (1.1, 0)]))
        p.add("head", r=track(t, [(0, 0), (0.3, 5), (1.1, 0)]))
        p.add("halo", y=track(t, [(0, 0), (0.3, 12), (1.1, 0)]), sx=track(t, [(0, 1), (0.35, 1.15), (1.1, 1)]), sy=track(t, [(0, 1), (0.35, 1.15), (1.1, 1)]))
        flutter(p, t, bump(t, 0.15, 0.9, 0.15), amp=12, hz=7)
        eyes(p, track(t, [(0, 1), (0.15, 0.5), (0.8, 0.5), (1.0, 1)]))

    def wisp(t, p):
        x, y = landed(t, p)
        hop = 170 * math.sin(math.pi * min(1, t / 1.0))
        rgb = track(t, [(0, CYAN), (0.42, WHITE), (0.7, GOLD), (1.0, CYAN)])
        return (x - 40 * math.sin(math.pi * min(1, t)), y - hop), track(t, [(0, 1), (0.45, 1.5), (1.1, 1)]), rgb, 0.95, -3.5 + 2 * math.sin(math.pi * min(1, t))

    def extra(t, p, slots):
        bursts(slots, p, t, [0.45], dist=160)
        slots["halo_glow"] = ((0xff, 0xe9, 0xa0), track(t, [(0, 0.0), (0.35, 0.8), (1.1, 0.0)]))
    return simple(1.1, keys, wisp, extra)


def anim_anticipation():
    def keys(t, p):
        p.add("spine", r=track(t, [(0, 0), (0.5, 3.5)]))
        p.add("chest", r=track(t, [(0, 0), (0.5, 1.5)]))
        p.add("head", r=track(t, [(0, 0), (0.6, 5)]))
        p.add("hips", x=track(t, [(0, 0), (0.5, -12)]))
        p.add("armR_up", r=track(t, [(0, 0), (0.5, -6)]))
        p.add("armR_fore", r=track(t, [(0, 0), (0.5, 8)]))
        p.add("handR", r=track(t, [(0, 0), (0.5, 10)]))
        p.add("halo", sx=track(t, [(0, 1), (0.5, 1.1)]), sy=track(t, [(0, 1), (0.5, 1.1)]))
        flutter(p, t, track(t, [(0, 0), (0.4, 0.6)]), amp=6, hz=8)
        eyes(p, track(t, [(0, 1), (0.3, 1.08)]))

    def wisp(t, p):
        x, y = landed(t, p, lift=track(t, [(0, 0), (0.5, 25)]))
        k = track(t, [(0, 0), (0.4, 1)])
        return (x + 3 * k * math.sin(TAU * 14 * t), y + 3 * k * math.sin(TAU * 17 * t + 1)), track(t, [(0, 1), (0.5, 1.35)]), CYAN_HOT, 1.0, track(t, [(0, -3.5), (0.6, 0)])

    def extra(t, p, slots):
        slots["halo_glow"] = ((0xff, 0xe9, 0xa0), track(t, [(0, 0.0), (0.6, 0.6)]))
    return simple(1.5, keys, wisp, extra, e=1.2)


ORBIT_C, ORBIT_R = (680, 330), (300, 190)


def orbit(t):
    th = TAU * t / 3.0
    return (ORBIT_C[0] + ORBIT_R[0] * math.cos(th), ORBIT_C[1] - ORBIT_R[1] * math.sin(th))


def anim_feature_trigger():
    def keys(t, p):
        p.add("hips", y=track(t, [(0, 0), (0.22, -8), (0.55, 26), (0.9, 6), (1.5, 0)]))
        p.add("spine", r=track(t, [(0, 0), (0.22, 2), (0.55, -2), (1.5, 0)]))
        p.add("armR_up", r=track(t, [(0, 0), (0.22, -4), (0.55, 38), (0.9, 30), (1.5, 8)]))
        p.add("armR_fore", r=track(t, [(0, 0), (0.55, 18), (0.9, 12), (1.5, 4)]))
        p.add("handR", r=track(t, [(0, 0), (0.55, 14), (1.5, 0)]))
        p.add("head", r=track(t, [(0, 0), (0.55, 4), (1.5, 0)]))
        p.add("neck", r=track(t, [(0, 0), (0.55, -3), (1.5, 0)]))
        k = track(t, [(0, 1), (0.6, 1.3), (1.5, 1.05)])
        p.add("halo", sx=k, sy=k)
        flutter(p, t, bump(t, 0.3, 1.2, 0.15), amp=14, hz=7)
        eyes(p, track(t, [(0, 1), (0.4, 1), (0.55, 0.45), (1.0, 0.45), (1.3, 1)]))

    top = (720, 20)

    def wisp(t, p):
        if t < 0.3:
            pos = landed(t, p)
        else:
            pos = catmull(t, [(0.3, landed(0.3, p)), (0.55, (820, 200)), (0.75, top), (1.0, (860, 130)), (1.25, (960, 250)), (1.5, orbit(0))])
        scale = track(t, [(0, 1), (0.3, 1), (0.7, 1.1), (0.78, 2.4), (1.0, 0.9), (1.5, 0.95)])
        rgb = track(t, [(0, CYAN), (0.3, CYAN_HOT), (0.72, WHITE), (1.0, GOLD)])
        return pos, scale, rgb, 1.0, track(t, [(0, -3.5), (0.5, 2), (1.5, look_at(orbit(0)[0]))])

    def extra(t, p, slots):
        bursts(slots, p, t, [0.75], dist=220, dur=0.55)
        slots["halo_glow"] = ((0xff, 0xe9, 0xa0), track(t, [(0, 0.3), (0.6, 1.0), (1.5, 0.6)]))
        twinkle(slots, p, "halo_spark1", "halo_spark1", t, [0.55])
        twinkle(slots, p, "halo_spark2", "halo_spark2", t, [0.7])
    return simple(1.5, keys, wisp, extra, per=FEAT, e=1.3)


def anim_feature_idle():
    dur = 3.0

    def body_(t):
        p = Pose()
        life(p, t, e=1.6, **FEAT)
        p.add("armR_up", r=8)
        p.add("armR_fore", r=4)
        p.add("halo", r=2.5 * math.sin(TAU * t / 3))
        flutter(p, t, 1.0, amp=5, hz=3)
        eyes(p, blink(t, [1.1]))
        return p

    def wisp(t, p):
        pos = orbit(t)
        return pos, 0.9 + 0.12 * math.sin(TAU * t / 0.75), GOLD, 0.8, look_at(pos[0])

    def extra(t, p, slots):
        slots["halo_glow"] = ((0xff, 0xe9, 0xa0), 0.6 + 0.2 * math.sin(TAU * t / 1.5))
        twinkle(slots, p, "halo_spark1", "halo_spark1", t, [0.4, 1.9])
        twinkle(slots, p, "halo_spark2", "halo_spark2", t, [1.2, 2.6])
    return dur, True, body_, wisp, extra


def anim_big_win():
    def keys(t, p):
        p.add("hips", y=track(t, [(0, 0), (0.25, 22), (0.5, 0), (0.75, 26), (1.05, 0), (1.2, 5), (1.45, 0)]))
        p.add("armR_up", r=track(t, [(0, 0), (0.35, 30), (1.4, 30), (2.0, 0)]))
        p.add("armR_fore", r=track(t, [(0, 0), (0.35, 14), (1.4, 14), (2.0, 0)]))
        p.add("handR", r=track(t, [(0, 0), (0.35, 12), (1.4, 12), (2.0, 0)]))
        p.add("head", r=track(t, [(0, 0), (0.4, 6), (1.4, 6), (2.0, 0)]))
        p.add("neck", r=track(t, [(0, 0), (0.4, -3), (1.4, -3), (2.0, 0)]))
        k = track(t, [(0, 1), (0.4, 1.25), (1.6, 1.25), (2.2, 1)])
        p.add("halo", sx=k, sy=k)
        flutter(p, t, bump(t, 0.2, 1.6, 0.2), amp=14, hz=7)
        eyes(p, track(t, [(0, 1), (0.3, 0.45), (1.5, 0.45), (1.8, 1)]))

    c, r, th0 = (690, 300), (260, 200), 0.8

    def circle(t):
        th = th0 + 2 * TAU * (t - 0.5) / 1.2
        return (c[0] + r[0] * math.cos(th), c[1] + r[1] * math.sin(th))

    def wisp(t, p):
        if t < 0.3 or t >= 2.1:
            pos = landed(t, p)
        elif t < 0.5:
            pos = catmull(t, [(0.3, landed(0.3, p)), (0.5, circle(0.5))])
        elif t < 1.7:
            pos = circle(t)
        else:
            pos = catmull(t, [(1.7, circle(1.7)), (1.9, (930, 420)), (2.1, landed(2.1, p))])
        on = track(t, [(0, 1), (0.3, 1), (0.45, 0), (1.95, 0), (2.1, 1)])
        flash = max(bump(t, 0.45, 0.6, 0.06), bump(t, 0.95, 1.1, 0.06), bump(t, 1.45, 1.6, 0.06))
        rgb = tuple(a + (b - a) * flash for a, b in zip(track(t, [(0, CYAN), (0.3, GOLD), (1.95, GOLD), (2.1, CYAN)]), WHITE))
        scale = (0.95 + 0.5 * flash) * track(t, [(0, 1), (2.1, 1.3), (2.2, 1.2)])
        return pos, scale, rgb, 0.9, on * -3.5 + (1 - on) * look_at(pos[0])

    def extra(t, p, slots):
        bursts(slots, p, t, [0.5, 1.0, 1.5], dist=170)
        slots["halo_glow"] = ((0xff, 0xe9, 0xa0), track(t, [(0, 0.0), (0.4, 1.0), (1.6, 1.0), (2.2, 0.0)]))
        twinkle(slots, p, "halo_spark1", "halo_spark1", t, [0.4, 1.2])
        twinkle(slots, p, "halo_spark2", "halo_spark2", t, [0.8, 1.6])
    return simple(2.2, keys, wisp, extra, e=1.3)


def anim_settle():
    def keys(t, p):
        p.add("armR_up", r=track(t, [(0, 8), (0.7, 0)]))
        p.add("armR_fore", r=track(t, [(0, 4), (0.7, 0)]))

    def wisp(t, p):
        pos = catmull(t, [(0, orbit(0)), (0.3, (960, 400)), (0.6, landed(0.6, p))]) if t < 0.6 else landed(t, p)
        rgb = track(t, [(0, GOLD), (0.45, GOLD), (0.65, CYAN)])
        on = track(t, [(0, 0), (0.6, 1)])
        return pos, track(t, [(0, 0.95), (0.6, 1.25), (0.7, 1.1)]), rgb, 0.85, on * -3.5 + (1 - on) * look_at(pos[0])
    return simple(0.7, keys, wisp)


ANIMS = {
    "idle_01": anim_idle_01, "idle_02": anim_idle_02, "spin_ack": anim_spin_ack, "cascade_continue": anim_cascade,
    "small_win": anim_small_win, "medium_win": anim_medium_win, "anticipation": anim_anticipation,
    "feature_trigger": anim_feature_trigger, "feature_idle": anim_feature_idle, "big_win": anim_big_win,
    "settle_to_idle": anim_settle,
}

WISP0 = S((910, 505))


# The arm is painted into the body: big swings tear the sleeve and open holes behind it, so the
# choreography's arm angles are scaled down here (the wisp, hops, head and halo carry the energy).
ARM_SCALE = {"armR_up": 0.2, "armR_fore": 0.45, "handR": 0.8}


def frame(spec, t):
    dur, loop, body_, wisp, extra = spec
    tw = (t % dur) if loop else min(max(t, 0.0), dur)
    pose = body_(tw)
    for b, k in ARM_SCALE.items():
        if b in pose:
            pose[b][0] *= k
    pos, scale, rgb, glow_a, lk = wisp(tw, pose)
    look(pose, lk)
    s = S(pos)
    pose.add("wisp", x=s[0] - WISP0[0], y=s[1] - WISP0[1], sx=scale, sy=scale)
    pose.add("wisp_spin", r=-60 * tw)
    # Little wings: folded and slow on her palm, beating in flight.
    px, py = palm_P(pose)
    fly = smooth(15, 60, math.hypot(pos[0] - px, pos[1] - py))
    flap = (8 + 24 * fly) * math.sin(TAU * 7 * tw)
    pose.add("wisp_wL", r=flap + 10 * (1 - fly))
    pose.add("wisp_wR", r=-flap - 10 * (1 - fly))
    slots = {"wisp_glow": (rgb, glow_a), "wisp_core": (tuple(min(255, int(c * 0.55 + 255 * 0.45)) for c in rgb), 1.0),
             "wisp_star": (WHITE, 1.0)}
    extra(tw, pose, slots)
    return pose, slots, s


def build_animation(spec):
    dur, loop = spec[0], spec[1]
    n = int(round(dur * FPS))
    times = [i / FPS for i in range(n + 1)]
    frames = [frame(spec, t) for t in times]
    # Trails: where the wisp was a moment ago (fade with speed).
    for i, (pose, slots, s) in enumerate(frames):
        for k, lag in ((1, 2), (2, 4)):
            j = i - lag
            if loop:
                j %= n
            else:
                j = max(0, j)
            ps = frames[j][2]
            speed = math.hypot(s[0] - ps[0], s[1] - ps[1]) * FPS / lag
            a = max(0.0, min(0.75, (speed - 250) / 1400))
            pose.add(f"trail{k}", x=ps[0] - WISP0[0], y=ps[1] - WISP0[1], sx=0.5 - 0.12 * k, sy=0.5 - 0.12 * k)
            slots[f"trail{k}"] = (frames[i][1]["wisp_glow"][0], a * (1.0 - 0.3 * k))
    if loop:  # the last frame is the first one: seamless loop
        frames[-1] = frames[0]
    bones, slot_tl = {}, {}
    names = sorted({b for f in frames for b in f[0]})
    for b in names:
        vals = [f[0].get(b, [0, 0, 0, 1, 1]) for f in frames]
        tl = {}
        if any(abs(v[0]) > 1e-3 for v in vals):
            tl["rotate"] = keys1(times, [v[0] for v in vals], 0.05, "value")
        if any(abs(v[1]) > 1e-2 or abs(v[2]) > 1e-2 for v in vals):
            tl["translate"] = keys2(times, [(v[1], v[2]) for v in vals], 0.3, 0.0)
        if any(abs(v[3] - 1) > 1e-4 or abs(v[4] - 1) > 1e-4 for v in vals):
            tl["scale"] = keys2(times, [(v[3], v[4]) for v in vals], 0.002, 1.0)
        if tl:
            bones[b] = tl
    for sl in sorted({s for f in frames for s in f[1]}):
        vals = []
        for f in frames:
            rgb, a = f[1].get(sl, (WHITE, SETUP_ALPHA.get(sl, 1.0)))
            vals.append((rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, max(0.0, min(1.0, a))))
        slot_tl[sl] = {"rgba": keys_color(times, vals)}
    out = {"bones": bones}
    if slot_tl:
        out["slots"] = slot_tl
    return out


def decimate(times, vals, tol):
    """Keep the keys needed for linear interpolation within tol (vals: tuples)."""
    keep = [0]
    i = 0
    n = len(vals)
    while i < n - 1:
        j = i + 1
        while j + 1 < n:
            ok = True
            for m in range(i + 1, j + 2):
                k = (times[m] - times[i]) / (times[j + 1] - times[i])
                for c in range(len(vals[0])):
                    if abs(vals[i][c] + (vals[j + 1][c] - vals[i][c]) * k - vals[m][c]) > tol:
                        ok = False
                        break
                if not ok:
                    break
            if not ok:
                break
            j += 1
        keep.append(j)
        i = j
    return keep


def keys1(times, vals, tol, field):
    keep = decimate(times, [(v,) for v in vals], tol)
    out = []
    for i in keep:
        k = {"time": round(times[i], 4)} if times[i] else {}
        k[field] = round(vals[i], 3)
        out.append(k)
    return out


def keys2(times, vals, tol, default):
    keep = decimate(times, vals, tol)
    out = []
    for i in keep:
        k = {"time": round(times[i], 4)} if times[i] else {}
        x, y = vals[i]
        if abs(x - default) > 1e-6:
            k["x"] = round(x, 4)
        if abs(y - default) > 1e-6:
            k["y"] = round(y, 4)
        out.append(k)
    return out


def keys_color(times, vals):
    keep = decimate(times, vals, 1.5 / 255)
    out = []
    for i in keep:
        k = {"time": round(times[i], 4)} if times[i] else {}
        k["color"] = "".join(f"{int(round(c * 255)):02x}" for c in vals[i])
        out.append(k)
    return out


SETUP_ALPHA = {"halo_glow": 0.0, "halo_spark1": 0.0, "halo_spark2": 0.0, "trail1": 0.0, "trail2": 0.0,
               "burst1": 0.0, "burst2": 0.0, "burst3": 0.0, "burst4": 0.0}


# ---------------------------------------------------------------- skeleton
def main():
    os.makedirs(IMG, exist_ok=True)
    for f in os.listdir(IMG):
        if f.endswith(".png"):
            os.remove(os.path.join(IMG, f))
    centres = v28_centres()
    back = flatten(BACK, centres, "body_back")
    front = flatten(FRONT, centres, "body_front")
    for n in ("cloud", "halo", "wing_L", "wing_R", "fx_spark"):
        Image.open(os.path.join(SRC, n + ".png")).save(os.path.join(IMG, n + ".png"))
    def radial(name, profile):
        a = Image.new("L", (128, 128))
        a.putdata([int(255 * profile(min(1.0, math.hypot(x - 63.5, y - 63.5) / 64))) for y in range(128) for x in range(128)])
        Image.merge("RGBA", (Image.new("L", (128, 128), 255),) * 3 + (a,)).save(os.path.join(IMG, name + ".png"))
    radial("fx_soft", lambda r: max(0.0, 1 - r) ** 1.8)  # glows and trails
    radial("fx_orb", lambda r: 1.0 if r < 0.55 else max(0.0, 1 - (r - 0.55) / 0.45) ** 1.5)  # the wisp's body
    cloud_img = Image.open(os.path.join(SRC, "cloud.png")).convert("RGBA")
    ccx, ccy = centres["cloud"]
    cloud = {"x0": ccx - cloud_img.width / 2, "y0": ccy - cloud_img.height / 2, "w": cloud_img.width, "h": cloud_img.height, "img": cloud_img}

    bones = []
    for name in ORDER:
        b = {"name": name}
        if PARENT[name]:
            b["parent"] = PARENT[name]
        lx, ly, lr = LOCAL[name]
        if abs(lx) > 1e-3:
            b["x"] = round(lx, 2)
        if abs(ly) > 1e-3:
            b["y"] = round(ly, 2)
        if abs(lr) > 1e-3:
            b["rotation"] = round(lr, 3)
        if name in LENGTH:
            b["length"] = round(LENGTH[name], 2)
        bones.append(b)

    def at(name, p):  # region attachment centred on P, in the bone's setup space
        bx, by, br = WORLD[name]
        s = S(p)
        lx, ly = rot2(s[0] - bx, s[1] - by, -br)
        return {"x": round(lx, 2), "y": round(ly, 2), "rotation": round(-br, 3)} if abs(br) > 1e-3 else {"x": round(lx, 2), "y": round(ly, 2)}

    def size(n):
        with Image.open(os.path.join(IMG, n + ".png")) as im:
            return {"width": im.width, "height": im.height}

    slots = [
        {"name": "cloud", "bone": "cloud_root", "attachment": "cloud"},
        {"name": "body_back", "bone": "hips", "attachment": "body_back"},
        {"name": "halo_glow", "bone": "halo", "color": "ffe9a000", "attachment": "fx_soft", "blend": "additive"},
        {"name": "halo", "bone": "halo", "attachment": "halo"},
        {"name": "wing_L", "bone": "wing_L", "attachment": "wing_L"},
        {"name": "wing_R", "bone": "wing_R", "attachment": "wing_R"},
        {"name": "body_front", "bone": "hips", "attachment": "body_front"},
        {"name": "halo_spark1", "bone": "halo_spark1", "color": "ffffff00", "attachment": "fx_spark", "blend": "additive"},
        {"name": "halo_spark2", "bone": "halo_spark2", "color": "ffffff00", "attachment": "fx_spark", "blend": "additive"},
        {"name": "trail2", "bone": "trail2", "color": "ffffff00", "attachment": "fx_soft", "blend": "additive"},
        {"name": "trail1", "bone": "trail1", "color": "ffffff00", "attachment": "fx_soft", "blend": "additive"},
        {"name": "wisp_glow", "bone": "wisp", "color": "8fe9ffe6", "attachment": "fx_soft"},
        {"name": "wisp_wL", "bone": "wisp_wL", "attachment": "wing_L"},
        {"name": "wisp_wR", "bone": "wisp_wR", "attachment": "wing_R"},
        {"name": "wisp_core", "bone": "wisp", "attachment": "fx_orb"},
        {"name": "wisp_star", "bone": "wisp_spin", "attachment": "fx_spark"},
    ] + [{"name": f"burst{k}", "bone": f"burst{k}", "color": "ffffff00", "attachment": "fx_spark", "blend": "additive"} for k in range(1, 5)]

    cloud_mesh = mesh(cloud, 48, cloud_weights, dense=False)
    skin = {
        "cloud": {"cloud": cloud_mesh},
        "body_back": {"body_back": mesh(back, 34, weights)},
        "body_front": {"body_front": mesh(front, 30, weights)},
        "halo_glow": {"fx_soft": dict(size("fx_soft"), scaleX=3.4, scaleY=1.7)},
        "halo": {"halo": dict(size("halo"))},
        "wing_L": {"wing_L": dict(at("wing_L", centres["wing_L"]), **size("wing_L"))},
        "wing_R": {"wing_R": dict(at("wing_R", centres["wing_R"]), **size("wing_R"))},
        "halo_spark1": {"fx_spark": size("fx_spark")},
        "halo_spark2": {"fx_spark": size("fx_spark")},
        "trail1": {"fx_soft": dict(size("fx_soft"), scaleX=1.4, scaleY=1.4)},
        "trail2": {"fx_soft": dict(size("fx_soft"), scaleX=1.4, scaleY=1.4)},
        "wisp_glow": {"fx_soft": dict(size("fx_soft"), scaleX=2.0, scaleY=2.0)},
        "wisp_wL": {"wing_L": dict(size("wing_L"), x=-34, y=40, scaleX=0.34, scaleY=0.34)},
        "wisp_wR": {"wing_R": dict(size("wing_R"), x=34, y=32, scaleX=0.36, scaleY=0.36)},
        "wisp_core": {"fx_orb": dict(size("fx_orb"), scaleX=0.62, scaleY=0.62)},
        "wisp_star": {"fx_spark": dict(size("fx_spark"), scaleX=1.0, scaleY=1.0)},
    }
    for k in range(1, 5):
        skin[f"burst{k}"] = {"fx_spark": size("fx_spark")}

    PHYS = [("hairL2", 70, 0.8), ("hairL3", 55, 0.8), ("hairL4", 45, 0.78), ("hairR2", 70, 0.8), ("hairR3", 55, 0.8),
            ("hairR4", 45, 0.78), ("sleeve1", 90, 0.85), ("sleeve2", 70, 0.82), ("skirtR", 90, 0.85),
            ("drapeL1", 80, 0.85), ("drapeL2", 60, 0.82), ("tailR1", 70, 0.83), ("tailR2", 55, 0.8)]
    constraints = [{"type": "physics", "name": f"phys_{b}", "bone": b, "rotate": 1, "inertia": 0.6, "strength": s,
                    "damping": d, "mass": 1, "fps": 60} for b, s, d in PHYS]

    skel = {
        "skeleton": {"hash": "sky-drop-character-mesh", "spine": "4.3.26", "x": -552.5, "y": 0, "width": 1105,
                     "height": 1424, "fps": FPS, "images": "./images/"},
        "bones": bones,
        "slots": slots,
        "constraints": constraints,
        "skins": [{"name": "default", "attachments": skin}],
        "animations": {name: build_animation(fn()) for name, fn in ANIMS.items()},
    }
    path = os.path.join(CH, "character.json")
    with open(path, "w") as f:
        json.dump(skel, f, separators=(",", ":"))
    nb = len(skin["body_back"]["body_back"]["uvs"]) // 2
    nf = len(skin["body_front"]["body_front"]["uvs"]) // 2
    print(f"character.json {os.path.getsize(path) // 1024} KB, back {nb} verts, front {nf} verts, {len(bones)} bones")


if __name__ == "__main__":
    main()
