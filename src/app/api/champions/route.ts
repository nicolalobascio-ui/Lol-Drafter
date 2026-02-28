import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const champions = await prisma.champion.findMany({
      include: {
        counters: true,   // "JOIN" — prendiamo anche i counter
        synergies: true,  // "JOIN" — prendiamo anche le sinergie
      },
    });

    // Formattiamo i dati in un modo ottimale per il frontend
    const formattedChampions = champions.map(champ => ({
      id: champ.id,
      name: champ.name,
      image: champ.image,
      counters: champ.counters.map(c => ({ name: c.name, reason: c.reason })),
      synergies: champ.synergies.map(s => s.name)
    }));

    return NextResponse.json(formattedChampions);
  } catch (error) {
    console.error("Errore durante il fetch dei campioni:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei dati" },
      { status: 500 }
    );
  }
}
