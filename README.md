# Emergency Kit Planner

A small, free web page that helps households in **the Netherlands, Belgium, Germany, France, Austria and Switzerland**
put together an emergency kit based on the official advice in each country.
Available in **English, Nederlands, Deutsch, Français and فارسی**.

## What it does

1. Choose your language and country of residence.
2. Enter your household: adults, seniors (65+), children, babies, pets, and any special needs
   (chronic illness, medical equipment that needs power, limited mobility, hearing or visual impairment,
   special diet or allergy, dementia).
3. The page calculates water, food, cash and the checklist for the number of days you choose:

   | Country | Days | Water | Food quantities | Cash |
   |---|---|---|---|---|
   | Netherlands – Denk Vooruit | at least 3 | 3 L / person / day | BBK basket as a guide | €70 per adult, €30 per child |
   | Belgium – National Crisis Centre | at least 3 | 3 L / person / day (advice: 3–10 L) | BBK basket as a guide | some cash |
   | Germany – BBK | ideally 10 (at least 3) | 2 L / person / day | BBK reference basket (≈2,200 kcal) | some cash |
   | France – SGDSN “Tous responsables” | 3 (72-hour kit) | 6 L / person (2 L a day) | BBK basket as a guide | some cash |
   | Austria – oesterreich.gv.at + Zivilschutzverband | 10–14 (default 14) | 2.5 L / person / day | Zivilschutzverband 14-day basket (≈2,000 kcal) | about a double weekly shop, max ≈ €100 per person (OeNB) |
   | Switzerland – BWL “Kluger Rat – Notvorrat” | about 7 | 9 L / person (3 L a day for 3 days) | BBK basket as a guide | a week's shopping + a tank of fuel |

   Country-specific items are added where the authority lists them: iodine tablets and pen & paper (Belgium),
   books and games (France), 50 hygiene masks per person and the Alertswiss app (Switzerland), the NINA app (Germany).
4. Tick what you already have; the rest becomes your **shopping list** (copy, share or print).
5. Send the shopping list to **Claude, ChatGPT or Gemini** with one tap. The request is written in your
   language, names shops in your country, and tells the assistant never to order or pay without asking.
   - Claude and ChatGPT receive the text through the link (`claude.ai/new?q=…`, `chatgpt.com/?q=…`).
     Very long requests (for example in Farsi) are copied to the clipboard instead, to paste.
   - Gemini has no official way to receive text through a link, so the request is copied to the clipboard to paste.
   - On a phone, the links open the installed app when there is one.

Everything runs in the browser. No server, no tracking, no cookies; ticks are remembered in the browser's local storage.

### Share a ready-made link with friends

“Copy link for a friend” creates a link with the language, country and household filled in, e.g.
`…/?lang=fa&country=DE&a=2&s=1&c=1&b=0&p=0&d=10&n=chronic,diet`

| Parameter | Meaning |
|---|---|
| `lang` | `en`, `nl`, `de`, `fr`, `fa` |
| `country` | `NL`, `BE`, `DE`, `FR`, `AT`, `CH` |
| `a` / `s` / `c` / `b` / `p` | adults / seniors / children / babies / pets |
| `d` | days |
| `n` | special needs: `chronic,power,mobility,hearing,vision,diet,cognitive` |

## Publish on GitHub Pages

1. Create a new public repository, e.g. `emergency-kit-planner`.
2. Upload `index.html`, `data.js`, `app.js` and this `README.md` to the root.
3. Settings → Pages → *Deploy from a branch* → branch `main`, folder `/ (root)` → Save.
4. After a minute the site is live at `https://<your-username>.github.io/emergency-kit-planner/`.

## Keeping it up to date

All guidance lives in `data.js`:
- `COUNTRIES` – days, water per person per day (`waterDays` fixes the number of water days, as in Switzerland),
  cash amounts, currency, food basket, shops and official links per country.
- `BASKETS` – food per person per day: `BBK` (Germany) and `ZSV` (Austria). `BASKET_KCAL` holds their calories.
- `ITEMS` – every checklist item, its category, which country lists it (`gov` = official list,
  `ref` = reference basket, `tip` = practical tip; no key = not shown in that country) and how its quantity is calculated.
- `T` – all text in the five languages, including the AI request.

Add a country by adding an entry to `COUNTRIES`, a `src` key to the items, and in each language of `T`:
the country name, `inCountry`, `daysHint_XX`, `badge_gov_XX`, `emergency_XX`, the `src_…` link labels,
and optionally `foodNote_XX` and `cashNote_XX`.

## Official websites (checked November 2026)

The page shows these links for the selected country, with the emergency numbers. The descriptions are translated;
the official websites themselves are linked as they are, with the site's own language shown.

**Netherlands** – emergency 112, police (non-emergency) 0900-8844
- [Denk Vooruit](https://www.denkvooruit.nl) · [in English](https://english.denkvooruit.nl) · [booklet in other languages](https://www.denkvooruit.nl/vertalingen)
- [Rijksoverheid – Wat zit er in een noodpakket?](https://www.rijksoverheid.nl/onderwerpen/veiligheidsregios-en-crisisbeheersing/vraag-en-antwoord/wat-zit-er-in-een-noodpakket)
- [NL-Alert](https://www.nl-alert.nl) · [Find your veiligheidsregio](https://www.denkvooruit.nl/bereid-je-voor/zo-krijg-je-een-waarschuwing/jouw-veiligheidsregio)

**Belgium** – fire & ambulance 112, police 101, doctor on duty 1733
- [Centre de crise – Prêts. Ensemble.](https://centredecrise.be/fr/que-pouvez-vous-faire/prets-ensemble-toute-situation-durgence) · [Crisiscentrum (Nederlands)](https://crisiscentrum.be)
- [Un kit d'urgence à la maison](https://centredecrise.be/fr/que-pouvez-vous-faire/preparez-un-kit-durgence/un-kit-durgence-la-maison) · [Brochure (PDF)](https://centredecrise.be/sites/default/files/documents/files/WEB-Brochure-Pr%C3%AAts.%20Ensemble-FR.pdf)
- [BE-Alert](https://www.be-alert.be)

**Germany** – fire & ambulance 112, police 110, authorities 115
- [BBK – Vorsorge](https://www.bbk.bund.de/vorsorge) · [Ratgeber & Checklisten](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Vorsorge/Ratgeber-Checkliste/ratgeber-checkliste_node.html) · [Leichte Sprache](https://www.bbk.bund.de/leichtesprache-ratgeber)
- [NINA warning app](https://www.bbk.bund.de/DE/Warnung-Vorsorge/Warn-App-NINA/NINA-Download/nina-download_node.html)
- [BLE Vorratskalkulator](https://www.ernaehrungsvorsorge.de/private-vorsorge/notvorrat/vorratskalkulator)

**France** – 112, SAMU 15, police 17, fire brigade 18, deaf/hard of hearing (SMS) 114
- [Se préparer à une situation d'urgence](https://www.info.gouv.fr/risques/se-preparer-a-une-situation-durgence) · [Guide « Tous responsables »](https://www.info.gouv.fr/actualite/tous-responsables-un-guide-pour-mieux-faire-face-aux-risques)
- [Préparer son kit d'urgence 72 h](https://www.ecologie.gouv.fr/dossiers/comprendre-risques-naturels-sen-proteger/preparer-son-kit-durgence-72-h) · [Géorisques](https://www.georisques.gouv.fr) · [FR-Alert](https://fr-alert.gouv.fr)

**Austria** – 112, fire brigade 122, police 133, ambulance 144, doctor on call 141, health hotline 1450
- [Zivilschutzverband – Vorrat](https://www.oesterreich.gv.at/de/linkresolution/link/31934) · [Zivilschutzverband – Blackout](https://www.oesterreich.gv.at/de/linkresolution/link/24277)
- [oesterreich.gv.at – Verhalten bei Blackout](https://www.oesterreich.gv.at/de/themen/notfaelle_unfaelle_und_kriminalitaet/katastrophenfaelle/1/Seite.29500329.html) · [Bevölkerungswarnung](https://www.oesterreich.gv.at/de/themen/notfaelle_unfaelle_und_kriminalitaet/katastrophenfaelle/2/Seite.29500311.html)
- [AT-Alert](https://www.at-alert.at)

**Switzerland** – 112, police 117, fire brigade 118, ambulance 144, Rega 1414, Tox Info 145
- [BWL – Notvorrat](https://www.bwl.admin.ch/de/notvorrat) · [Notvorratsrechner](https://www.notvorratsrechner.bwl.admin.ch/de)
- [Alertswiss](https://www.alert.swiss) · [Personal emergency plan (PDF)](https://www.babs.admin.ch/dam/de/sd-web/oJLzuJoq2T-3/Emergency%20plan_A4_DE.pdf)

This is a community helper, not an official government tool. Quantities are guidelines; adapt them to diets,
allergies and medical needs, and ask a doctor or pharmacist about medicines.
