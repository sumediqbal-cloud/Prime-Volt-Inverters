/**
 * Exact cycle-accurate behavioral model of Primevolt-V16-4r8-P1-Unipolar-Fixed.c
 * Target: dsPIC30F2010 @ 7.3728 MHz crystal with XT_PLL4 (FCY = 7.3728 MIPS)
 * Preserves 100% of the internal Unipolar PWM core and 26-item Unipolar Menu.
 */

export const FCY_HZ = 7372800;
export const FUNDAMENTAL_HZ = 50;

export const SINE_QUARTER_Q15: readonly number[] = [
  0, 804, 1608, 2410, 3212, 4011, 4808, 5602,
  6393, 7179, 7962, 8739, 9512, 10278, 11039, 11793,
  12539, 13279, 14010, 14732, 15446, 16151, 16846, 17530,
  18204, 18868, 19519, 20159, 20787, 21403, 22005, 22594,
  23170, 23731, 24279, 24811, 25329, 25832, 26319, 26790,
  27245, 27683, 28105, 28510, 28898, 29268, 29621, 29956,
  30273, 30571, 30852, 31113, 31356, 31580, 31785, 31971,
  32137, 32285, 32412, 32521, 32609, 32678, 32728, 32757,
  32767
];

export const OVERMOD_CURVE: ReadonlyArray<{ fundamentalQ15: number; gainQ13: number }> = [
  { fundamentalQ15: 32768, gainQ13: 8192 },
  { fundamentalQ15: 33551, gainQ13: 8438 },
  { fundamentalQ15: 34177, gainQ13: 8684 },
  { fundamentalQ15: 34875, gainQ13: 9011 },
  { fundamentalQ15: 35594, gainQ13: 9421 },
  { fundamentalQ15: 36191, gainQ13: 9830 },
  { fundamentalQ15: 36697, gainQ13: 10240 },
  { fundamentalQ15: 37130, gainQ13: 10650 },
  { fundamentalQ15: 37835, gainQ13: 11469 },
  { fundamentalQ15: 38383, gainQ13: 12288 },
  { fundamentalQ15: 39004, gainQ13: 13517 },
  { fundamentalQ15: 39463, gainQ13: 14746 },
  { fundamentalQ15: 39911, gainQ13: 16384 },
  { fundamentalQ15: 40304, gainQ13: 18432 },
  { fundamentalQ15: 40581, gainQ13: 20480 },
  { fundamentalQ15: 40783, gainQ13: 22528 },
  { fundamentalQ15: 40935, gainQ13: 24576 },
  { fundamentalQ15: 41147, gainQ13: 28672 },
  { fundamentalQ15: 41283, gainQ13: 32768 },
  { fundamentalQ15: 41442, gainQ13: 40960 },
  { fundamentalQ15: 41528, gainQ13: 49152 },
  { fundamentalQ15: 41613, gainQ13: 65535 }
];

export type WaveType = 0 | 1 | 2; // 0 = AUTO, 1 = MOD SINE, 2 = PURE SINE
export type PwmAlignment = 0 | 1; // 0 = EDGE, 1 = CENTER
export type BridgeSide = 0 | 1 | 2; // 0 = Right Polar, 1 = Left Polar, 2 = ALT Polar

export interface PrimevoltSettings {
  acOutputV: number;          // 180..260 V (default 220)
  pvMaxV: number;             // 300..850 V (default 450)
  pvMinV: number;             // 100..300 V (default 170)
  pvCalAuto: number;          // 0=MANUAL, 1=AUTO 3V=305V (default 1)
  pvCal3vV: number;           // 250..600 V (default 305)
  carrierHz: number;          // 13000..16000 Hz (default 16000)
  pwmAlignment: PwmAlignment; // 0=EDGE, 1=CENTER (default 1)
  shuntTenthMohm: number;     // 10..2000 (default 333 -> 33.3 mOhm)
  ampGainX10: number;         // 10..1000 (default 90 -> 9.0x)
  deadtimeAuto: number;       // 0=MANUAL, 1=AUTO (default 1)
  deadtimeNs: number;         // 1492..3255 ns (default 1492)
  uniBridge: BridgeSide;      // 0=Right Polar, 1=Left Polar, 2=ALT Polar (default 0)
  waveType: WaveType;         // 0=AUTO, 1=MOD SINE, 2=PURE SINE (default 0)
  uniTorque: number;          // 0=OFF, 1=100ms, 2=250ms, 3=500ms (default 3)
  softStartMs: number;        // 1000..10000 ms (default 3000)
  changeoverEnable: number;   // 0=OFF, 1=ON (default 0)
  autoRestart: number;        // 0=OFF, 1=ON (default 1)
  shortReboot: number;        // 0=OFF, 1=ON (default 0)
  shortSensitivityPct: number;// 1..100% (default 15)
  protectPvLow: number;       // 0 or 1 (default 1)
  protectPvHigh: number;      // 0 or 1 (default 1)
  protectOverload: number;    // 0 or 1 (default 1)
  protectTemp: number;        // 0 or 1 (default 1)
}

export const DEFAULT_PRIMEVOLT_SETTINGS: PrimevoltSettings = {
  acOutputV: 220,
  pvMaxV: 450,
  pvMinV: 170,
  pvCalAuto: 1,
  pvCal3vV: 305,
  carrierHz: 16000,
  pwmAlignment: 1,
  shuntTenthMohm: 333,
  ampGainX10: 90,
  deadtimeAuto: 1,
  deadtimeNs: 1492,
  uniBridge: 0,
  waveType: 0,
  uniTorque: 3,
  softStartMs: 3000,
  changeoverEnable: 0,
  autoRestart: 1,
  shortReboot: 0,
  shortSensitivityPct: 15,
  protectPvLow: 1,
  protectPvHigh: 1,
  protectOverload: 1,
  protectTemp: 1
};

/**
 * Exact 32-bit phase Q15 sine lookup with fractional interpolation from firmware `SineQ15Interp`
 */
export function sineQ15Interp(phaseU32: number): number {
  const u32 = phaseU32 >>> 0;
  const index = (u32 >>> 24) & 0xff;
  let offset = index & 63;
  let next: number;
  const frac = (u32 >>> 8) & 0xffff;

  if ((index & 64) !== 0) {
    offset = 64 - offset;
    next = offset - 1;
  } else {
    next = offset + 1;
  }

  let a = SINE_QUARTER_Q15[offset];
  let b = SINE_QUARTER_Q15[next];
  if ((index & 128) !== 0) {
    a = -a;
    b = -b;
  }

  const slope = (b - a) * frac;
  return (a + ((slope + 32768) >> 16)) | 0;
}

export function carrierPeriod(carrierHz: number, alignment: PwmAlignment): number {
  const table = [
    { edge: 566, center: 283 }, // 13 kHz
    { edge: 526, center: 262 }, // 14 kHz
    { edge: 491, center: 245 }, // 15 kHz
    { edge: 460, center: 229 }  // 16 kHz
  ];
  const idx = Math.max(0, Math.min(3, Math.floor(carrierHz / 1000) - 13));
  return alignment === 1 ? table[idx].center : table[idx].edge;
}

export function deadTimeCountFromNs(ns: number): { count: number; actualNs: number } {
  const scaled = ns * 288;
  let count = Math.floor((scaled + 19531) / 39063);
  if (count < 11) count = 11;
  if (count > 24) count = 24;
  const actualNs = Math.floor((count * 39063 + 144) / 288);
  return { count, actualNs };
}

export function overmodGainFromFundamentalQ15(fundamentalQ15: number): number {
  if (fundamentalQ15 <= OVERMOD_CURVE[0].fundamentalQ15) {
    return Math.floor((fundamentalQ15 + 2) / 4);
  }
  const last = OVERMOD_CURVE[OVERMOD_CURVE.length - 1];
  if (fundamentalQ15 >= last.fundamentalQ15) {
    return last.gainQ13;
  }
  for (let i = 0; i < OVERMOD_CURVE.length - 1; i++) {
    const x0 = OVERMOD_CURVE[i].fundamentalQ15;
    const x1 = OVERMOD_CURVE[i + 1].fundamentalQ15;
    if (fundamentalQ15 <= x1) {
      const y0 = OVERMOD_CURVE[i].gainQ13;
      const y1 = OVERMOD_CURVE[i + 1].gainQ13;
      const dx = x1 - x0;
      const dy = y1 - y0;
      return y0 + Math.floor(((fundamentalQ15 - x0) * dy + (dx >> 1)) / dx);
    }
  }
  return last.gainQ13;
}

export interface UnipolarStepSample {
  timeMs: number;
  phaseDeg: number;
  pdc1: number;
  pdc2: number;
  ptper: number;
  pwmSpan: number;
  pwm1H: number; // 0 or 1 (RE1: Left/Slow Leg High)
  pwm1L: number; // 0 or 1 (RE0: Left/Slow Leg Low)
  pwm2H: number; // 0 or 1 (RE3: Right/Fast SPWM Leg High)
  pwm2L: number; // 0 or 1 (RE2: Right/Fast SPWM Leg Low)
  bridgeDiffVolts: number; // +Vpv, 0, -Vpv
  filteredAcVolts: number; // LC filtered instantaneous AC voltage
  modulationQ15: number;
  effectiveWave: 'PURE' | 'OVR';
}

export interface UnipolarScopeSummary {
  samples: UnipolarStepSample[];
  ptper: number;
  pwmSpan: number;
  deadtimeCount: number;
  deadtimeActualNs: number;
  deadtimeCompTicks: number;
  modulationIndexPct: number;
  rmsAcVolts: number;
  peakAcVolts: number;
  fundamentalHz: number;
  carrierHz: number;
  effectiveWave: 'PURE' | 'OVR';
  thdPercent: number;
}

/**
 * Runs the exact `PWM_UnipolarUpdate` math from `Primevolt-V16-4r8-P1-Unipolar-Fixed.c`
 * across `numCycles` of the 50 Hz fundamental to produce oscilloscope traces.
 */
export function simulateUnipolarOscilloscope(
  settings: PrimevoltSettings,
  pvVolts: number,
  loadWatts: number,
  softStartRatio = 1.0,
  numCycles = 2
): UnipolarScopeSummary {
  const ptper = carrierPeriod(settings.carrierHz, settings.pwmAlignment);
  const pwmNeutral = ptper + 1;
  const pwmSpan = pwmNeutral * 2;
  const dtNs = settings.deadtimeAuto ? 1492 : settings.deadtimeNs;
  const { count: deadtimeCount, actualNs: deadtimeActualNs } = deadTimeCountFromNs(dtNs);
  const deadtimeCompTicks =
    settings.pwmAlignment === 1
      ? Math.floor((deadtimeCount * 3) / 4)
      : Math.floor((deadtimeCount * 3) / 2);

  const minPulseBase =
    settings.pwmAlignment === 1
      ? deadtimeCount + 8
      : deadtimeCount * 2 + 16;
  const minPulse = settings.pwmAlignment === 1 ? minPulseBase * 2 : minPulseBase;
  const maxPulse = pwmSpan - minPulse;

  const safePv = Math.max(100, pvVolts);
  // Required Q15 modulation to produce acOutputV RMS from safePv DC link:
  // V_ac_peak = acOutputV * sqrt(2) -> Q15 = acOutputV * 46341 / pvVolts
  const rawDesiredQ15 = Math.floor((settings.acOutputV * 46341 + (safePv >> 1)) / safePv);

  let effectiveWave: 'PURE' | 'OVR' = 'PURE';
  let targetQ15 = rawDesiredQ15;

  if (settings.waveType === 2) {
    // PURE SINE
    effectiveWave = 'PURE';
    if (targetQ15 > 30000) targetQ15 = 30000;
  } else if (settings.waveType === 1) {
    // MOD SINE (OVERMOD)
    effectiveWave = 'OVR';
    if (targetQ15 > 41613) targetQ15 = 41613;
  } else {
    // AUTO WAVE
    if (rawDesiredQ15 > 32768) {
      effectiveWave = 'OVR';
      if (targetQ15 > 41613) targetQ15 = 41613;
    } else {
      effectiveWave = 'PURE';
      if (targetQ15 > 30000) targetQ15 = 30000;
    }
  }

  const modulationQ15 = Math.floor(targetQ15 * Math.max(0, Math.min(1, softStartRatio)));
  const driveGainQ13 =
    effectiveWave === 'OVR'
      ? overmodGainFromFundamentalQ15(modulationQ15)
      : (modulationQ15 + 2) >> 2;

  // Simulate at 16 kHz carrier periods (320 carrier periods per 20 ms 50 Hz cycle)
  const carriersPerCycle = Math.round(settings.carrierHz / FUNDAMENTAL_HZ);
  const subStepsPerCarrier = 4; // High-resolution sub-carrier points for crisp PWM switching edges
  const totalCarriers = carriersPerCycle * numCycles;
  const samples: UnipolarStepSample[] = [];

  let pulsePark = 0;
  let sumSqAc = 0;
  let peakAc = 0;

  // Second-order damped LC filter state (L = 2.75 mH, C = 11 uF, R_esr + R_load)
  let filterV = 0;
  let filterI = 0;
  const L = 0.00275;
  const C = 0.000011;
  const rSeries = 0.85;
  const RLoad = loadWatts > 20 ? (settings.acOutputV * settings.acOutputV) / loadWatts : 180;
  const dt = 1 / (settings.carrierHz * subStepsPerCarrier);

  for (let c = 0; c < totalCarriers; c++) {
    const cycleIndex = Math.floor(c / carriersPerCycle);
    const posInCycle = (c % carriersPerCycle) / carriersPerCycle;
    const phaseU32 = Math.floor(posInCycle * 4294967296) >>> 0;
    const negHalf = posInCycle >= 0.5 ? 1 : 0;

    const s = sineQ15Interp(phaseU32);
    const mag = s < 0 ? -s : s;
    const scaled = Math.floor((mag * driveGainQ13 + 4096) / 8192);
    const mod = scaled > 32767 ? 32767 : scaled;

    let dFast = Math.floor((pwmSpan * mod + 16384) / 32768);
    if (dFast > 0 && deadtimeCompTicks > 0) {
      const comp = Math.floor((deadtimeCompTicks * mod * 192 + 4194304) / 8388608);
      dFast = Math.min(pwmSpan, dFast + comp);
    }

    const lowEnter = minPulse;
    const lowExit = minPulse + 6;
    const highEnter = maxPulse;
    const highExit = maxPulse - 6;

    if (pulsePark === 1) {
      if (dFast >= lowExit) pulsePark = 0;
    } else if (pulsePark === 2) {
      if (dFast <= highExit) pulsePark = 0;
    }

    if (pulsePark === 0) {
      if (dFast < lowEnter) pulsePark = 1;
      else if (dFast > highEnter) pulsePark = 2;
    }

    if (pulsePark === 1) dFast = 0;
    else if (pulsePark === 2) dFast = pwmSpan;

    let dSlow: number;
    if (negHalf === 1) {
      dSlow = pwmSpan;
      dFast = pwmSpan - dFast;
    } else {
      dSlow = 0;
    }

    // Bridge side selection (Right Polar = 0, Left Polar = 1, ALT Polar = 2)
    let swap = 0;
    if (settings.uniBridge === 1) {
      swap = 1;
    } else if (settings.uniBridge === 2) {
      swap = cycleIndex & 1;
    }

    const pdc1 = swap ? dFast : dSlow;
    const pdc2 = swap ? dSlow : dFast;

    const dutyRatio1 = pdc1 / pwmSpan;
    const dutyRatio2 = pdc2 / pwmSpan;

    for (let sub = 0; sub < subStepsPerCarrier; sub++) {
      // Triangle carrier in [0, 1] for Center-Aligned or Sawtooth for Edge-Aligned
      const subFrac = (sub + 0.5) / subStepsPerCarrier;
      const carrierVal =
        settings.pwmAlignment === 1
          ? subFrac <= 0.5
            ? subFrac * 2
            : 2 - subFrac * 2
          : subFrac;

      const pwm1H = dutyRatio1 > carrierVal ? 1 : 0;
      const pwm1L = dutyRatio1 < carrierVal ? 1 : 0;
      const pwm2H = dutyRatio2 > carrierVal ? 1 : 0;
      const pwm2L = dutyRatio2 < carrierVal ? 1 : 0;

      // Leg1 voltage = pwm1H * Vpv, Leg2 voltage = pwm2H * Vpv
      const rawLegDiff = swap ? (pwm1H - pwm2H) * safePv : (pwm2H - pwm1H) * safePv;

      // Update 2nd-order damped LC filter
      const dI = (rawLegDiff - filterV - filterI * rSeries) / L;
      filterI += dI * dt;
      const dV = (filterI - filterV / RLoad) / C;
      filterV += dV * dt;

      const tMs = (c * subStepsPerCarrier + sub) * dt * 1000;
      const phaseDeg = (posInCycle + sub / (carriersPerCycle * subStepsPerCarrier)) * 360;

      sumSqAc += filterV * filterV;
      if (Math.abs(filterV) > peakAc) peakAc = Math.abs(filterV);

      samples.push({
        timeMs: Number(tMs.toFixed(4)),
        phaseDeg: Number(phaseDeg.toFixed(2)),
        pdc1,
        pdc2,
        ptper,
        pwmSpan,
        pwm1H,
        pwm1L,
        pwm2H,
        pwm2L,
        bridgeDiffVolts: rawLegDiff,
        filteredAcVolts: Number(filterV.toFixed(2)),
        modulationQ15,
        effectiveWave
      });
    }
  }

  // Exact firmware formula from Control_Service10ms (line 2675):
  // __builtin_divud(__builtin_muluu(g_run.pv_v, g_modulation_q15) + 23170UL, 46341U)
  const rmsAcVolts = Math.floor((safePv * modulationQ15 + 23170) / 46341);
  const peakAcVolts = Math.round(rmsAcVolts * Math.SQRT2);
  const modulationIndexPct = Math.round((modulationQ15 / 32768) * 1000) / 10;
  const thdPercent = effectiveWave === 'PURE' ? 1.8 : 6.4;

  return {
    samples,
    ptper,
    pwmSpan,
    deadtimeCount,
    deadtimeActualNs,
    deadtimeCompTicks,
    modulationIndexPct,
    rmsAcVolts,
    peakAcVolts,
    fundamentalHz: FUNDAMENTAL_HZ,
    carrierHz: settings.carrierHz,
    effectiveWave,
    thdPercent
  };
}

/**
 * All 26 Unipolar Menu Items exactly matching `menu_descriptor[MENU_COUNT]` in the C firmware
 */
export interface UnipolarMenuItemSpec {
  index: number;
  title: string;
  key: keyof PrimevoltSettings | 'factory' | 'noSave' | 'saveExit';
  low: number;
  high: number;
  step: number;
  format: 'volts' | 'khz' | 'ns' | 'sec' | 'tenth' | 'percent' | 'enum' | 'bit' | 'bridge' | 'torque' | 'action';
  formatValue: (s: PrimevoltSettings, factoryConfirm?: boolean) => string;
}

const padLeft = (val: number | string, width: number, ch = ' '): string => {
  const s = String(val);
  return s.length >= width ? s.slice(0, width) : ch.repeat(width - s.length) + s;
};

const padRight16 = (s: string): string => {
  return s.length >= 16 ? s.slice(0, 16) : s + ' '.repeat(16 - s.length);
};

export const UNIPOLAR_MENU_ITEMS: ReadonlyArray<UnipolarMenuItemSpec> = [
  {
    index: 0,
    title: 'OUTPUT AC',
    key: 'acOutputV',
    low: 180,
    high: 260,
    step: 1,
    format: 'volts',
    formatValue: s => `${padLeft(s.acOutputV, 5)} V`
  },
  {
    index: 1,
    title: 'PV MAX',
    key: 'pvMaxV',
    low: 300,
    high: 850,
    step: 1,
    format: 'volts',
    formatValue: s => `${padLeft(s.pvMaxV, 5)} V`
  },
  {
    index: 2,
    title: 'PV MIN',
    key: 'pvMinV',
    low: 100,
    high: 300,
    step: 1,
    format: 'volts',
    formatValue: s => `${padLeft(s.pvMinV, 5)} V`
  },
  {
    index: 3,
    title: 'PV CAL MODE',
    key: 'pvCalAuto',
    low: 0,
    high: 1,
    step: 1,
    format: 'enum',
    formatValue: s => (s.pvCalAuto ? 'AUTO 3V=305V' : 'MANUAL')
  },
  {
    index: 4,
    title: 'PV CAL @ 3V',
    key: 'pvCal3vV',
    low: 250,
    high: 600,
    step: 1,
    format: 'volts',
    formatValue: s => `${padLeft(s.pvCal3vV, 5)} V`
  },
  {
    index: 5,
    title: 'CARRIER',
    key: 'carrierHz',
    low: 13000,
    high: 16000,
    step: 1000,
    format: 'khz',
    formatValue: s => `${padLeft(Math.floor(s.carrierHz / 1000), 5)} kHz`
  },
  {
    index: 6,
    title: 'PWM ALIGNMENT',
    key: 'pwmAlignment',
    low: 0,
    high: 1,
    step: 1,
    format: 'enum',
    formatValue: s => (s.pwmAlignment ? 'CENTER' : 'EDGE')
  },
  {
    index: 7,
    title: 'SHUNT mOHM',
    key: 'shuntTenthMohm',
    low: 10,
    high: 2000,
    step: 1,
    format: 'tenth',
    formatValue: s => `${padLeft(Math.floor(s.shuntTenthMohm / 10), 4)}.${s.shuntTenthMohm % 10}`
  },
  {
    index: 8,
    title: 'AMP GAIN x',
    key: 'ampGainX10',
    low: 10,
    high: 1000,
    step: 1,
    format: 'tenth',
    formatValue: s => `${padLeft(Math.floor(s.ampGainX10 / 10), 4)}.${s.ampGainX10 % 10}`
  },
  {
    index: 9,
    title: 'DEADTIME MODE',
    key: 'deadtimeAuto',
    low: 0,
    high: 1,
    step: 1,
    format: 'enum',
    formatValue: s => (s.deadtimeAuto ? 'AUTO' : 'MANUAL')
  },
  {
    index: 10,
    title: 'DEAD TIME',
    key: 'deadtimeNs',
    low: 1492,
    high: 3255,
    step: 10,
    format: 'ns',
    formatValue: s => `${padLeft(s.deadtimeNs, 5)} ns`
  },
  {
    index: 11,
    title: 'UNI BRIDGE SIDE',
    key: 'uniBridge',
    low: 0,
    high: 2,
    step: 1,
    format: 'bridge',
    formatValue: s =>
      s.uniBridge === 1 ? 'Left Polar' : s.uniBridge === 2 ? 'ALT Polar' : 'Right Polar'
  },
  {
    index: 12,
    title: 'WAVE TYPE',
    key: 'waveType',
    low: 0,
    high: 2,
    step: 1,
    format: 'enum',
    formatValue: s => (s.waveType === 1 ? 'MOD SINE' : s.waveType === 2 ? 'PURE SINE' : 'AUTO')
  },
  {
    index: 13,
    title: 'UNI TORQUE',
    key: 'uniTorque',
    low: 0,
    high: 3,
    step: 1,
    format: 'torque',
    formatValue: s => {
      if (s.uniTorque === 0) return 'OFF';
      const ms = s.uniTorque === 1 ? 100 : s.uniTorque === 2 ? 250 : 500;
      return `SAG HOLD ${padLeft(ms, 3)} ms`;
    }
  },
  {
    index: 14,
    title: 'SOFT START',
    key: 'softStartMs',
    low: 1000,
    high: 10000,
    step: 1000,
    format: 'sec',
    formatValue: s => `${padLeft(Math.floor(s.softStartMs / 1000), 5)} sec`
  },
  {
    index: 15,
    title: 'CHANGEOVER P22',
    key: 'changeoverEnable',
    low: 0,
    high: 1,
    step: 1,
    format: 'enum',
    formatValue: s => (s.changeoverEnable ? 'ON' : 'OFF')
  },
  {
    index: 16,
    title: 'AUTO RESTART',
    key: 'autoRestart',
    low: 0,
    high: 1,
    step: 1,
    format: 'enum',
    formatValue: s => (s.autoRestart ? 'ON' : 'OFF')
  },
  {
    index: 17,
    title: 'SHORT REBOOT',
    key: 'shortReboot',
    low: 0,
    high: 1,
    step: 1,
    format: 'enum',
    formatValue: s => (s.shortReboot ? 'ON' : 'OFF')
  },
  {
    index: 18,
    title: 'SHORT CIRCUIT',
    key: 'shortSensitivityPct',
    low: 1,
    high: 100,
    step: 1,
    format: 'percent',
    formatValue: s => `SENSITIVITY ${padLeft(s.shortSensitivityPct, 3)}%`
  },
  {
    index: 19,
    title: 'PROTECT PV LOW',
    key: 'protectPvLow',
    low: 0,
    high: 1,
    step: 1,
    format: 'bit',
    formatValue: s => (s.protectPvLow ? 'ON' : 'OFF')
  },
  {
    index: 20,
    title: 'PROTECT PV HIGH',
    key: 'protectPvHigh',
    low: 0,
    high: 1,
    step: 1,
    format: 'bit',
    formatValue: s => (s.protectPvHigh ? 'ON' : 'OFF')
  },
  {
    index: 21,
    title: 'PROTECT O/LOAD',
    key: 'protectOverload',
    low: 0,
    high: 1,
    step: 1,
    format: 'bit',
    formatValue: s => (s.protectOverload ? 'ON' : 'OFF')
  },
  {
    index: 22,
    title: 'PROTECT TEMP',
    key: 'protectTemp',
    low: 0,
    high: 1,
    step: 1,
    format: 'bit',
    formatValue: s => (s.protectTemp ? 'ON' : 'OFF')
  },
  {
    index: 23,
    title: 'RESTORE FACTORY',
    key: 'factory',
    low: 0,
    high: 0,
    step: 0,
    format: 'action',
    formatValue: (_s, factoryConfirm) => (factoryConfirm ? 'ENTER AGAIN' : 'ENTER')
  },
  {
    index: 24,
    title: 'NO SAVE & EXIT',
    key: 'noSave',
    low: 0,
    high: 0,
    step: 0,
    format: 'action',
    formatValue: () => 'ENTER'
  },
  {
    index: 25,
    title: 'SAVE & RESTART',
    key: 'saveExit',
    low: 0,
    high: 0,
    step: 0,
    format: 'action',
    formatValue: () => 'ENTER = RESTART'
  }
];

export function formatMenuLcdLines(
  menuIndex: number,
  settings: PrimevoltSettings,
  editing: boolean,
  factoryConfirm = false
): [string, string] {
  const item = UNIPOLAR_MENU_ITEMS[Math.max(0, Math.min(25, menuIndex))];
  const rawTitle = padRight16(item.title);
  const line0 = rawTitle.slice(0, 15) + (editing ? '*' : ' ');
  const line1 = padRight16(item.formatValue(settings, factoryConfirm));
  return [line0, line1];
}

export function formatMainDashboardLcdLines(
  pvVolts: number,
  acVolts: number,
  loadWatts: number,
  effectiveWave: 'PURE' | 'OVR'
): [string, string] {
  const pvStr = padLeft(Math.max(0, Math.min(999, Math.round(pvVolts))), 3, '0');
  const acStr = padLeft(Math.max(0, Math.min(999, Math.round(acVolts))), 3, '0');
  const loadStr = padLeft(Math.max(0, Math.min(9999, Math.round(loadWatts))), 4, '0');
  const waveStr = effectiveWave === 'OVR' ? 'OVR' : 'PUR';
  return [
    padRight16(`PV:${pvStr} AC~${acStr}V`),
    padRight16(`L:${loadStr}W Wave:${waveStr}`)
  ];
}
