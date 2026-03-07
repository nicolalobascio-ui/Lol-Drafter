import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { champions } from "../src/app/data/champions";

// Carica le variabili d'ambiente (per sicurezza se non le prende in automatico)
import "dotenv/config";

// 1. Configura il Pool di connessione per PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 2. Inizializza PrismaClient con l'adapter obbligatorio
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Inizio seeding del database...");

    // Prima svuotiamo le tabelle (nell'ordine giusto per le relazioni)
    await prisma.synergy.deleteMany();
    await prisma.counter.deleteMany();
    await prisma.champion.deleteMany();

    console.log("🗑️  Tabelle svuotate.");

    for (const champ of champions) {
        await prisma.champion.create({
            data: {
                id: champ.id,
                name: champ.name,
                image: champ.image,
                counters: {
                    create: (champ.counters || []).map((counter: any) => ({
                        name: counter.name,
                        reason: counter.reason || "",
                    })),
                },
                synergies: {
                    create: (champ.synergies || []).map((synergy: any) => ({
                        name: synergy.name,
                        reason: synergy.reason || ""
                    })),
                },
            },
        });

        console.log(`✅ Inserito: ${champ.name}`);
    }

    const totalChampions = await prisma.champion.count();
    const totalCounters = await prisma.counter.count();
    const totalSynergies = await prisma.synergy.count();

    console.log(`\n🎉 Seeding completato!`);
    console.log(`   Campioni: ${totalChampions}`);
    console.log(`   Counter:  ${totalCounters}`);
    console.log(`   Sinergie: ${totalSynergies}`);
}

main()
    .catch((e) => {
        console.error("❌ Errore durante il seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
