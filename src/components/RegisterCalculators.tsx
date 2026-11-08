import React, { useState } from 'react';
import {
  calculatePicBaudRate,
  calculatePicTimerPeriod,
  calculatePicPwm,
  calculatePicEeprom,
  PicEepromFamily,
  PicEepromOperation,
  PicEepromMemoryTarget,
} from '../utils/microchipCalculators';
import { CodeBlock } from './CodeBlock';
import { Calculator, Clock, Radio, Activity, Database, Lock, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface RegisterCalculatorsProps {
  foscHz: number;
  lang: 'urdu' | 'en';
}

export const RegisterCalculators: React.FC<RegisterCalculatorsProps> = ({ foscHz, lang }) => {
  const isUrdu = lang === 'urdu';
  const [activeTab, setActiveTab] = useState<'baud' | 'timer' | 'pwm' | 'eeprom'>('baud');

  // Baud Rate State
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [brghHigh, setBrghHigh] = useState<boolean>(true);

  // Timer State
  const [timerType, setTimerType] = useState<8 | 16>(16);
  const [timerPrescaler, setTimerPrescaler] = useState<number>(16);
  const [desiredIntervalMs, setDesiredIntervalMs] = useState<number>(1);
  const [timerNum, setTimerNum] = useState<0 | 1 | 2>(1);

  // PWM State
  const [pwmFreqHz, setPwmFreqHz] = useState<number>(5000);
  const [pwmPrescaler, setPwmPrescaler] = useState<1 | 4 | 16>(16);
  const [pwmDutyPercent, setPwmDutyPercent] = useState<number>(50);

  // EEPROM State
  const [eepromFamily, setEepromFamily] = useState<PicEepromFamily>('PIC16F');
  const [eepromOperation, setEepromOperation] = useState<PicEepromOperation>('WRITE');
  const [eepromMemoryTarget, setEepromMemoryTarget] = useState<PicEepromMemoryTarget>('DATA_EEPROM');
  const [eepromAddress, setEepromAddress] = useState<number>(0x10);
  const [eepromDataByte, setEepromDataByte] = useState<number>(0xA5);
  const [eepromDisableIrq, setEepromDisableIrq] = useState<boolean>(true);
  const [eepromVerifyWrite, setEepromVerifyWrite] = useState<boolean>(true);

  // Calculate results
  const baudResult = calculatePicBaudRate(foscHz, baudRate, brghHigh);
  const timerResult = calculatePicTimerPeriod(foscHz, timerPrescaler, timerType, desiredIntervalMs, timerNum);
  const pwmResult = calculatePicPwm(foscHz, pwmFreqHz, pwmPrescaler, pwmDutyPercent);
  const eepromResult = calculatePicEeprom(foscHz, {
    mcuFamily: eepromFamily,
    operation: eepromOperation,
    memoryTarget: eepromMemoryTarget,
    address: eepromAddress,
    dataByte: eepromDataByte,
    disableInterrupts: eepromDisableIrq,
    verifyAfterWrite: eepromVerifyWrite,
  });

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('baud')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'baud'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{isUrdu ? 'UART Baud Rate / SPBRG' : 'UART Baud Rate (SPBRG)'}</span>
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'timer'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isUrdu ? 'Timer Preload & Millis' : 'Timer Preload & ISR'}</span>
        </button>
        <button
          onClick={() => setActiveTab('pwm')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'pwm'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isUrdu ? 'PWM Frequency & PR2' : 'PWM & PR2 Generator'}</span>
        </button>
        <button
          onClick={() => setActiveTab('eeprom')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'eeprom'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isUrdu ? 'EEPROM Calculator & Code Gen' : 'EEPROM Calculator & Code Generator'}</span>
        </button>
      </div>

      {/* TAB 1: UART BAUD RATE CALCULATOR */}
      {activeTab === 'baud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              {isUrdu ? 'Baud Rate Parameters' : 'UART Baud Rate Parameters'}
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'Crystal Clock Frequency (Fosc):' : 'Oscillator Frequency (Fosc):'}
              </label>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 font-mono text-sm font-semibold">
                {(foscHz / 1e6).toFixed(2)} MHz ({foscHz.toLocaleString()} Hz)
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'Desired Baud Rate (bps):' : 'Desired Baud Rate (bps):'}
              </label>
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {[2400, 4800, 9600, 19200, 57600, 115200].map(b => (
                  <button
                    key={b}
                    onClick={() => setBaudRate(b)}
                    className={`py-1.5 px-2 rounded text-xs font-mono transition-all ${
                      baudRate === b
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={baudRate}
                onChange={e => setBaudRate(Math.max(300, parseInt(e.target.value) || 9600))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-sm"
              />
            </div>

            <div className="pt-2">
              <label className="text-xs text-slate-400 block mb-2">
                {isUrdu ? 'Speed Mode (TXSTA BRGH bit):' : 'Speed Mode (TXSTA BRGH bit):'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBrghHigh(true)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    brghHigh
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">High Speed (BRGH = 1)</div>
                  <div className="text-[10px] text-slate-400">Divider: 16 (Recommended)</div>
                </button>
                <button
                  onClick={() => setBrghHigh(false)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    !brghHigh
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold">Low Speed (BRGH = 0)</div>
                  <div className="text-[10px] text-slate-400">Divider: 64</div>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs space-y-1 text-slate-300">
              <span className="text-slate-400 block font-mono text-[11px]">
                {isUrdu ? 'Microchip Formula:' : 'Hardware Formula:'}
              </span>
              <div className="font-mono text-cyan-300">
                SPBRG = (Fosc / ({brghHigh ? 16 : 64} × Desired_Baud)) - 1
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>{isUrdu ? 'Hisab Ka Nateeja (Results):' : 'Calculation Results:'}</span>
                {baudResult.isValid ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    <CheckCircle className="w-3.5 h-3.5" /> Optimal UART Setting
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Error / Out of range
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">SPBRG Register</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">{baudResult.spbrg}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">0x{baudResult.spbrg.toString(16).toUpperCase()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Actual Baud</span>
                  <span className="text-xl font-bold font-mono text-white">{Math.round(baudResult.actualBaud)}</span>
                  <span className="text-[10px] text-slate-500 block">bps</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Baud Error</span>
                  <span className={`text-xl font-bold font-mono ${Math.abs(baudResult.errorPercent) <= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {baudResult.errorPercent >= 0 ? '+' : ''}{baudResult.errorPercent}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Tolerance &le; 3%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Bit Time</span>
                  <span className="text-xl font-bold font-mono text-purple-300">
                    {(1e6 / baudResult.actualBaud).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">microseconds</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-400 block mb-1">
                  {isUrdu ? 'XC8 Initialization Code:' : 'XC8 Initialization Code:'}
                </span>
                <CodeBlock code={baudResult.registerCode} filename="uart_init.c" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIMER PRELOAD CALCULATOR */}
      {activeTab === 'timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              {isUrdu ? 'Timer Parameters' : 'Timer Calculation Parameters'}
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'Timer Select karein:' : 'Select Timer:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { num: 0 as const, bits: 8 as const, label: 'Timer0 (8-bit)' },
                  { num: 1 as const, bits: 16 as const, label: 'Timer1 (16-bit)' },
                  { num: 2 as const, bits: 8 as const, label: 'Timer2 (8-bit)' },
                ].map(t => (
                  <button
                    key={t.num}
                    onClick={() => {
                      setTimerNum(t.num);
                      setTimerType(t.bits);
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                      timerNum === t.num
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'Prescaler Ratio:' : 'Prescaler Ratio:'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8, 16, 32, 64, 128, 256].map(p => (
                  <button
                    key={p}
                    onClick={() => setTimerPrescaler(p)}
                    className={`py-1.5 text-xs font-mono rounded transition-all ${
                      timerPrescaler === p
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    1:{p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'Matlooba Interval (Milliseconds):' : 'Desired Interval (ms):'}
              </label>
              <div className="flex gap-2 mb-2">
                {[0.1, 0.5, 1, 5, 10, 50, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setDesiredIntervalMs(val)}
                    className={`px-2 py-1 text-xs rounded font-mono ${
                      desiredIntervalMs === val
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {val}ms
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.1"
                min="0.01"
                value={desiredIntervalMs}
                onChange={e => setDesiredIntervalMs(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-sm"
              />
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs space-y-1 text-slate-300">
              <span className="text-slate-400 block font-mono text-[11px]">
                {isUrdu ? 'Architecture Note:' : 'PIC Architecture Note:'}
              </span>
              <p className="text-slate-400">
                {isUrdu
                  ? 'PIC microcontrollers mein Fcy = Fosc / 4 hota hai. 20MHz crystal pe instruction clock 5 MHz (0.2μs per instruction) hoti hai.'
                  : 'PIC instruction cycle is Fcy = Fosc / 4. A 20MHz crystal yields a 5MHz instruction cycle (0.2μs per tick).'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>{isUrdu ? 'Timer Results & Preload:' : 'Timer Preload Results:'}</span>
                {timerResult.isValid ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid Preload Value
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    <AlertTriangle className="w-3.5 h-3.5" /> Timer Overflows! Increase Prescaler or switch to 16-bit
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Preload (Decimal)</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">{timerResult.preloadValue}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    0x{timerResult.preloadValue.toString(16).toUpperCase()}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Actual Interval</span>
                  <span className="text-xl font-bold font-mono text-white">{timerResult.actualIntervalMs}</span>
                  <span className="text-[10px] text-slate-500 block">ms</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Frequency</span>
                  <span className="text-xl font-bold font-mono text-purple-300">{timerResult.frequencyHz}</span>
                  <span className="text-[10px] text-slate-500 block">Hz (overflows/sec)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Tick Time</span>
                  <span className="text-xl font-bold font-mono text-amber-300">
                    {((1 / timerResult.fcy) * timerPrescaler * 1e6).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">microseconds</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-400 block mb-1">
                  {isUrdu ? 'Timer Interrupt Service Routine (ISR) Code:' : 'Timer ISR Implementation:'}
                </span>
                <CodeBlock code={timerResult.isrCode} filename="timer_isr.c" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PWM & PR2 CALCULATOR WITH OSCILLOSCOPE */}
      {activeTab === 'pwm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              {isUrdu ? 'PWM Parameters' : 'PWM & PR2 Parameters'}
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'PWM Target Frequency:' : 'PWM Target Frequency (Hz):'}
              </label>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[1000, 2500, 5000, 10000, 20000, 38000].map(f => (
                  <button
                    key={f}
                    onClick={() => setPwmFreqHz(f)}
                    className={`py-1 text-xs font-mono rounded ${
                      pwmFreqHz === f
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {f >= 1000 ? `${f / 1000}kHz` : `${f}Hz`}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="100"
                max="500000"
                value={pwmFreqHz}
                onChange={e => setPwmFreqHz(Math.max(100, parseInt(e.target.value) || 5000))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {isUrdu ? 'Timer2 Prescaler:' : 'Timer2 Prescaler:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([1, 4, 16] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPwmPrescaler(p)}
                    className={`py-2 text-xs font-mono rounded-lg border ${
                      pwmPrescaler === p
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    1:{p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-400">
                  {isUrdu ? 'Duty Cycle Percentage:' : 'Duty Cycle:'}
                </label>
                <span className="text-cyan-400 font-mono font-bold text-sm">{pwmDutyPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={pwmDutyPercent}
                onChange={e => setPwmDutyPercent(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0% (OFF)</span>
                <span>50% (Square)</span>
                <span>100% (Full ON)</span>
              </div>
            </div>

            {/* Simulated Live PWM Oscilloscope Waveform */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  OSCILLOSCOPE PROBE (CCP1 Pin)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(pwmResult.actualFreqHz / 1000).toFixed(2)} kHz
                </span>
              </div>
              
              <div className="h-20 bg-slate-900/90 rounded border border-slate-800 relative overflow-hidden flex items-center p-2">
                {/* Oscilloscope Grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
                
                {/* SVG Square Wave */}
                <svg className="w-full h-16 relative z-10" viewBox="0 0 300 60" preserveAspectRatio="none">
                  {/* Generate 3 cycles of PWM */}
                  <path
                    d={`
                      M 0 50
                      L ${(100 * pwmDutyPercent) / 100} 50
                      L ${(100 * pwmDutyPercent) / 100} 10
                      L 100 10
                      L 100 50
                      L ${100 + (100 * pwmDutyPercent) / 100} 50
                      L ${100 + (100 * pwmDutyPercent) / 100} 10
                      L 200 10
                      L 200 50
                      L ${200 + (100 * pwmDutyPercent) / 100} 50
                      L ${200 + (100 * pwmDutyPercent) / 100} 10
                      L 300 10
                    `}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>{isUrdu ? 'PWM Register Settings:' : 'PWM Register Results:'}</span>
                {pwmResult.isValid ? (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid Period PR2 &le; 255
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
                    <AlertTriangle className="w-3.5 h-3.5" /> PR2 Out of bounds! Increase Prescaler or decrease Fosc
                  </span>
                )}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">PR2 Period Register</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">{pwmResult.pr2}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">0x{pwmResult.pr2.toString(16).toUpperCase()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Actual Frequency</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {(pwmResult.actualFreqHz / 1000).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">kHz</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Max Resolution</span>
                  <span className="text-xl font-bold font-mono text-purple-300">
                    {pwmResult.maxResolutionBits}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Bits (up to 1024)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Duty (10-bit val)</span>
                  <span className="text-xl font-bold font-mono text-amber-300">
                    {pwmResult.duty10BitAt50Percent}
                  </span>
                  <span className="text-[10px] text-slate-500 block">CCPR1L + CCP1CON</span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-400 block mb-1">
                  {isUrdu ? 'Hardware PWM Initialization Code (XC8):' : 'Complete Hardware PWM Init Code:'}
                </span>
                <CodeBlock code={pwmResult.initCode} filename="pwm_init.c" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EEPROM CALCULATOR & CODE GENERATOR (EECON1 / EECON2) */}
      {activeTab === 'eeprom' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: EEPROM Configuration Controls */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              {isUrdu ? 'EEPROM (EECON1 / EECON2) Parameters' : 'EEPROM Register & Unlock Parameters'}
            </h3>

            {/* Target MCU Family */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                {isUrdu ? 'Microchip PIC Family:' : 'Target PIC Architecture:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'PIC16F' as const, title: 'PIC16F877A / 628A', sub: 'Mid-Range (EEPGD, WREN, WR, RD)' },
                    { id: 'PIC18F' as const, title: 'PIC18F452 / 4550', sub: 'Enhanced (+CFGS, +FREE bits)' },
                  ]
                ).map(fam => (
                  <button
                    key={fam.id}
                    onClick={() => setEepromFamily(fam.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all ${
                      eepromFamily === fam.id
                        ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">{fam.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{fam.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Operation Mode */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                {isUrdu ? 'EEPROM Operation Mode:' : 'EEPROM Operation Mode:'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'WRITE' as const, label: 'Write Byte', desc: 'WREN=1, WR=1' },
                    { id: 'READ' as const, label: 'Read Byte', desc: 'RD=1 (1 Tcy)' },
                    { id: 'READ_MODIFY_WRITE' as const, label: 'Wear-Safe Write', desc: 'Skip if Equal' },
                  ]
                ).map(op => (
                  <button
                    key={op.id}
                    onClick={() => setEepromOperation(op.id)}
                    className={`py-2 px-2 rounded-lg text-center border transition-all ${
                      eepromOperation === op.id
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs">{op.label}</div>
                    <div className={`text-[10px] font-mono ${eepromOperation === op.id ? 'text-slate-900' : 'text-slate-500'}`}>
                      {op.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Memory Target (EEPGD Bit 7) */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">
                {isUrdu ? 'Memory Target (EECON1.EEPGD Bit 7):' : 'Memory Target (EECON1.EEPGD Bit 7):'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEepromMemoryTarget('DATA_EEPROM')}
                  className={`py-2 px-3 rounded-lg text-xs border transition-all text-left ${
                    eepromMemoryTarget === 'DATA_EEPROM'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold font-mono">EEPGD = 0 (Data EEPROM)</div>
                  <div className="text-[10px] text-slate-400">256 Bytes Non-Volatile Data</div>
                </button>
                <button
                  onClick={() => setEepromMemoryTarget('FLASH_PROGRAM')}
                  className={`py-2 px-3 rounded-lg text-xs border transition-all text-left ${
                    eepromMemoryTarget === 'FLASH_PROGRAM'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold font-mono">EEPGD = 1 (Program Flash)</div>
                  <div className="text-[10px] text-slate-400">Flash Program Memory Access</div>
                </button>
              </div>
            </div>

            {/* EEADR & EEDATA Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 font-semibold">EEADR (Address)</label>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{eepromResult.addressHex}</span>
                </div>
                <div className="flex gap-1">
                  {[0x00, 0x10, 0x20, 0x7F, 0xFF].map(addr => (
                    <button
                      key={addr}
                      onClick={() => setEepromAddress(addr)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono ${
                        eepromAddress === addr
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      0x{addr.toString(16).toUpperCase().padStart(2, '0')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={eepromAddress}
                  onChange={e => setEepromAddress(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
                  aria-label="EEADR Address Decimal"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-slate-300 font-semibold">EEDATA (Byte)</label>
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    {eepromResult.dataHex} ({eepromResult.dataAscii})
                  </span>
                </div>
                <div className="flex gap-1">
                  {[0x00, 0x41, 0x55, 0xA5, 0xFF].map(val => (
                    <button
                      key={val}
                      onClick={() => setEepromDataByte(val)}
                      className={`flex-1 py-1 rounded text-[10px] font-mono ${
                        eepromDataByte === val
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      0x{val.toString(16).toUpperCase().padStart(2, '0')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={eepromDataByte}
                  onChange={e => setEepromDataByte(Math.max(0, Math.min(255, parseInt(e.target.value) || 0)))}
                  aria-label="EEDATA Byte Decimal"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Hardware Protection Options */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      {isUrdu ? 'Disable Global Interrupts (GIE = 0)' : 'Atomic Unlock (Disable GIE during 0x55/0xAA)'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isUrdu
                        ? 'ISR agar 0x55 aur 0xAA ke darmiyan aa jaye to write fail ho jati hai'
                        : 'Prevents ISR from breaking the 4-cycle 0x55 -> 0xAA -> WR=1 sequence'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={eepromDisableIrq}
                  onChange={e => setEepromDisableIrq(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">
                      {isUrdu ? 'Post-Write Readback & WRERR Check' : 'Verify Data & Check EECON1.WRERR Flag'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isUrdu
                        ? 'Write mukammal hone ke baad EEDATA read-back verify karein'
                        : 'Confirms byte integrity and checks for Brown-Out/MCLR write abort'}
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={eepromVerifyWrite}
                  onChange={e => setEepromVerifyWrite(e.target.checked)}
                  className="accent-cyan-400 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Right Column: Calculated EECON1/EECON2 Values, Bitfield Map & XC8 Code */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>{isUrdu ? 'Calculated EEPROM Registers:' : 'Calculated EECON1 / EECON2 Register Values:'}</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/40">
                  <CheckCircle className="w-3.5 h-3.5" /> {eepromFamily} Compliant Sequence
                </span>
              </h4>

              {/* 4 Key Register Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">EECON1 (Pre-Trigger)</span>
                  <span className="text-xl font-bold font-mono text-cyan-300">{eepromResult.eecon1PreTriggerHex}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">{eepromResult.eecon1PreTriggerBin}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">EECON1 (Trigger)</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{eepromResult.eecon1TriggerHex}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">{eepromResult.eecon1TriggerBin}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">EECON2 Unlock</span>
                  <span className="text-lg font-bold font-mono text-amber-300">
                    {eepromOperation === 'READ' ? 'None' : '0x55 → 0xAA'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {eepromOperation === 'READ' ? 'Read Immediate' : 'Hardware Key'}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Cycle Duration</span>
                  <span className="text-xl font-bold font-mono text-purple-300">
                    {eepromResult.estimatedCycleTimeUs >= 1000
                      ? `${(eepromResult.estimatedCycleTimeUs / 1000).toFixed(2)} ms`
                      : `${eepromResult.estimatedCycleTimeUs} μs`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {eepromOperation === 'READ' ? '4 Tcy (@ Fosc)' : 'Self-Timed RC'}
                  </span>
                </div>
              </div>

              {/* Interactive 8-bit EECON1 Register Bitfield Breakdown */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    EECON1 REGISTER BITFIELD MAP (TRIGGER STATE = {eepromResult.eecon1TriggerHex})
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400">
                    Decimal: {eepromResult.eecon1Trigger}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {eepromResult.eecon1Bits.map(bitInfo => (
                    <div
                      key={bitInfo.bit}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        bitInfo.value === 1
                          ? 'bg-cyan-950/90 border-cyan-500/80 text-cyan-200'
                          : 'bg-slate-900/90 border-slate-800 text-slate-400'
                      }`}
                      title={bitInfo.description}
                    >
                      <div className="text-[10px] font-mono text-slate-500">Bit {bitInfo.bit}</div>
                      <div className="text-xs font-bold font-mono mt-0.5">{bitInfo.name}</div>
                      <div
                        className={`text-base font-extrabold font-mono mt-1 ${
                          bitInfo.value === 1 ? 'text-cyan-300' : 'text-slate-500'
                        }`}
                      >
                        {bitInfo.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Bit Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                  {eepromResult.eecon1Bits
                    .filter(b => b.name !== '—')
                    .map(b => (
                      <div key={b.bit} className="flex items-center gap-2 text-slate-400 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            b.value === 1 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {b.name}={b.value}
                        </span>
                        <span className="truncate font-sans text-slate-400">{b.description}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* EECON2 Hardware Unlock Sequence Pipeline */}
              {eepromOperation !== 'READ' && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5">
                  <div className="text-xs font-semibold text-amber-300 mb-2 flex items-center justify-between">
                    <span>EECON2 CRITICAL HARDWARE UNLOCK SEQUENCE</span>
                    <span className="font-mono text-[10px] text-amber-400/90">Must execute in consecutive Tcy</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono text-xs">
                    <div className="bg-slate-950/90 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">1. Setup</span>
                      <span className="text-cyan-300 font-bold">EECON1 = {eepromResult.eecon1PreTriggerHex}</span>
                    </div>
                    <div className="bg-slate-950/90 p-2 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">2. Atomic</span>
                      <span className="text-rose-300 font-bold">{eepromDisableIrq ? 'GIE = 0' : 'GIE unchanged'}</span>
                    </div>
                    <div className="bg-slate-950/90 p-2 rounded border border-amber-500/40">
                      <span className="text-[10px] text-amber-400/80 block">3. Key 1</span>
                      <span className="text-amber-300 font-bold">EECON2 = 0x55</span>
                    </div>
                    <div className="bg-slate-950/90 p-2 rounded border border-amber-500/40">
                      <span className="text-[10px] text-amber-400/80 block">4. Key 2</span>
                      <span className="text-amber-300 font-bold">EECON2 = 0xAA</span>
                    </div>
                    <div className="bg-slate-950/90 p-2 rounded border border-emerald-500/40 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-400/80 block">5. Trigger</span>
                      <span className="text-emerald-300 font-bold">WR = 1 ({eepromResult.eecon1TriggerHex})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Generated MPLAB XC8 Code */}
              <div className="mt-3">
                <span className="text-xs text-slate-400 block mb-1">
                  {isUrdu
                    ? 'MPLAB XC8 EEPROM Read/Write Driver Code:'
                    : 'Generated MPLAB XC8 EEPROM Driver & Usage Code:'}
                </span>
                <CodeBlock code={eepromResult.xc8Code} filename="eeprom_driver.c" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

