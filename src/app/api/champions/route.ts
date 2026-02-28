import { NextResponse } from 'next/server';
import { champions } from '@/app/data/champions'; // Per ora usiamo ancora il file come "finto DB"

export async function GET() {
  // Questa funzione simula quello che farebbe un backend vero:
  // Riceve una richiesta e restituisce i dati
  return NextResponse.json(champions);
}