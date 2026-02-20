function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

export function Spray(rand, position) {
  const interval = rand * 3; 
  const perturbation = getRandomArbitrary(-interval, interval);
  let newPosition = position + perturbation;
  newPosition = Math.max(0, Math.min(3, newPosition));
  return newPosition;
}

export default Spray;