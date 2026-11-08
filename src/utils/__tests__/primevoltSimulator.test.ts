import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PRIMEVOLT_SETTINGS,
  UNIPOLAR_MENU_ITEMS,
  carrierPeriod,
  deadTimeCountFromNs,
  formatMainDashboardLcdLines,
  formatMenuLcdLines,
  sineQ15Interp,
  simulateUnipolarOscilloscope
} from '../primevoltSimulator.ts';

describe('PrimeVolt dsPIC30F2010 Unipolar Core & 1602 LCD Engine', () => {
  it('computes exact Q15 sine lookup at 0, 90, 180, and 270 degrees', () => {
    assert.equal(sineQ15Interp(0x00000000), 0);
    assert.equal(sineQ15Interp(0x40000000), 32767);
    assert.equal(sineQ15Interp(0x80000000), 0);
    assert.equal(sineQ15Interp(0xC0000000), -32767);
  });

  it('computes exact dsPIC30F2010 PTPER and deadtime registers at 7.3728 MIPS', () => {
    assert.equal(carrierPeriod(16000, 1), 229); // Center-aligned 16 kHz -> PTPER = 229
    assert.equal(carrierPeriod(16000, 0), 460); // Edge-aligned 16 kHz -> PTPER = 460
    const dt = deadTimeCountFromNs(1492);
    assert.equal(dt.count, 11);
    assert.equal(dt.actualNs, 1492);
  });

  it('preserves all 26 Unipolar Menu items with exact 16x2 character formatting', () => {
    assert.equal(UNIPOLAR_MENU_ITEMS.length, 26);
    for (let i = 0; i < 26; i++) {
      const [line0, line1] = formatMenuLcdLines(i, DEFAULT_PRIMEVOLT_SETTINGS, false);
      assert.equal(line0.length, 16);
      assert.equal(line1.length, 16);
      assert.equal(line0[15], ' ');
    }
    const [edit0, edit1] = formatMenuLcdLines(0, DEFAULT_PRIMEVOLT_SETTINGS, true);
    assert.equal(edit0, 'OUTPUT AC      *');
    assert.equal(edit1, '  220 V         ');
  });

  it('formats live dashboard 1602 LCD lines accurately', () => {
    const [l0, l1] = formatMainDashboardLcdLines(320, 220, 850, 'PURE');
    assert.equal(l0, 'PV:320 AC~220V  ');
    assert.equal(l1, 'L:0850W Wave:PUR');
  });

  it('simulates 3-level Unipolar PWM and LC-filtered 50Hz output accurately', () => {
    const scope = simulateUnipolarOscilloscope(DEFAULT_PRIMEVOLT_SETTINGS, 340, 850, 1.0, 2);
    assert.equal(scope.ptper, 229);
    assert.equal(scope.pwmSpan, 460);
    assert.equal(scope.deadtimeCount, 11);
    assert.equal(scope.deadtimeActualNs, 1492);
    assert.equal(scope.fundamentalHz, 50);
    assert.equal(scope.carrierHz, 16000);
    assert.equal(scope.effectiveWave, 'PURE');
    assert.ok(scope.samples.length >= 2000);
    // In Right Polar mode at 90 deg peak (sample 320), Left leg (PDC1) is 0 while Right leg (PDC2) is near max duty
    const peakPos = scope.samples[320];
    assert.equal(peakPos.pdc1, 0);
    assert.ok(peakPos.pdc2 > 300);
  });
});
