export async function automation(position_coordonnee, modulo) {
 // const modulo =  0.15 * id ; // non la valeur du début du recuperage des synthGranular
  const A = 0 + modulo;
  const B = 0.05 + modulo;
  const C = 0.25 + modulo;
  const D = 0.3 + modulo; 
   
  let automation_volume = 0;

  if (position_coordonnee >= A && position_coordonnee <= B) {
    automation_volume = (position_coordonnee - modulo) * 20 /2;
  }
  else if (position_coordonnee >= B && position_coordonnee < C) {
    automation_volume = 1./2;
  }   
  else if (position_coordonnee >= C && position_coordonnee < D) {
    automation_volume = ( position_coordonnee -D) * (-20) /2;
  }
  else {
    automation_volume = 0 ; // à voir là dedans
    //return false ;
  }
  //console.log(automation_volume)
  return automation_volume ;
}

export default automation;