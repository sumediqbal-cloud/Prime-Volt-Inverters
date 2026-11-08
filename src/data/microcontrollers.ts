export interface PinInfo {
  number: number;
  label: string;
  port?: string;
  type: 'power' | 'gpio' | 'analog' | 'osc' | 'reset' | 'comm' | 'pwm';
  alternateFunctions: string[];
  description: string;
}

export interface Microcontroller {
  id: string;
  name: string;
  family: 'PIC16' | 'PIC18' | 'PIC12' | 'AVR' | 'dsPIC';
  packageType: 'DIP-40' | 'DIP-28' | 'DIP-18' | 'DIP-8' | 'DIP-14';
  pinCount: number;
  flashKb: number;
  ramBytes: number;
  eepromBytes: number;
  maxFreqMhz: number;
  adcChannels: number;
  pwmChannels: number;
  timers: string;
  defaultFoscHz: number;
  compiler: string;
  descriptionUrdu: string;
  descriptionEn: string;
  configPragmas: string;
  headerInclude: string;
  pins: PinInfo[];
}

export const MICROCONTROLLERS: Microcontroller[] = [
  {
    id: 'pic16f877a',
    name: 'PIC16F877A',
    family: 'PIC16',
    packageType: 'DIP-40',
    pinCount: 40,
    flashKb: 14,
    ramBytes: 368,
    eepromBytes: 256,
    maxFreqMhz: 20,
    adcChannels: 8,
    pwmChannels: 2,
    timers: 'Timer0 (8-bit), Timer1 (16-bit), Timer2 (8-bit PWM)',
    defaultFoscHz: 20000000,
    compiler: 'MPLAB XC8',
    descriptionUrdu: 'Pakistan aur dunya bhar mein sab se zyada use hone wali 40-pin Microchip PIC IC. Is mein 5 ports (A, B, C, D, E), 8 ADC channels, 2 PWM aur USART mojud hain.',
    descriptionEn: 'The classic 40-pin 8-bit Microchip PIC microcontroller. Features 5 I/O ports, 8-channel 10-bit ADC, 2 CCP/PWM modules, and USART.',
    headerInclude: '#include <xc.h>',
    configPragmas: `// PIC16F877A Configuration Bit Settings
#pragma config FOSC = HS        // Oscillator Selection bits (HS oscillator)
#pragma config WDTE = OFF       // Watchdog Timer Enable bit (WDT disabled)
#pragma config PWRTE = ON       // Power-up Timer Enable bit (PWRT enabled)
#pragma config BOREN = ON       // Brown-out Reset Enable bit (BOR enabled)
#pragma config LVP = OFF        // Low-Voltage (Single-Supply) In-Circuit Serial Programming Enable bit (RB3 is digital I/O)
#pragma config CPD = OFF        // Data EEPROM Memory Code Protection bit (Data EEPROM not code-protected)
#pragma config WRT = OFF        // Flash Program Memory Write Enable bits (Write protection off)
#pragma config CP = OFF         // Flash Program Memory Code Protection bit (Code protection off)`,
    pins: [
      { number: 1, label: 'MCLR/VPP', type: 'reset', alternateFunctions: ['THV'], description: 'Master Clear (Reset) input or high-voltage programming input' },
      { number: 2, label: 'RA0/AN0', port: 'RA0', type: 'analog', alternateFunctions: ['AN0'], description: 'PORTA bit 0 or Analog Channel 0' },
      { number: 3, label: 'RA1/AN1', port: 'RA1', type: 'analog', alternateFunctions: ['AN1'], description: 'PORTA bit 1 or Analog Channel 1' },
      { number: 4, label: 'RA2/AN2', port: 'RA2', type: 'analog', alternateFunctions: ['AN2', 'VREF-'], description: 'PORTA bit 2 or Analog Channel 2 / Voltage Ref-' },
      { number: 5, label: 'RA3/AN3', port: 'RA3', type: 'analog', alternateFunctions: ['AN3', 'VREF+'], description: 'PORTA bit 3 or Analog Channel 3 / Voltage Ref+' },
      { number: 6, label: 'RA4/T0CKI', port: 'RA4', type: 'gpio', alternateFunctions: ['T0CKI'], description: 'PORTA bit 4 (Open Drain) or Timer0 clock input' },
      { number: 7, label: 'RA5/AN4', port: 'RA5', type: 'analog', alternateFunctions: ['AN4', 'SS'], description: 'PORTA bit 5 or Analog Channel 4 / SPI Slave Select' },
      { number: 8, label: 'RE0/AN5', port: 'RE0', type: 'analog', alternateFunctions: ['AN5', 'RD'], description: 'PORTE bit 0 or Analog Channel 5' },
      { number: 9, label: 'RE1/AN6', port: 'RE1', type: 'analog', alternateFunctions: ['AN6', 'WR'], description: 'PORTE bit 1 or Analog Channel 6' },
      { number: 10, label: 'RE2/AN7', port: 'RE2', type: 'analog', alternateFunctions: ['AN7', 'CS'], description: 'PORTE bit 2 or Analog Channel 7' },
      { number: 11, label: 'VDD (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Positive supply voltage (+5V DC)' },
      { number: 12, label: 'VSS (GND)', type: 'power', alternateFunctions: ['GND'], description: 'Ground reference (0V)' },
      { number: 13, label: 'OSC1/CLKI', type: 'osc', alternateFunctions: ['CLKI'], description: 'Crystal oscillator input / External clock source' },
      { number: 14, label: 'OSC2/CLKO', type: 'osc', alternateFunctions: ['CLKO'], description: 'Crystal oscillator output / Clock output' },
      { number: 15, label: 'RC0/T1OSO', port: 'RC0', type: 'gpio', alternateFunctions: ['T1OSO', 'T1CKI'], description: 'PORTC bit 0 or Timer1 oscillator output' },
      { number: 16, label: 'RC1/T1OSI', port: 'RC1', type: 'gpio', alternateFunctions: ['T1OSI', 'CCP2'], description: 'PORTC bit 1 or Timer1 oscillator input / CCP2' },
      { number: 17, label: 'RC2/CCP1', port: 'RC2', type: 'pwm', alternateFunctions: ['CCP1'], description: 'PORTC bit 2 or Capture/Compare/PWM 1 output' },
      { number: 18, label: 'RC3/SCK/SCL', port: 'RC3', type: 'comm', alternateFunctions: ['SCK', 'SCL'], description: 'PORTC bit 3 or SPI Clock / I2C Clock' },
      { number: 19, label: 'RD0/PSP0', port: 'RD0', type: 'gpio', alternateFunctions: ['PSP0'], description: 'PORTD bit 0 or Parallel Slave Port bit 0' },
      { number: 20, label: 'RD1/PSP1', port: 'RD1', type: 'gpio', alternateFunctions: ['PSP1'], description: 'PORTD bit 1 or Parallel Slave Port bit 1' },
      { number: 21, label: 'RD2/PSP2', port: 'RD2', type: 'gpio', alternateFunctions: ['PSP2'], description: 'PORTD bit 2 or Parallel Slave Port bit 2' },
      { number: 22, label: 'RD3/PSP3', port: 'RD3', type: 'gpio', alternateFunctions: ['PSP3'], description: 'PORTD bit 3 or Parallel Slave Port bit 3' },
      { number: 23, label: 'RC4/SDI/SDA', port: 'RC4', type: 'comm', alternateFunctions: ['SDI', 'SDA'], description: 'PORTC bit 4 or SPI Data In / I2C Data' },
      { number: 24, label: 'RC5/SDO', port: 'RC5', type: 'comm', alternateFunctions: ['SDO'], description: 'PORTC bit 5 or SPI Data Out' },
      { number: 25, label: 'RC6/TX/CK', port: 'RC6', type: 'comm', alternateFunctions: ['TX', 'CK'], description: 'PORTC bit 6 or USART Transmit (TX)' },
      { number: 26, label: 'RC7/RX/DT', port: 'RC7', type: 'comm', alternateFunctions: ['RX', 'DT'], description: 'PORTC bit 7 or USART Receive (RX)' },
      { number: 27, label: 'RD4/PSP4', port: 'RD4', type: 'gpio', alternateFunctions: ['PSP4'], description: 'PORTD bit 4 or Parallel Slave Port bit 4' },
      { number: 28, label: 'RD5/PSP5', port: 'RD5', type: 'gpio', alternateFunctions: ['PSP5'], description: 'PORTD bit 5 or Parallel Slave Port bit 5' },
      { number: 29, label: 'RD6/PSP6', port: 'RD6', type: 'gpio', alternateFunctions: ['PSP6'], description: 'PORTD bit 6 or Parallel Slave Port bit 6' },
      { number: 30, label: 'RD7/PSP7', port: 'RD7', type: 'gpio', alternateFunctions: ['PSP7'], description: 'PORTD bit 7 or Parallel Slave Port bit 7' },
      { number: 31, label: 'VSS (GND)', type: 'power', alternateFunctions: ['GND'], description: 'Ground reference (0V)' },
      { number: 32, label: 'VDD (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Positive supply voltage (+5V DC)' },
      { number: 33, label: 'RB0/INT', port: 'RB0', type: 'gpio', alternateFunctions: ['INT'], description: 'PORTB bit 0 or External Interrupt 0' },
      { number: 34, label: 'RB1', port: 'RB1', type: 'gpio', alternateFunctions: [], description: 'PORTB bit 1 Digital I/O' },
      { number: 35, label: 'RB2', port: 'RB2', type: 'gpio', alternateFunctions: [], description: 'PORTB bit 2 Digital I/O' },
      { number: 36, label: 'RB3/PGM', port: 'RB3', type: 'gpio', alternateFunctions: ['PGM'], description: 'PORTB bit 3 or Low Voltage ICSP Programming' },
      { number: 37, label: 'RB4', port: 'RB4', type: 'gpio', alternateFunctions: ['IOC'], description: 'PORTB bit 4 or Interrupt on Change' },
      { number: 38, label: 'RB5', port: 'RB5', type: 'gpio', alternateFunctions: ['IOC'], description: 'PORTB bit 5 or Interrupt on Change' },
      { number: 39, label: 'RB6/PGC', port: 'RB6', type: 'comm', alternateFunctions: ['PGC'], description: 'PORTB bit 6 or ICSP Clock line' },
      { number: 40, label: 'RB7/PGD', port: 'RB7', type: 'comm', alternateFunctions: ['PGD'], description: 'PORTB bit 7 or ICSP Data line' },
    ],
  },
  {
    id: 'pic18f4550',
    name: 'PIC18F4550',
    family: 'PIC18',
    packageType: 'DIP-40',
    pinCount: 40,
    flashKb: 32,
    ramBytes: 2048,
    eepromBytes: 256,
    maxFreqMhz: 48,
    adcChannels: 13,
    pwmChannels: 2,
    timers: 'Timer0 (16-bit), Timer1 (16-bit), Timer2 (8-bit PWM), Timer3 (16-bit)',
    defaultFoscHz: 48000000,
    compiler: 'MPLAB XC8',
    descriptionUrdu: 'High-performance 18F series IC jis mein Full-Speed USB 2.0 peripheral, 32KB Flash, 2KB RAM aur 48MHz internal PLL clock shamil hai.',
    descriptionEn: 'High-performance 8-bit MCU with Full-Speed USB 2.0, 32KB Flash, 2KB RAM, 13 ADC channels and 48MHz operation with internal PLL.',
    headerInclude: '#include <xc.h>',
    configPragmas: `// PIC18F4550 Configuration Bit Settings (for 20MHz crystal to 48MHz USB CPU)
#pragma config PLLDIV = 5       // Divide by 5 (20 MHz oscillator input)
#pragma config CPUDIV = OSC1_PLL2 // [OSC1/OSC2 Src: /1][96 MHz PLL Src: /2]
#pragma config USBDIV = 2       // USB clock source from 96MHz PLL / 2 = 48MHz
#pragma config FOSC = HSPLL_HS  // HS oscillator, PLL enabled (HSPLL)
#pragma config FCMEN = OFF      // Fail-Safe Clock Monitor disabled
#pragma config IESO = OFF       // Oscillator Switchover mode disabled
#pragma config PWRT = ON        // Power-up Timer enabled
#pragma config BOR = ON         // Brown-out Reset enabled
#pragma config WDT = OFF        // Watchdog Timer disabled
#pragma config MCLRE = ON       // MCLR pin enabled
#pragma config LVP = OFF        // Single-Supply ICSP disabled
#pragma config PBADEN = OFF     // PORTB<4:0> pins are configured as digital I/O on Reset`,
    pins: [
      { number: 1, label: 'MCLR/VPP/RE3', type: 'reset', alternateFunctions: ['RE3'], description: 'Master Reset or High Voltage Programming' },
      { number: 2, label: 'RA0/AN0', port: 'RA0', type: 'analog', alternateFunctions: ['AN0'], description: 'PORTA0 / Analog Channel 0' },
      { number: 3, label: 'RA1/AN1', port: 'RA1', type: 'analog', alternateFunctions: ['AN1'], description: 'PORTA1 / Analog Channel 1' },
      { number: 4, label: 'RA2/AN2/VREF-', port: 'RA2', type: 'analog', alternateFunctions: ['AN2'], description: 'PORTA2 / Analog 2' },
      { number: 5, label: 'RA3/AN3/VREF+', port: 'RA3', type: 'analog', alternateFunctions: ['AN3'], description: 'PORTA3 / Analog 3' },
      { number: 6, label: 'RA4/T0CKI', port: 'RA4', type: 'gpio', alternateFunctions: ['T0CKI'], description: 'PORTA4 Open-drain output / Timer0' },
      { number: 7, label: 'RA5/AN4', port: 'RA5', type: 'analog', alternateFunctions: ['AN4', 'SS'], description: 'PORTA5 / Analog 4 / SPI SS' },
      { number: 8, label: 'RE0/AN5', port: 'RE0', type: 'analog', alternateFunctions: ['AN5'], description: 'PORTE0 / Analog 5' },
      { number: 9, label: 'RE1/AN6', port: 'RE1', type: 'analog', alternateFunctions: ['AN6'], description: 'PORTE1 / Analog 6' },
      { number: 10, label: 'RE2/AN7', port: 'RE2', type: 'analog', alternateFunctions: ['AN7'], description: 'PORTE2 / Analog 7' },
      { number: 11, label: 'VDD (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Positive supply voltage' },
      { number: 12, label: 'VSS (GND)', type: 'power', alternateFunctions: ['GND'], description: 'Ground' },
      { number: 13, label: 'OSC1/CLKI', type: 'osc', alternateFunctions: ['CLKI'], description: 'Oscillator crystal input' },
      { number: 14, label: 'OSC2/CLKO', type: 'osc', alternateFunctions: ['CLKO'], description: 'Oscillator crystal output' },
      { number: 15, label: 'RC0/T1OSO', port: 'RC0', type: 'gpio', alternateFunctions: ['T1OSO'], description: 'PORTC0' },
      { number: 16, label: 'RC1/T1OSI/CCP2', port: 'RC1', type: 'pwm', alternateFunctions: ['CCP2'], description: 'PORTC1 / PWM2' },
      { number: 17, label: 'RC2/CCP1', port: 'RC2', type: 'pwm', alternateFunctions: ['CCP1'], description: 'PORTC2 / PWM1' },
      { number: 18, label: 'VUSB', type: 'power', alternateFunctions: ['3.3V'], description: 'Internal USB 3.3V regulator capacitor pin' },
      { number: 19, label: 'RD0/SPP0', port: 'RD0', type: 'gpio', alternateFunctions: [], description: 'PORTD0' },
      { number: 20, label: 'RD1/SPP1', port: 'RD1', type: 'gpio', alternateFunctions: [], description: 'PORTD1' },
      { number: 21, label: 'RD2/SPP2', port: 'RD2', type: 'gpio', alternateFunctions: [], description: 'PORTD2' },
      { number: 22, label: 'RD3/SPP3', port: 'RD3', type: 'gpio', alternateFunctions: [], description: 'PORTD3' },
      { number: 23, label: 'RC4/D-', port: 'RC4', type: 'comm', alternateFunctions: ['USB D-'], description: 'PORTC4 or USB Data Minus (D-)' },
      { number: 24, label: 'RC5/D+', port: 'RC5', type: 'comm', alternateFunctions: ['USB D+'], description: 'PORTC5 or USB Data Plus (D+)' },
      { number: 25, label: 'RC6/TX/CK', port: 'RC6', type: 'comm', alternateFunctions: ['TX'], description: 'USART Transmit' },
      { number: 26, label: 'RC7/RX/DT', port: 'RC7', type: 'comm', alternateFunctions: ['RX'], description: 'USART Receive' },
      { number: 27, label: 'RD4/SPP4', port: 'RD4', type: 'gpio', alternateFunctions: [], description: 'PORTD4' },
      { number: 28, label: 'RD5/SPP5', port: 'RD5', type: 'gpio', alternateFunctions: [], description: 'PORTD5' },
      { number: 29, label: 'RD6/SPP6', port: 'RD6', type: 'gpio', alternateFunctions: [], description: 'PORTD6' },
      { number: 30, label: 'RD7/SPP7', port: 'RD7', type: 'gpio', alternateFunctions: [], description: 'PORTD7' },
      { number: 31, label: 'VSS (GND)', type: 'power', alternateFunctions: ['GND'], description: 'Ground' },
      { number: 32, label: 'VDD (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Supply +5V' },
      { number: 33, label: 'RB0/INT0', port: 'RB0', type: 'gpio', alternateFunctions: ['INT0', 'AN12'], description: 'PORTB0 / External Interrupt 0' },
      { number: 34, label: 'RB1/INT1', port: 'RB1', type: 'gpio', alternateFunctions: ['INT1', 'AN10'], description: 'PORTB1 / External Interrupt 1' },
      { number: 35, label: 'RB2/INT2', port: 'RB2', type: 'gpio', alternateFunctions: ['INT2', 'AN8'], description: 'PORTB2 / External Interrupt 2' },
      { number: 36, label: 'RB3', port: 'RB3', type: 'gpio', alternateFunctions: ['AN9'], description: 'PORTB3' },
      { number: 37, label: 'RB4', port: 'RB4', type: 'gpio', alternateFunctions: ['AN11'], description: 'PORTB4' },
      { number: 38, label: 'RB5', port: 'RB5', type: 'gpio', alternateFunctions: ['PGM'], description: 'PORTB5' },
      { number: 39, label: 'RB6/PGC', port: 'RB6', type: 'comm', alternateFunctions: ['PGC'], description: 'ICSP Clock' },
      { number: 40, label: 'RB7/PGD', port: 'RB7', type: 'comm', alternateFunctions: ['PGD'], description: 'ICSP Data' },
    ],
  },
  {
    id: 'pic12f675',
    name: 'PIC12F675',
    family: 'PIC12',
    packageType: 'DIP-8',
    pinCount: 8,
    flashKb: 1.75,
    ramBytes: 64,
    eepromBytes: 128,
    maxFreqMhz: 20,
    adcChannels: 4,
    pwmChannels: 0,
    timers: 'Timer0 (8-bit), Timer1 (16-bit)',
    defaultFoscHz: 4000000,
    compiler: 'MPLAB XC8',
    descriptionUrdu: 'Bohat mashhoor choti 8-pin Microchip IC. Is mein internal 4MHz oscillator, 4 ADC channels aur analog comparator mojud hai. Chotay projects aur relays k lye behtareen.',
    descriptionEn: 'Popular ultra-compact 8-pin Microchip microcontroller with internal 4MHz oscillator, 4-channel 10-bit ADC, and 1 comparator.',
    headerInclude: '#include <xc.h>',
    configPragmas: `// PIC12F675 Configuration Bit Settings
#pragma config FOSC = INTRCIO   // Oscillator Selection bits (Internal oscillator: GPIO on GP4/GP5)
#pragma config WDTE = OFF       // Watchdog Timer Enable bit (WDT disabled)
#pragma config PWRTE = ON       // Power-up Timer Enable bit (PWRT enabled)
#pragma config MCLRE = OFF      // GP3/MCLR pin function select (GP3 is digital input)
#pragma config BOREN = ON       // Brown-out Detect Enable bit (BOD enabled)
#pragma config CP = OFF         // Code Protection bit (Program Memory code protection disabled)
#pragma config CPD = OFF        // Data Code Protection bit (Data EEPROM code protection disabled)`,
    pins: [
      { number: 1, label: 'VDD (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Positive supply voltage' },
      { number: 2, label: 'GP5/OSC1', port: 'GP5', type: 'gpio', alternateFunctions: ['T1CKI'], description: 'General Purpose I/O 5 or Timer1 Clock' },
      { number: 3, label: 'GP4/OSC2/AN3', port: 'GP4', type: 'analog', alternateFunctions: ['AN3', 'CLKOUT'], description: 'GP4 or ADC Channel 3' },
      { number: 4, label: 'GP3/MCLR/VPP', port: 'GP3', type: 'reset', alternateFunctions: ['MCLR'], description: 'GP3 (Input Only) or Master Reset / VPP' },
      { number: 5, label: 'GP2/AN2/INT', port: 'GP2', type: 'analog', alternateFunctions: ['AN2', 'INT'], description: 'GP2 or ADC Channel 2 / External Interrupt' },
      { number: 6, label: 'GP1/AN1/PGC', port: 'GP1', type: 'analog', alternateFunctions: ['AN1', 'PGC'], description: 'GP1 or ADC Channel 1 / ICSP Clock' },
      { number: 7, label: 'GP0/AN0/PGD', port: 'GP0', type: 'analog', alternateFunctions: ['AN0', 'PGD'], description: 'GP0 or ADC Channel 0 / ICSP Data' },
      { number: 8, label: 'VSS (GND)', type: 'power', alternateFunctions: ['GND'], description: 'Ground' },
    ],
  },
  {
    id: 'pic16f628a',
    name: 'PIC16F628A',
    family: 'PIC16',
    packageType: 'DIP-18',
    pinCount: 18,
    flashKb: 3.5,
    ramBytes: 224,
    eepromBytes: 128,
    maxFreqMhz: 20,
    adcChannels: 0,
    pwmChannels: 1,
    timers: 'Timer0 (8-bit), Timer1 (16-bit), Timer2 (8-bit PWM)',
    defaultFoscHz: 4000000,
    compiler: 'MPLAB XC8',
    descriptionUrdu: '18-pin DIP package IC jis mein internal 4MHz oscillator, USART serial port aur 1 hardware PWM module hai. PIC16F84A ka direct modern upgrade.',
    descriptionEn: 'The direct modern replacement for PIC16F84A. Features internal 4MHz/48kHz oscillator, hardware USART, 1 CCP/PWM module, and 3 Timers.',
    headerInclude: '#include <xc.h>',
    configPragmas: `// PIC16F628A Configuration Bit Settings
#pragma config FOSC = INTOSCIO  // Internal oscillator: I/O function on RA6/RA7
#pragma config WDTE = OFF       // Watchdog Timer disabled
#pragma config PWRTE = ON       // Power-up Timer enabled
#pragma config MCLRE = ON       // RA5/MCLR pin function is MCLR
#pragma config BOREN = ON       // Brown-out Reset enabled
#pragma config LVP = OFF        // Low-Voltage ICSP disabled
#pragma config CPD = OFF        // Data EEPROM code protection off
#pragma config CP = OFF         // Flash Program code protection off`,
    pins: [
      { number: 1, label: 'RA2/AN2/VREF', port: 'RA2', type: 'analog', alternateFunctions: ['VREF'], description: 'PORTA bit 2 / Voltage Reference' },
      { number: 2, label: 'RA3/AN3/CMP1', port: 'RA3', type: 'analog', alternateFunctions: ['CMP1'], description: 'PORTA bit 3 / Comparator 1 output' },
      { number: 3, label: 'RA4/T0CKI/CMP2', port: 'RA4', type: 'gpio', alternateFunctions: ['T0CKI'], description: 'PORTA bit 4 (Open Drain)' },
      { number: 4, label: 'RA5/MCLR', port: 'RA5', type: 'reset', alternateFunctions: ['VPP'], description: 'Master Reset (MCLR) or RA5 input' },
      { number: 5, label: 'VSS (GND)', type: 'power', alternateFunctions: ['GND'], description: 'Ground' },
      { number: 6, label: 'RB0/INT', port: 'RB0', type: 'gpio', alternateFunctions: ['INT'], description: 'PORTB bit 0 / External Interrupt' },
      { number: 7, label: 'RB1/RX/DT', port: 'RB1', type: 'comm', alternateFunctions: ['RX'], description: 'PORTB bit 1 / USART Receive' },
      { number: 8, label: 'RB2/TX/CK', port: 'RB2', type: 'comm', alternateFunctions: ['TX'], description: 'PORTB bit 2 / USART Transmit' },
      { number: 9, label: 'RB3/CCP1', port: 'RB3', type: 'pwm', alternateFunctions: ['CCP1'], description: 'PORTB bit 3 / Hardware PWM output' },
      { number: 10, label: 'RB4/PGM', port: 'RB4', type: 'gpio', alternateFunctions: [], description: 'PORTB bit 4' },
      { number: 11, label: 'RB5', port: 'RB5', type: 'gpio', alternateFunctions: [], description: 'PORTB bit 5' },
      { number: 12, label: 'RB6/PGC', port: 'RB6', type: 'comm', alternateFunctions: ['PGC'], description: 'PORTB bit 6 / ICSP Clock' },
      { number: 13, label: 'RB7/PGD', port: 'RB7', type: 'comm', alternateFunctions: ['PGD'], description: 'PORTB bit 7 / ICSP Data' },
      { number: 14, label: 'VDD (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Supply +5V' },
      { number: 15, label: 'OSC2/RA6', port: 'RA6', type: 'osc', alternateFunctions: ['CLKO'], description: 'Oscillator 2 or RA6 I/O' },
      { number: 16, label: 'OSC1/RA7', port: 'RA7', type: 'osc', alternateFunctions: ['CLKI'], description: 'Oscillator 1 or RA7 I/O' },
      { number: 17, label: 'RA0/AN0', port: 'RA0', type: 'analog', alternateFunctions: [], description: 'PORTA bit 0' },
      { number: 18, label: 'RA1/AN1', port: 'RA1', type: 'analog', alternateFunctions: [], description: 'PORTA bit 1' },
    ],
  },
  {
    id: 'atmega328p',
    name: 'ATmega328P (Microchip AVR)',
    family: 'AVR',
    packageType: 'DIP-28',
    pinCount: 28,
    flashKb: 32,
    ramBytes: 2048,
    eepromBytes: 1024,
    maxFreqMhz: 20,
    adcChannels: 6,
    pwmChannels: 6,
    timers: 'Timer0 (8-bit PWM), Timer1 (16-bit PWM), Timer2 (8-bit RTC/PWM)',
    defaultFoscHz: 16000000,
    compiler: 'Microchip Studio (AVR-GCC) / Arduino',
    descriptionUrdu: 'Microchip AVR family ki mashhoor tareen 28-pin IC jo Arduino Uno ka brain hai. 32KB Flash, 6 PWM, 6 ADC channels aur SPI/I2C/USART supported.',
    descriptionEn: 'The world-famous 28-pin AVR microcontroller by Microchip, core of Arduino Uno. 32KB Flash, 6 hardware PWM, 6-channel 10-bit ADC, SPI, I2C, and USART.',
    headerInclude: '#include <avr/io.h>\n#include <util/delay.h>',
    configPragmas: `// AVR Fuse Settings (Typically 16MHz External Crystal)
// Low Fuse: 0xFF (Ext Crystal 16MHz)
// High Fuse: 0xDE (SPI en, Boot size 512 words)
// Extended Fuse: 0xFD (BOD 2.7V)`,
    pins: [
      { number: 1, label: 'PC6 (RESET)', port: 'PC6', type: 'reset', alternateFunctions: ['RESET'], description: 'Reset pin (Active Low)' },
      { number: 2, label: 'PD0 (RXD)', port: 'PD0', type: 'comm', alternateFunctions: ['RXD'], description: 'USART Receive' },
      { number: 3, label: 'PD1 (TXD)', port: 'PD1', type: 'comm', alternateFunctions: ['TXD'], description: 'USART Transmit' },
      { number: 4, label: 'PD2 (INT0)', port: 'PD2', type: 'gpio', alternateFunctions: ['INT0'], description: 'External Interrupt 0' },
      { number: 5, label: 'PD3 (INT1/OC2B)', port: 'PD3', type: 'pwm', alternateFunctions: ['INT1', 'PWM'], description: 'External Interrupt 1 or Timer2 PWM B' },
      { number: 6, label: 'PD4 (T0/XCK)', port: 'PD4', type: 'gpio', alternateFunctions: ['T0'], description: 'Timer0 external clock' },
      { number: 7, label: 'VCC (+5V)', type: 'power', alternateFunctions: ['+5V'], description: 'Positive supply voltage' },
      { number: 8, label: 'GND', type: 'power', alternateFunctions: ['GND'], description: 'Ground' },
      { number: 9, label: 'PB6 (XTAL1)', port: 'PB6', type: 'osc', alternateFunctions: ['TOSC1'], description: 'Crystal oscillator pin 1' },
      { number: 10, label: 'PB7 (XTAL2)', port: 'PB7', type: 'osc', alternateFunctions: ['TOSC2'], description: 'Crystal oscillator pin 2' },
      { number: 11, label: 'PD5 (OC0B/T1)', port: 'PD5', type: 'pwm', alternateFunctions: ['PWM'], description: 'Timer0 PWM B' },
      { number: 12, label: 'PD6 (OC0A/AIN0)', port: 'PD6', type: 'pwm', alternateFunctions: ['PWM'], description: 'Timer0 PWM A' },
      { number: 13, label: 'PD7 (AIN1)', port: 'PD7', type: 'gpio', alternateFunctions: ['AIN1'], description: 'Analog Comparator negative input' },
      { number: 14, label: 'PB0 (ICP1)', port: 'PB0', type: 'gpio', alternateFunctions: ['ICP1'], description: 'Timer1 input capture' },
      { number: 15, label: 'PB1 (OC1A)', port: 'PB1', type: 'pwm', alternateFunctions: ['PWM'], description: 'Timer1 PWM A (16-bit)' },
      { number: 16, label: 'PB2 (OC1B/SS)', port: 'PB2', type: 'pwm', alternateFunctions: ['PWM', 'SS'], description: 'Timer1 PWM B / SPI Slave Select' },
      { number: 17, label: 'PB3 (MOSI/OC2A)', port: 'PB3', type: 'comm', alternateFunctions: ['MOSI', 'PWM'], description: 'SPI Master Out Slave In / Timer2 PWM A' },
      { number: 18, label: 'PB4 (MISO)', port: 'PB4', type: 'comm', alternateFunctions: ['MISO'], description: 'SPI Master In Slave Out' },
      { number: 19, label: 'PB5 (SCK)', port: 'PB5', type: 'comm', alternateFunctions: ['SCK'], description: 'SPI Clock / Built-in LED on Arduino Uno' },
      { number: 20, label: 'AVCC', type: 'power', alternateFunctions: ['+5V'], description: 'Analog Supply Voltage (connect to +5V with LC filter)' },
      { number: 21, label: 'AREF', type: 'power', alternateFunctions: ['VREF'], description: 'Analog Reference Pin' },
      { number: 22, label: 'GND', type: 'power', alternateFunctions: ['GND'], description: 'Ground' },
      { number: 23, label: 'PC0 (ADC0)', port: 'PC0', type: 'analog', alternateFunctions: ['ADC0'], description: 'ADC Channel 0' },
      { number: 24, label: 'PC1 (ADC1)', port: 'PC1', type: 'analog', alternateFunctions: ['ADC1'], description: 'ADC Channel 1' },
      { number: 25, label: 'PC2 (ADC2)', port: 'PC2', type: 'analog', alternateFunctions: ['ADC2'], description: 'ADC Channel 2' },
      { number: 26, label: 'PC3 (ADC3)', port: 'PC3', type: 'analog', alternateFunctions: ['ADC3'], description: 'ADC Channel 3' },
      { number: 27, label: 'PC4 (ADC4/SDA)', port: 'PC4', type: 'comm', alternateFunctions: ['ADC4', 'SDA'], description: 'ADC Channel 4 or I2C Data line (SDA)' },
      { number: 28, label: 'PC5 (ADC5/SCL)', port: 'PC5', type: 'comm', alternateFunctions: ['ADC5', 'SCL'], description: 'ADC Channel 5 or I2C Clock line (SCL)' },
    ],
  },
];
