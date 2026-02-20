import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);

async function prechargerCSV(path) {
    try {
        const data = await readFile(path, 'utf8');
        return data ;

    } catch (err) {
        console.error("Erreur lors du préchargement du CSV :", err);
        throw err; // Rejette l'erreur pour que l'appelant puisse la gérer
    }
}

export { prechargerCSV };
