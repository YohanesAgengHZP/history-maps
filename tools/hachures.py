"""Turn an ETOPO subset into Lehmann-style hachures: short strokes running downhill,
thicker where the slope is steeper.

Run once. The two base64 strings it prints into /tmp/hachure_out.txt are pasted into
HACH_XY and HACH_W in napoleon-map.html; nothing here runs in the browser.

First fetch the elevation grid (0.1 deg over the map's bounding box, ~19MB):

  curl "https://coastwatch.pfeg.noaa.gov/erddap/griddap/etopo180.csv\
?altitude%5B(12.0):6:(72.0)%5D%5B(-30.0):6:(62.0)%5D" -o /tmp/dem.csv

then: python3 tools/hachures.py

Tuning notes: SPACING sets stroke spacing in grid cells, `length` sets stroke length in
degrees. Both must be read against the map scale, where 1 degree is about 10 viewBox
units, so a 0.2 degree stroke is only ~2 units long at the default zoom. Width classes
are assigned by slope percentile, not absolute slope, because the absolute values depend
on how much the grid was smoothed.
"""
import numpy as np, base64, struct

LAT0, LAT1, LON0, LON1, STEP = 12.0, 72.0, -30.0, 62.0, 0.1

raw = np.loadtxt("/tmp/dem.csv", delimiter=",", skiprows=2)
lats = np.round(raw[:, 0], 4)
lons = np.round(raw[:, 1], 4)
nlat = int(round((LAT1 - LAT0) / STEP)) + 1
nlon = int(round((LON1 - LON0) / STEP)) + 1
Z = np.full((nlat, nlon), -9999.0)
li = np.round((lats - LAT0) / STEP).astype(int)
oi = np.round((lons - LON0) / STEP).astype(int)
ok = (li >= 0) & (li < nlat) & (oi >= 0) & (oi < nlon)
Z[li[ok], oi[ok]] = raw[ok, 2]
print("grid", Z.shape, "missing", int((Z == -9999).sum()), "max", Z.max())

Z = np.where(Z == -9999, 0.0, Z)
land = Z > 0

# smooth a little so single-cell noise does not produce stray strokes
K = np.array([[1, 2, 1], [2, 4, 2], [1, 2, 1]], float)
K /= K.sum()
S = Z.copy()
for _ in range(2):
    P = np.pad(S, 1, mode="edge")
    S = sum(K[i, j] * P[i:i + nlat, j:j + nlon] for i in range(3) for j in range(3))

latv = LAT0 + np.arange(nlat) * STEP
m_per_deg_lat = 111320.0
m_per_deg_lon = 111320.0 * np.cos(np.radians(latv))[:, None]

dzdlat, dzdlon = np.gradient(S, STEP, STEP)
gy = dzdlat / m_per_deg_lat          # metres rise per metre north
gx = dzdlon / m_per_deg_lon          # metres rise per metre east
slope = np.hypot(gx, gy)

# hachures run downhill: direction is the negative gradient
mag = np.where(slope > 0, slope, 1.0)
dx, dy = -gx / mag, -gy / mag

# the whole of Europe is 1000 units wide, so 1 deg is about 10 units: strokes have to be
# a few tenths of a degree long to read at all at the default zoom
SPACING = 2          # sample every N cells (0.2 deg)
MIN_ELEV = 150.0
MIN_SLOPE = 0.012
strokes = []
rng = np.random.default_rng(7)
for r in range(2, nlat - 2, SPACING):
    for c in range(2, nlon - 2, SPACING):
        if not land[r, c] or S[r, c] < MIN_ELEV or slope[r, c] < MIN_SLOPE:
            continue
        # offset alternate rows and jitter, so the strokes do not read as a grid
        jl = (LAT0 + r * STEP) + (rng.random() - .5) * STEP * SPACING * .3
        jo = (LON0 + c * STEP) + (rng.random() - .5) * STEP * SPACING * .3
        s = slope[r, c]
        length = 0.17 + 0.17 * min(s / 0.12, 1.0)        # degrees
        ex = jo + dx[r, c] * length / max(np.cos(np.radians(jl)), .2)
        ey = jl + dy[r, c] * length
        strokes.append([jo, jl, ex, ey, s])

# Lehmann hachures get thicker with slope. Split by percentile so the three weights
# are actually used, rather than by absolute values that depend on the smoothing.
sl = np.array([s[4] for s in strokes])
t1, t2 = np.percentile(sl, 62), np.percentile(sl, 89)
print("slope thresholds %.4f %.4f  max %.4f" % (t1, t2, sl.max()))
for s in strokes:
    s[4] = 0 if s[4] < t1 else (1 if s[4] < t2 else 2)
print("strokes", len(strokes), "by width", [sum(1 for s in strokes if s[4] == i) for i in range(3)])

xy, ww = [], []
for (x0, y0, x1, y1, w) in strokes:
    xy += [int(round(x0 * 100)), int(round(y0 * 100)), int(round(x1 * 100)), int(round(y1 * 100))]
    ww.append(w)
assert all(-32768 <= v <= 32767 for v in xy)

b = (base64.b64encode(struct.pack("<%dh" % len(xy), *xy)).decode(),
     base64.b64encode(bytes(ww)).decode())
print("base64: xy=%d w=%d total=%.1fKB" % (len(b[0]), len(b[1]), sum(len(x) for x in b) / 1024))
open("/tmp/hachure_out.txt", "w").write("\n".join(b))
