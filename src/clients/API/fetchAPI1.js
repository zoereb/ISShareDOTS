let lastGoodData = null ;
async function fetchISSPosition() {
    try {
        const response = await fetch('http://api.open-notify.org/iss-now.json');
        if (!response.ok) {
            throw new Error('Erreur réseau');
        }
        const data = await response.json();
        lastGoodData = data;
        return data ;
        
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return lastGoodData;
    }
}
export default fetchISSPosition;