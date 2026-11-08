import React, { useState } from 'react';
import { Microcontroller, PinInfo } from '../data/microcontrollers';
import { Cpu, Zap, Activity, Info, Copy, Check, Filter } from 'lucide-react';

interface PinoutVisualizerProps {
  mcu: Microcontroller;
  lang: 'urdu' | 'en';
}

export const PinoutVisualizer: React.FC<PinoutVisualizerProps> = ({ mcu, lang }) => {
  const [selectedPin, setSelectedPin] = useState<PinInfo>(mcu.pins[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const halfCount = Math.floor(mcu.pinCount / 2);
  const leftPins = mcu.pins.slice(0, halfCount);
  // For standard DIP packages, the right side pins go from pinCount down to halfCount + 1
  const rightPins = [...mcu.pins.slice(halfCount)].reverse();

  const isUrdu = lang === 'urdu';

  const getPinColor = (type: PinInfo['type']) => {
    switch (type) {
      case 'power':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
      case 'reset':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
      case 'analog':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 hover:bg-yellow-500/30';
      case 'pwm':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30';
      case 'comm':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'osc':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30';
    }
  };

  const getPinBadgeColor = (type: PinInfo['type']) => {
    switch (type) {
      case 'power':
        return 'bg-rose-500';
      case 'reset':
        return 'bg-amber-500';
      case 'analog':
        return 'bg-yellow-500';
      case 'pwm':
        return 'bg-purple-500';
      case 'comm':
        return 'bg-emerald-500';
      case 'osc':
        return 'bg-sky-500';
      default:
        return 'bg-blue-500';
    }
  };

  const isPinHighlighted = (pin: PinInfo) => {
    if (filterType === 'all') return true;
    if (filterType === 'analog' && (pin.type === 'analog' || pin.alternateFunctions.some(f => f.startsWith('AN')))) return true;
    if (filterType === 'pwm' && (pin.type === 'pwm' || pin.alternateFunctions.some(f => f.includes('CCP') || f.includes('PWM')))) return true;
    if (filterType === 'comm' && (pin.type === 'comm' || pin.alternateFunctions.some(f => ['TX', 'RX', 'SDA', 'SCL', 'SCK', 'MOSI', 'MISO', 'USB D+'].includes(f)))) return true;
    if (filterType === 'gpio' && pin.type === 'gpio') return true;
    return false;
  };

  const copyCode = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(snippet);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Filter and Overview Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            {mcu.name} — {mcu.packageType} {isUrdu ? 'Interactive Pinout' : 'Pinout Inspector'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isUrdu
              ? 'Kisi bhi pin pe click karein taake uski configuration, alternate functions aur C code register dekhein.'
              : 'Click any pin to inspect its register addressing, alternate multiplexed hardware, and C snippet.'}
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            {isUrdu ? 'Filter:' : 'Filter:'}
          </span>
          {[
            { id: 'all', label: isUrdu ? 'Tamam (All)' : 'All Pins' },
            { id: 'analog', label: 'ADC / Analog' },
            { id: 'pwm', label: 'PWM / CCP' },
            { id: 'comm', label: 'UART / I2C / SPI' },
            { id: 'gpio', label: 'GPIO' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                filterType === f.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* DIP IC Visualizer (Left Column) */}
        <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-x-auto shadow-xl">
          <div className="min-w-[500px] flex justify-center py-4">
            <div className="relative flex items-center justify-between gap-2 sm:gap-4 w-full max-w-xl">
              
              {/* Left Pin Column (1 to N/2) */}
              <div className="flex flex-col space-y-1.5 flex-1 items-end">
                {leftPins.map(pin => {
                  const isSelected = selectedPin?.number === pin.number;
                  const highlighted = isPinHighlighted(pin);
                  return (
                    <button
                      key={pin.number}
                      onClick={() => setSelectedPin(pin)}
                      className={`group flex items-center gap-2 px-2 py-1 rounded text-xs transition-all w-full justify-end border ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-500/30'
                          : highlighted
                          ? getPinColor(pin.type)
                          : 'opacity-30 border-slate-800 bg-slate-900/40 text-slate-500'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-slate-400 group-hover:text-white">
                        {pin.alternateFunctions.length > 0 && `(${pin.alternateFunctions[0]}) `}
                      </span>
                      <span className="font-semibold">{pin.label}</span>
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800/80 text-[10px] font-mono text-slate-200 font-bold border border-slate-700">
                        {pin.number}
                      </span>
                      {/* Physical Metallic Leg */}
                      <span className="w-2.5 h-1.5 bg-gradient-to-r from-slate-400 to-slate-200 rounded-sm inline-block shadow-sm"></span>
                    </button>
                  );
                })}
              </div>

              {/* Central DIP IC Body */}
              <div className="w-36 sm:w-44 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-slate-700/80 rounded-lg p-3 py-6 flex flex-col items-center justify-between text-center shadow-2xl relative select-none">
                {/* Top Notch of DIP package */}
                <div className="w-8 h-4 rounded-b-full bg-slate-950 border-b-2 border-l-2 border-r-2 border-slate-700 -mt-6 mb-3 shadow-inner"></div>

                {/* Microchip Logo & Laser Marking */}
                <div className="my-auto space-y-2 py-4">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-[9px] text-cyan-300 font-mono tracking-wider uppercase">
                    MICROCHIP
                  </div>
                  <div className="font-mono font-bold text-slate-200 text-sm tracking-wide">
                    {mcu.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {mcu.packageType} • {mcu.pinCount}-PIN
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {(mcu.defaultFoscHz / 1e6).toFixed(0)}MHz • {mcu.compiler}
                  </div>
                  <div className="pt-2 text-[9px] text-slate-400">
                    {mcu.flashKb}KB Flash | {mcu.ramBytes}B RAM
                  </div>
                </div>

                {/* Bottom marker */}
                <div className="text-[8px] font-mono text-slate-400 tracking-widest mt-3">
                  AI STUDIO BUILD
                </div>
              </div>

              {/* Right Pin Column (N down to N/2 + 1) */}
              <div className="flex flex-col space-y-1.5 flex-1 items-start">
                {rightPins.map(pin => {
                  const isSelected = selectedPin?.number === pin.number;
                  const highlighted = isPinHighlighted(pin);
                  return (
                    <button
                      key={pin.number}
                      onClick={() => setSelectedPin(pin)}
                      className={`group flex items-center gap-2 px-2 py-1 rounded text-xs transition-all w-full justify-start border ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-500/30'
                          : highlighted
                          ? getPinColor(pin.type)
                          : 'opacity-30 border-slate-800 bg-slate-900/40 text-slate-500'
                      }`}
                    >
                      {/* Physical Metallic Leg */}
                      <span className="w-2.5 h-1.5 bg-gradient-to-r from-slate-200 to-slate-400 rounded-sm inline-block shadow-sm"></span>
                      <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800/80 text-[10px] font-mono text-slate-200 font-bold border border-slate-700">
                        {pin.number}
                      </span>
                      <span className="font-semibold">{pin.label}</span>
                      <span className="font-mono text-[10px] text-slate-400 group-hover:text-white">
                        {pin.alternateFunctions.length > 0 && `(${pin.alternateFunctions[0]})`}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Color legend */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-rose-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Power / GND
            </div>
            <div className="flex items-center gap-1.5 text-blue-300">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> GPIO (I/O)
            </div>
            <div className="flex items-center gap-1.5 text-yellow-300">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> ADC Analog
            </div>
            <div className="flex items-center gap-1.5 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> PWM / CCP
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Serial / Comm
            </div>
            <div className="flex items-center gap-1.5 text-amber-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Reset / MCLR
            </div>
          </div>
        </div>

        {/* Selected Pin Details & Code Snippets (Right Column) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow ${getPinBadgeColor(selectedPin.type)}`}>
                  {selectedPin.number}
                </span>
                <div>
                  <h4 className="text-base font-bold text-white font-mono">{selectedPin.label}</h4>
                  <span className="text-xs text-cyan-400 capitalize">{selectedPin.type} Pin</span>
                </div>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Pin #{selectedPin.number} of {mcu.pinCount}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">
                  {isUrdu ? 'Tafseelat (Description):' : 'Function & Description:'}
                </span>
                <p className="text-sm text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  {selectedPin.description}
                </p>
              </div>

              {selectedPin.port && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">PORT Register:</span>
                    <span className="text-cyan-300 font-mono font-semibold">PORT{selectedPin.port[1]}</span>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[11px]">Direction (TRIS):</span>
                    <span className="text-cyan-300 font-mono font-semibold">TRIS{selectedPin.port[1]}</span>
                  </div>
                </div>
              )}

              {selectedPin.alternateFunctions.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isUrdu ? 'Doosray Hardware Functions:' : 'Multiplexed Functions:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPin.alternateFunctions.map((fn, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-mono">
                        {fn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready-to-use C Snippets for this Pin */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {isUrdu ? 'Is Pin Ka XC8 C Code Snippet:' : 'Ready C Code Snippets:'}
                </span>

                {selectedPin.port ? (
                  <div className="space-y-2">
                    {/* Output Snippet */}
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <div>
                        <span className="text-emerald-400">// Configure as Output (0):</span>
                        <div className="text-slate-200 mt-0.5">
                          TRIS{selectedPin.port[1]}bits.TRIS{selectedPin.port} = 0;
                        </div>
                        <div className="text-cyan-300">
                          {mcu.id.startsWith('pic18') ? `LAT${selectedPin.port[1]}bits.LAT${selectedPin.port} = 1;` : `PORT${selectedPin.port[1]}bits.${selectedPin.port} = 1;`}
                        </div>
                      </div>
                      <button
                        onClick={() => copyCode(`TRIS${selectedPin.port![1]}bits.TRIS${selectedPin.port} = 0;\nPORT${selectedPin.port![1]}bits.${selectedPin.port} = 1;`)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Copy"
                      >
                        {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Input Snippet */}
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
                      <div>
                        <span className="text-emerald-400">// Configure as Input (1):</span>
                        <div className="text-slate-200 mt-0.5">
                          TRIS{selectedPin.port[1]}bits.TRIS{selectedPin.port} = 1;
                        </div>
                        <div className="text-amber-300">
                          if (PORT{selectedPin.port[1]}bits.{selectedPin.port} == 1) {'{ /*...*/ }'}
                        </div>
                      </div>
                      <button
                        onClick={() => copyCode(`TRIS${selectedPin.port![1]}bits.TRIS${selectedPin.port} = 1;\nif (PORT${selectedPin.port![1]}bits.${selectedPin.port} == 1) {\n    // Code here\n}`)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Copy"
                      >
                        {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400">
                    {selectedPin.type === 'power' && (
                      <p>
                        {isUrdu
                          ? 'Yeh Power pin hai. VDD ko +5V DC supply aur VSS ko Ground (0V) se jorein. Noise filter k lye 100nF capacitor lazmi lagayein.'
                          : 'This is a dedicated power pin. Connect VDD to +5V DC and VSS to GND with a 100nF decoupling capacitor.'}
                      </p>
                    )}
                    {selectedPin.type === 'reset' && (
                      <p>
                        {isUrdu
                          ? 'MCLR Reset pin hai. Normal chalane k lye isay 10kΩ resistor k zariye +5V se pull-up karein. Push button GND k sath reset k lye use kr skty hain.'
                          : 'Master Clear (Reset) pin. Pull-up to +5V using a 10kΩ resistor for normal run mode, or connect to ground through a momentary switch for manual reset.'}
                      </p>
                    )}
                    {selectedPin.type === 'osc' && (
                      <p>
                        {isUrdu
                          ? 'Oscillator crystal pin. Yahan 4MHz, 8MHz, ya 20MHz crystal aur do 22pF ceramic capacitors GND k sath lagayein.'
                          : 'Connect crystal oscillator across OSC1/OSC2 with two 22pF load capacitors tied to Ground.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Hardware Safety Notice */}
          <div className="bg-cyan-950/40 border border-cyan-800/40 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-cyan-200 leading-relaxed">
              <strong>{isUrdu ? 'Ahem Mashwara (Pro Tip):' : 'Hardware Pro Tip:'}</strong>{' '}
              {isUrdu
                ? 'PIC microcontrollers mein agar koi pin analog (AN0-AN7) pe map ho to wo default tor pe Analog mode mein hoti hai. Digital I/O use krne k lye hamesha ADCON1 = 0x06 (ya ANSEL = 0x00) lazmi karein!'
                : 'PIC pins with analog multiplexing boot up in analog mode by default! Always configure ADCON1 = 0x06 (or clear ANSEL) to use them as standard digital inputs.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
