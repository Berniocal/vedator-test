(()=>{
  try{
    if(typeof TOPICS==='undefined')return;
    TOPICS['Matematika']=[
      'matemat','geometri','fraktál','nekonečn','chaos','pravdepodobnosť',
      'štatistik','štatistika','štatistický','exponenciáln','exponenciálne rozdelenie',
      'normálne rozdelenie','normálne rozdelenia','rozdelenie pravdepodobnosti',
      'priemer','medián','rozptyl','štandardná odchýlka','kombinatorik','logaritm'
    ];
  }catch(error){console.warn('Nepodarilo sa rozšíriť kľúčové slová matematiky',error)}
})();