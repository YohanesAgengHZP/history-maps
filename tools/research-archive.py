"""Search Wikimedia Commons for contemporary plans/engravings of the major stops and
record only what the API actually returns. Nothing here is written by hand."""
import json, time, urllib.parse, urllib.request

UA = {"User-Agent": "eagles-road-research/1.0 (personal history project)"}
API = "https://commons.wikimedia.org/w/api.php"

def api(params):
    params["format"] = "json"
    url = API + "?" + urllib.parse.urlencode(params)
    for attempt in range(5):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45))
            time.sleep(1.5)          # stay well inside Commons' rate limit
            return r
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 4:
                raise
            back = 10 * (attempt + 1)
            print(f"  429, backing off {back}s")
            time.sleep(back)
        except Exception:
            if attempt == 4: raise
            time.sleep(5)

QUERIES = {
    "Battle of Austerlitz": "Plan Schlacht Austerlitz 1805",
    "Battle of Waterloo": "plan battle of Waterloo 1815 map",
    "Battle of Borodino": "plan bataille Borodino 1812 carte",
    "Battle of Leipzig": "Plan Schlacht bei Leipzig 1813",
    "Battle of Trafalgar": "plan battle of Trafalgar 1805",
    "Jena–Auerstedt": "Plan Schlacht bei Jena 1806",
    "Battle of Wagram": "Plan Schlacht bei Wagram 1809",
    "Battle of Marengo": "plan bataille Marengo 1800",
    "Battle of Aspern-Essling": "Plan Schlacht Aspern Essling 1809",
    "Battle of Eylau": "plan bataille Eylau 1807",
    "Battle of Friedland": "plan bataille Friedland 1807",
    "Battle of the Pyramids": "bataille des Pyramides 1798 estampe",
    "Battle of the Nile": "battle of the Nile 1798 Aboukir plan",
    "Crossing the Berezina": "Berezina 1812 passage estampe",
}

OK_LICENCES = ("public domain", "cc0", "pd-")

out = {}
for battle, q in QUERIES.items():
    res = api({"action": "query", "list": "search", "srsearch": q,
               "srnamespace": 6, "srlimit": 8})
    titles = [r["title"] for r in res.get("query", {}).get("search", [])]
    if not titles:
        continue
    meta = api({"action": "query", "titles": "|".join(titles), "prop": "imageinfo",
                "iiprop": "extmetadata|url", "iiextmetadatafilter":
                "LicenseShortName|UsageTerms|Artist|DateTimeOriginal|Credit|ImageDescription"})
    rows = []
    for p in meta["query"]["pages"].values():
        if "imageinfo" not in p:
            continue
        m = p["imageinfo"][0]["extmetadata"]
        g = lambda k: (m.get(k, {}).get("value") or "").strip()
        lic = g("LicenseShortName")
        if not any(t in lic.lower() for t in OK_LICENCES):
            continue
        rows.append({
            "title": p["title"],
            "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(p["title"].replace(" ", "_")),
            "licence": lic,
            "date": g("DateTimeOriginal"),
            "credit": g("Credit"),
            "artist": g("Artist"),
        })
    if rows:
        out[battle] = rows
    time.sleep(1.0)

json.dump(out, open("/tmp/archive_candidates.json", "w"), indent=1, ensure_ascii=False)
print(f"battles with candidates: {len(out)} / {len(QUERIES)}")
for b, rows in out.items():
    dated = [r for r in rows if r["date"]]
    print(f"  {b}: {len(rows)} candidates, {len(dated)} with a date")
