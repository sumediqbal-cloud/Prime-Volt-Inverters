import React from 'react';
import { Microcontroller, MICROCONTROLLERS } from '../data/microcontrollers';
import { Cpu, Zap, Globe, Clock, Layers } from 'lucide-react';

interface NavbarProps {
  currentMcu: Microcontroller;
  onSelectMcu: (mcu: Microcontroller) => void;
  foscHz: number;
  onChangeFosc: (fosc: number) => void;
  lang: 'urdu' | 'en';
  onToggleLang: (lang: 'urdu' | 'en') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMcu,
  onSelectMcu,
  foscHz,
  onChangeFosc,
  lang,
  onToggleLang,
}) => {
  const isUrdu = lang === 'urdu';

  const frequencies = [
    { label: '4 MHz (Internal/XT)', value: 4000000 },
    { label: '8 MHz (Medium)', value: 8000000 },
    { label: '16 MHz (Standard/AVR)', value: 16000000 },
    { label: '20 MHz (High-Speed HS)', value: 20000000 },
    { label: '48 MHz (USB PLL)', value: 48000000 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Microchip PIC & AVR Studio
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono font-semibold">
                  XC8 / XC16
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isUrdu
                  ? 'Microchip ICs k lye Mukammal Coding, Pinouts aur Register Calculator'
                  : 'Firmware Code Generator, Register Calculator & Pinout Visualizer'}
              </p>
            </div>
          </div>

          {/* Controls Bar: MCU, Clock, Language */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* MCU Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <label htmlFor="mcu-select" className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">
                IC:
              </label>
              <select
                id="mcu-select"
                value={currentMcu.id}
                onChange={e => {
                  const found = MICROCONTROLLERS.find(m => m.id === e.target.value);
                  if (found) {
                    onSelectMcu(found);
                    onChangeFosc(found.defaultFoscHz);
                  }
                }}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              >
                {MICROCONTROLLERS.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                    {m.name} ({m.packageType})
                  </option>
                ))}
              </select>
            </div>

            {/* Crystal Fosc Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <label htmlFor="fosc-select" className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">
                Fosc:
              </label>
              <select
                id="fosc-select"
                value={foscHz}
                onChange={e => onChangeFosc(parseInt(e.target.value))}
                className="bg-transparent text-xs font-mono font-medium text-cyan-300 focus:outline-none cursor-pointer"
              >
                {frequencies.map(f => (
                  <option key={f.value} value={f.value} className="bg-slate-900 text-slate-100 font-sans">
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle: Urdu / English */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shadow-sm">
              <button
                onClick={() => onToggleLang('urdu')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  lang === 'urdu'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇵🇰 Roman Urdu</span>
              </button>
              <button
                onClick={() => onToggleLang('en')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  lang === 'en'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
