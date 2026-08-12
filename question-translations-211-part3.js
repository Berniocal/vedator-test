(()=>{
  if(window.__vedatorQuestionTranslations211Part3)return;
  window.__vedatorQuestionTranslations211Part3=true;

  const PAIRS=[
    ['Jak vznikla první buňka?','Ako vznikla prvá bunka?'],
    ['Některé molekuly samovolně vytvářejí membránové kuličky.','Niektoré molekuly samovoľne vytvárajú membránové guľôčky.'],
    ['Když takový obal uzavřel molekulu schopnou kopírování, mohl vzniknout předchůdce buňky, přesný průběh ale neznáme.','Keď takýto obal uzavrel molekulu schopnú kopírovania, mohol vzniknúť predchodca bunky, presný priebeh však nepoznáme.'],

    ['Jak daleko působí černá díra?','Ako ďaleko pôsobí čierna diera?'],
    ['Její gravitace teoreticky působí do nekonečné vzdálenosti.','Jej gravitácia teoreticky pôsobí do nekonečnej vzdialenosti.'],
    ['Se vzdáleností však rychle slábne a nakonec je prakticky zanedbatelná.','So vzdialenosťou však rýchlo slabne a napokon je prakticky zanedbateľná.'],

    ['Co jsou bílé díry?','Čo sú biele diery?'],
    ['Jde o hypotetický opak černých děr, do kterého by nic nemohlo vstoupit a hmota by z něj pouze vycházela.','Ide o hypotetický opak čiernych dier, do ktorého by nič nemohlo vstúpiť a hmota by z neho iba vychádzala.'],
    ['Jejich existenci zatím nepodporuje žádné pozorování.','Ich existenciu zatiaľ nepodporuje žiadne pozorovanie.'],

    ['Proč se udává poločas rozpadu, a ne celkový čas rozpadu?','Prečo sa udáva polčas rozpadu, a nie celkový čas rozpadu?'],
    ['Po každém poločasu zbývá polovina předchozího množství látky.','Po každom polčase zostáva polovica predchádzajúceho množstva látky.'],
    ['Matematicky se množství stále zmenšuje, ale nikdy přesně neklesne na nulu.','Matematicky sa množstvo stále zmenšuje, ale nikdy presne neklesne na nulu.'],

    ['Proč noční motýl létá za světlem, když je noční?','Prečo nočný motýľ lieta za svetlom, keď je nočný?'],
    ['Noční hmyz se vyvinul v prostředí, kde hlavními nočními zdroji světla byly Měsíc a hvězdy.','Nočný hmyz sa vyvinul v prostredí, kde hlavnými nočnými zdrojmi svetla boli Mesiac a hviezdy.'],
    ['Umělé světlo narušuje jeho přirozený navigační systém.','Umelé svetlo narúša jeho prirodzený navigačný systém.'],

    ['Proč se při cestách na vysoké hory táboří?','Prečo sa pri cestách na vysoké hory táborí?'],
    ['Výstup je příliš dlouhý na jeden den.','Výstup je príliš dlhý na jeden deň.'],
    ['Postupné přespávání ve výšce navíc umožňuje tělu aklimatizovat se na nižší množství kyslíku.','Postupné prespávanie vo výške navyše umožňuje telu aklimatizovať sa na menšie množstvo kyslíka.'],

    ['Jak podle nich vypadají Trisolarané?','Ako podľa nich vyzerajú Trisolarania?'],
    ['Ve volném pokračování série jsou popsáni jako drobní tvorové podobní hmyzu.','Vo voľnom pokračovaní série sú opísaní ako drobné tvory podobné hmyzu.'],
    ['Malá velikost by jim usnadňovala vysychání a přežití nestabilních podmínek jejich planety.','Malá veľkosť by im uľahčovala vysychanie a prežitie nestabilných podmienok ich planéty.'],

    ['Proč se lidem zdají sny?','Prečo sa ľuďom snívajú sny?'],
    ['Ve spánku mozek třídí a upevňuje vzpomínky.','V spánku mozog triedi a upevňuje spomienky.'],
    ['Proto se sny často týkají nedávných zážitků, myšlenek a problémů.','Preto sa sny často týkajú nedávnych zážitkov, myšlienok a problémov.'],

    ['Dokážeme vymyslet novou barvu?','Dokážeme vymyslieť novú farbu?'],
    ['Běžný člověk je omezen typy světločivných buněk, se kterými se narodil.','Bežný človek je obmedzený typmi svetlocitlivých buniek, s ktorými sa narodil.'],
    ['Lidé se čtyřmi typy čípků ale mohou rozlišovat odstíny, které ostatní nevidí.','Ľudia so štyrmi typmi čapíkov však môžu rozlišovať odtiene, ktoré ostatní nevidia.'],

    ['Je možný život v okolí kvasarů, pulzarů nebo hvězd třetí populace?','Je možný život v okolí kvazarov, pulzarov alebo hviezd tretej populácie?'],
    ['Jednoduchý život nelze zcela vyloučit.','Jednoduchý život nemožno úplne vylúčiť.'],
    ['Velmi vysoké energie však ztěžují vznik stabilních chemických vazeb potřebných pro život.','Veľmi vysoké energie však sťažujú vznik stabilných chemických väzieb potrebných pre život.'],

    ['Jak v životě zpomalit?','Ako v živote spomaliť?'],
    ['Pomáhá pravidelný pohyb, čtení, omezení telefonu a čas věnovaný jednoduchým činnostem.','Pomáha pravidelný pohyb, čítanie, obmedzenie telefónu a čas venovaný jednoduchým činnostiam.'],
    ['Není nutné, aby byla každá hodina produktivní, a důležité je neporovnávat se neustále s ostatními.','Nie je nutné, aby bola každá hodina produktívna, a dôležité je neporovnávať sa neustále s ostatnými.'],

    ['Jak se určuje velikost hvězdy?','Ako sa určuje veľkosť hviezdy?'],
    ['Některé blízké hvězdy lze změřit přímo.','Niektoré blízke hviezdy možno zmerať priamo.'],
    ['Jindy se využívá zakrytí hvězdy planetou nebo Měsícem a doba, po kterou zakrytí trvá.','Inokedy sa využíva zakrytie hviezdy planétou alebo Mesiacom a čas, počas ktorého zakrytie trvá.']
  ];

  const LOOKUP=new Map();
  for(const [cz,sk] of PAIRS){const item={cz,sk};LOOKUP.set(cz,item);LOOKUP.set(sk,item)}
  const language=()=>window.vedatorUiLanguage?.()==='cz'?'cz':'sk';
  const apply=()=>{
    const lang=language();
    document.querySelectorAll('#questions .faq-question-card, .episode-summary .summary-block').forEach(block=>{
      block.querySelectorAll('h2,.summary-title,.summary-question,li').forEach(node=>{
        let raw=node.textContent.trim(),prefix='';
        if(raw.startsWith('Otázka: ')){prefix='Otázka: ';raw=raw.slice(8)}
        const item=LOOKUP.get(node.dataset.vedator211Part3Key||raw)||LOOKUP.get(raw);
        if(!item)return;
        node.dataset.vedator211Part3Key=item.cz;
        const value=prefix+item[lang];
        if(node.textContent!==value)node.textContent=value;
      });
    });
  };
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})};
  new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('vedatorlanguagechange',apply);
  apply();
})();