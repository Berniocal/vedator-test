(()=>{
  try{
    if(typeof TOPICS==='undefined')return;
    TOPICS['Matematika']=[
      'matemat','geometri','fraktál','nekonečn','chaos','pravdepodobnosť',
      'štatistiky','štatistiky','štatistický','exponenciáln','exponenciálne rozdelenie',
      'normálne rozdelenie','normálne rozdelenie','rozdelenie pravdepodobnosti',
      'priemer','medián','rozptyl','štandardné odchýlky','kombinatorik','logaritm'
    ];
  }catch(error){console.warn('Nepodarilo sa rozšíriť kľúčové slová matematiky',error)}
})();