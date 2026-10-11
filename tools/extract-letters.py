"""Pull specific letters out of the Gutenberg text of Hall's 1901 edition and attach each
to the stop it belongs to. Nothing is retyped: every word is sliced from the source file,
which is why the blog's three transcription errors do not reach the page."""
import re, json, textwrap

t = open("/tmp/gut.txt", encoding="utf-8", errors="replace").read().replace("\r", "")

def letter(anchor, stop, place, date, note):
    i = t.find(anchor)
    assert i >= 0, anchor
    seg = t[i + len(anchor):]
    # a letter ends at the signature
    m = re.search(r"\n\s*(NAPOLEON|BONAPARTE)\.", seg)
    assert m, anchor
    body = seg[:m.start()]
    sign = m.group(1).title()
    body = re.sub(r"\[\d+\]", "", body)              # footnote markers
    body = re.sub(r"\n\s*\n", " ", body)        # keep paragraph breaks
    body = re.sub(r"\s+", " ", body)
    body = body.replace("_", "")                     # Gutenberg marks italics with underscores
    body = re.sub(r"^(My Dear|My dear),?--", "", body).strip()
    paras = [p.strip(" _") for p in body.split(" ") if p.strip(" _")]
    return {"stop": stop, "place": place, "date": date, "signed": sign,
            "paragraphs": paras, "note": note}

LETTERS = [
    letter("_Marmirolo_, _July 17, 1796_, 9 P.M.", "Battle of Arcole",
           "Marmirolo, near Mantua", "17 July 1796",
           "Written during the siege of Mantua, in the middle of the first Italian campaign."),
    letter("_Austerlitz, December 3, 1805._", "Battle of Austerlitz",
           "Austerlitz", "3 December 1805",
           "Written the day after the battle, from the field."),
    letter("_Jena_, _October 15, 1806_, 3 A.M.", "Jena–Auerstedt",
           "Jena", "15 October 1806",
           "Written the day after Jena and Auerstedt were fought."),
    letter("_Eylau_, _February 17, 1807_, 3 A.M.", "Battle of Eylau",
           "Eylau", "17 February 1807",
           "Written nine days after the battle, on the ground where it was fought."),
    letter("_Friedland_, _June 16, 1807_, 4 P.M.", "Battle of Friedland",
           "Friedland", "16 June 1807",
           "Written two days after the battle that ended the war with Russia."),
]

for l in LETTERS:
    words = sum(len(p.split()) for p in l["paragraphs"])
    print(f"{l['stop'][:24]:26} {l['date']:18} {words:4} words, {len(l['paragraphs'])} paras")
    print("   ", textwrap.shorten(l["paragraphs"][0], 100))

out = {
    "source": {
        "work": "Napoleon's Letters to Josephine, 1796–1812",
        "translator": "Henry Foljambe Hall",
        "published": "1901",
        "via": "Project Gutenberg ebook 37499",
        "url": "https://www.gutenberg.org/ebooks/37499",
        "rights": "The letters themselves are long out of copyright; Hall's 1901 translation is public domain."
    },
    "letters": {l["stop"]: {k: v for k, v in l.items() if k != "stop"} for l in LETTERS}
}
json.dump(out, open("/Users/mamikos/projects/perosnal-projects/napoleon-maps/src/data/letters.json", "w"), indent=1, ensure_ascii=False)
print("\nwritten:", sum(len(l['paragraphs']) for l in LETTERS), "paragraphs across", len(LETTERS), "stops")
