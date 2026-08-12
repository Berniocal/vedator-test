(()=>{
  if(window.__vedatorEpisode340Summary)return;
  window.__vedatorEpisode340Summary=true;

  // Díl 346 musí fungovat i na instalacích, které stále používají přímo sw.js.
  // Tento soubor se vždy spouští těsně před questions-view.js, takže zde
  // synchronně zablokujeme starou verzi Otázek, načteme shrnutí 346 a následně
  // spustíme stejný questions-view.js s doplněným dílem 346 a počtem 734.
  if(!window.__vedatorEpisode346DirectRuntime){
    window.__vedatorEpisode346DirectRuntime=true;
    window.__vedatorQuestionsView=true;

    const startPatchedQuestions=async()=>{
      if(window.__vedatorQuestionsView346Started)return;
      window.__vedatorQuestionsView346Started=true;
      try{
        const response=await fetch('./questions-view.js?episode346-direct=v1',{cache:'no-store'});
        let code=await response.text();
        code=code.replace(/const FAQ=\[([^\]]*)\]/,(_,source)=>{
          const values=source.split(',').map(value=>value.trim()).filter(Boolean);
          if(!values.includes('346'))values.unshift('346');
          return `const FAQ=[${values.join(',')}]`;
        });
        code=code.replace(/TOTAL_QUESTIONS=\d+\b/,'TOTAL_QUESTIONS=734');
        delete window.__vedatorQuestionsView;
        const script=document.createElement('script');
        script.dataset.vedatorQuestions346Runtime='1';
        script.textContent=code+'\n//# sourceURL=questions-view-346-runtime.js';
        document.head.appendChild(script);
        script.remove();
      }catch(error){
        console.warn('Nepodařilo se spustit rozšířené Otázky pro díl 346.',error);
        delete window.__vedatorQuestionsView;
        const fallback=document.createElement('script');
        fallback.src='./questions-view.js?episode346-fallback=v1';
        fallback.defer=true;
        document.head.appendChild(fallback);
      }
    };

    if(window.__vedatorEpisode346Summary){
      void startPatchedQuestions();
    }else{
      const summaryScript=document.createElement('script');
      summaryScript.src='./episode-346-summary.js?direct=v1';
      summaryScript.async=false;
      summaryScript.dataset.vedatorEpisode346Direct='1';
      summaryScript.onload=()=>void startPatchedQuestions();
      summaryScript.onerror=()=>void startPatchedQuestions();
      document.head.appendChild(summaryScript);
    }
  }

  const QUESTIONS=[
    {time:'2:00',title:'Entropie, absolutní nula a směr času',question:'Je při absolutní nule entropie nulová? A zastavil by se čas?',points:['Při absolutní nule systém padne do nejnižšího energetického stavu → entropie je minimální (v praxi téměř nulová).','Nic se nehýbe → v tomto smyslu „čas neplyne“, protože není žádná dynamika.','Směr času souvisí s růstem entropie; pokud se nic nemění, není „co měřit“.']},
    {time:'4:20',title:'Může kovová kulička narazit do rozbité mramorové stěny a opravit ji?',points:['Fyzikálně povolené, statisticky absolutně nemožné.','Aby se stěna „složila zpět“, musely by se všechny molekuly přesně vrátit opačným směrem.','Pravděpodobnost je extrémně malá: řádově 10^(10^20).','Je to příklad jednosměrnosti času a růstu entropie.']},
    {time:'7:41',title:'Může se Země převrátit o 180° kvůli Džanibekovovu efektu?',points:['Džanibekovův efekt je nestabilní rotace objektů s určitými momenty setrvačnosti.','Země má tvar a rozložení hmoty, které takovou nestabilní rotaci neumožňuje.','Zemi to nehrozí.','Kdyby se to stalo náhle → všichni by okamžitě zemřeli kvůli obrovskému zrychlení (změna 240 km/s).']},
    {time:'11:43',title:'Proč černá díra pohlcuje věci? (dětská otázka)',points:['Gravitace černé díry je tak silná, že neunikne ani světlo.','Pokud neunikne světlo, neunikne nic.','Je to jen extrémní verze stejné gravitace, která drží nás na Zemi.']},
    {time:'13:26',title:'Co je kometa 3I/ATLAS? Je mimozemská?',points:['Třetí známá mezihvězdná kometa po ‘Oumuamua a Borisovovi.','Není mimozemská technologie, jen objekt z jiné hvězdné soustavy.','Už ji nedoženeme – všimli jsme si jí pozdě.','Konspirační weby o ní šířily nesmysly.']},
    {time:'15:22',title:'Jaký je váš cíl v počtu přehrání podcastu?',points:['Původní cíl: 5 000 posluchačů na epizodu do 3 let → splněno za 3 měsíce.','Nemají žádný nový cíl; dělají podcast pro radost.','Aktuálně cca 7,5 milionu přehrání na audioplatformách + ~700–800 tisíc na YouTube.']},
    {time:'18:37',title:'Je pokrok v solárních plachetnicích?',points:['Technologie funguje, ale je extrémně pomalá.','Fotony mají malou hybnost → malé zrychlení.','Laserové pohony by mohly být budoucnost (např. projekt Starshot).','Problém: obrovské plachty → riziko zásahu mikrometeoritů.','Možné využití v daleké budoucnosti pro automatické sondy.']},
    {time:'22:07',title:'Proč mě kope kolo, když jedu pod vedením vysokého napětí?',points:['Vysoké napětí vytváří slabé elektrické pole.','Pohyb kovového rámu v poli indukuje proud.','Pneumatiky izolují → proud nemá kam unikat → člověk ho cítí.','Úroveň je v milampérech → nepříjemné, ale ne nebezpečné.']},
    {time:'23:31',title:'Může pochodující vojsko zničit most?',points:['Ano, pokud se trefí do rezonanční frekvence konstrukce.','Rezonance může zesílit vibrace až k destrukci.','Historicky se to stalo dvakrát (Anglie 1830, Francie 1850).','Dnes se konstrukce navrhují tak, aby se tomu vyhnuly.','Vítr může most rozvibrovat také (příklad Tacoma Narrows Bridge).']},
    {time:'26:27',title:'Na jaké škole učí Samuel?',points:['Matematicko-fyzikální fakulta, Univerzita Komenského, Bratislava.','Učí teoretickou fyziku.']},
    {time:'27:44',title:'Co kdyby naše galaxie začala rotovat opačně?',points:['Pokud pomalu → nevšimli bychom si to.','Galaktický rok trvá ~250 milionů let.','Pokud náhle → okamžitá smrt všech kvůli změně rychlosti 240 km/s.','Většina hvězd viditelných okem je blízko, takže změny by byly pomalé.']},
    {time:'29:19',title:'Co znamená slovo „rozumět“?',points:['Prakticky: umět samostatně aplikovat postup.','Teoreticky: vidět strukturu v množství informací a zjednodušit ji.','Rozumění = schopnost odlišit podstatné kroky od zbytečných.','Opice umí opakovat, ale nerozumí; člověk chápe, co je důležité.']},
    {time:'32:10',title:'Hrajete ještě Magic: The Gathering?',points:['Ano, dokonce víc než dřív.','Hrají doma → s fanoušky si zahrát nejde.','Možná jednou udělají veřejné hraní nebo turnaj.']},
    {time:'33:11',title:'Proč tornádo nepřekročí rovník?',points:['Tornáda a hurikány potřebují Koriolisovu sílu.','Na rovníku je Koriolis = 0 → rotace se nevytvoří.','Silné proudění (jet streams) navíc brání přechodu.','Malá tornáda (ne hurikány) rovník překročit mohou.']},
    {time:'35:31',title:'Musím při výpočtu délky letu počítat s rotací Země?',points:['Délka trasy je stejná tam i zpět.','Čas letu se liší kvůli větru, ne kvůli rotaci Země.','Vzduch se hýbe → letíš vůči vzduchu, ne vůči Zemi.','Proudění je strukturované (trade winds, jet streams).','Rotace Země by hrála roli jen kdyby vzduch stál → ale nestojí.']}
  ];

  function isEpisode340(article){return /\bpodcast\s+340\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode340(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Shrnutí dílu';
    const body=document.createElement('div');
    body.className='episode-summary-body';

    for(const item of QUESTIONS){
      const block=document.createElement('div');
      block.className='summary-block';
      const time=document.createElement('div');time.className='summary-time';time.textContent=item.time;
      const title=document.createElement('div');title.className='summary-title';title.textContent=item.title;
      block.append(time,title);
      if(item.question){const question=document.createElement('div');question.className='summary-question';question.textContent=`Otázka: ${item.question}`;block.appendChild(question)}
      const list=document.createElement('ul');
      for(const point of item.points){const li=document.createElement('li');li.textContent=point;list.appendChild(li)}
      block.appendChild(list);body.appendChild(block);
    }
    const note=document.createElement('div');note.className='summary-note';note.textContent='Kliknutím na čas se epizoda spustí přímo u dané otázky.';
    body.appendChild(note);details.append(summary,body);article.appendChild(details);
  }

  const episodes=document.querySelector('#episodes');
  if(!episodes)return;
  episodes.querySelectorAll('article').forEach(install);
  new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes){
      if(node.nodeType!==1)continue;
      if(node.matches?.('article'))install(node);
      node.querySelectorAll?.('article').forEach(install);
    }
  }).observe(episodes,{childList:true});
})();