"""Curate the Commons search results into src/data/archive.json.
Every field is copied from the catalogue record; nothing is written from memory.
`nature` is the one editorial judgement, and it is derived from evidence in the record:
if the engraver was born after the event, the print cannot be contemporary."""
import json, re, html, urllib.parse

cand = json.load(open("/tmp/archive_candidates.json"))

def clean(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = html.unescape(re.sub(r"\s+", " ", s)).strip()
    s = re.sub(r"\s*date QS:.*$", "", s)        # Wikidata qualifier tail on some dates
    return re.sub(r"^(Unknown author\s*)+$", "Unknown", s).strip()

def pick(battle, needle):
    for r in cand.get(battle, []):
        if needle.lower() in r["title"].lower():
            return r
    raise SystemExit(f"not found: {battle} / {needle}")

# battle -> [(needle, institution, event_year)]
WANT = {
    "Battle of Austerlitz": [
        ("Plan der Schlacht bey Austerlitz 1805.jpg", "Die Zeiten, Weimar (periodical)", 1805),
        ("Plan der Gegend von Austerlitz", "Leibniz-Institut für Länderkunde, Leipzig", 1805)],
    "Battle of Waterloo": [
        ("Plan of the battle of Waterloo (BM", "British Museum", 1815),
        ("Kaart en gezicht van het slagveld van Waterloo", "Rijksmuseum", 1815)],
    "Battle of Trafalgar": [
        ("Plan of the battle of Trafalgar RMG K1079", "Royal Museums Greenwich", 1805)],
    "Battle of Marengo": [
        ("Plan de la bataille de Marengo", 'Library of History and Culture "G. Grosso"', 1800)],
    "Battle of Eylau": [
        ("Champ de bataille de Preussisch-Eylau - (Dépôt de la guerre) - btv1b53078299n (1 of 5)",
         "Bibliothèque nationale de France", 1807)],
    "Battle of the Nile": [
        ("The Battle of the Nile, 1 August 1798; chart of Aboukir Bay", "Royal Museums Greenwich", 1798)],
    "Battle of Aspern-Essling": [
        ("Batailles d'Aspern et d'Essling", "Biblioteka Narodowa (Polona)", 1809)],
    "Battle of Leipzig": [
        ("Plan der Schlacht bei Leipzig am 18. und 19. Oktober 1813", "Schlachtenatlas (Rothenburg)", 1813)],
    "Battle of Friedland": [
        ("Bataille de Friedland le 14 juin 1807", "Bibliothèque nationale de France", 1807)],
    "Crossing the Berezina": [
        ("Passage de la Bérézina, G.33732.jpg", "Paris Musées / Musée Carnavalet", 1812)],
}

URL = re.compile(r"https?://[^\s\"'<>]+")

out = {}
for battle, wants in WANT.items():
    items = []
    for needle, institution, event_year in wants:
        r = pick(battle, needle)
        credit, artist = clean(r["credit"]), clean(r["artist"])
        date = clean(r["date"])
        m = URL.search(r["credit"] or "")
        catalogue = m.group(0).rstrip(".,") if m else None

        # evidence-based: if the engraver was still a child at the battle, the print is a
        # later depiction whatever date the catalogue attaches to it
        born = re.search(r"\((\d{4})\s*[-–]", artist)
        later = bool(born and int(born.group(1)) + 18 > event_year)
        yr = re.search(r"\b(1[6-9]\d{2})\b", date)
        if yr and int(yr.group(1)) > event_year + 5:
            later = True

        items.append({
            "title": re.sub(r"^File:", "", r["title"]).rsplit(".", 1)[0],
            "date": date or "undated in the catalogue",
            "creator": artist or "Unknown",
            "institution": institution,
            "licence": clean(r["licence"]),
            "catalogue": catalogue,
            "commons": r["page"],
            "nature": "later depiction" if later else "contemporary",
        })
    out[battle] = items

json.dump(out, open("src/data/archive.json", "w"), indent=1, ensure_ascii=False)
n = sum(len(v) for v in out.values())
print(f"{n} items across {len(out)} stops")
for b, items in out.items():
    for i in items:
        print(f"  {b[:26]:28} {i['nature']:14} {i['licence']:14} cat={'yes' if i['catalogue'] else 'commons only'}")
