# Vedátor V2 – bezpečný postup úprav obsahu

Tento dokument je technický návod pro další úpravy V2. Cíl je nepřidávat další runtime patch soubory do stránky a nerozbít vazby mezi epizodami, FAQ otázkami, neotázkami, překlady a sériemi.

## Základní pravidlo

Veřejná V2 za běhu načítá pouze `v2.html`, `app-v2.js` a jeden datový balík `content-v2.json`. Staré soubory typu `episode-XXX-summary.js`, `episode-translations-*.js`, `question-translations-*.js` a `nonquestions-data.js` jsou zdrojová data pro build; V2 je nesmí za běhu dynamicky připojovat jako další `<script>`.

Po změně zdrojových dat se vždy znovu sestaví `content-v2.json` a musí projít všechny V2 testy.

## Nové epizody

Automatický workflow `.github/workflows/update-podcast-feed.yml` denně stáhne RSS do `episodes.json` a pak spustí:

1. `node tools/build-content-v2.mjs`
2. `node tools/augment-v2-episode-descriptions.mjs`
3. `node tools/augment-v2-parity-content.mjs`
4. `node tools/test-content-v2.mjs`
5. `node tools/test-v2-faq-integrity.mjs`

Teprve potom se mají commitnout `episodes.json` a `content-v2.json`.

## FAQ / Otázky

Kanonický seznam FAQ dílů je v `tools/build-content-v2.mjs` v poli `FAQ`. Pokud přibude nový FAQ díl:

1. přidej číslo dílu do `FAQ`;
2. dodej jeho zdrojové shrnutí/otázky ve stejném formátu jako ostatní FAQ díly;
3. pokud má díl atypický formát, přidej explicitní parser do `parseEpisodeQuestions()` – nespoléhej jen na název epizody;
4. spusť build a `tools/test-v2-faq-integrity.mjs`;
5. ověř, že díl je současně v sérii `FAQ – dobré otázky` a že všechny jeho otázky jsou v `content-v2.json`.

Díl 300 je důležitý regresní případ: jmenuje se jinak, ale patří do FAQ. Jeho otázky jsou ve `SUMMARIES[300].sections` v `index.html`; `episode-300-chapters.js` obsahuje odpovídající kapitoly/časy. Test musí explicitně hlídat díl 300.

Díl 346 je další speciální FAQ díl a musí zůstat součástí stejné kontroly.

Nikdy neposuzuj FAQ pouze podle toho, zda název obsahuje `FAQ`.

## Překlady epizod

Zdrojové překlady epizod jsou v `episode-translations-*.js`. `tools/build-content-v2.mjs` je sloučí do `episode.i18n.cs` / `episode.i18n.sk` v `content-v2.json`.

Při přidání překladu:

- zachovej existující strukturu `TRANSLATIONS` nebo `TRANSLATION`;
- nepřidávej nový runtime loader;
- po buildu ověř počet bilingvních epizod v `tools/test-content-v2.mjs`.

## Překlady otázek

Zdrojové dvojice jsou v `question-translations-*.js`. Build je sloučí do `question.i18n.cs` / `question.i18n.sk`.

Při přidání nové FAQ otázky musí existovat český základ a případný slovenský překlad se doplní přes stávající překladovou vrstvu. V2 nesmí za běhu načítat `question-translations-*.js`.

## Neotázky

Základ je v `nonquestions-data.js`; novější díly mohou být doplněny přes `episode-XXX-summary.js` nebo specializované summary-data soubory podle logiky v `tools/build-content-v2.mjs`.

Při přidání neotázky zkontroluj:

- číslo dílu;
- čas a pětisekundový preroll;
- CZ/SK data;
- že položka je po buildu v `content-v2.json`;
- `tools/test-v2-question-experience.mjs` a `tools/test-content-v2.mjs`.

## Série

Pevné série se generují v `tools/augment-v2-parity-content.mjs`. Série FAQ se nesmí odvozovat pouze regexem z názvu. Musí odpovídat kanonickému seznamu FAQ dílů a `tools/test-v2-faq-integrity.mjs` musí hlídat shodu.

Při změně série ověř:

- počet dílů;
- pořadí;
- CZ/SK název;
- pokračování v sérii;
- původní vizuální značení rozposlouchané/dokončené série a jednotlivých položek.

## Povinné testy před publikováním

Minimálně:

```text
node tools/build-content-v2.mjs
node tools/augment-v2-episode-descriptions.mjs
node tools/augment-v2-parity-content.mjs
node tools/test-content-v2.mjs
node tools/test-v2-faq-integrity.mjs
node tools/test-app-v2.mjs
node tools/test-v2-question-experience.mjs
node tools/test-v2-episode-experience.mjs
node tools/test-v2-full-parity.mjs
node tools/test-v2-playlist-parity.mjs
node tools/test-v2-mobile-deep-polish.mjs
node tools/test-v2-mobile-browser.mjs
node tools/test-v2-mobile-browser-playlist.mjs
```

Publikovat až po zeleném CI. Produkční repo `Berniocal/vedator` se nesmí měnit při práci na testovací V2, pokud to uživatel výslovně nepožádá.
