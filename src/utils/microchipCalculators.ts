/**
 * Microchip PIC & AVR Register and Hardware Calculators
 * Pure calculation functions for Baud Rate, Timers, PWM, and ADC.
 */

export interface BaudRateResult {
  fosc: number;
  desiredBaud: number;
  brghHigh: boolean;
  spbrg: number;
  actualBaud: number;
  errorPercent: number;
  isValid: boolean;
  registerCode: string;
}

export function calculatePicBaudRate(
  foscHz: number,
  desiredBaud: number,
  brghHigh: boolean = true
): BaudRateResult {
  if (foscHz <= 0 || desiredBaud <= 0) {
    return {
      fosc: foscHz,
      desiredBaud,
      brghHigh,
      spbrg: 0,
      actualBaud: 0,
      errorPercent: 100,
      isValid: false,
      registerCode: '// Invalid Fosc or Baud Rate',
    };
  }

  // Formula for PIC16/PIC18 Asynchronous 8-bit Baud Rate Generator:
  // High Speed (BRGH = 1): Baud = Fosc / (16 * (SPBRG + 1))  => SPBRG = (Fosc / (16 * Baud)) - 1
  // Low Speed  (BRGH = 0): Baud = Fosc / (64 * (SPBRG + 1))  => SPBRG = (Fosc / (64 * Baud)) - 1
  const divider = brghHigh ? 16 : 64;
  let spbrg = Math.round(foscHz / (divider * desiredBaud)) - 1;

  if (spbrg < 0) spbrg = 0;
  const isOverflow = spbrg > 255;
  const clampedSpbrg = Math.min(255, Math.max(0, spbrg));

  const actualBaud = foscHz / (divider * (clampedSpbrg + 1));
  const errorPercent = ((actualBaud - desiredBaud) / desiredBaud) * 100;
  const isValid = !isOverflow && Math.abs(errorPercent) <= 3.0; // Standard serial tolerance <= 3%

  const registerCode = [
    `// UART Configuration @ ${(foscHz / 1e6).toFixed(2)} MHz, Desired: ${desiredBaud} bps`,
    `TXSTAbits.BRGH = ${brghHigh ? '1' : '0'}; // ${brghHigh ? 'High' : 'Low'} Speed Baud Rate`,
    `SPBRG = ${clampedSpbrg};          // Calculated actual baud: ${actualBaud.toFixed(1)} bps (${errorPercent >= 0 ? '+' : ''}${errorPercent.toFixed(2)}% error)`,
    `TXSTAbits.SYNC = 0; // Asynchronous mode`,
    `RCSTAbits.SPEN = 1; // Enable Serial Port`,
    `TXSTAbits.TXEN = 1; // Enable Transmitter`,
    `RCSTAbits.CREN = 1; // Enable Continuous Receive`,
  ].join('\n');

  return {
    fosc: foscHz,
    desiredBaud,
    brghHigh,
    spbrg: clampedSpbrg,
    actualBaud,
    errorPercent: parseFloat(errorPercent.toFixed(2)),
    isValid,
    registerCode,
  };
}

export interface TimerResult {
  fosc: number;
  fcy: number;
  prescaler: number;
  timerBits: 8 | 16;
  desiredIntervalMs: number;
  preloadValue: number;
  actualIntervalMs: number;
  frequencyHz: number;
  isValid: boolean;
  isrCode: string;
}

export function calculatePicTimerPeriod(
  foscHz: number,
  prescaler: number,
  timerBits: 8 | 16,
  desiredIntervalMs: number,
  timerNumber: 0 | 1 | 2 = 0
): TimerResult {
  // PIC instruction clock Fcy = Fosc / 4
  const fcy = foscHz / 4;
  const tickTimeSec = (1 / fcy) * prescaler;
  const desiredSec = desiredIntervalMs / 1000;
  const maxCounts = timerBits === 8 ? 256 : 65536;

  const ticksNeeded = Math.round(desiredSec / tickTimeSec);
  const preload = maxCounts - ticksNeeded;

  const isValid = preload >= 0 && preload < maxCounts;
  const clampedPreload = Math.max(0, Math.min(maxCounts - 1, preload));

  const actualSec = (maxCounts - clampedPreload) * tickTimeSec;
  const actualIntervalMs = actualSec * 1000;
  const frequencyHz = actualSec > 0 ? 1 / actualSec : 0;

  let isrCode = '';
  if (timerBits === 8) {
    const regName = timerNumber === 0 ? 'TMR0' : `TMR${timerNumber}`;
    const intFlag = timerNumber === 0 ? 'INTCONbits.TMR0IF' : `PIR1bits.TMR${timerNumber}IF`;
    const intEnable = timerNumber === 0 ? 'INTCONbits.TMR0IE' : `PIE1bits.TMR${timerNumber}IE`;
    isrCode = [
      `// Timer${timerNumber} 8-bit Reload for ${desiredIntervalMs}ms interval`,
      `void __interrupt() ISR(void) {`,
      `    if (${intFlag}) {`,
      `        ${regName} = ${clampedPreload}; // Reload preload value`,
      `        ${intFlag} = 0;     // Clear interrupt flag`,
      `        // Your code here (toggle LED, update tick count)`,
      `    }`,
      `}`,
      ``,
      `// Initialization:`,
      `${regName} = ${clampedPreload};`,
      `${intFlag} = 0;`,
      `${intEnable} = 1;`,
      `INTCONbits.GIE = 1; // Global Interrupt Enable`,
    ].join('\n');
  } else {
    // 16-bit timer (Timer1)
    const preloadHex = '0x' + clampedPreload.toString(16).toUpperCase().padStart(4, '0');
    isrCode = [
      `// Timer1 16-bit Reload for ${desiredIntervalMs}ms interval (${preloadHex})`,
      `void __interrupt() ISR(void) {`,
      `    if (PIR1bits.TMR1IF) {`,
      `        TMR1H = 0x${((clampedPreload >> 8) & 0xFF).toString(16).toUpperCase().padStart(2, '0')};`,
      `        TMR1L = 0x${(clampedPreload & 0xFF).toString(16).toUpperCase().padStart(2, '0')};`,
      `        PIR1bits.TMR1IF = 0;`,
      `        // Your code here`,
      `    }`,
      `}`,
    ].join('\n');
  }

  return {
    fosc: foscHz,
    fcy,
    prescaler,
    timerBits,
    desiredIntervalMs,
    preloadValue: clampedPreload,
    actualIntervalMs: parseFloat(actualIntervalMs.toFixed(3)),
    frequencyHz: parseFloat(frequencyHz.toFixed(2)),
    isValid,
    isrCode,
  };
}

export interface PwmResult {
  fosc: number;
  targetFreqHz: number;
  prescaler: 1 | 4 | 16;
  pr2: number;
  actualFreqHz: number;
  maxResolutionBits: number;
  duty10BitAt50Percent: number;
  isValid: boolean;
  initCode: string;
}

export function calculatePicPwm(
  foscHz: number,
  targetFreqHz: number,
  prescaler: 1 | 4 | 16 = 16,
  dutyPercent: number = 50
): PwmResult {
  // PWM Period = [(PR2) + 1] * 4 * Tosc * (TMR2 Prescale Value)
  // PR2 = (Fosc / (4 * PWM_Freq * TMR2_Prescale)) - 1
  const pr2Float = foscHz / (4 * targetFreqHz * prescaler) - 1;
  const pr2 = Math.round(pr2Float);

  const isValid = pr2 >= 0 && pr2 <= 255;
  const clampedPr2 = Math.min(255, Math.max(0, pr2));

  const actualPeriodSec = (clampedPr2 + 1) * 4 * (1 / foscHz) * prescaler;
  const actualFreqHz = actualPeriodSec > 0 ? 1 / actualPeriodSec : 0;

  // Max Resolution (bits) = log2(Fosc / (PWM_Freq * Prescale))
  const maxResolutionBits = Math.min(
    10,
    parseFloat((Math.log2(foscHz / (actualFreqHz * prescaler))).toFixed(1))
  );

  // 10-bit Duty Cycle Register Value = (Duty% / 100) * 4 * (PR2 + 1)
  const duty10Bit = Math.round((dutyPercent / 100) * 4 * (clampedPr2 + 1));
  const clampedDuty = Math.min(1023, Math.max(0, duty10Bit));

  const ccpr1l = (clampedDuty >> 2) & 0xFF;
  const ccp1conBits = (clampedDuty & 0x03) << 4;

  const t2conPrescalerVal = prescaler === 1 ? '0b00' : prescaler === 4 ? '0b01' : '0b11';

  const initCode = [
    `// PIC CCP1 Hardware PWM @ ${(actualFreqHz / 1000).toFixed(2)} kHz, Duty: ${dutyPercent}%`,
    `TRISCbits.TRISC2 = 0; // CCP1 pin as output`,
    `PR2 = ${clampedPr2};               // Set PWM period`,
    `CCP1CON = 0x0C | (0x${ccp1conBits.toString(16).toUpperCase()}); // PWM mode, CCP1CON<5:4> = ${ccp1conBits >> 4}`,
    `CCPR1L = ${ccpr1l};              // 8 MSB bits of duty cycle`,
    `T2CON = ${t2conPrescalerVal};            // Timer2 Prescaler = ${prescaler}`,
    `T2CONbits.TMR2ON = 1;     // Enable Timer2`,
  ].join('\n');

  return {
    fosc: foscHz,
    targetFreqHz,
    prescaler,
    pr2: clampedPr2,
    actualFreqHz: parseFloat(actualFreqHz.toFixed(1)),
    maxResolutionBits,
    duty10BitAt50Percent: clampedDuty,
    isValid,
    initCode,
  };
}

export type PicEepromFamily = 'PIC16F' | 'PIC18F';
export type PicEepromOperation = 'READ' | 'WRITE' | 'READ_MODIFY_WRITE';
export type PicEepromMemoryTarget = 'DATA_EEPROM' | 'FLASH_PROGRAM';

export interface EepromBitField {
  bit: number;
  name: string;
  value: 0 | 1;
  description: string;
}

export interface EepromCalculatorInput {
  mcuFamily: PicEepromFamily;
  operation: PicEepromOperation;
  memoryTarget: PicEepromMemoryTarget;
  address: number;
  dataByte: number;
  disableInterrupts: boolean;
  verifyAfterWrite: boolean;
  eepromSizeBytes?: number;
}

export interface EepromCalculatorResult {
  mcuFamily: PicEepromFamily;
  operation: PicEepromOperation;
  memoryTarget: PicEepromMemoryTarget;
  address: number;
  addressHex: string;
  dataByte: number;
  dataHex: string;
  dataAscii: string;
  eecon1PreTrigger: number;
  eecon1PreTriggerHex: string;
  eecon1PreTriggerBin: string;
  eecon1Trigger: number;
  eecon1TriggerHex: string;
  eecon1TriggerBin: string;
  eecon2Step1Hex: string;
  eecon2Step2Hex: string;
  eecon1Bits: EepromBitField[];
  estimatedCycleTimeUs: number;
  isValidAddress: boolean;
  isValid: boolean;
  xc8Code: string;
}

export function calculatePicEeprom(
  foscHz: number,
  input: EepromCalculatorInput
): EepromCalculatorResult {
  const maxBytes = input.eepromSizeBytes ?? 256;
  const isValidAddress = input.address >= 0 && input.address < maxBytes;
  const clampedAddr = Math.max(0, Math.min(maxBytes - 1, Math.floor(input.address)));
  const clampedData = Math.max(0, Math.min(255, Math.floor(input.dataByte))) & 0xFF;

  const eepgd: 0 | 1 = input.memoryTarget === 'FLASH_PROGRAM' ? 1 : 0;
  const cfgs: 0 | 1 = 0; // Access EEPROM/Flash, not Configuration Words
  const freeBit: 0 | 1 = 0;
  const wrerrBit: 0 | 1 = 0;

  const isWrite = input.operation === 'WRITE' || input.operation === 'READ_MODIFY_WRITE';
  const wrenBit: 0 | 1 = isWrite ? 1 : 0;
  const wrBit: 0 | 1 = isWrite ? 1 : 0;
  const rdBit: 0 | 1 = isWrite ? 0 : 1;

  // EECON1 value before setting WR/RD trigger bit (e.g. when configuring EEPGD, CFGS, WREN)
  const eecon1PreTrigger =
    ((eepgd << 7) | (cfgs << 6) | (freeBit << 4) | (wrerrBit << 3) | (wrenBit << 2)) & 0xFF;

  // EECON1 value at the exact trigger instant (RD=1 for Read, or WREN=1 & WR=1 after 0x55/0xAA unlock)
  const eecon1Trigger = (eecon1PreTrigger | (wrBit << 1) | rdBit) & 0xFF;

  const eecon1Bits: EepromBitField[] = [
    {
      bit: 7,
      name: 'EEPGD',
      value: eepgd,
      description: eepgd ? '1 = Access Flash Program Memory' : '0 = Access Data EEPROM Memory',
    },
    {
      bit: 6,
      name: input.mcuFamily === 'PIC18F' ? 'CFGS' : '—',
      value: cfgs,
      description:
        input.mcuFamily === 'PIC18F'
          ? '0 = Access Flash/Data EEPROM (not Config bits)'
          : '0 = Unimplemented (Read as 0 on PIC16F)',
    },
    {
      bit: 5,
      name: '—',
      value: 0,
      description: '0 = Unimplemented (Read as 0)',
    },
    {
      bit: 4,
      name: input.mcuFamily === 'PIC18F' ? 'FREE' : '—',
      value: freeBit,
      description:
        input.mcuFamily === 'PIC18F'
          ? '0 = Perform Write Only (1 = Flash Row Erase)'
          : '0 = Unimplemented (Read as 0)',
    },
    {
      bit: 3,
      name: 'WRERR',
      value: wrerrBit,
      description: '0 = Write Operation Completed Normally (1 = Premature Reset/Error)',
    },
    {
      bit: 2,
      name: 'WREN',
      value: wrenBit,
      description: wrenBit ? '1 = Allows EEPROM Erase/Write Cycles' : '0 = Inhibits EEPROM Write',
    },
    {
      bit: 1,
      name: 'WR',
      value: wrBit,
      description: wrBit
        ? '1 = Initiates Self-Timed Erase/Write Cycle (Cleared by HW)'
        : '0 = Write Cycle Complete / Idle',
    },
    {
      bit: 0,
      name: 'RD',
      value: rdBit,
      description: rdBit
        ? '1 = Initiates Immediate EEPROM Read (Cleared by HW in 1 Tcy)'
        : '0 = Does Not Initiate EEPROM Read',
    },
  ];

  // Instruction cycle time in microseconds: Tcy = 4 / Fosc
  const safeFosc = foscHz > 0 ? foscHz : 20000000;
  const tcyUs = (4 / safeFosc) * 1e6;
  // Read takes ~2-4 instruction cycles (< 2 us); Write takes ~4000 us (4 ms typical internal RC timer)
  const estimatedCycleTimeUs = isWrite
    ? parseFloat((4000 + tcyUs * 14).toFixed(2))
    : parseFloat((tcyUs * 4).toFixed(2));

  const addressHex = '0x' + clampedAddr.toString(16).toUpperCase().padStart(2, '0');
  const dataHex = '0x' + clampedData.toString(16).toUpperCase().padStart(2, '0');
  const dataAscii =
    clampedData >= 32 && clampedData <= 126 ? `'${String.fromCharCode(clampedData)}'` : 'Non-Printable';
  const eecon1PreTriggerHex = '0x' + eecon1PreTrigger.toString(16).toUpperCase().padStart(2, '0');
  const eecon1PreTriggerBin = '0b' + eecon1PreTrigger.toString(2).padStart(8, '0');
  const eecon1TriggerHex = '0x' + eecon1Trigger.toString(16).toUpperCase().padStart(2, '0');
  const eecon1TriggerBin = '0b' + eecon1Trigger.toString(2).padStart(8, '0');

  const cfgsLine =
    input.mcuFamily === 'PIC18F'
      ? `    EECON1bits.CFGS = 0;    // Access Flash/EEPROM, not Config registers\n`
      : '';

  const readTriggerHex = '0x' + (((eepgd << 7) | 1) & 0xFF).toString(16).toUpperCase().padStart(2, '0');
  const readFuncCode = [
    `uint8_t EEPROM_ReadByte(uint8_t addr) {`,
    `    while (EECON1bits.WR);  // Wait for any previous write to complete`,
    `    EEADR = addr;           // Load target EEPROM address (${addressHex})`,
    `    EECON1bits.EEPGD = ${eepgd};   // ${eepgd ? 'Select Program Flash' : 'Select Data EEPROM memory'}`,
    cfgsLine ? cfgsLine.trimEnd() : null,
    `    EECON1bits.RD = 1;      // Initiate EEPROM Read (EECON1 = ${readTriggerHex})`,
    `    return EEDATA;          // Data available in EEDATA on next cycle`,
    `}`,
  ]
    .filter(Boolean)
    .join('\n');

  const writeFuncCode = [
    `bool EEPROM_WriteByte(uint8_t addr, uint8_t data) {`,
    `    while (EECON1bits.WR);  // Wait if a write cycle is currently active`,
    input.operation === 'READ_MODIFY_WRITE'
      ? `    if (EEPROM_ReadByte(addr) == data) return true; // Skip write if unchanged (wear leveling)`
      : null,
    `    EEADR = addr;           // Load EEPROM address (${addressHex})`,
    `    EEDATA = data;          // Load byte to write (${dataHex})`,
    `    EECON1bits.EEPGD = ${eepgd};   // ${eepgd ? 'Select Program Flash' : 'Select Data EEPROM memory'}`,
    cfgsLine ? cfgsLine.trimEnd() : null,
    `    EECON1bits.WREN = 1;    // Enable EEPROM writes (EECON1 = ${eecon1PreTriggerHex})`,
    input.disableInterrupts
      ? `    uint8_t gie_state = INTCONbits.GIE;\n    INTCONbits.GIE = 0;     // Disable interrupts during critical unlock sequence`
      : null,
    `    EECON2 = 0x55;          // Mandatory Hardware Unlock Step 1`,
    `    EECON2 = 0xAA;          // Mandatory Hardware Unlock Step 2`,
    `    EECON1bits.WR = 1;      // Start self-timed write (EECON1 = ${eecon1TriggerHex})`,
    input.disableInterrupts
      ? `    INTCONbits.GIE = gie_state; // Restore Global Interrupt state`
      : null,
    `    while (EECON1bits.WR);  // Wait ~4ms for internal write timer to complete`,
    `    EECON1bits.WREN = 0;    // Disable writes to prevent accidental corruption`,
    input.verifyAfterWrite
      ? `    return (EEPROM_ReadByte(addr) == data) && (EECON1bits.WRERR == 0);`
      : `    return (EECON1bits.WRERR == 0);`,
    `}`,
  ]
    .filter(Boolean)
    .join('\n');

  const xc8Code = [
    `// Microchip ${input.mcuFamily} Data EEPROM Driver (XC8)`,
    `// Target Address: ${addressHex} (${clampedAddr}), Data: ${dataHex} (${clampedData})`,
    `// Calculated EECON1 (Setup): ${eecon1PreTriggerHex} (${eecon1PreTriggerBin})`,
    `// Calculated EECON1 (Trigger): ${eecon1TriggerHex} (${eecon1TriggerBin}), EECON2 Unlock: 0x55 -> 0xAA`,
    `#include <xc.h>`,
    `#include <stdint.h>`,
    `#include <stdbool.h>`,
    ``,
    readFuncCode,
    ...(isWrite ? [``, writeFuncCode] : []),
    ``,
    `void EEPROM_ExampleUsage(void) {`,
    isWrite
      ? `    EEPROM_WriteByte(${addressHex}, ${dataHex}); // Write ${dataHex} to EEPROM[${addressHex}]`
      : `    uint8_t val = EEPROM_ReadByte(${addressHex}); // Read byte from EEPROM[${addressHex}]`,
    `}`,
  ].join('\n');

  return {
    mcuFamily: input.mcuFamily,
    operation: input.operation,
    memoryTarget: input.memoryTarget,
    address: clampedAddr,
    addressHex,
    dataByte: clampedData,
    dataHex,
    dataAscii,
    eecon1PreTrigger,
    eecon1PreTriggerHex,
    eecon1PreTriggerBin,
    eecon1Trigger,
    eecon1TriggerHex,
    eecon1TriggerBin,
    eecon2Step1Hex: isWrite ? '0x55' : 'N/A (Read Only)',
    eecon2Step2Hex: isWrite ? '0xAA' : 'N/A (Read Only)',
    eecon1Bits,
    estimatedCycleTimeUs,
    isValidAddress,
    isValid: isValidAddress,
    xc8Code,
  };
}

