
export function CsvLatLon(data, index) {
    try {
        const lignes = data.split('\n');

        if (index < 0 || index >= lignes.length) {
            throw new Error("Index hors limites");
        }

        const ligneCible = lignes[index].trim();
        const elements = ligneCible.split(',');

        if (elements.length < 2) {
            throw new Error("Format de ligne invalide");
        }

        const latitude = parseFloat(elements[0]);
        const longitude = parseFloat(elements[1]);
        return {latitude, longitude};

    } catch (err) {
        console.error("Erreur lors du préchargement du CSV :", err);
        throw err; // Rejette l'erreur pour que l'appelant puisse la gérer
    }
}

export default { CsvLatLon };