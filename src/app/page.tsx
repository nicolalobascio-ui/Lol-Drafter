"use client";
import React, { useState, useMemo, useEffect } from "react";

interface Counter {
  name: string;
  reason: string;
}

interface Synergy {
  name: string;
  reason: string;
}

interface Champion {
  id: string;
  name: string;
  image: string;
  counters: Counter[];
  synergies?: Synergy[];
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

  const suggestedCounters = useMemo(() => {
    if (selectedEnemies.length === 0) return [];

    const counterMap: Record<string, { count: number; targets: string[] }> = {};

    selectedEnemies.forEach((enemyName) => {
      const enemyData = champions.find((c) => c.name === enemyName);
      if (enemyData?.counters) {
        enemyData.counters.forEach((counter) => {
          if (!counterMap[counter.name]) counterMap[counter.name] = { count: 0, targets: [] };
          counterMap[counter.name].count += 1;
          counterMap[counter.name].targets.push(enemyName);
        });
      }
    });

    return Object.entries(counterMap)
      .map(([name, data]) => {
        const champ = champions.find((c) => c.name === name);
        return { name, image: champ?.image ?? "", ...data };
      })
      .filter((s) => !selectedAllies.includes(s.name) && !selectedEnemies.includes(s.name))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [selectedEnemies, selectedAllies, champions]);

  const suggestedSynergies = useMemo(() => {
    if (selectedAllies.length === 0) return [];

    const synergyMap: Record<string, { count: number; targets: string[] }> = {};

    selectedAllies.forEach((allyName) => {
      champions.forEach((c) => {
        const syn = c.synergies?.find((s) => s.name === allyName);
        if (syn) {
          if (!synergyMap[c.name]) synergyMap[c.name] = { count: 0, targets: [] };
          synergyMap[c.name].count += 1;
          synergyMap[c.name].targets.push(allyName);
        }
      });
    });

    return Object.entries(synergyMap)
      .map(([name, data]) => {
        const champ = champions.find((c) => c.name === name);
        return { name, image: champ?.image ?? "", ...data };
      })
      .filter((s) => !selectedAllies.includes(s.name) && !selectedEnemies.includes(s.name))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [selectedAllies, selectedEnemies, champions]);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-slate-100 p-4 font-sans flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black uppercase tracking-widest text-[#c8a951] italic">Draft Oracle</h1>
        <button
          onClick={resetDraft}
          className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/50 rounded-xl transition-all text-xs font-black uppercase tracking-widest text-red-500"
        >
          Reset Draft
        </button>
      </header>

      {/* Main Grid: 3 Columns Desktop / Stacked Mobile */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* Left Column: Allies (Blue Side) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-blue-900/40 border border-blue-500/30 p-2 rounded-t-lg">
            <h2 className="text-sm font-black text-blue-400 uppercase tracking-tighter">Blue Team (Allies)</h2>
            <span className="text-xs font-bold text-blue-300">{selectedAllies.length}/5</span>
          </div>
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((index) => {
              const championName = selectedAllies[index];
              const champData = championName ? champions.find((c) => c.name === championName) : null;
              return (
                <div
                  key={`ally-${index}`}
                  className={`relative flex items-center h-24 rounded-lg overflow-hidden border ${
                    championName ? 'border-blue-500/50 bg-blue-900/20' : 'border-slate-800 bg-slate-900/40 border-dashed'
                  } transition-all duration-300 hover:border-blue-400/80`}
                >
                  {championName && champData ? (
                    <>
                      <img src={champData.image} alt={champData.name} className="w-24 h-full object-cover" />
                      <div className="flex-1 p-3 flex flex-col justify-center bg-gradient-to-r from-blue-900/60 to-transparent">
                        <h3 className="text-lg font-bold text-blue-100 uppercase italic leading-tight">{champData.name}</h3>
                        <div className="mt-1 flex flex-col gap-1">
                          {champData.synergies?.slice(0, 2).map((syn, i) => (
                             <span key={i} className="text-[10px] text-blue-300 truncate" title={syn.reason}>
                               • {syn.name} (Syn)
                             </span>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => removeAlly(championName)} className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded text-[10px] opacity-0 hover:opacity-100 transition-opacity">✕</button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm font-bold italic">
                      Empty Slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: Champion Pool */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-[#0d0e12] border border-[#1e2328] rounded-xl p-4 shadow-2xl">
          <div className="flex justify-center mb-2">
             <div className="flex bg-[#111318] rounded-full p-1 border border-[#1e2328]">
                <button
                  onClick={() => setActiveSlot("ally")}
                  className={`px-6 py-2 rounded-full text-sm font-black uppercase transition-all duration-300 ${
                    activeSlot === "ally" ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  disabled={selectedAllies.length >= 5 && activeSlot !== "ally"}
                >
                  Pick Ally
                </button>
                <button
                  onClick={() => setActiveSlot("enemy")}
                  className={`px-6 py-2 rounded-full text-sm font-black uppercase transition-all duration-300 ${
                    activeSlot === "enemy" ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                  disabled={selectedEnemies.length >= 5 && activeSlot !== "enemy"}
                >
                  Pick Enemy
                </button>
             </div>
          </div>

          <input
            type="text"
            placeholder={`Search champion...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111318] border border-[#1e2328] rounded-xl px-4 py-3 text-[#c8a951] placeholder-[#c8a951]/40 focus:outline-none focus:border-[#c8a951] focus:ring-1 focus:ring-[#c8a951] transition-all"
          />

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredChampions.map((champ) => {
              const isSelectedEnemy = selectedEnemies.includes(champ.name);
              const isSelectedAlly = selectedAllies.includes(champ.name);
              const isDisabled = (activeSlot === "ally" && selectedAllies.length >= 5 && !isSelectedAlly) || 
                                 (activeSlot === "enemy" && selectedEnemies.length >= 5 && !isSelectedEnemy);

              return (
                <button
                  key={champ.id}
                  onClick={() => !isDisabled && toggleSelect(champ.name)}
                  title={champ.name}
                  disabled={isDisabled}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 ${
                    isSelectedEnemy ? "border-red-500 bg-red-900/30" : 
                    isSelectedAlly ? "border-blue-500 bg-blue-900/30" : 
                    isDisabled ? "border-transparent opacity-30 cursor-not-allowed" :
                    "border-slate-800 bg-[#111318] hover:border-[#c8a951] hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(200,169,81,0.2)]"
                  }`}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 mb-2 transition-all ${
                    isSelectedEnemy ? "border-red-500" : isSelectedAlly ? "border-blue-500" : "border-[#1e2328]"
                  }`}>
                    <img src={champ.image} alt={champ.name} className="w-full h-full object-cover scale-110" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider truncate w-full text-center ${
                    isSelectedEnemy ? "text-red-400" : isSelectedAlly ? "text-blue-400" : "text-[#c8a951]"
                  }`}>
                    {champ.name}
                  </span>
                  
                  {isSelectedEnemy && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(220,38,38,1)]"></div>}
                  {isSelectedAlly && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,1)]"></div>}
                </button>
              );
            })}
            {filteredChampions.length === 0 && <div className="col-span-full text-center text-sm text-[#1e2328] font-bold py-10 uppercase">No champions found</div>}
          </div>
        </div>

        {/* Right Column: Enemies (Red Side) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-red-900/40 border border-red-500/30 p-2 rounded-t-lg">
            <span className="text-xs font-bold text-red-300">{selectedEnemies.length}/5</span>
            <h2 className="text-sm font-black text-red-400 uppercase tracking-tighter">Red Team (Enemies)</h2>
          </div>
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((index) => {
              const championName = selectedEnemies[index];
              const champData = championName ? champions.find((c) => c.name === championName) : null;
              return (
                <div
                  key={`enemy-${index}`}
                  className={`relative flex items-center justify-end h-24 rounded-lg overflow-hidden border ${
                    championName ? 'border-red-500/50 bg-red-900/20' : 'border-slate-800 bg-slate-900/40 border-dashed'
                  } transition-all duration-300 hover:border-red-400/80`}
                >
                  {championName && champData ? (
                    <>
                      <div className="flex-1 p-3 flex flex-col justify-center items-end bg-gradient-to-l from-red-900/60 to-transparent">
                        <h3 className="text-lg font-bold text-red-100 uppercase italic leading-tight">{champData.name}</h3>
                        <div className="mt-1 flex flex-col gap-1 items-end">
                          {champData.counters?.slice(0, 2).map((ctr, i) => (
                             <span key={i} className="text-[10px] text-red-300 truncate text-right" title={ctr.reason}>
                               (Ctr) {ctr.name} •
                             </span>
                          ))}
                        </div>
                      </div>
                      <img src={champData.image} alt={champData.name} className="w-24 h-full object-cover" />
                      <button onClick={() => removeEnemy(championName)} className="absolute top-1 left-1 p-1 bg-red-500/80 hover:bg-red-500 rounded text-[10px] opacity-0 hover:opacity-100 transition-opacity">✕</button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm font-bold italic">
                      Empty Slot
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Suggested Picks Section - Split Redesign */}
      <section className="w-full max-w-7xl pt-8 mt-8 border-t border-[#1e2328]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Recommended Counters */}
          <div className="flex flex-col bg-[#110505] border border-red-900/50 rounded-2xl overflow-hidden">
             <div className="bg-red-900/40 p-4 border-b border-red-900/50">
               <h2 className="text-lg font-black uppercase tracking-widest text-red-400">Recommended Counters</h2>
               <p className="text-xs text-red-300">Champions that counter selected enemies</p>
             </div>
             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedCounters.map((s) => (
                   <div key={`counter-${s.name}`} className="flex flex-col p-3 rounded-xl bg-[#0a0a0c] border border-red-900/30 hover:border-red-500/50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                         {s.image && <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full border border-red-500/30" />}
                         <div>
                            <h4 className="font-bold text-red-100 uppercase tracking-wider text-sm">{s.name}</h4>
                         </div>
                      </div>
                      <div className="flex-1 mb-4">
                         <span className="text-[10px] text-red-400 uppercase font-bold block mb-1">Strong against:</span>
                         <div className="flex flex-wrap gap-1">
                            {s.targets.map(t => (
                               <span key={t} className="text-[10px] bg-red-950 text-red-200 px-2 py-0.5 rounded-full border border-red-800">
                                 {t}
                               </span>
                            ))}
                         </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedAllies.length < 5) {
                            setSelectedAllies((p) => (p.includes(s.name) ? p : [...p, s.name]));
                            setSelectedEnemies((p) => p.filter((x) => x !== s.name));
                            setActiveSlot("ally");
                          }
                        }}
                        disabled={selectedAllies.length >= 5}
                        className="w-full py-2 rounded-lg bg-blue-900/40 hover:bg-blue-600 text-blue-200 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                      >
                        Draft as Ally
                      </button>
                   </div>
                ))}
                {suggestedCounters.length === 0 && (
                   <div className="col-span-full py-8 text-center text-xs text-red-900/50 uppercase font-black">
                     Select an enemy to see counters
                   </div>
                )}
             </div>
          </div>

          {/* Right: Recommended Synergies */}
          <div className="flex flex-col bg-[#050a11] border border-blue-900/50 rounded-2xl overflow-hidden">
             <div className="bg-blue-900/40 p-4 border-b border-blue-900/50 text-right">
               <h2 className="text-lg font-black uppercase tracking-widest text-blue-400">Recommended Synergies</h2>
               <p className="text-xs text-blue-300">Champions that pair well with your allies</p>
             </div>
             <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestedSynergies.map((s) => (
                   <div key={`synergy-${s.name}`} className="flex flex-col p-3 rounded-xl bg-[#0a0a0c] border border-blue-900/30 hover:border-blue-500/50 transition-colors">
                      <div className="flex flex-row-reverse items-center gap-3 mb-3">
                         {s.image && <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full border border-blue-500/30" />}
                         <div className="text-right">
                            <h4 className="font-bold text-blue-100 uppercase tracking-wider text-sm">{s.name}</h4>
                         </div>
                      </div>
                      <div className="flex-1 mb-4 text-right">
                         <span className="text-[10px] text-blue-400 uppercase font-bold block mb-1">Synergizes with:</span>
                         <div className="flex flex-wrap gap-1 justify-end">
                            {s.targets.map(t => (
                               <span key={t} className="text-[10px] bg-blue-950 text-blue-200 px-2 py-0.5 rounded-full border border-blue-800">
                                 {t}
                               </span>
                            ))}
                         </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedAllies.length < 5) {
                            setSelectedAllies((p) => (p.includes(s.name) ? p : [...p, s.name]));
                            setSelectedEnemies((p) => p.filter((x) => x !== s.name));
                            setActiveSlot("ally");
                          }
                        }}
                        disabled={selectedAllies.length >= 5}
                        className="w-full py-2 rounded-lg bg-blue-900/40 hover:bg-blue-600 text-blue-200 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors disabled:opacity-50"
                      >
                        Draft as Ally
                      </button>
                   </div>
                ))}
                {suggestedSynergies.length === 0 && (
                   <div className="col-span-full py-8 text-center text-xs text-blue-900/50 uppercase font-black">
                     Select an ally to see synergies
                   </div>
                )}
             </div>
          </div>

        </div>
      </section>

    </main>
  );
}