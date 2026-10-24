"""Debug view of the master rig's weight field: each pixel tinted by the bone that moves it most
(mixed colours = blended weights), over the master. Usage: weight_map.py out.png [x0 y0 x1 y1]"""
import colorsys, os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_master_rig as M

out = sys.argv[1]
master = Image.open(os.path.join(M.SRC, "master.png")).convert("RGBA")
box = tuple(int(v) for v in sys.argv[2:6]) if len(sys.argv) >= 6 else master.getbbox()
step = 6
bones = {}
tint = Image.new("RGBA", master.size, (0, 0, 0, 0))
px = tint.load()
alpha = master.split()[3].load()
for y in range(box[1], box[3], step):
    for x in range(box[0], box[2], step):
        if alpha[x, y] < 40:
            continue
        r = g = b = 0.0
        for bone, w in M.weights((x, y)):
            if bone not in bones:
                h = (len(bones) * 0.618034) % 1.0
                bones[bone] = colorsys.hsv_to_rgb(h, 0.95, 1.0)
            c = bones[bone]
            r += c[0] * w; g += c[1] * w; b += c[2] * w
        for yy in range(y, min(y + step, box[3])):
            for xx in range(x, min(x + step, box[2])):
                px[xx, yy] = (int(r * 255), int(g * 255), int(b * 255), 150)
base = Image.new("RGBA", master.size, (60, 64, 80, 255))
base.alpha_composite(master)
base.alpha_composite(tint)
img = base.crop(box)
from PIL import ImageDraw
d = ImageDraw.Draw(img)
for i, (bone, c) in enumerate(bones.items()):
    d.rectangle([8, 8 + i * 22, 26, 26 + i * 22], fill=tuple(int(v * 255) for v in c))
    d.text((32, 10 + i * 22), bone, fill=(255, 255, 255))
img.convert("RGB").save(out)
print(out, img.size)
