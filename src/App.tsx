/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { PinoutVisualizer } from './components/PinoutVisualizer';
import { RegisterCalculators } from './components/RegisterCalculators';
import { CodeGeneratorView } from './components/CodeGeneratorView';
import { CustomAssistantView } from './components/CustomAssistantView';
import { CheatSheetView } from './components/CheatSheetView';
import { PrimevoltVerifierView } from './components/PrimevoltVerifierView';
import { MICROCONTROLLERS, Microcontroller } from './data/microcontrollers';
import {
  Activity,
  Code,
  Cpu,
  Calculator,
  Sparkles,
  BookOpen,
  CheckCircle,
  Zap,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Terminal
} from 'lucide-react';

export default function App() {
  const [currentMcu, setCurrentMcu] = useState<Microcontroller>(MICROCONTROLLERS[0]); // PIC16F877A default
  const [foscHz, setFoscHz] = useState<number>(MICROCONTROLLERS[0].defaultFoscHz);
  const [lang, setLang] = useState<'urdu' | 'en'>('urdu');
  const [activeTab, setActiveTab] = useState<
    'primevolt' | 'code' | 'pinout' | 'calculators' | 'custom' | 'cheatsheet'
  >('primevolt');

  const isUrdu = lang === 'urdu';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Navbar */}
      <Navbar
        currentMcu={currentMcu}
        onSelectMcu={m => setCurrentMcu(m)}
        foscHz={foscHz}
        onChangeFosc={f => setFoscHz(f)}
        lang={lang}
        onToggleLang={l => setLang(l)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Primary View Navigation Tabs */}
        <nav className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-2" aria-label="Microchip Studio Tabs">
          <button
            onClick={() => setActiveTab('primevolt')}
            data-testid="tab-primevolt"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'primevolt'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                : 'bg-slate-900/80 text-emerald-300 border border-emerald-500/30 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>
              {isUrdu
                ? '🔬 PrimeVolt dsPIC30F2010 Unipolar Lab (HEX + 1602 LCD + Scope)'
                : '🔬 PrimeVolt dsPIC30F2010 Unipolar Lab (HEX + 1602 LCD + Scope)'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>{isUrdu ? '⚡ Firmware Library (Code)' : '⚡ Firmware Library'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pinout')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'pinout'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{isUrdu ? '🔬 Interactive Pinout (IC Pins)' : '🔬 Interactive Pinout'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calculators')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'calculators'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>{isUrdu ? '🧮 Hardware Calculators (Registers)' : '🧮 Register Calculators'}</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'custom'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isUrdu ? '🤖 Custom Code Generator (Urdu/Eng)' : '🤖 Custom Code Generator'}</span>
          </button>

          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === 'cheatsheet'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isUrdu ? '📚 Registers & MPLAB X Guide' : '📚 Architecture & Registers Guide'}</span>
          </button>
        </nav>

        {/* Tab Content Display */}
        <section className="pt-2">
          {activeTab === 'primevolt' && (
            <PrimevoltVerifierView lang={lang} />
          )}

          {activeTab === 'code' && (
            <CodeGeneratorView mcu={currentMcu} foscHz={foscHz} lang={lang} />
          )}

          {activeTab === 'pinout' && (
            <PinoutVisualizer mcu={currentMcu} lang={lang} />
          )}

          {activeTab === 'calculators' && (
            <RegisterCalculators foscHz={foscHz} lang={lang} />
          )}

          {activeTab === 'custom' && (
            <CustomAssistantView mcu={currentMcu} foscHz={foscHz} lang={lang} />
          )}

          {activeTab === 'cheatsheet' && (
            <CheatSheetView lang={lang} />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Microchip PIC & AVR Embedded Firmware Studio</span>
        </div>
        <p>
          {isUrdu
            ? 'MPLAB X IDE, XC8, XC16, XC32, Microchip Studio, aur PICkit 3 / 4 ICSP programming supported.'
            : 'Supports Microchip MPLAB X IDE, XC8/XC16/XC32 Compilers, Microchip Studio, and PICkit 3/4 hardware programmers.'}
        </p>
      </footer>
    </div>
  );
}
