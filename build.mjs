import fs from 'fs';
import fetch from 'node-fetch';
import { manualData } from './src/app/data/manual-data.js'; // Il tuo file con la nuova struttura

async function buildChampions() {
  try {
    console.log("🚀 Recupero dati da Data Dragon...");
    
    // 1. Recupera la lista completa dei campioni da Riot Games
    const response = await fetch('https://ddragon.leagueoflegends.com/cdn/13.24.1/data/it_IT/champion.json');
    const data = await response.json();
    const championsList = Object.values(data.data);

    // 2. Trasforma i dati integrando i tuoi counter e sinergie manuali
    const formattedChampions = championsList.map(champ => {
      // Accediamo ai dati manuali usando il nome del campione
      const manualEntry = manualData[champ.name] || {};

      return {
        id: champ.id,
        name: champ.name,
        image: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${champ.image.full}`,
        // Se non esistono counter o sinergie per questo champ, usiamo un array vuoto
        counters: manualEntry.counters || [],
        synergies: manualEntry.synergies || []
      };
    });

    // 3. Genera il contenuto del file TypeScript
    const content = `
/**
 * AUTO-GENERATED FILE - NON MODIFICARE DIRETTAMENTE
 * Esegui 'node build.mjs' per aggiornare questi dati.
 */

export const champions = ${JSON.stringify(formattedChampions, null, 2)};
`.trim();

    // 4. Scrivi il file nella cartella del tuo progetto
    // Nota: assicurati che la cartella 'src/app/data/' esista
    fs.writeFileSync('./src/app/data/champions.ts', content);

    console.log("✅ File 'champions.ts' generato con successo!");
    console.log(`📊 Totale campioni processati: ${formattedChampions.length}`);
    
    // Check veloce per vedere quanti hanno dati manuali
    const withData = formattedChampions.filter(c => c.counters.length > 0 || c.synergies.length > 0).length;
    console.log(`✨ Campioni con Counter/Sinergie caricati: ${withData}`);

  } catch (error) {
    console.error("❌ Errore durante il build:", error);
  }
}

buildChampions();