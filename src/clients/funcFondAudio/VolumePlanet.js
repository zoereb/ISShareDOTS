
export async function VolumePlanet(value) {
   
  const G1 = value ;
  const G2 = (Math.exp((1-value)) - 1) / 1.6;
  console.log(G2)
  /*let G1 , G6 ;
    if (value >= 0 && value < 0.5) {
      G1 =  1.5*value ;
      G6 = value*0.1 ;
    }
    else {
      G1 =  1.5*(1-value) ;
      G6 = (1-value)*0.1 ;
    }

    const G2 = value/4;  // son des bips bips de l'espace
    const G3 = (1-value)  ; // clocher (ambiance)
    const G4 = (1-value) / 20; // voix humaine
    const G5 = (1-value);
    
    const G7 = (1-value) / 10 ; //voix enfant
    const G8 = value/20 ;
  */
  return [G1, G2] ;
}

export default VolumePlanet;