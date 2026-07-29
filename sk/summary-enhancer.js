(() => {
  const SUMMARIES = {
    300: {
      highlights: [
        {
          time: '1:25',
          title: 'Prvý kontakt s mimozemšťanmi',
          points: [
            'Komunikácia s civilizáciou bez spoločného jazyka, skúseností a spôsobu myslenia by bola mimoriadne ťažká.',
            'Vyššia civilizácia nás nemusí považovať za rovnocenných partnerov, rovnako ako ľudia necítia mravce ani baktérie.',
            'Zjavné je, že dlhodobej technologickej civilizácii pravdepodobne treba aj vyspelá etika, inak by mohla sama zničiť.',
            'Situace se přirovnává k historickým kontaktům moderních společností s izolovanými kmeny.'
          ]
        },
        {
          time: '6:33',
          title: 'Majú galaxie farby?',
          points: [
            'U velmi vzdálených galaxií pozorujeme červený posuv způsobený rozpínáním vesmíru.',
            'Mladé galaxie s velkým množstvím horkých mladých hvězd bývají modřejší.',
            'Starší galaxie obsahují více chladnějších hvězd a často působí červeněji.',
            'Farba, ktorú pozorujeme, závisí aj od vzdialenosti, pohybu spektra a spôsobu spracovania obrazu.'
          ]
        },
        {
          time: '8:14',
          title: 'Môžeme prehliadať mimozemské životy?',
          points: [
            'Mimozemské signály alebo technológie môžu existovať v podobe, ktorú nedokážeme rozpoznať ani merať.',
            'Rovnako ako mravca nedokáže pochopiť smartfón, my nemusíme pochopiť technológie výrazne vyspelých civilizácií.',
            'Príkladom sú gravitačné vlny: dlho sme predpokladali ich existenciu, ale nedokázali sme ich priamo zachytiť.'
          ]
        },
        {
          time: '10:42',
          title: 'Zrychľuje svetlo?',
          points: [
            'Ve skle nebo vodě se světlo šíří pomaleji než ve vakuu kvůli interakci elektromagnetického záření s látkou.',
            'Nejde o klasické zpomalování a následné zrychlování částice působením síly.',
            'Rychlost světla ve vakuu zůstává základní fyzikální konstantou.',
            'Bez rovnic je ťažké presne vysvetliť optiku, preto sa často používajú zjednodušené predstavy.'
          ]
        },
        {
          time: '13:02',
          title: 'Čo je vlastne Veľký třes?',
          points: [
            'Veľký třes nie je výbuch do prázdnoty, ale opis ranného horúceho a hustého stavu rozširujúceho sa vesmíru.',
            'Existuje viac kozmologických modelov a nie je isté, čo presne predchádzalo tomuto stavu.',
            'Prvních přibližně 380 000 let byl vesmír pro světlo neprůhledný; teprve poté vzniklo reliktní záření, které dnes pozorujeme.',
            'Diskusia sa týka kozmickej inflácie, horúceho Veľkého trestu a budúcich meraní gravitačných vln detektorom LISA.'
          ]
        },
        {
          time: '19:12',
          title: 'Prečo objekty v Slnečnej sústave majú divoké dráhy?',
          points: [
            'Slapové síly mohou bránit spojování materiálu do většího tělesa nebo naopak těleso roztrhat.',
            'Slnečná sústava nebola od začiatku usporiadaná tak, ako je dnes; planéty mohli migruovať a meniť si dráhy.',
            'Gravitační prak může malé těleso urychlit a poslat na velmi protáhlou dráhu nebo úplně mimo soustavu.',
            'Takto môžu vzniknúť aj bláznivé planéty bez hviezd.'
          ]
        },
        {
          time: '29:55',
          title: 'Klimatické krízové technológie',
          points: [
            'Rozpráva sa týka torových reaktorov, jadrového fúzie a efektívnejších solárnych článkov.',
            'Chytávanie oxidu uhličitého je technicky možné, ale vyžaduje veľké množstvo lacnej energie bez emisií.',
            'Umelá inteligencia môže pomôcť optimalizovať spotrebu energie, dopravu, výrobu a obmedziť straty potravín a materiálov.',
            'Technologie sama o sebe nestačí  dôležitá je aj ochota spoločnosti zmeniť svoje návyky a vzdať sa časti pohodlia.'
          ]
        },
        {
          time: '36:01',
          title: 'Vznik a zánik Saturnových prsteňov',
          points: [
            'Prsteň pravdepodobne tvorí materiál, ktorý sa nedovolil spojiť do mesiaca, prípadne pozostatky rozpadnutého tela.',
            'Časť materiálu postupne spadá do atmosféry Saturnu, takže prstence nie sú večné.',
            'Přesné stáří prstenců i doba jejich další existence zůstávají nejisté.'
          ]
        },
        {
          time: '38:45',
          title: 'Hviezdy sa pohybujú a súhry nie sú večné',
          points: [
            'Každá hvězda má vlastní pohyb, takže se tvary souhvězdí během tisíců let mění.',
            'Kvůli precesi zemské osy nebyla v minulosti severkou dnešní Polárka.',
            'Magnetický severný pól sa tiež posúva, čo môže vyžadovať zmeny označenia letísk.'
          ]
        },
        {
          time: '41:24',
          title: 'Vesmír má vrchol tvorby hviezd za sebou.',
          points: [
            'Najviac hviezd vzniklo v minulosti; dnes ich tvorba je výrazne nižšia.',
            'S postupným ubýváním plynu bude vesmír v daleké budoucnosti méně aktivní a dynamický.'
          ]
        },
        {
          time: '41:48',
          title: 'Kedy sa bude konať ďalší rozhovor o vesmíre?',
          points: [
            'Josef už nechodí na univerzitu, ale Norby a jeho rodina plánujú pokračovať v sérii.',
            'Několik epizod je už nahraných a čeká na dokončení střihu.',
            'Do konce roku by chtěli vydat alespoň jeden nebo dva další díly.'
          ]
        }
      ],
      concepts: [
        'Červený pohyb  posun svetla na dlhšie vlnové dĺžky, najmä v vzdialených galaxiách, v dôsledku rozširovania vesmíru.',
        'Gravitatívne vlny  vlny časoprostoru vznikajúce pri zrýchlenom pohybe veľmi hmotných objektov.',
        'Rýchlosť svetla vo vakuu  približne 300 000 km/s; najvyššia rýchlosť prenosu informácií podľa relativity.',
        'Reliktní záření – nejstarší elektromagnetické záření, které můžeme přímo pozorovat; pochází z doby asi 380 000 let po Velkém třesku.',
        'Kosmická inflácia  hypotetická fáza mimoriadne rýchleho rozširovania veľmi skorého vesmíru.',
        'LISA  plánovaný kozmický detektor gravitačných vln tvorený trojkou satelitov.',
        'Základné sily  rozdiely gravitačného pôsobenia na rôzne časti tela, ktoré môžu deformovať alebo roztrhať telo.',
        'Gravitácia  zmenu rýchlosti a smeru tela pri prechode okolo planéty alebo iného hmotného objektu.',
        'Carbon capture  Technológia zachytávania uhlíka z priemyselných zdrojov alebo priamo z ovzdušia.',
        'Preces  pomalý zmena smeru rotácie zeme, podobný kĺbovi rozvráteného kača.'
      ],
      note: 'Chronologický výťah bol upravený podľa zhrnutia videa poskytnutého používateľom.'
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
        <summary>Zhrnutie diely</summary>
        <div class="episode-summary-body">
          <h3>Chronologický výťah</h3>
          ${summary.highlights.map(item => `
            <section class="summary-highlight">
              <div class="summary-highlight-title"><span class="summary-time">${esc(item.time)}</span>${esc(item.title)}</div>
              <ul>${item.points.map(point => `<li>${esc(point)}</li>`).join('')}</ul>
            </section>`).join('')}
          <h3>Základné pojmy</h3>
          <ul>${summary.concepts.map(item => `<li>${esc(item)}</li>`).join('')}</ul>
          <div class="summary-note">${esc(summary.note)}</div>
        </div>`;
      card.appendChild(details);
    });
  }

  addSummaries();
  new MutationObserver(addSummaries).observe(document.body, {childList:true, subtree:true});
})();