(()=>{
  if(window.__vedatorEpisode284Summary)return;
  window.__vedatorEpisode284Summary=true;

  const QUESTIONS=[
    {time:'1:40',title:'Prečo by som dal ďalší tieň, keď som v ňom?',points:['Nie si v dokonalom stíne.','V meste sa svetlo odráža od budov, zeme a atmosféry, takže prichádza z viacerých smerov.','Na Mesiaci sú tieňy veľmi ostré, pretože tam je takmer žiadne rozptýlené svetlo.']},
    {time:'3:22',title:'Ako je možné, že gravitacia existuje?',points:['Veda zvyčajne nevysvetľuje konečné "príč", ale opisuje, ako funguje gravitacia.','Gravitace je projev zakřivení časoprostoru hmotou.','Teoreticky lze uvažovat vesmír bez gravitace nastavením gravitační konstanty G na nulu.','Iné nezávislé druhy gravitácie by nemali zmysel, pretože časoprostor má jednu metriku.']},
    {time:'5:08',title:'Koľko by stálo cesta k najbližšej čiernej diere?',points:['Nejbližší známá černá díra je přibližně 1600 světelných let daleko.','Aby človek mohol prejsť svoj život, musel by lietať asi 99% rýchlosti svetla, čo je energeticky nereálne.','Raketa by potřebovala energii odpovídající přeměně bilionů tun hmoty na energii.','Sonda se solární plachetnicí by mohla letět tisíce let.','Môžu existovať bližšie čierne diery, ale zatiaľ nie sú potvrdené.']},
    {time:'8:19',title:'Je možné chudnúť psychickou aktivitou?',points:['Mozek spotrebuje veľa energie, ale ťažšie premýšľanie len málo zvyšuje spotrebu.','Chudnutí vyžaduje kalorický deficit.','Cvičenie pomáha, ale môže zvýšiť hlad a potom človek bude jesť viac.','Únava po skúške je skôr spojená so stresom, jedlom a nedostatkom tekutín, než s výraznou spotrebou energie.']},
    {time:'10:37',title:'Prečo v rovnicach singularity je nekonečné?',points:['Nekonečna zvyčajne znamená, že použitý model je neúplný.','Podobně při zanedbání odporu nebo tlumení může model předpovědět nesmyslně nekonečnou amplitudu.','Pri čiernych dieroch je singularita dôkazom toho, že nám chýba úplná teória kvantovej gravitácie.']},
    {time:'11:59',title:'Môže čierna diera pochlať niečo väčšie ako sama?',points:['Áno, to sa deje bežne.','Veľký objekt, napríklad hviezda, sa špagetifikuje, keď spadne.','Část hmoty může být vyvržena ven v podobě výtrysků.','Rozmer padajúcej objekty nie je prekážkou  Zem by mohla spadať do menšej čiernej diery.']},
    {time:'13:28',title:'Čo drží atmosféru na Zemi?',points:['Atmosféru drží gravitace.','Molekuly sa pohybujú a niektoré sa snažia uniknúť, ale gravitácia ich väčšinou drží.','Hustota vzduchu proto s výškou klesá.','Těžký plyn, napríklad CO2, môže zostať v otvorenej nádoby a môže sa vylievať na sviečku.']},
    {time:'14:56',title:'Ovplyvňuje úplňok spánok?',points:['Áno, hlavne kvôli väčšiemu množstvu svetla.','Nedostatečné zatemnění může zhoršit usínání a kvalitu spánku.','Aktivnější zvířata mohou v noci více rušit.','Pomoci může maska na oči a špunty do uší.']},
    {time:'16:52',title:'Obľúbené videohry',points:['Witcher 3.','Diablo 2, Baldur\'s Gate 2, Hearthstone a Magic.','Obaja majú radi hry, ktoré sa môžu hrať spoločne.']},
    {time:'18:21',title:'Čo si myslíte o Majorane 1 od Microsoftu?',points:['Ide o nový návrh kvantového počítača, ktorý sľubuje škálovanie až do milióna qubitov.','Microsoft už prednesol niektoré sľuby, takže je vhodné opatrne optimistické.','Kombinace kvantových počítačů a umělé inteligence by mohla být velmi silná.','Projekt znovu přitáhl pozornost ke kvantovým počítačům po boomu AI.']},
    {time:'20:39',title:'Obľúbené anime',points:['Joseph: One Piece  piráti, dobrodružstvo a spoločenské témy, viac ako tisíc epizód.','Samuel: Death Note, Akira, Ghost in the Shell a filmy štúdia Ghibli.']},
    {time:'24:17',title:'Prečo oheň nemá tieň?',points:['Oheň světlo vytváří a viditelné světlo většinou výrazně neblokuje.','Proto obvykle nevytváří běžný viditelný stín.','Hladká plazma, napríklad pod raketou, môže blokovať rádiové vlny a vytvárať rádio stín.','Horký vzduch nad plamenem také způsobuje optické zkreslení a vlnění obrazu.']}
  ];

  function isEpisode284(article){return /\bpodcast\s+284\b/i.test(article?.querySelector('h2')?.textContent||'')}

  function install(article){
    if(!isEpisode284(article)||article.querySelector('.episode-summary'))return;
    const details=document.createElement('details');
    details.className='episode-summary';
    const summary=document.createElement('summary');
    summary.textContent='Zhrnutie diely';
    const body=document.createElement('div');
    body.className='episode-summary-body';

    for(const item of QUESTIONS){
      const block=document.createElement('div');
      block.className='summary-block';
      const time=document.createElement('div');time.className='summary-time';time.textContent=item.time;
      const title=document.createElement('div');title.className='summary-title';title.textContent=item.title;
      block.append(time,title);
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