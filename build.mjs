import fs from 'fs';
import fetch from 'node-fetch';
import { manualData } from './src/app/data/manual-data.js'; // Il tuo file con la nuova struttura

const ROLES = {
  "Aatrox": ["Top"],
  "Ahri": ["Mid"],
  "Akali": ["Mid", "Top"],
  "Akshan": ["Mid", "Bot"],
  "Alistar": ["Support"],
  "Amumu": ["Jungle", "Support"],
  "Anivia": ["Mid"],
  "Annie": ["Mid", "Support"],
  "Aphelios": ["Bot"],
  "Ashe": ["Bot", "Support"],
  "Aurelion Sol": ["Mid"],
  "Azir": ["Mid"],
  "Bard": ["Support"],
  "Bel'Veth": ["Jungle"],
  "Blitzcrank": ["Support"],
  "Brand": ["Support", "Mid"],
  "Briar": ["Jungle"],
  "Camille": ["Top"],
  "Cassiopeia": ["Mid"],
  "Cho'Gath": ["Top", "Mid"],
  "Corki": ["Mid"],
  "Darius": ["Top"],
  "Diana": ["Mid", "Jungle"],
  "Dr. Mundo": ["Top", "Jungle"],
  "Draven": ["Bot"],
  "Ekko": ["Mid", "Jungle"],
  "Elise": ["Jungle"],
  "Evelynn": ["Jungle"],
  "Ezreal": ["Bot"],
  "Fiddlesticks": ["Jungle", "Support"],
  "Fiora": ["Top"],
  "Fizz": ["Mid"],
  "Galio": ["Mid", "Support"],
  "Gangplank": ["Top"],
  "Garen": ["Top"],
  "Gnar": ["Top"],
  "Gragas": ["Jungle", "Top", "Support"],
  "Graves": ["Jungle"],
  "Gwen": ["Top", "Mid"],
  "Hecarim": ["Jungle"],
  "Heimerdinger": ["Mid", "Top", "Bot"],
  "Illaoi": ["Top"],
  "Irelia": ["Top", "Mid"],
  "Ivern": ["Jungle"],
  "Janna": ["Support"],
  "Jarvan IV": ["Jungle"],
  "Jax": ["Top", "Jungle"],
  "Jayce": ["Top", "Mid"],
  "Jinx": ["Bot"],
  "K'Sante": ["Top"],
  "Kai'Sa": ["Bot"],
  "Kalista": ["Bot"],
  "Karma": ["Support", "Mid"],
  "Karthus": ["Jungle", "Mid"],
  "Kassadin": ["Mid"],
  "Katarina": ["Mid"],
  "Kayle": ["Top", "Mid"],
  "Kayn": ["Jungle"],
  "Kennen": ["Top"],
  "Kha'Zix": ["Jungle"],
  "Kindred": ["Jungle"],
  "Kled": ["Top"],
  "Kog'Maw": ["Bot"],
  "LeBlanc": ["Mid"],
  "Lee Sin": ["Jungle"],
  "Leona": ["Support"],
  "Lillia": ["Jungle"],
  "Lissandra": ["Mid"],
  "Lucian": ["Bot", "Mid"],
  "Lulu": ["Support", "Top"],
  "Lux": ["Support", "Mid"],
  "Malphite": ["Top", "Support"],
  "Malzahar": ["Mid"],
  "Maokai": ["Support", "Top", "Jungle"],
  "Master Yi": ["Jungle"],
  "Miss Fortune": ["Bot"],
  "Mordekaiser": ["Top"],
  "Morgana": ["Support", "Mid"],
  "Nami": ["Support"],
  "Nasus": ["Top"],
  "Nautilus": ["Support"],
  "Nidalee": ["Jungle"],
  "Nilah": ["Bot"],
  "Nocturne": ["Jungle"],
  "Olaf": ["Jungle", "Top"],
  "Orianna": ["Mid"],
  "Ornn": ["Top"],
  "Pantheon": ["Top", "Support"],
  "Poppy": ["Top", "Jungle", "Support"],
  "Pyke": ["Support"],
  "Qiyana": ["Mid"],
  "Quinn": ["Top"],
  "Rakan": ["Support"],
  "Rammus": ["Jungle"],
  "Rek'Sai": ["Jungle"],
  "Rell": ["Support"],
  "Renata Glasc": ["Support"],
  "Renekton": ["Top"],
  "Rengar": ["Jungle", "Top"],
  "Riven": ["Top"],
  "Rumble": ["Top", "Mid"],
  "Ryze": ["Mid"],
  "Samira": ["Bot"],
  "Sejuani": ["Jungle"],
  "Senna": ["Support", "Bot"],
  "Seraphine": ["Support", "Mid"],
  "Sett": ["Top", "Support"],
  "Shaco": ["Jungle"],
  "Shen": ["Top"],
  "Shyvana": ["Jungle"],
  "Singed": ["Top"],
  "Sion": ["Top"],
  "Sivir": ["Bot"],
  "Skarner": ["Jungle"],
  "Sona": ["Support"],
  "Soraka": ["Support"],
  "Swain": ["Support", "Mid"],
  "Sylas": ["Mid", "Jungle"],
  "Syndra": ["Mid"],
  "Tahm Kench": ["Support", "Top"],
  "Taliyah": ["Jungle", "Mid"],
  "Talon": ["Mid", "Jungle"],
  "Taric": ["Support"],
  "Teemo": ["Top"],
  "Thresh": ["Support"],
  "Tristana": ["Bot"],
  "Trundle": ["Jungle", "Top"],
  "Tryndamere": ["Top"],
  "Twisted Fate": ["Mid"],
  "Twitch": ["Bot", "Jungle"],
  "Udyr": ["Jungle", "Top"],
  "Urgot": ["Top"],
  "Varus": ["Bot", "Mid"],
  "Vayne": ["Bot", "Top"],
  "Veigar": ["Mid", "Support"],
  "Vel'Koz": ["Support", "Mid"],
  "Vex": ["Mid"],
  "Vi": ["Jungle"],
  "Viego": ["Jungle"],
  "Viktor": ["Mid"],
  "Vladimir": ["Mid", "Top"],
  "Volibear": ["Top", "Jungle"],
  "Warwick": ["Jungle"],
  "Wukong": ["Jungle", "Top"],
  "Xayah": ["Bot"],
  "Xerath": ["Support", "Mid"],
  "Xin Zhao": ["Jungle"],
  "Yasuo": ["Mid", "Bot"],
  "Yone": ["Mid", "Top"],
  "Yorick": ["Top"],
  "Yuumi": ["Support"],
  "Zac": ["Jungle"],
  "Zed": ["Mid"],
  "Zeri": ["Bot"],
  "Ziggs": ["Bot", "Mid"],
  "Zilean": ["Support", "Mid"],
  "Zoe": ["Mid"],
  "Zyra": ["Support"],
  "Braum": ["Support"],
  "Caitlyn": ["Bot"],
  "Hwei": ["Mid"],
  "Jhin": ["Bot"],
  "Milio": ["Support"],
  "Naafiri": ["Mid"],
  "Neeko": ["Mid", "Support"],
  "Nunu e Willump": ["Jungle"],
};

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
        role: ROLES[champ.name] || [],
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