# Vedátor test – dvojjazyčná verze

Aplikace používá jednu společnou HTML/CSS/JavaScript logiku a oddělená jazyková data.

## Struktura

- `index.html` – společná struktura aplikace
- `styles.css` – společný vzhled
- `app.js` – společná logika, filtrování a vykreslování
- `locales/cs.json`, `locales/sk.json` – texty rozhraní
- `content/episodes.cs.json`, `content/episodes.sk.json` – jazykové varianty epizod podle čísla dílu
- `content/questions.cs.json`, `content/questions.sk.json` – otázky se stejnými stabilními ID v obou jazycích

Výchozí jazyk je slovenština. Zvolený jazyk se ukládá do `localStorage` pod klíčem `vedator.lang`.

## Přidání překladu epizody

Do příslušného souboru `content/episodes.<jazyk>.json` se doplní záznam:

```json
{
  "340": {
    "title": "Přeložený název",
    "description": "Přeložený popis"
  }
}
```

## Přidání otázky

Česká a slovenská varianta musí mít stejné `id`, číslo `episode` a čas `time`. Aplikace při přepnutí jazyka znovu vykreslí data z vybraného jazykového souboru. Nemění hotové textové uzly a nepoužívá `MutationObserver`.
