# Vedátor V2 – bezpečný postup úprav obsahu

Tento dokument je technický návod pro další úpravy V2. Cíl je nepřidávat další runtime patch soubory do stránky a nerozbít vazby mezi epizodami, FAQ otázkami, neotázkami, překlady a sériemi.

## Základní pravidlo

Veřejná V2 za běhu načítá pouze `v2.html`, `app-v2.js` a jeden datový balík `content-v2.json`. Staré soubory typu `episode-XXX-summary.js`, `episode-translations-*.js`, `question-translations-*.js` a `nonquestions-data.js` jsou zdrojová data pro build; V2 je nesmí za běhu dynamicky připojovat jako další `<script>`.

Po změně zdrojových dat se vždy znovu sestaví `content-v2.json` a musí projít všechny V2 testy.

## Nové epizody

Automatický workflow `.github/workflows/update-podcast-feed.yml` denně stáhne RSS do `episodes.json` a pak spustí:

1. `node tools/build-content-v2.mjs`
2. `node tools/augment-v2-episode-descriptions.mjs`
3. `node tools/augment-v2-full-descriptions.mjs`
4. `node tools/augment-v2-parity-content.mjs`
5. `node tools/test-content-v2.mjs`
6. `node tools/test-v2-faq-integrity.mjs`

Teprve potom se mají commitnout `episodes.json` a `content-v2.json`.

## Popisek epizody a Číst více

U epizody jsou záměrně dvě různé podoby popisu a nesmí se znovu sloučit do jedné:

- `description` / jazyková `i18n.*.description` je krátký smysluplný popis karty a zdroj pro vyhledávání;
- `fullDescription` je celý popis jako prostý text pro záložní zobrazení;
- `fullDescriptionHtml` / `i18n.*.fullDescriptionHtml` je bezpečný bohatý HTML popis z RSS pro `Číst více`, včetně odstavců a HTTP(S) odkazů.

`tools/augment-v2-full-descriptions.mjs` musí plný HTML popis vytvářet z původního `episodes.json`. U české varianty zachová strukturu HTML a odkazy, ale použije existující překlady prvního odstavce a promo textů ze `episode-translations-*.js`.

**Nikdy nepoužívej `fullDescription` ani `fullDescriptionHtml` pro vyhledávání.** Vyhledávání epizod má stejně jako stará verze končit před větou `Podcast vzniká ... spolupráci ... SME`; sponzorské texty a odkazy za ní nesmějí ovlivnit výsledky.

Při změně `Číst více` vždy ověř díl 347 v reálném browser testu `tools/test-v2-real-readmore-browser.mjs`: po rozbalení musí být vidět SME a promo odstavce, odkazy Herohero/Martinus musí být klikací, po sbalení musí zmizet a `herohero` nesmí být v search indexu.

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
- pokud soubor obsahuje `DESCRIPTION_TEXT_PAIRS` nebo `COMMON_TEXT_PAIRS`, používají se také při sestavení českého plného HTML popisu;
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

## Kompatibilita s Google Apps Scriptem pro podobné otázky

Současný Apps Script vytváří odkazy ve starém tvaru `#question=<díl>-sheet@<sekundy>`. V2 tento formát **musí zachovat jako podporovaný deep link** i po finálním přepnutí produkce. Nesmí se odstranit parser legacy odkazu v `processDeepLink()`.

Starší verze Apps Scriptu si databázi sestavuje z `episode-*-summary.js`, `episode-*-chapters.js` a `question-translations-*.js`. Dokud tyto zdrojové soubory zůstávají v produkčním repu, funguje beze změny.

Před finálním odstraněním starých zdrojových souborů musí být Apps Script přepnut na `content-v2.json`. Pro každou otázku musí V2 zachovat minimálně:

- `episode`;
- `order`;
- `sourceTime` nebo `time`;
- `seconds` (už s pětisekundovým prerrollem pro přímý odkaz);
- `title` a `i18n.cs.title` / `i18n.sk.title`.

Doporučený Apps Script má nejdřív zkusit stáhnout `content-v2.json` a pouze pokud ještě není v produkčním repu dostupný, použít starý parser souborů. Tím může být nasazen ještě před finálním cutoverem a po přepnutí se automaticky přepne na V2 databázi.

`PUBLIC_BASE` v produkčním Apps Scriptu musí zůstat `https://bernio.cz/vedator/`. Po finálním cutoveru musí hlavní V2 běžet na této adrese, aby odkazy z Google Tabulky zůstaly platné.

## Mobilní typografie

Při mobilním viewportu se nepokoušej texty plošně zmenšovat kvůli prostoru. Referenční hodnoty ze staré aplikace jsou přibližně:

- počet nalezených výsledků a řazení: `1rem` (16 px);
- název epizody: `1.08rem` (17,28 px);
- datum/meta: `.85rem` (13,6 px);
- popisek: `1rem` s `line-height: 1.48`;
- štítky: `.76rem`.

Tyto hodnoty ověřuje mobilní Chromium test, aby se V2 při dalších úpravách znovu nezmenšila.

## Povinné testy před publikováním

Minimálně:

```text
node tools/build-content-v2.mjs
node tools/augment-v2-episode-descriptions.mjs
node tools/augment-v2-full-descriptions.mjs
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
node tools/test-v2-real-readmore-browser.mjs
```

Publikovat až po zeleném CI. Produkční repo `Berniocal/vedator` se nesmí měnit při práci na testovací V2, pokud to uživatel výslovně nepožádá.
