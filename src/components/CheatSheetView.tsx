import React from 'react';
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Zap,
  HelpCircle,
  FileCode,
  ShieldAlert,
  Flame
} from 'lucide-react';

interface CheatSheetViewProps {
  lang: 'urdu' | 'en';
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({ lang }) => {
  const isUrdu = lang === 'urdu';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          {isUrdu
            ? 'Microchip Registers & Hardware Cheat Sheet (Urdu / English)'
            : 'Microchip Registers & Hardware Engineering Guide'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isUrdu
            ? 'PIC microcontrollers k registers, configuration bits aur circuit design k ahem tareen osool.'
            : 'Essential reference guide for registers, configuration fuse bits, and common hardware pitfalls.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* CARD 1: TRIS vs PORT vs LAT */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            {isUrdu ? 'TRIS vs PORT vs LAT Ka Farq' : 'TRIS vs PORT vs LAT Explained'}
          </h3>

          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-white block font-mono text-sm mb-1 text-cyan-400">
                1. TRIS Register (Tri-state Direction)
              </strong>
              <p>
                {isUrdu ? (
                  <>
                    TRIS register pin ki simat (Direction) tay krta hai:<br />
                    • <code className="text-amber-300 font-mono font-bold">1 = Input</code> (Yad rakhne ka tareeqa: 1 dekhne mein <strong>I</strong>nput jesa hai).<br />
                    • <code className="text-emerald-300 font-mono font-bold">0 = Output</code> (Yad rakhne ka tareeqa: 0 dekhne mein <strong>O</strong>utput jesa hai).
                  </>
                ) : (
                  <>
                    Controls the pin data direction:<br />
                    • <code className="text-amber-300 font-mono font-bold">1 = Input</code> (Mnemonic: 1 resembles <strong>I</strong> for Input).<br />
                    • <code className="text-emerald-300 font-mono font-bold">0 = Output</code> (Mnemonic: 0 resembles <strong>O</strong> for Output).
                  </>
                )}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-white block font-mono text-sm mb-1 text-purple-400">
                2. PORT Register
              </strong>
              <p>
                {isUrdu
                  ? 'Pins par mojood haqeeqi physical voltage read krne k lye PORT istemal hota hai (e.g. if (PORTBbits.RB0 == 1)).'
                  : 'Used to read the actual physical voltage level currently present on the pins (e.g. if (PORTBbits.RB0 == 1)).'}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <strong className="text-white block font-mono text-sm mb-1 text-emerald-400">
                3. LAT Register (Output Data Latch - PIC18/24/dsPIC)
              </strong>
              <p>
                {isUrdu
                  ? 'PIC18 mein outputs likhne k lye hamesha LAT register use karein (e.g. LATBbits.LATB0 = 1). Yeh Read-Modify-Write (RMW) bug se mehfooz rakhta hai.'
                  : 'In PIC18 and above, always write to LAT registers (LATBbits.LATB0 = 1) to completely eliminate the Read-Modify-Write (RMW) hardware glitch during rapid pin toggles.'}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Configuration Bits (#pragma config) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            {isUrdu ? 'Configuration Bits (#pragma config) Ka Matlab' : 'Configuration Fuses Breakdown'}
          </h3>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="font-mono text-cyan-300 font-semibold block">#pragma config FOSC = HS</span>
              <span className="text-slate-400 text-[11px]">
                {isUrdu
                  ? 'High-Speed external crystal oscillator (4MHz se 20MHz crystal k lye HS select karein).'
                  : 'High-Speed external crystal oscillator mode (required for 4MHz to 20MHz crystals).'}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="font-mono text-cyan-300 font-semibold block">#pragma config WDTE = OFF</span>
              <span className="text-slate-400 text-[11px]">
                {isUrdu
                  ? 'Watchdog Timer OFF rakhein. Agar ON ho to PIC har 18ms baad baghair kisi wajah k khud ba khud restart hoti rahegi jab tak CLRWDT() na call karein.'
                  : 'Watchdog Timer OFF. If enabled, the MCU will reset automatically every ~18ms unless continually serviced with CLRWDT().'}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="font-mono text-cyan-300 font-semibold block">#pragma config PWRTE = ON</span>
              <span className="text-slate-400 text-[11px]">
                {isUrdu
                  ? 'Power-up Timer ON. Power switch on hone k baad PIC ko 72ms tak hold rakhta hai taake voltage 5V pe mustahkam (stable) ho jaye.'
                  : 'Power-up Timer ON. Delays MCU startup for 72ms upon power-up to ensure VDD reaches steady state.'}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="font-mono text-cyan-300 font-semibold block">#pragma config LVP = OFF</span>
              <span className="text-slate-400 text-[11px]">
                {isUrdu
                  ? 'Low-Voltage ICSP OFF. Isay OFF rakhna zaroori hai warna RB3 pin aam digital I/O k tor pe kaam nahi kregi.'
                  : 'Low-Voltage Programming OFF. Essential to turn OFF so RB3 pin can be used as regular digital I/O.'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 3: Common Mistakes & Hardware Troubleshooting */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            {isUrdu ? 'Hardware Ki Aam Ghaltiyan Aur Hal' : 'Common Hardware Traps & Fixes'}
          </h3>

          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="border-l-2 border-rose-500 pl-3">
              <strong className="text-white block font-semibold">
                {isUrdu ? '1. IC Flash Ho Gayi Magar Run Nahi Kr Rahi?' : '1. Code flashed but chip not running?'}
              </strong>
              <p className="text-slate-400 mt-0.5">
                {isUrdu
                  ? 'PIC Pin 1 (MCLR) ko 10kΩ resistor se +5V (VDD) pull-up lazmi karein! Agar MCLR open ho to chip reset halat mein phansi rehti hai.'
                  : 'Ensure Pin 1 (MCLR) is pulled up to +5V through a 10kΩ resistor. Floating MCLR causes endless reset loops.'}
              </p>
            </div>

            <div className="border-l-2 border-amber-500 pl-3">
              <strong className="text-white block font-semibold">
                {isUrdu ? '2. Crystal Oscillator Start Nahi Ho Raha?' : '2. Crystal oscillator not oscillating?'}
              </strong>
              <p className="text-slate-400 mt-0.5">
                {isUrdu
                  ? 'Crystal k dono terminals (OSC1 aur OSC2) se GND tak do 22pF ceramic disc capacitors lagana zaroori hai.'
                  : 'Always connect two 22pF ceramic capacitors from OSC1 and OSC2 to Ground.'}
              </p>
            </div>

            <div className="border-l-2 border-cyan-500 pl-3">
              <strong className="text-white block font-semibold">
                {isUrdu ? '3. Digital Pin Hamesha 0 Ya Ghalat Parh Rahi Hai?' : '3. Digital pin reads 0 or behaves erratic?'}
              </strong>
              <p className="text-slate-400 mt-0.5">
                {isUrdu
                  ? 'PIC ki analog pins (PORTA/PORTE) default analog mode mein hoti hain. Code k shuru mein ADCON1 = 0x06; (PIC16) ya ADCON1 = 0x0F; (PIC18) ya ANSEL = 0x00; likhna na bhoolein!'
                  : 'Pins multiplexed with ADC default to analog mode on power-up. Explicitly configure ADCON1 = 0x06 (PIC16) or ADCON1 = 0x0F (PIC18) to enable digital inputs.'}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 4: MPLAB X & PICkit Flashing Tutorial */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            {isUrdu ? 'MPLAB X & PICkit 3/4 Flashing Guide' : 'MPLAB X & PICkit Quickstart'}
          </h3>

          <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              <span className="font-semibold text-white">New Project:</span> File &gt; New Project &gt; Microchip Embedded &gt; Standalone Project.
            </li>
            <li>
              <span className="font-semibold text-white">Select Device:</span> Device dropdown mein apna MCU chunein (e.g. PIC16F877A).
            </li>
            <li>
              <span className="font-semibold text-white">Select Tool:</span> PICkit 3, PICkit 4, SNAP, ya Simulator select karein.
            </li>
            <li>
              <span className="font-semibold text-white">Select Compiler:</span> XC8 (v2.xx or higher).
            </li>
            <li>
              <span className="font-semibold text-white">Add Source File:</span> Source Files &gt; New &gt; main.c aur hamara generated code paste karein.
            </li>
            <li>
              <span className="font-semibold text-white">ICSP Connections:</span>
              <div className="ml-4 mt-1 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-0.5">
                <div>Pin 1: MCLR / VPP</div>
                <div>Pin 2: VDD (+5V)</div>
                <div>Pin 3: VSS (GND)</div>
                <div>Pin 4: PGD (Data - RB7)</div>
                <div>Pin 5: PGC (Clock - RB6)</div>
              </div>
            </li>
            <li>
              <span className="font-semibold text-white">Program Chip:</span> Click "Make and Program Device" button (Green downward arrow).
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
