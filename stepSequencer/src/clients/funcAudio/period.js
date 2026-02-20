export async function period_automation(position_coordonnee, modulo) {
  //const modulo =  0.15 * id ; // id
  const A = 0 + modulo;
  const B = 0.05 + modulo;
  const C = 0.25 + modulo;
  const D = 0.3 + modulo; 
   
  let period = 0.01;

  if (position_coordonnee >= A && position_coordonnee <= B) {
    period = (position_coordonnee - modulo) * 20;
  }
  else if (position_coordonnee >= B && position_coordonnee < C) {
    period = 30.; // en secondes attention je crois period < durarion
  }   
  else if (position_coordonnee >= C && position_coordonnee < D) {
    period = ( position_coordonnee -D) * (-20);
  }
  else {
    period = 0.05 ;
  }
  return period ;
}

export default period_automation;