import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePicBaudRate,
  calculatePicTimerPeriod,
  calculatePicPwm,
  calculatePicEeprom,
} from './microchipCalculators';

test('calculatePicBaudRate 9600 bps @ 20MHz crystal (BRGH=1)', () => {
  const result = calculatePicBaudRate(20000000, 9600, true);
  // SPBRG = round(20000000 / (16 * 9600)) - 1 = round(130.208) - 1 = 129
  assert.equal(result.spbrg, 129);
  assert.ok(Math.abs(result.errorPercent) < 0.5, 'Error should be less than 0.5%');
  assert.equal(result.isValid, true);
});

test('calculatePicBaudRate 115200 bps @ 20MHz crystal (BRGH=1)', () => {
  const result = calculatePicBaudRate(20000000, 115200, true);
  // SPBRG = round(20000000 / (16 * 115200)) - 1 = round(10.85) - 1 = 10
  assert.equal(result.spbrg, 10);
  assert.equal(result.isValid, true);
});

test('calculatePicTimerPeriod 1ms interrupt @ 20MHz with 1:16 prescaler on 8-bit timer', () => {
  const result = calculatePicTimerPeriod(20000000, 16, 8, 1);
  // Fcy = 5MHz, Tick = 16 / 5MHz = 3.2 microseconds
  // 1ms = 1000us / 3.2us = 312.5 ticks -> Overflows 8-bit timer (max 256)
  assert.equal(result.isValid, false);
});

test('calculatePicTimerPeriod 1ms interrupt @ 20MHz with 1:16 prescaler on 16-bit timer', () => {
  const result = calculatePicTimerPeriod(20000000, 16, 16, 1);
  // 65536 - 313 = 65223 preload
  assert.equal(result.isValid, true);
  assert.ok(result.preloadValue > 65000);
});

test('calculatePicPwm 5kHz PWM @ 20MHz crystal with 1:16 prescaler', () => {
  const result = calculatePicPwm(20000000, 5000, 16, 50);
  // PR2 = (20000000 / (4 * 5000 * 16)) - 1 = (20000000 / 320000) - 1 = 62.5 - 1 = 62 or 61
  assert.ok(result.pr2 >= 61 && result.pr2 <= 63);
  assert.equal(result.isValid, true);
  assert.ok(result.initCode.includes('PR2 ='));
});

test('calculatePicEeprom Data EEPROM Write computes EECON1=0x04/0x06 and EECON2=0x55/0xAA', () => {
  const result = calculatePicEeprom(20000000, {
    mcuFamily: 'PIC16F',
    operation: 'WRITE',
    memoryTarget: 'DATA_EEPROM',
    address: 0x10,
    dataByte: 0x41, // 'A'
    disableInterrupts: true,
    verifyAfterWrite: true,
  });
  assert.equal(result.eecon1PreTrigger, 0x04);
  assert.equal(result.eecon1PreTriggerHex, '0x04');
  assert.equal(result.eecon1Trigger, 0x06);
  assert.equal(result.eecon1TriggerHex, '0x06');
  assert.equal(result.eecon2Step1Hex, '0x55');
  assert.equal(result.eecon2Step2Hex, '0xAA');
  assert.equal(result.addressHex, '0x10');
  assert.equal(result.dataHex, '0x41');
  assert.equal(result.dataAscii, "'A'");
  assert.equal(result.isValid, true);
  assert.ok(result.xc8Code.includes('EECON2 = 0x55;'));
  assert.ok(result.xc8Code.includes('EECON2 = 0xAA;'));
  assert.ok(result.xc8Code.includes('INTCONbits.GIE = 0;'));
});

test('calculatePicEeprom Data EEPROM Read computes EECON1=0x00/0x01 and N/A EECON2 unlock', () => {
  const result = calculatePicEeprom(20000000, {
    mcuFamily: 'PIC18F',
    operation: 'READ',
    memoryTarget: 'DATA_EEPROM',
    address: 0x05,
    dataByte: 0x00,
    disableInterrupts: false,
    verifyAfterWrite: false,
  });
  assert.equal(result.eecon1PreTrigger, 0x00);
  assert.equal(result.eecon1Trigger, 0x01);
  assert.equal(result.eecon1TriggerHex, '0x01');
  assert.equal(result.eecon2Step1Hex, 'N/A (Read Only)');
  assert.ok(result.xc8Code.includes('EECON1bits.CFGS = 0;'));
  assert.ok(result.xc8Code.includes('EECON1bits.RD = 1;'));
});

test('calculatePicEeprom Flash Program Memory Write sets EEPGD=1 (EECON1=0x84/0x86)', () => {
  const result = calculatePicEeprom(20000000, {
    mcuFamily: 'PIC16F',
    operation: 'READ_MODIFY_WRITE',
    memoryTarget: 'FLASH_PROGRAM',
    address: 0x20,
    dataByte: 0x7F,
    disableInterrupts: true,
    verifyAfterWrite: false,
  });
  assert.equal(result.eecon1PreTrigger, 0x84);
  assert.equal(result.eecon1Trigger, 0x86);
  assert.equal(result.eecon1PreTriggerHex, '0x84');
  assert.equal(result.eecon1TriggerHex, '0x86');
  assert.ok(result.xc8Code.includes('if (EEPROM_ReadByte(addr) == data) return true;'));
});

