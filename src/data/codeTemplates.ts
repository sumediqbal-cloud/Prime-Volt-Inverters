export interface CodeTemplate {
  id: string;
  title: string;
  titleUrdu: string;
  category: 'gpio' | 'adc' | 'pwm' | 'uart' | 'display' | 'timers' | 'sensors' | 'interrupts';
  supportedMcus: string[];
  summaryUrdu: string;
  summaryEn: string;
  wiringUrdu: string[];
  wiringEn: string[];
  generateCode: (mcuId: string, foscHz: number, lang: 'urdu' | 'en') => string;
}

export const CODE_TEMPLATES: CodeTemplate[] = [
  {
    id: 'blink_led',
    title: 'LED Blink & Chaser (GPIO Output)',
    titleUrdu: 'LED Blink aur Running Sequence (GPIO Output)',
    category: 'gpio',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'pic12f675', 'pic16f628a', 'atmega328p'],
    summaryUrdu: 'PORT aur TRIS registers ka bunyadi istemal. LED ko on/off aur delay functions k sath blink krna.',
    summaryEn: 'Fundamental GPIO configuration using TRIS and PORT/LAT registers with non-blocking or __delay_ms routines.',
    wiringUrdu: [
      'LED Anode (+) pin ko 330Ω ya 470Ω resistor k zariye PORTB pin (RB0) se jorein.',
      'LED Cathode (-) pin ko Circuit GND (0V) se jorein.',
      'PIC MCU pin 1 (MCLR) ko 10kΩ resistor se +5V (VDD) pull-up lazmi karein.',
      'OSC1 aur OSC2 pins k darmyan 20MHz crystal aur do 22pF ceramic capacitors GND k sath lagayein.',
    ],
    wiringEn: [
      'Connect LED Anode (+) through a 330Ω current limiting resistor to RB0.',
      'Connect LED Cathode (-) directly to Ground (VSS).',
      'Pull up pin 1 (MCLR) to +5V using a 10kΩ resistor.',
      'Connect 20MHz crystal across OSC1 and OSC2 with two 22pF load capacitors to GND.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      if (mcuId === 'pic12f675') {
        return `/*
 * Project: PIC12F675 LED Blink Example
 * Compiler: Microchip MPLAB XC8
 * Clock: ${(foscHz / 1e6).toFixed(1)} MHz Internal Oscillator
 * 
 * ${isUrdu ? 'Wazahut: GP0 pin ko output bana kr LED blink ki ja rahi hai.' : 'Description: Toggling GP0 output to blink an LED with __delay_ms().'}
 */

#include <xc.h>

// Configuration Bits
#pragma config FOSC = INTRCIO   // Internal Oscillator
#pragma config WDTE = OFF       // Watchdog Timer Disabled
#pragma config PWRTE = ON       // Power-up Timer Enabled
#pragma config MCLRE = OFF      // GP3/MCLR is Digital Input
#pragma config BOREN = ON       // Brown-out Reset Enabled
#pragma config CP = OFF         // Code Protection Disabled

#define _XTAL_FREQ ${foscHz}     // Microchip delay macro clock frequency

void main(void) {
    // ${isUrdu ? 'ANSEL: Tamam pins ko digital banayein (Analog disable)' : 'ANSEL: Configure all pins as digital I/O'}
    ANSEL = 0x00;
    
    // ${isUrdu ? 'CMCON: Analog Comparator ko turn off karein' : 'CMCON: Turn off comparator'}
    CMCON = 0x07;
    
    // ${isUrdu ? 'TRISIO: 0 = Output, 1 = Input (GP0 ko output banaya)' : 'TRISIO: Set GP0 as output (0=Output, 1=Input)'}
    TRISIObits.TRISIO0 = 0;
    
    // ${isUrdu ? 'Shuru mein LED OFF rakhein' : 'Initial state: LED OFF'}
    GPIObits.GP0 = 0;

    while(1) {
        GPIObits.GP0 = 1;        // ${isUrdu ? 'LED ON karein' : 'Turn LED ON'}
        __delay_ms(500);         // 500ms Delay
        GPIObits.GP0 = 0;        // ${isUrdu ? 'LED OFF karein' : 'Turn LED OFF'}
        __delay_ms(500);         // 500ms Delay
    }
}`;
      }

      if (mcuId === 'atmega328p') {
        return `/*
 * Project: ATmega328P LED Blink (Microchip AVR)
 * Toolchain: Microchip Studio / AVR-GCC
 * Clock: ${(foscHz / 1e6).toFixed(1)} MHz External Crystal
 */

#define F_CPU ${foscHz}UL
#include <avr/io.h>
#include <util/delay.h>

int main(void) {
    // ${isUrdu ? 'DDRB: Data Direction Register (PB5 pin ko output banayein)' : 'DDRB: Set PB5 (Pin 13 on Arduino) as output'}
    DDRB |= (1 << DDB5);

    while (1) {
        PORTB ^= (1 << PORTB5); // ${isUrdu ? 'XOR se LED toggle karein' : 'Toggle LED state using XOR'}
        _delay_ms(500);         // 500ms delay
    }

    return 0;
}`;
      }

      // Default PIC16 / PIC18
      const isPic18 = mcuId.startsWith('pic18');
      return `/*
 * =========================================================================
 * Project: ${mcuId.toUpperCase()} LED Blink & 8-Bit Chaser
 * Compiler: Microchip MPLAB XC8
 * Target Clock: ${(foscHz / 1e6).toFixed(1)} MHz
 * =========================================================================
 * ${isUrdu ? 'Mulaheza: TRISB register direction set krta hai (0=Output, 1=Input).' : 'Note: TRIS registers set direction (0=Output, 1=Input).'}
 * ${isPic18 ? (isUrdu ? 'PIC18 mein outputs likhne k lye LAT register istemal karein (Read-Modify-Write se bachne k lye).' : 'In PIC18, use LAT registers for output writes to avoid Read-Modify-Write.') : ''}
 */

#include <xc.h>

// Configuration Bits
#pragma config FOSC = ${isPic18 ? 'HSPLL_HS' : 'HS'}       // High-Speed Crystal Oscillator
#pragma config WDTE = OFF      // Watchdog Timer Disabled
#pragma config PWRTE = ON      // Power-up Timer Enabled
#pragma config BOREN = ON      // Brown-out Reset Enabled
#pragma config LVP = OFF       // Low Voltage Programming Disabled

#define _XTAL_FREQ ${foscHz}    // Required for __delay_ms()

#define LED_PIN  ${isPic18 ? 'LATBbits.LATB0' : 'PORTBbits.RB0'}

void main(void) {
    ${isPic18 ? '// Disable analog on PORTB (PIC18 feature)\n    ADCON1 = 0x0F;' : '// Configure ADCON1 for digital I/O\n    ADCON1 = 0x06;'}
    
    // ${isUrdu ? 'TRISB: Tamam PORTB pins (RB0-RB7) ko OUTPUT banayein (0x00)' : 'TRISB: Set all PORTB pins as OUTPUT (0x00)'}
    TRISB = 0x00;
    
    // ${isUrdu ? 'Tamam pins ko LOW (0) se shuru karein' : 'Initialize all outputs to LOW'}
    ${isPic18 ? 'LATB = 0x00;' : 'PORTB = 0x00;'}

    while(1) {
        // --- Single LED Blink on RB0 ---
        LED_PIN = 1;             // ${isUrdu ? 'RB0 HIGH (LED ON)' : 'Turn RB0 HIGH'}
        __delay_ms(250);
        LED_PIN = 0;             // ${isUrdu ? 'RB0 LOW (LED OFF)' : 'Turn RB0 LOW'}
        __delay_ms(250);

        // --- 8-Bit LED Running Chaser (Knight Rider Effect) ---
        for (int i = 0; i < 8; i++) {
            ${isPic18 ? 'LATB' : 'PORTB'} = (1 << i); // ${isUrdu ? 'Aik waqt mein aik LED on' : 'Shift 1 bit across PORTB'}
            __delay_ms(80);
        }
        for (int i = 6; i > 0; i--) {
            ${isPic18 ? 'LATB' : 'PORTB'} = (1 << i); // ${isUrdu ? 'Wapis reverse direction mein shift' : 'Reverse shift'}
            __delay_ms(80);
        }
    }
}`;
    },
  },
  {
    id: 'push_button_debounce',
    title: 'Push Button Input with Debouncing',
    titleUrdu: 'Push Button Input aur Software Debouncing',
    category: 'gpio',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'pic16f628a', 'pic12f675', 'atmega328p'],
    summaryUrdu: 'Button press detect krna aur mechanical contacts ki bouncing ko 20ms delay se filter kr k toggle krna.',
    summaryEn: 'Clean digital input reading with 20ms state-change debounce routine to toggle an output actuator.',
    wiringUrdu: [
      'Button ka aik terminal RB1 pin se aur doosra GND se jorein (Active-Low).',
      'RB1 pin ko 10kΩ pull-up resistor k zariye +5V se jorein (ya internal pull-ups on karein).',
      'Output LED RB0 pin pe 330Ω resistor k sath lagayein.',
    ],
    wiringEn: [
      'Connect one terminal of push button to RB1, other to GND (Active-Low logic).',
      'Add a 10kΩ pull-up resistor from RB1 to +5V VDD.',
      'Connect indicator LED to RB0 with a 330Ω resistor to GND.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      const isPic18 = mcuId.startsWith('pic18');
      return `/*
 * Project: ${mcuId.toUpperCase()} Push Button with Software Debounce
 * Compiler: Microchip MPLAB XC8
 * 
 * ${isUrdu ? 'Kese Kaam Krta Hai: Button dabane se RB1 LOW hota hai. 20ms debounce delay mechanical chatter ko khatam krta hai.' : 'Operation: Detects active-low button press on RB1 with 20ms debounce to toggle RB0 LED.'}
 */

#include <xc.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

#define BUTTON_PIN   PORTBbits.RB1
#define LED_PIN      ${isPic18 ? 'LATBbits.LATB0' : 'PORTBbits.RB0'}

void main(void) {
    ${isPic18 ? 'ADCON1 = 0x0F;' : 'ADCON1 = 0x06;'} // ${isUrdu ? 'Digital mode enable' : 'Enable digital I/O'}
    
    // ${isUrdu ? 'TRIS: RB0 ko Output (0) aur RB1 ko Input (1) banayein' : 'TRIS: RB0 as Output (0), RB1 as Input (1)'}
    TRISBbits.TRISB0 = 0; // LED Output
    TRISBbits.TRISB1 = 1; // Button Input
    
    // ${isUrdu ? 'OPTION_REG: PORTB Internal Pull-ups enable karein (nRBPU = 0)' : 'Enable internal pull-ups on PORTB'}
    OPTION_REGbits.nRBPU = 0;
    
    LED_PIN = 0; // Initial state

    while(1) {
        // ${isUrdu ? 'Active-Low check: Agar button press hua ho (pin == 0)' : 'Check if button pressed (Active-Low)'}
        if (BUTTON_PIN == 0) {
            __delay_ms(20); // ${isUrdu ? 'Debounce delay (mechanical noise filter)' : 'Debounce delay to filter chatter'}
            
            if (BUTTON_PIN == 0) {
                // ${isUrdu ? 'Confirm button press, state toggle karein' : 'Button is stably pressed, toggle output'}
                LED_PIN = !LED_PIN;
                
                // ${isUrdu ? 'Button release hone ka intezar karein' : 'Wait until button is released'}
                while (BUTTON_PIN == 0);
                __delay_ms(20); // Release debounce
            }
        }
    }
}`;
    },
  },
  {
    id: 'adc_lm35',
    title: '10-Bit ADC & Analog Sensor (LM35 / Potentiometer)',
    titleUrdu: '10-Bit ADC aur Analog Sensor (LM35 Temperature / Pot)',
    category: 'adc',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'pic12f675'],
    summaryUrdu: 'Analog-to-Digital Converter (ADC) se voltage read krna aur usay Temperature (°C) ya Millivolts mein tabdeel krna.',
    summaryEn: 'Configuring ADCON0 and ADCON1 registers, channel acquisition time, reading 10-bit results (ADRESH:ADRESL), and temperature scaling.',
    wiringUrdu: [
      'LM35 Pin 1 (Vs) ko +5V se jorein.',
      'LM35 Pin 2 (Vout) ko PIC pin 2 (RA0 / AN0) se jorein.',
      'LM35 Pin 3 (GND) ko Circuit GND se jorein.',
      'Analog noise se bachne k lye LM35 Vout aur GND k darmyan 100nF capacitor lagayein.',
    ],
    wiringEn: [
      'Connect LM35 Pin 1 (Vs) to +5V DC.',
      'Connect LM35 Pin 2 (Vout) to RA0 / AN0 pin on PIC.',
      'Connect LM35 Pin 3 (GND) to Circuit GND.',
      'Place a 100nF decoupling capacitor across LM35 Vout and GND for noise reduction.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      const isPic18 = mcuId.startsWith('pic18');
      return `/*
 * Project: ${mcuId.toUpperCase()} 10-Bit ADC Reader
 * Target: AN0 (RA0 pin)
 * Formula: Voltage (mV) = (ADC_Value * 5000.0) / 1024.0
 * LM35 Temp: 10mV = 1°C => Temp (°C) = Voltage(mV) / 10.0
 */

#include <xc.h>
#include <stdio.h>

#pragma config FOSC = ${isPic18 ? 'HSPLL_HS' : 'HS'}
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

void ADC_Init(void) {
    // ${isUrdu ? 'TRISA0 ko INPUT (1) banayein' : 'Configure RA0/AN0 as Analog Input'}
    TRISAbits.TRISA0 = 1;
    
    ${isPic18 ? `// PIC18 ADC Configuration
    ADCON1 = 0x0E; // AN0 as Analog, others Digital, VREF = VDD/VSS
    ADCON2 = 0x8A; // Right justified, 2 TAD acquisition, Fosc/32 conversion clock` : `// PIC16 ADC Configuration
    ADCON1 = 0x8E; // Right justified result, AN0 analog, VDD/VSS reference
    ADCON0 = 0x41; // ADC Clock = Fosc/8, Channel 0 selected (AN0), ADC ON`}
}

unsigned int ADC_Read(unsigned char channel) {
    ${isPic18 ? `ADCON0bits.CHS = channel; // Select channel` : `ADCON0 = (channel << 3) | 0x41; // Select channel and keep ADC ON`}
    
    __delay_us(30); // ${isUrdu ? 'Acquisition time (sampling capacitor charge hone k lye)' : 'Acquisition time for sample capacitor to charge'}
    
    ${isPic18 ? 'ADCON0bits.GO = 1;' : 'ADCON0bits.GO_nDONE = 1;'} // ${isUrdu ? 'Conversion shuru karein' : 'Start conversion'}
    
    // ${isUrdu ? 'Conversion mukammal hone ka intezar karein' : 'Wait until conversion is complete'}
    while (${isPic18 ? 'ADCON0bits.GO' : 'ADCON0bits.GO_nDONE'});
    
    // ${isUrdu ? '10-bit result return karein (High byte << 8 + Low byte)' : 'Return 10-bit result from ADRESH and ADRESL'}
    return ((ADRESH << 8) + ADRESL);
}

void main(void) {
    unsigned int adcRaw = 0;
    float milliVolts = 0.0;
    float tempCelsius = 0.0;

    ADC_Init();

    while(1) {
        adcRaw = ADC_Read(0); // ${isUrdu ? 'AN0 channel 0 read karein' : 'Read channel 0 (RA0)'}
        
        // ${isUrdu ? 'Voltage calculate karein (5000mV / 1024 steps)' : 'Calculate voltage in mV'}
        milliVolts = (adcRaw * 5000.0) / 1024.0;
        
        // ${isUrdu ? 'LM35: Har 10mV pe 1 degree Celsius' : 'LM35: 10mV per degree Celsius'}
        tempCelsius = milliVolts / 10.0;
        
        __delay_ms(500); // Sample rate 2Hz
    }
}`;
    },
  },
  {
    id: 'uart_serial',
    title: 'UART Serial Communication (TX/RX @ 9600 bps)',
    titleUrdu: 'UART Serial Communication (PC/Bluetooth Interfacing)',
    category: 'uart',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'pic16f628a', 'atmega328p'],
    summaryUrdu: 'Hardware USART module se PC (Serial Monitor) ya Bluetooth (HC-05) k sath data send aur receive krna.',
    summaryEn: 'Complete hardware USART driver for bidirectional serial communication with string transmission and receive routines.',
    wiringUrdu: [
      'PIC TX Pin (RC6) ko USB-TTL Converter / Bluetooth Module RX Pin se jorein.',
      'PIC RX Pin (RC7) ko USB-TTL Converter / Bluetooth Module TX Pin se jorein.',
      'GND ko USB-TTL converter k GND se lazmi common karein.',
    ],
    wiringEn: [
      'Connect PIC TX pin (RC6) to USB-to-UART / HC-05 RX pin.',
      'Connect PIC RX pin (RC7) to USB-to-UART / HC-05 TX pin.',
      'Ensure common GND between PIC board and USB converter.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      const spbrgVal = Math.round(foscHz / (16 * 9600)) - 1;
      return `/*
 * Project: ${mcuId.toUpperCase()} Hardware USART Driver
 * Baud Rate: 9600 bps (BRGH = 1)
 * Clock: ${(foscHz / 1e6).toFixed(1)} MHz
 * Pins: RC6 (TX), RC7 (RX)
 */

#include <xc.h>
#include <stdio.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

void UART_Init(void) {
    // ${isUrdu ? 'Pin directions: RC6 (TX) output, RC7 (RX) input' : 'Configure pin directions: RC6 output, RC7 input'}
    TRISCbits.TRISC6 = 0; // TX Output
    TRISCbits.TRISC7 = 1; // RX Input

    // ${isUrdu ? 'Baud rate generator setting: SPBRG = (Fosc/(16*Baud)) - 1' : 'Set SPBRG for 9600 baud'}
    SPBRG = ${spbrgVal};
    TXSTAbits.BRGH = 1;  // High Speed mode
    TXSTAbits.SYNC = 0;  // Asynchronous mode
    
    RCSTAbits.SPEN = 1;  // Enable Serial Port
    TXSTAbits.TXEN = 1;  // Enable Transmitter
    RCSTAbits.CREN = 1;  // Enable Continuous Receive
}

void UART_Write(char data) {
    // ${isUrdu ? 'Transmit buffer khali hone ka intezar karein (TRMT == 1)' : 'Wait for transmit buffer to be empty'}
    while (!TXSTAbits.TRMT);
    TXREG = data; // Send byte
}

void UART_Write_String(const char* text) {
    while (*text) {
        UART_Write(*text++);
    }
}

char UART_Read(void) {
    // ${isUrdu ? 'Overrun error check' : 'Check for and clear overrun error'}
    if (RCSTAbits.OERR) {
        RCSTAbits.CREN = 0;
        RCSTAbits.CREN = 1;
    }
    // ${isUrdu ? 'Data receive hone ka intezar karein (RCIF == 1)' : 'Wait until data is received'}
    while (!PIR1bits.RCIF);
    return RCREG;
}

// Redirect printf() to UART
void putch(char c) {
    UART_Write(c);
}

void main(void) {
    UART_Init();
    __delay_ms(100);

    UART_Write_String("\\r\\n================================\\r\\n");
    UART_Write_String("Microchip PIC Embedded Studio OK\\r\\n");
    UART_Write_String("UART 9600 Baud Initialized!\\r\\n");
    UART_Write_String("================================\\r\\n");

    while(1) {
        char rx = UART_Read();
        UART_Write_String("Echo Received: [");
        UART_Write(rx);
        UART_Write_String("]\\r\\n");
    }
}`;
    },
  },
  {
    id: 'hardware_pwm_motor',
    title: 'Hardware PWM & Motor Speed Control (CCP1)',
    titleUrdu: 'Hardware PWM aur DC Motor Speed Control (CCP1 Module)',
    category: 'pwm',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'pic16f628a'],
    summaryUrdu: 'Capture/Compare/PWM (CCP) hardware module se 5kHz PWM frequency generate kr k motor ki speed 0 se 100% control krna.',
    summaryEn: 'Hardware PWM generation using CCP1 module and Timer2. Complete code for motor speed control with variable duty cycle.',
    wiringUrdu: [
      'CCP1 Pin (RC2) ko L298N Motor Driver ke ENA (Enable A) pin se jorein.',
      'PIC RD0 aur RD1 pins ko L298N ke IN1 aur IN2 pins se jorein (Direction control k lye).',
      'Motor driver aur PIC ka GND common karein.',
      'Motor ko alag 12V battery se power dein (MCU ko kabhi motor power se na chalayein).',
    ],
    wiringEn: [
      'Connect CCP1 pin (RC2) to L298N Motor Driver Enable A (ENA) pin.',
      'Connect RD0 and RD1 to L298N IN1 and IN2 for direction control (Forward/Reverse).',
      'Connect common Ground between PIC and motor driver.',
      'Supply motors with an external 12V power source.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      // At 20MHz with prescaler 16, 5kHz PWM: PR2 = (20M / (4 * 5000 * 16)) - 1 = 61.5 -> 62
      const pr2 = Math.round(foscHz / (4 * 5000 * 16)) - 1;
      return `/*
 * Project: ${mcuId.toUpperCase()} Hardware PWM (CCP1 Module)
 * Target Frequency: ~5 kHz (Timer2 Prescaler = 16)
 * Pin: RC2 / CCP1
 * Motor Driver: L298N / L293D
 */

#include <xc.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

// Motor Direction Pins
#define MOTOR_DIR1  PORTDbits.RD0
#define MOTOR_DIR2  PORTDbits.RD1

void PWM1_Init(void) {
    // ${isUrdu ? 'RC2/CCP1 pin ko OUTPUT (0) banayein' : 'Configure RC2/CCP1 as Output'}
    TRISCbits.TRISC2 = 0;
    
    // Direction pins as output
    TRISDbits.TRISD0 = 0;
    TRISDbits.TRISD1 = 0;

    // ${isUrdu ? 'PR2: PWM Period register set karein' : 'Set PR2 register for PWM period'}
    PR2 = ${pr2};

    // ${isUrdu ? 'CCP1CON: PWM mode select karein (0x0C = 0b00001100)' : 'Configure CCP1CON for PWM mode'}
    CCP1CON = 0x0C;

    // ${isUrdu ? 'T2CON: Timer2 Prescaler 1:16 set karein aur Timer2 on karein' : 'Set Timer2 prescaler 1:16 and turn on'}
    T2CON = 0x03;          // Prescaler 16
    T2CONbits.TMR2ON = 1;  // Start Timer2
}

void PWM1_Set_Duty(unsigned int duty10Bit) {
    // Clamp to 10-bit max (1023)
    if (duty10Bit > 1023) duty10Bit = 1023;

    // ${isUrdu ? 'Upper 8-bits CCPR1L mein aur lower 2-bits CCP1CON<5:4> mein jati hain' : 'Upper 8 bits stored in CCPR1L, lower 2 bits in CCP1CON<5:4>'}
    CCPR1L = duty10Bit >> 2;
    CCP1CON = (CCP1CON & 0xCF) | ((duty10Bit & 0x03) << 4);
}

void Motor_Forward(unsigned char speedPercent) {
    MOTOR_DIR1 = 1;
    MOTOR_DIR2 = 0;
    // Calculate 10-bit value for duty percentage: Max = (PR2 + 1) * 4
    unsigned int maxCount = (${pr2} + 1) * 4;
    unsigned int dutyVal = (speedPercent * maxCount) / 100;
    PWM1_Set_Duty(dutyVal);
}

void Motor_Stop(void) {
    MOTOR_DIR1 = 0;
    MOTOR_DIR2 = 0;
    PWM1_Set_Duty(0);
}

void main(void) {
    ADCON1 = 0x06; // Digital pins
    PWM1_Init();

    while(1) {
        // Accelerate motor from 0% to 100%
        for (int spd = 20; spd <= 100; spd += 10) {
            Motor_Forward(spd);
            __delay_ms(300);
        }
        
        __delay_ms(1500); // Run at full speed
        Motor_Stop();
        __delay_ms(1000);
    }
}`;
    },
  },
  {
    id: 'lcd_16x2',
    title: '16x2 Alphanumeric LCD (4-Bit Mode)',
    titleUrdu: '16x2 LCD Display Library (4-Bit Mode)',
    category: 'display',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'atmega328p'],
    summaryUrdu: 'Kam pins (sirf 6 I/O pins) istemal krte hue 16x2 LCD pe text, numbers aur custom characters display krna.',
    summaryEn: 'High-speed 4-bit parallel HD44780 LCD driver using only 6 MCU pins with custom string and cursor positioning functions.',
    wiringUrdu: [
      'LCD VSS (Pin 1) -> GND, VDD (Pin 2) -> +5V.',
      'LCD V0 (Pin 3 Contrast) -> 10kΩ Potentiometer wiper pin.',
      'LCD RS (Pin 4) -> RD2, RW (Pin 5) -> GND, EN (Pin 6) -> RD3.',
      'LCD Data pins D4, D5, D6, D7 -> RD4, RD5, RD6, RD7.',
      'LCD Backlight Anode (Pin 15) -> +5V (via 220Ω resistor), Cathode (Pin 16) -> GND.',
    ],
    wiringEn: [
      'LCD VSS (Pin 1) to GND, VDD (Pin 2) to +5V.',
      'LCD V0 (Pin 3 Contrast) to 10kΩ Potentiometer wiper.',
      'LCD RS to RD2, RW to GND (Always Write), EN to RD3.',
      'LCD Data pins D4-D7 to RD4-RD7.',
      'LCD Backlight (Pins 15/16) to +5V through 220Ω resistor and GND.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      return `/*
 * Project: ${mcuId.toUpperCase()} 16x2 LCD in 4-Bit Mode
 * LCD Driver IC: HD44780
 * Connections: RS=RD2, EN=RD3, D4-D7=RD4-RD7
 */

#include <xc.h>
#include <stdio.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

#define LCD_RS  PORTDbits.RD2
#define LCD_EN  PORTDbits.RD3
#define LCD_D4  PORTDbits.RD4
#define LCD_D5  PORTDbits.RD5
#define LCD_D6  PORTDbits.RD6
#define LCD_D7  PORTDbits.RD7

void LCD_Pulse_Enable(void) {
    LCD_EN = 1;
    __delay_us(5);
    LCD_EN = 0;
    __delay_us(50);
}

void LCD_Send_Nibble(unsigned char nibble) {
    LCD_D4 = (nibble >> 0) & 0x01;
    LCD_D5 = (nibble >> 1) & 0x01;
    LCD_D6 = (nibble >> 2) & 0x01;
    LCD_D7 = (nibble >> 3) & 0x01;
    LCD_Pulse_Enable();
}

void LCD_Command(unsigned char cmd) {
    LCD_RS = 0; // Command mode
    LCD_Send_Nibble(cmd >> 4);   // High nibble
    LCD_Send_Nibble(cmd & 0x0F); // Low nibble
    if (cmd == 0x01 || cmd == 0x02) __delay_ms(2);
}

void LCD_Char(char data) {
    LCD_RS = 1; // Data mode
    LCD_Send_Nibble(data >> 4);   // High nibble
    LCD_Send_Nibble(data & 0x0F); // Low nibble
}

void LCD_String(const char *str) {
    while (*str) {
        LCD_Char(*str++);
    }
}

void LCD_Set_Cursor(unsigned char row, unsigned char col) {
    unsigned char address = (row == 1) ? (0x80 + col - 1) : (0xC0 + col - 1);
    LCD_Command(address);
}

void LCD_Clear(void) {
    LCD_Command(0x01);
    __delay_ms(2);
}

void LCD_Init(void) {
    TRISD &= 0x03; // RD2 to RD7 as output
    LCD_RS = 0;
    LCD_EN = 0;
    __delay_ms(20);

    // Initialization sequence for 4-bit mode
    LCD_Send_Nibble(0x03);
    __delay_ms(5);
    LCD_Send_Nibble(0x03);
    __delay_us(150);
    LCD_Send_Nibble(0x03);
    LCD_Send_Nibble(0x02); // 4-bit mode command

    LCD_Command(0x28); // 4-bit, 2 lines, 5x8 font
    LCD_Command(0x0C); // Display ON, Cursor OFF
    LCD_Command(0x06); // Increment cursor
    LCD_Clear();
}

void main(void) {
    ADCON1 = 0x06; // Digital pins
    LCD_Init();

    LCD_Set_Cursor(1, 1);
    LCD_String("Microchip PIC");
    LCD_Set_Cursor(2, 1);
    LCD_String("XC8 Embedded C");

    int counter = 0;
    char buffer[16];

    while(1) {
        __delay_ms(1000);
        counter++;
        sprintf(buffer, "Count: %d sec", counter);
        LCD_Set_Cursor(2, 1);
        LCD_String("                "); // Clear line
        LCD_Set_Cursor(2, 1);
        LCD_String(buffer);
    }
}`;
    },
  },
  {
    id: 'ultrasonic_sensor',
    title: 'HC-SR04 Ultrasonic Distance Sensor',
    titleUrdu: 'HC-SR04 Ultrasonic Distance Sensor (Timer1 Input)',
    category: 'sensors',
    supportedMcus: ['pic16f877a', 'pic18f4550'],
    summaryUrdu: 'Echo pulse ki lambai Timer1 se measure kr k distance centimeters (cm) mein maloom krna.',
    summaryEn: 'High-accuracy distance measurement with HC-SR04 by triggering a 10us pulse and timing the Echo response with 16-bit Timer1.',
    wiringUrdu: [
      'HC-SR04 VCC ko +5V aur GND ko GND se jorein.',
      'HC-SR04 Trig pin ko PIC RB1 (Output) se jorein.',
      'HC-SR04 Echo pin ko PIC RB2 (Input) se jorein.',
    ],
    wiringEn: [
      'Connect HC-SR04 VCC to +5V and GND to GND.',
      'Connect Trigger pin to PIC RB1 (configured as Output).',
      'Connect Echo pin to PIC RB2 (configured as Input).',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      return `/*
 * Project: ${mcuId.toUpperCase()} Ultrasonic HC-SR04 Reader
 * Trigger: RB1 (Output)
 * Echo: RB2 (Input)
 * Formula: Distance (cm) = (Echo Time in us) / 58.0
 */

#include <xc.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

#define TRIG_PIN  PORTBbits.RB1
#define ECHO_PIN  PORTBbits.RB2

void Ultrasonic_Init(void) {
    TRISBbits.TRISB1 = 0; // Trigger as Output
    TRISBbits.TRISB2 = 1; // Echo as Input
    TRIG_PIN = 0;
    
    // Configure Timer1: 16-bit, 1:4 prescaler (Fosc=20MHz => Fcy=5MHz => 1 tick = 0.8us)
    T1CON = 0x20; // Prescaler 1:4, Timer1 OFF
}

unsigned int Get_Distance_CM(void) {
    unsigned int timerCounts = 0;

    // Send 10 microsecond trigger pulse
    TRIG_PIN = 1;
    __delay_us(10);
    TRIG_PIN = 0;

    // Wait for Echo to go HIGH
    while (!ECHO_PIN);

    // Start Timer1
    TMR1H = 0;
    TMR1L = 0;
    T1CONbits.TMR1ON = 1;

    // Wait for Echo to go LOW
    while (ECHO_PIN);

    // Stop Timer1
    T1CONbits.TMR1ON = 0;
    timerCounts = (TMR1H << 8) | TMR1L;

    // Time (us) = timerCounts * 0.8
    // Distance (cm) = (Time us) / 58 = (timerCounts * 0.8) / 58
    unsigned int distanceCm = (unsigned int)((timerCounts * 0.8) / 58.0);
    return distanceCm;
}

void main(void) {
    ADCON1 = 0x06; // Digital pins
    Ultrasonic_Init();

    while(1) {
        unsigned int distance = Get_Distance_CM();
        // Do something with distance (e.g. sound buzzer if < 10cm)
        __delay_ms(100);
    }
}`;
    },
  },
  {
    id: 'external_interrupt',
    title: 'External Interrupt (RB0/INT Edge Triggered)',
    titleUrdu: 'External Interrupt (RB0/INT Pin Pe Emergency Action)',
    category: 'interrupts',
    supportedMcus: ['pic16f877a', 'pic18f4550', 'atmega328p'],
    summaryUrdu: 'Hardware interrupt service routine (ISR) jo baghair delay k instant response deti hai.',
    summaryEn: 'Zero-latency edge-triggered interrupt service routine (ISR) on RB0/INT pin for emergency buttons or sensor triggers.',
    wiringUrdu: [
      'Emergency switch ya sensor output ko RB0/INT (Pin 33) se jorein.',
      'Indicator LED ko RD0 pe jorein jo interrupt trigger hone pe foran toggle hogi.',
    ],
    wiringEn: [
      'Connect emergency stop push button or pulse sensor to RB0/INT pin.',
      'Connect indicator LED to RD0 to observe immediate ISR response.',
    ],
    generateCode: (mcuId, foscHz, lang) => {
      const isUrdu = lang === 'urdu';
      return `/*
 * Project: ${mcuId.toUpperCase()} External Hardware Interrupt (INT0)
 * Trigger Pin: RB0 / INT
 * Interrupt Service Routine (ISR)
 */

#include <xc.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

// Interrupt Service Routine
void __interrupt() Ext_ISR(void) {
    if (INTCONbits.INTF) {
        // ${isUrdu ? 'RB0 pe interrupt trigger hua! Foran action lein' : 'External interrupt triggered on RB0 pin!'}
        PORTDbits.RD0 = !PORTDbits.RD0; // Toggle indicator LED
        
        // ${isUrdu ? 'INTF flag ko zero krna lazmi hai warna ISR baar baar call hogi' : 'MUST clear INTF flag, otherwise ISR loops infinitely'}
        INTCONbits.INTF = 0;
    }
}

void Interrupt_Init(void) {
    TRISBbits.TRISB0 = 1; // RB0 as Input
    TRISDbits.TRISD0 = 0; // RD0 as Output
    PORTDbits.RD0 = 0;

    // ${isUrdu ? 'INTEDG: 1 = Rising edge (0 se 1 pe), 0 = Falling edge' : 'INTEDG: 1 = Rising edge, 0 = Falling edge'}
    OPTION_REGbits.INTEDG = 1;

    INTCONbits.INTF = 0; // Clear flag
    INTCONbits.INTE = 1; // Enable External Interrupt
    INTCONbits.GIE = 1;  // Global Interrupt Enable
}

void main(void) {
    ADCON1 = 0x06;
    Interrupt_Init();

    while(1) {
        // Main task runs continuously without wasting CPU polling RB0!
        PORTBbits.RB7 = 1;
        __delay_ms(500);
        PORTBbits.RB7 = 0;
        __delay_ms(500);
    }
}`;
    },
  },
];
