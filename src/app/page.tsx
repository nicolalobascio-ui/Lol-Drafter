"use client";
import React, { useState, useMemo, useEffect } from "react";
fetch("/api/champions")

interface Counter {
  name: string;
  reason: string;
}

interface Champion {
  id: string;
  name: string;
  image: string;
  counters: Counter[];
  synergies?: string[];
}

export default function DraftOracle() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/champions")
      .then((r) => r.json())
      .then((data: Champion[]) => { if (mounted) setChampions(data); })
      .catch(() => { if (mounted) setChampions([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const [selectedEnemies, setSelectedEnemies] = useState<string[]>([]);
  const [selectedAllies, setSelectedAllies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeSlot, setActiveSlot] = useState<"enemy" | "ally">("enemy");

  const resetDraft = () => {
    setSelectedEnemies([]);
    setSelectedAllies([]);
    setSearchTerm("");
    setActiveSlot("enemy");
  };

  const toggleSelect = (name: string) => {
    if (activeSlot === "enemy") {
      setSelectedEnemies((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
      );
      // ensure not selected as ally
      setSelectedAllies((prev) => prev.filter((p) => p !== name));
    } else {
      setSelectedAllies((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
      );
      // ensure not selected as enemy
      setSelectedEnemies((prev) => prev.filter((p) => p !== name));
    }
  };

  const removeEnemy = (name: string) => setSelectedEnemies((p) => p.filter((x) => x !== name));
  const removeAlly = (name: string) => setSelectedAllies((p) => p.filter((x) => x !== name));

  const filteredChampions = useMemo(
    () =>
      champions.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      ),
    [champions, searchTerm]
  );

  const suggestions = useMemo(() => {
    if (selectedEnemies.length === 0) return [];

    const scores: Record<string, { score: number; reasons: string[]; synergy: boolean }> = {};

    selectedEnemies.forEach((enemyName) => {
      const enemyData = champions.find((c) => c.name === enemyName);
      if (enemyData?.counters) {
        enemyData.counters.forEach((counter) => {
          if (!scores[counter.name]) scores[counter.name] = { score: 0, reasons: [], synergy: false };
          scores[counter.name].score += 2;
          scores[counter.name].reasons.push(`Contro ${enemyName}: ${counter.reason}`);
        });
      }
    });

    selectedAllies.forEach((allyName) => {
      champions.forEach((c) => {
        if (c.synergies?.includes(allyName)) {
          if (!scores[c.name]) scores[c.name] = { score: 0, reasons: [], synergy: false };
          scores[c.name].score += 1;
          scores[c.name].synergy = true;
          scores[c.name].reasons.push(`Sinergia con ${allyName}`);
        }
      });
    });

    return Object.entries(scores)
      .map(([name, data]) => {
        const champ = champions.find((c) => c.name === name);
        return { name, image: champ?.image ?? "", ...data };
      })
      .filter((s) => !selectedAllies.includes(s.name) && !selectedEnemies.includes(s.name))
      .sort((a, b) => b.score - a.score);
  }, [selectedEnemies, selectedAllies, champions]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSlot("enemy")}
              className={`px-3 py-1 rounded-xl ${activeSlot === "enemy" ? "bg-red-600/30" : "bg-slate-900/40"}`}
            >
              Seleziona Nemici
            </button>
            <button
              onClick={() => setActiveSlot("ally")}
              className={`px-3 py-1 rounded-xl ${activeSlot === "ally" ? "bg-blue-600/30" : "bg-slate-900/40"}`}
            >
              Seleziona Alleati
            </button>
          </div>

          <button
            onClick={resetDraft}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded-xl transition-all"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Reset Draft
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <input
              type="text"
              placeholder={`Cerca campione per ${activeSlot === "enemy" ? "Nemici" : "Alleati"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredChampions.map((champ) => {
                const isSelectedEnemy = selectedEnemies.includes(champ.name);
                const isSelectedAlly = selectedAllies.includes(champ.name);
                return (
                  <button
                    key={champ.id}
                    onClick={() => toggleSelect(champ.name)}
                    title={champ.name}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl border ${
                      isSelectedEnemy ? "border-red-500" : isSelectedAlly ? "border-blue-500" : "border-slate-800"
                    } bg-slate-900/40`}
                  >
                    <img src={champ.image} alt={champ.name} className="w-12 h-12 object-cover rounded-full" />
                    <span className="text-xs text-center">{champ.name}</span>
                  </button>
                );
              })}
              {filteredChampions.length === 0 && <div className="text-sm text-slate-400 p-4">Nessun campione trovato</div>}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 justify-center">
            <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl">
              <h3 className="text-xs font-black text-red-500 uppercase mb-4 tracking-tighter">Team Nemico (Click per rimuovere)</h3>
              <div className="flex gap-3 flex-wrap">
                {selectedEnemies.length === 0 && <div className="text-sm text-slate-400">Nessun nemico selezionato</div>}
                {selectedEnemies.map((name) => (
                  <button key={name} onClick={() => removeEnemy(name)} className="px-3 py-1 bg-red-600/20 rounded-full text-sm">
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-3xl">
              <h3 className="text-xs font-black text-blue-500 uppercase mb-4 tracking-tighter">I Tuoi Alleati (Click per rimuovere)</h3>
              <div className="flex gap-3 flex-wrap">
                {selectedAllies.length === 0 && <div className="text-sm text-slate-400">Nessun alleato selezionato</div>}
                {selectedAllies.map((name) => (
                  <button key={name} onClick={() => removeAlly(name)} className="px-3 py-1 bg-blue-600/20 rounded-full text-sm">
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-400">Analisi Counter Consigliati</h2>
            {suggestions.length > 0 && (
              <div className="text-xs font-bold text-slate-100 bg-emerald-600 px-4 py-2 rounded-full shadow-lg">
                {suggestions.length} CAMPIONI TROVATI
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {suggestions.map((s) => (
              <div key={s.name} className="p-5 rounded-3xl border-2 border-slate-800 bg-slate-900/60 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {s.image && (
                      <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                    )}
                    <h4 className="font-bold">{s.name}</h4>
                  </div>
                  <div className="text-sm font-black text-emerald-300">{s.score}</div>
                </div>
                <ul className="text-xs text-slate-300 space-y-1">
                  {s.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // quick add to selection in current slot
                      if (activeSlot === "enemy") {
                        setSelectedEnemies((p) => (p.includes(s.name) ? p : [...p, s.name]));
                        setSelectedAllies((p) => p.filter((x) => x !== s.name));
                      } else {
                        setSelectedAllies((p) => (p.includes(s.name) ? p : [...p, s.name]));
                        setSelectedEnemies((p) => p.filter((x) => x !== s.name));
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-emerald-600 text-black font-bold"
                  >
                    Aggiungi ({activeSlot === "enemy" ? "Nemico" : "Alleato"})
                  </button>
                </div>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="text-sm text-slate-400">Seleziona almeno un nemico per vedere suggerimenti.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}