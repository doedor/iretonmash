/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { faces, Face } from './data/faces';

type Filter = 'boys' | 'girls' | 'both';

export default function App() {
  const [filter, setFilter] = useState<Filter>('both');
  const [elos, setElos] = useState<Record<number, number>>({});
  const [currentPair, setCurrentPair] = useState<[Face, Face] | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load ELOs from local storage
  useEffect(() => {
    const storedElos = localStorage.getItem('facemash_elos');
    if (storedElos) {
      try {
        setElos(JSON.parse(storedElos));
      } catch (e) {
        console.error('Failed to parse elos', e);
      }
    }
    pickNewPair('both');
  }, []);

  // Save to local storage whenever Elos change
  useEffect(() => {
    if (Object.keys(elos).length > 0) {
      localStorage.setItem('facemash_elos', JSON.stringify(elos));
    }
  }, [elos]);

  // Pick a new pair
  const pickNewPair = (currentFilter: Filter) => {
    let available = faces;
    if (currentFilter === 'boys') available = faces.filter(f => f.gender === 'boy');
    if (currentFilter === 'girls') available = faces.filter(f => f.gender === 'girl');

    if (available.length < 2) return;

    // Random pick
    const idx1 = Math.floor(Math.random() * available.length);
    let idx2 = Math.floor(Math.random() * available.length);
    while (idx1 === idx2) {
      idx2 = Math.floor(Math.random() * available.length);
    }

    setCurrentPair([available[idx1], available[idx2]]);
  };

  // On filter change, pick new pair
  useEffect(() => {
    pickNewPair(filter);
  }, [filter]);

  const handleChoice = (winnerId: number, loserId: number) => {
    const winnerElo = elos[winnerId] || 1200;
    const loserElo = elos[loserId] || 1200;
    
    const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));
    
    const k = 32;
    const newWinnerElo = Math.round(winnerElo + k * (1 - expectedWinner));
    const newLoserElo = Math.round(loserElo + k * (0 - expectedLoser));

    setElos(prev => ({
      ...prev,
      [winnerId]: newWinnerElo,
      [loserId]: newLoserElo
    }));

    pickNewPair(filter);
  };

  return (
    <div className="min-h-screen bg-white text-black font-mono selection:bg-black selection:text-white flex flex-col items-center p-4">
      <header className="mb-8 mt-4 md:mt-12 text-center max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black uppercase tracking-widest">
          IRETONMASH
        </h1>
      </header>

      <div className="mb-12 flex flex-wrap justify-center gap-4 border-4 border-black p-3 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        {(['girls', 'both', 'boys'] as Filter[]).map(f => (
          <button 
            key={f}
            className={`px-6 py-2 uppercase font-black text-lg border-4 border-transparent hover:border-black transition-all ${filter === f ? 'bg-black text-white border-black shadow-inner' : 'bg-white'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl">
        {currentPair ? (
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center w-full justify-center">
            <button 
              className="group relative border-4 border-black p-3 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-1 transition-all"
              onClick={() => handleChoice(currentPair[0].id, currentPair[1].id)}
            >
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 overflow-hidden border-4 border-black relative">
                <img 
                  src={currentPair[0].imageUrl} 
                  alt="Choice 1" 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
            </button>
            
            <div className="text-3xl font-black p-6 bg-white text-black border-4 border-black aspect-square flex items-center justify-center rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 shrink-0 transform -rotate-12">
              OR
            </div>

            <button 
              className="group relative border-4 border-black p-3 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-1 transition-all"
              onClick={() => handleChoice(currentPair[1].id, currentPair[0].id)}
            >
              <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 overflow-hidden border-4 border-black relative">
                <img 
                  src={currentPair[1].imageUrl} 
                  alt="Choice 2" 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200" 
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
              </div>
            </button>
          </div>
        ) : (
          <div className="text-3xl font-black uppercase tracking-widest animate-pulse border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">Loading faces...</div>
        )}
      </main>

      <footer className="mt-16 mb-12 w-full flex justify-center">
        <button 
          className="border-4 border-black bg-white px-8 py-5 font-black text-2xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
          onClick={() => setShowModal(true)}
        >
          View Leaderboard
        </button>
      </footer>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border-8 border-black p-8 md:p-12 max-w-2xl w-full shadow-[16px_16px_0px_0px_rgba(255,255,255,1)] relative">
            <button 
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center border-4 border-black font-black text-xl hover:bg-black hover:text-white transition-colors"
              onClick={() => setShowModal(false)}
            >
              X
            </button>
            <h2 className="text-5xl font-black mb-8 uppercase border-b-4 border-black pb-4 inline-block">Coming Soon</h2>
            <p className="text-2xl font-bold uppercase leading-relaxed mb-6">
              Your personal ranking algorithm is processing.
            </p>
            <ul className="text-lg font-bold uppercase space-y-4 list-disc list-inside">
              <li>See names of all faces</li>
              <li>Global Leaderboard</li>
              <li>Custom Elo Stats</li>
            </ul>
            <div className="mt-12 bg-black text-white p-4 text-center font-black uppercase tracking-widest">
              Please check back later
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

