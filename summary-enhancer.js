(() => {
  const SUMMARIES = {
    300: {
      highlights: [
        {
          time: '1:25',
          title: 'První kontakt s mimozemšťany',
          points: [
            'Komunikace s civilizací bez společného jazyka, zkušeností a způsobu uvažování by byla mimořádně obtížná.',
            'Vyspělejší civilizace nás nemusí považovat za rovnocenné partnery – podobně jako lidé nevnímají mravence nebo bakterie.',
            'Zaznívá úvaha, že dlouhodobě přežívající technologická civilizace pravděpodobně potřebuje také vyspělou etiku, jinak by se mohla sama zničit.',
            'Situace se přirovnává k historickým kontaktům moderních společností s izolovanými kmeny.'
          ]
        },
        {
          time: '6:33',
          title: 'Mají galaxie barvy?',
          points: [
            'U velmi vzdálených galaxií pozorujeme červený posuv způsobený rozpínáním vesmíru.',
            'Mladé galaxie s velkým množstvím horkých mladých hvězd bývají modřejší.',
            'Starší galaxie obsahují více chladnějších hvězd a často působí červeněji.',
            'Pozorovaná barva závisí také na vzdálenosti, posuvu spektra a způsobu zpracování snímku.'
          ]
        },
        {
          time: '8:14',
          title: 'Můžeme přehlédnout mimozemský život?',
          points: [
            'Mimozemské signály nebo technologie mohou existovat v podobě, kterou neumíme rozpoznat ani měřit.',
            'Podobně jako mravenec nedokáže pochopit chytrý telefon, nemusíme rozumět technologii výrazně vyspělejší civilizace.',
            'Příkladem jsou gravitační vlny: dlouho jsme předpokládali jejich existenci, ale nedokázali jsme je přímo zachytit.'
          ]
        },
        {
          time: '10:42',
          title: 'Zrychluje světlo?',
          points: [
            'Ve skle nebo vodě se světlo šíří pomaleji než ve vakuu kvůli interakci elektromagnetického záření s látkou.',
            'Nejde o klasické zpomalování a následné zrychlování částice působením síly.',
            'Rychlost světla ve vakuu zůstává základní fyzikální konstantou.',
            'Optiku je bez rovnic obtížné vysvětlit úplně přesně, proto se často používají zjednodušené představy.'
          ]
        },
        {
          time: '13:02',
          title: 'Co je vlastně Velký třesk?',
          points: [
            'Velký třesk není exploze do prázdného prostoru, ale popis raného horkého a hustého stavu rozpínajícího se vesmíru.',
            'Existuje více kosmologických modelů a není jisté, co přesně tomuto stavu předcházelo.',
            'Prvních přibližně 380 000 let byl vesmír pro světlo neprůhledný; teprve poté vzniklo reliktní záření, které dnes pozorujeme.',
            'Diskuse se dotýká kosmické inflace, horkého Velkého třesku a budoucích měření gravitačních vln detektorem LISA.'
          ]
        },
        {
          time: '19:12',
          title: 'Proč mají objekty ve Sluneční soustavě divoké dráhy?',
          points: [
            'Slapové síly mohou bránit spojování materiálu do většího tělesa nebo naopak těleso roztrhat.',
            'Sluneční soustava nebyla od počátku uspořádaná stejně jako dnes; planety mohly migrovat a vzájemně si měnit dráhy.',
            'Gravitační prak může malé těleso urychlit a poslat na velmi protáhlou dráhu nebo úplně mimo soustavu.',
            'Takto mohou vznikat i bludné planety, které neobíhají žádnou hvězdu.'
          ]
        },
        {
          time: '29:55',
          title: 'Technologie pro řešení klimatické krize',
          points: [
            'Probírají se tóriové reaktory, jaderná fúze a účinnější solární články.',
            'Zachytávání oxidu uhličitého je technicky možné, ale vyžaduje velké množství levné bezemisní energie.',
            'Umělá inteligence může pomoci s optimalizací spotřeby energie, dopravy, výroby a omezením plýtvání potravinami a materiály.',
            'Technologie samy nestačí – důležitá je také ochota společnosti měnit návyky a vzdát se části pohodlí.'
          ]
        },
        {
          time: '36:01',
          title: 'Vznik a zánik Saturnových prstenců',
          points: [
            'Prstence pravděpodobně tvoří materiál, kterému slapové síly nedovolily spojit se do měsíce, případně pozůstatky rozpadlého tělesa.',
            'Část materiálu postupně padá do atmosféry Saturnu, takže prstence nejsou věčné.',
            'Přesné stáří prstenců i doba jejich další existence zůstávají nejisté.'
          ]
        },
        {
          time: '38:45',
          title: 'Hvězdy se pohybují a souhvězdí nejsou věčná',
          points: [
            'Každá hvězda má vlastní pohyb, takže se tvary souhvězdí během tisíců let mění.',
            'Kvůli precesi zemské osy nebyla v minulosti severkou dnešní Polárka.',
            'Magnetický severní pól se také posouvá, což může vyžadovat změny označení letištních drah.'
          ]
        },
        {
          time: '41:24',
          title: 'Vesmír má vrchol tvorby hvězd za sebou',
          points: [
            'Nejvíce hvězd vznikalo v minulosti; dnešní tempo jejich tvorby je výrazně nižší.',
            'S postupným ubýváním plynu bude vesmír v daleké budoucnosti méně aktivní a dynamický.'
          ]
        },
        {
          time: '41:48',
          title: 'Kdy budou další Rozhovory o vesmíru?',
          points: [
            'Jozef už nepůsobí na univerzitě, ale s Norbym plánují v sérii pokračovat.',
            'Několik epizod je už nahraných a čeká na dokončení střihu.',
            'Do konce roku by chtěli vydat alespoň jeden nebo dva další díly.'
          ]
        }
      ],
      concepts: [
        'Červený posuv – posun světla ke delším vlnovým délkám, u vzdálených galaxií zejména vlivem rozpínání vesmíru.',
        'Gravitační vlny – vlnění časoprostoru vznikající při zrychleném pohybu velmi hmotných objektů.',
        'Rychlost světla ve vakuu – přibližně 300 000 km/s; nejvyšší rychlost přenosu informace podle relativity.',
        'Reliktní záření – nejstarší elektromagnetické záření, které můžeme přímo pozorovat; pochází z doby asi 380 000 let po Velkém třesku.',
        'Kosmická inflace – hypotetická fáze mimořádně rychlého rozpínání velmi raného vesmíru.',
        'LISA – plánovaný kosmický detektor gravitačních vln tvořený trojicí družic.',
        'Slapové síly – rozdíly gravitačního působení na různé části tělesa, které mohou těleso deformovat nebo roztrhat.',
        'Gravitační prak – změna rychlosti a směru tělesa při průletu kolem planety nebo jiného hmotného objektu.',
        'Carbon capture – technologie zachytávání oxidu uhličitého z průmyslových zdrojů nebo přímo ze vzduchu.',
        'Precese – pomalá změna směru zemské rotační osy, podobná kývání roztočené káči.'
      ],
      note: 'Chronologický výtah byl upraven podle shrnutí videa, které poskytl uživatel. Nejde o doslovný přepis.'
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .episode-summary{margin-top:10px;border:1px solid var(--line,#dbe2ea);border-radius:12px;background:#fafaff}
    .episode-summary>summary{cursor:pointer;font-weight:750;padding:10px 12px;color:#392b9b;list-style:none}
    .episode-summary>summary::-webkit-details-marker{display:none}
    .episode-summary>summary::after{content:'▾';float:right;transition:.2s}
    .episode-summary[open]>summary::after{transform:rotate(180deg)}
    .episode-summary-body{padding:0 12px 12px;color:#354158;line-height:1.48}
    .episode-summary-body h3{font-size:.96rem;margin:.85rem 0 .4rem}
    .episode-summary-body ul{margin:.25rem 0;padding-left:1.25rem}
    .episode-summary-body li{margin:.3rem 0}
    .summary-highlight{padding:.65rem 0;border-bottom:1px solid var(--line,#dbe2ea)}
    .summary-highlight:last-of-type{border-bottom:0}
    .summary-highlight-title{font-weight:750;color:var(--ink,#162033);margin-bottom:.25rem}
    .summary-time{display:inline-block;min-width:3.4rem;color:#5b4bdb;font-weight:800}
    .summary-note{font-size:.78rem;color:var(--muted,#64748b);margin-top:.8rem}
  `;
  document.head.appendChild(style);

  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[char]));

  function addSummaries() {
    document.querySelectorAll('#episodes article').forEach(card => {
      if (card.querySelector('.episode-summary')) return;
      const title = card.querySelector('h2')?.textContent || '';
      const match = title.match(/Vedátorský podcast\s+(\d+)/i);
      if (!match) return;
      const summary = SUMMARIES[Number(match[1])];
      if (!summary) return;

      const details = document.createElement('details');
      details.className = 'episode-summary';
      details.innerHTML = `
        <summary>Shrnutí dílu</summary>
        <div class="episode-summary-body">
          <h3>Chronologický výtah</h3>
          ${summary.highlights.map(item => `
            <section class="summary-highlight">
              <div class="summary-highlight-title"><span class="summary-time">${esc(item.time)}</span>${esc(item.title)}</div>
              <ul>${item.points.map(point => `<li>${esc(point)}</li>`).join('')}</ul>
            </section>`).join('')}
          <h3>Základní pojmy</h3>
          <ul>${summary.concepts.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
          <div class="summary-note">${esc(summary.note)}</div>
        </div>`;
      card.appendChild(details);
    });
  }

  addSummaries();
  new MutationObserver(addSummaries).observe(document.body, {childList:true, subtree:true});
})();