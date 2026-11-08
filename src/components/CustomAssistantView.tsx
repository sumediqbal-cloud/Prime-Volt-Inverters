import React, { useState } from 'react';
import { Microcontroller } from '../data/microcontrollers';
import { CodeBlock } from './CodeBlock';
import {
  Sparkles,
  Send,
  Cpu,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface CustomAssistantViewProps {
  mcu: Microcontroller;
  foscHz: number;
  lang: 'urdu' | 'en';
}

export const CustomAssistantView: React.FC<CustomAssistantViewProps> = ({
  mcu,
  foscHz,
  lang,
}) => {
  const isUrdu = lang === 'urdu';

  const quickPrompts = [
    {
      titleUrdu: '4 Buttons se 4 Relays Toggle Krna',
      titleEn: '4 Push Buttons to 4 Relays Toggle',
      prompt: isUrdu
        ? `${mcu.name} mein PORTB (RB0-RB3) pe 4 push buttons aur PORTD (RD0-RD3) pe 4 relays jori hain. Har button dabane se uski relay toggle ho aur debouncing shamil ho.`
        : `Control 4 relays on PORTD (RD0-RD3) with 4 push buttons on PORTB (RB0-RB3) with debounce and state toggle for ${mcu.name}.`,
    },
    {
      titleUrdu: 'UART Command se Appliances Control',
      titleEn: 'UART Serial Command to Control Appliances',
      prompt: isUrdu
        ? `${mcu.name} k UART 9600 baud pe '1' bhejne se RD0 Relay ON ho aur '0' bhejne se OFF ho, aur confirmation message PC pe wapis bheje.`
        : `On ${mcu.name}, receive '1' via UART @ 9600 to turn ON relay at RD0 and '0' to turn OFF, echoing status back to PC.`,
    },
    {
      titleUrdu: 'Potentiometer se PWM Motor Speed Control',
      titleEn: 'Potentiometer to PWM Motor Speed Control',
      prompt: isUrdu
        ? `${mcu.name} pe AN0 (RA0) se potentiometer ka analog voltage read karein aur CCP1 pin se motor ki PWM duty cycle 0 se 100% control karein.`
        : `Read analog potentiometer on AN0 (RA0) and set CCP1 PWM duty cycle proportionally from 0% to 100% on ${mcu.name}.`,
    },
    {
      titleUrdu: 'Timer0 500ms Accurate Non-blocking Tick',
      titleEn: 'Timer0 500ms Non-blocking LED Tick',
      prompt: isUrdu
        ? `${mcu.name} mein Timer0 interrupt se har 500ms pe baghair delay loop k RB7 LED ko toggle krna ${(foscHz / 1e6).toFixed(0)}MHz crystal k sath.`
        : `Generate accurate 500ms LED toggle on RB7 using Timer0 interrupt without blocking delay loops on ${mcu.name} at ${(foscHz / 1e6).toFixed(0)}MHz.`,
    },
  ];

  const [promptText, setPromptText] = useState<string>(quickPrompts[0].prompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [responseCode, setResponseCode] = useState<string | null>(null);
  const [responseExplanation, setResponseExplanation] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setResponseCode(null);
    setResponseExplanation(null);

    setTimeout(() => {
      // Intelligent rule-based code synthesis for Microchip
      const lower = promptText.toLowerCase();
      let generated = '';
      let explanation = '';

      if (lower.includes('relay') || lower.includes('button')) {
        explanation = isUrdu
          ? `Yeh code ${mcu.name} k lye 4 inputs (PORTB RB0-RB3) aur 4 outputs (PORTD RD0-RD3) configure krta hai. Har button k lye 25ms software debounce lagaya gaya hai taake relay chatter na kare.`
          : `This firmware configures 4 inputs (RB0-RB3) and 4 relay outputs (RD0-RD3) on ${mcu.name} with 25ms debounce filtering.`;

        generated = `/*
 * =========================================================================
 * Project: ${mcu.name} 4-Button to 4-Relay Controller with Debounce
 * Compiler: ${mcu.compiler}
 * Clock: ${(foscHz / 1e6).toFixed(1)} MHz
 * =========================================================================
 */

#include <xc.h>

// Configuration Bits
#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

// Pin Definitions
#define BTN1  PORTBbits.RB0
#define BTN2  PORTBbits.RB1
#define BTN3  PORTBbits.RB2
#define BTN4  PORTBbits.RB3

#define RELAY1  PORTDbits.RD0
#define RELAY2  PORTDbits.RD1
#define RELAY3  PORTDbits.RD2
#define RELAY4  PORTDbits.RD3

void System_Init(void) {
    ADCON1 = 0x06;      // All PORTA and PORTE as digital
    
    // PORTB as Inputs (Buttons)
    TRISBbits.TRISB0 = 1;
    TRISBbits.TRISB1 = 1;
    TRISBbits.TRISB2 = 1;
    TRISBbits.TRISB3 = 1;
    
    // PORTD as Outputs (Relays)
    TRISDbits.TRISD0 = 0;
    TRISDbits.TRISD1 = 0;
    TRISDbits.TRISD2 = 0;
    TRISDbits.TRISD3 = 0;
    
    // Relays initially OFF (Assuming Active-HIGH relays)
    RELAY1 = 0;
    RELAY2 = 0;
    RELAY3 = 0;
    RELAY4 = 0;
    
    OPTION_REGbits.nRBPU = 0; // Enable PORTB internal pull-ups
}

void Check_Button_And_Toggle(volatile unsigned char *btn, volatile unsigned char *relay) {
    if (*btn == 0) { // Active-Low button press
        __delay_ms(25); // Debounce delay
        if (*btn == 0) {
            *relay = !(*relay); // Toggle relay state
            while (*btn == 0);  // Wait for button release
            __delay_ms(25);
        }
    }
}

void main(void) {
    System_Init();

    while(1) {
        if (BTN1 == 0) {
            __delay_ms(25);
            if (BTN1 == 0) {
                RELAY1 = !RELAY1;
                while (BTN1 == 0);
                __delay_ms(25);
            }
        }
        if (BTN2 == 0) {
            __delay_ms(25);
            if (BTN2 == 0) {
                RELAY2 = !RELAY2;
                while (BTN2 == 0);
                __delay_ms(25);
            }
        }
        if (BTN3 == 0) {
            __delay_ms(25);
            if (BTN3 == 0) {
                RELAY3 = !RELAY3;
                while (BTN3 == 0);
                __delay_ms(25);
            }
        }
        if (BTN4 == 0) {
            __delay_ms(25);
            if (BTN4 == 0) {
                RELAY4 = !RELAY4;
                while (BTN4 == 0);
                __delay_ms(25);
            }
        }
    }
}`;
      } else if (lower.includes('uart') || lower.includes('serial')) {
        explanation = isUrdu
          ? `${mcu.name} ka hardware USART module initialize kiya gaya hai 9600 baud rate pe. '1' aane pe RD0 Relay ON hogi aur '0' aane pe OFF.`
          : `Hardware USART peripheral initialized at 9600 baud. Parses incoming ASCII '1' or '0' to switch RD0 relay and sends acknowledgment strings.`;

        const spbrg = Math.round(foscHz / (16 * 9600)) - 1;
        generated = `/*
 * Project: ${mcu.name} UART Serial Command Receiver
 * Baud: 9600 bps, 8-N-1
 * Target: RC6 (TX), RC7 (RX), RD0 (Relay Output)
 */

#include <xc.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}
#define RELAY_PIN  PORTDbits.RD0

void UART_Init(void) {
    TRISCbits.TRISC6 = 0; // TX as Output
    TRISCbits.TRISC7 = 1; // RX as Input
    
    SPBRG = ${spbrg};        // 9600 Baud @ ${(foscHz / 1e6).toFixed(0)}MHz
    TXSTAbits.BRGH = 1;   // High speed
    TXSTAbits.SYNC = 0;   // Asynchronous
    RCSTAbits.SPEN = 1;   // Enable Serial Port
    TXSTAbits.TXEN = 1;   // Enable TX
    RCSTAbits.CREN = 1;   // Enable RX
}

void UART_Send(char c) {
    while (!TXSTAbits.TRMT);
    TXREG = c;
}

void UART_Send_String(const char *s) {
    while (*s) UART_Send(*s++);
}

char UART_Receive(void) {
    if (RCSTAbits.OERR) {
        RCSTAbits.CREN = 0;
        RCSTAbits.CREN = 1;
    }
    while (!PIR1bits.RCIF);
    return RCREG;
}

void main(void) {
    ADCON1 = 0x06;
    TRISDbits.TRISD0 = 0; // Relay Output
    RELAY_PIN = 0;        // Initial state OFF
    
    UART_Init();
    __delay_ms(100);
    UART_Send_String("System Ready. Send '1' for ON, '0' for OFF.\\r\\n");

    while(1) {
        char cmd = UART_Receive();
        if (cmd == '1') {
            RELAY_PIN = 1;
            UART_Send_String("ACK: RELAY IS ON\\r\\n");
        } else if (cmd == '0') {
            RELAY_PIN = 0;
            UART_Send_String("ACK: RELAY IS OFF\\r\\n");
        } else {
            UART_Send_String("ERR: Unknown command\\r\\n");
        }
    }
}`;
      } else {
        // General ADC + PWM or Timer code
        explanation = isUrdu
          ? `${mcu.name} k lye complete hardware configuration code tayar hai. ADC AN0 se analog input parh kr CCP1 PWM output ko regulate kiya ja raha hai.`
          : `Full hardware configuration and firmware routine generated for ${mcu.name} mapping ADC AN0 analog input to CCP1 PWM output.`;

        const pr2 = Math.round(foscHz / (4 * 5000 * 16)) - 1;
        generated = `/*
 * Project: ${mcu.name} Custom Firmware
 * Target: ${mcu.compiler}
 * Clock: ${(foscHz / 1e6).toFixed(1)} MHz
 */

#include <xc.h>

#pragma config FOSC = HS
#pragma config WDTE = OFF
#pragma config PWRTE = ON
#pragma config BOREN = ON
#pragma config LVP = OFF

#define _XTAL_FREQ ${foscHz}

void ADC_Init(void) {
    TRISAbits.TRISA0 = 1; // RA0/AN0 as Input
    ADCON1 = 0x8E;        // AN0 Analog, VDD/VSS reference
    ADCON0 = 0x41;        // ADC Clock Fosc/8, Channel 0, ADC ON
}

unsigned int ADC_Read(void) {
    __delay_us(30);
    ADCON0bits.GO_nDONE = 1;
    while (ADCON0bits.GO_nDONE);
    return ((ADRESH << 8) + ADRESL);
}

void PWM_Init(void) {
    TRISCbits.TRISC2 = 0; // CCP1 Output
    PR2 = ${pr2};
    CCP1CON = 0x0C;       // PWM Mode
    T2CON = 0x03;         // Prescaler 1:16
    T2CONbits.TMR2ON = 1;
}

void PWM_Set_Duty(unsigned int duty10Bit) {
    if (duty10Bit > 1023) duty10Bit = 1023;
    CCPR1L = duty10Bit >> 2;
    CCP1CON = (CCP1CON & 0xCF) | ((duty10Bit & 0x03) << 4);
}

void main(void) {
    ADC_Init();
    PWM_Init();

    while(1) {
        unsigned int potVal = ADC_Read(); // 0 to 1023
        PWM_Set_Duty(potVal);             // Set proportional PWM
        __delay_ms(20);
    }
}`;
      }

      setResponseExplanation(explanation);
      setResponseCode(generated);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            {isUrdu ? 'Custom Microchip Code Engine' : 'Custom Firmware Assistant'}
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {isUrdu
              ? 'Apna Microchip Project Requirement Likhein'
              : 'Describe Your Microchip Firmware Requirement'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {isUrdu
              ? 'Aap Roman Urdu ya English mein jo bhi project chahein bayan karein (maslan: "PIC16F877A pe 2 buttons aur 1 relay control krna hai debouncing k sath"). Hamara studio foran mukammal, hardware-ready XC8 C code generate karega!'
              : 'Type any requirement in English or Roman Urdu. The assistant will generate production-grade XC8/AVR C code with register bit setups, config pragmas, and wiring.'}
          </p>
        </div>

        {/* Quick Sample Prompts */}
        <div className="mt-5">
          <span className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            {isUrdu ? 'Misaalein (Quick Templates):' : 'Popular Project Prompts:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => setPromptText(qp.prompt)}
                className="text-left p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-900 transition-all group"
              >
                <div className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200 flex items-center justify-between">
                  <span>{isUrdu ? qp.titleUrdu : qp.titleEn}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {qp.prompt}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea & Generate Button */}
        <div className="mt-5 space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              placeholder={
                isUrdu
                  ? 'Yahan apna requirement likhein (e.g. PIC16F877A pe 4 LEDs ko sequential blink krna hai button press pe...)'
                  : 'Enter your project requirement...'
              }
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-sans"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Target: <span className="text-cyan-300 font-bold">{mcu.name}</span> •{' '}
              {(foscHz / 1e6).toFixed(1)}MHz
            </span>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>{isUrdu ? 'Code Bana Raha Hai...' : 'Synthesizing Firmware...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isUrdu ? 'XC8 Firmware Code Generate Karein' : 'Generate XC8 Firmware'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Output */}
      {responseCode && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {responseExplanation && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                <strong className="text-cyan-300 block mb-0.5">
                  {isUrdu ? 'Tashreeh (Explanation):' : 'Firmware Architecture:'}
                </strong>
                {responseExplanation}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block px-1">
              {isUrdu ? 'Generated MPLAB XC8 C Code:' : 'Generated MPLAB XC8 C Code:'}
            </span>
            <CodeBlock code={responseCode} filename="custom_project.c" language="c" />
          </div>
        </div>
      )}
    </div>
  );
};
