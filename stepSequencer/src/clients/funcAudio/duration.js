export async function duration_automation(position_coordonnee, modulo) {
  //const modulo =  0.15 * id ; // id
  const A = 0 + modulo;
  const B = 0.05 + modulo;
  const C = 0.25 + modulo;
  const D = 0.3 + modulo; 
      
  let duration = 0.1;

  if (position_coordonnee >= A && position_coordonnee <= B) {
    duration = (position_coordonnee - modulo) * 20;
  }
  else if (position_coordonnee >= B && position_coordonnee < C) {
    duration = 30.;
  }   
  else if (position_coordonnee >= C && position_coordonnee < D) {
    duration = ( position_coordonnee -D) * (-20);
  }
  else {
    duration = 0.05 ;
  }
  return duration ;
}

export default duration_automation;