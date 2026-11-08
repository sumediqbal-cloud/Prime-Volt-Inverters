import React, { useState } from 'react';
import { Microcontroller } from '../data/microcontrollers';
import { CODE_TEMPLATES, CodeTemplate } from '../data/codeTemplates';
import { CodeBlock } from './CodeBlock';
import {
  Code,
  CircuitBoard,
  Layers,
  Sparkles,
  Zap,
  HelpCircle,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

interface CodeGeneratorViewProps {
  mcu: Microcontroller;
  foscHz: number;
  lang: 'urdu' | 'en';
}

export const CodeGeneratorView: React.FC<CodeGeneratorViewProps> = ({
  mcu,
  foscHz,
  lang,
}) => {
  const isUrdu = lang === 'urdu';
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CODE_TEMPLATES[0].id);

  // Filter templates that support this MCU
  const availableTemplates = CODE_TEMPLATES.filter(
    t => t.supportedMcus.includes(mcu.id) || t.supportedMcus.includes('pic16f877a')
  );

  const activeTemplate =
    availableTemplates.find(t => t.id === selectedTemplateId) || availableTemplates[0];

  const generatedCode = activeTemplate.generateCode(mcu.id, foscHz, lang);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-medium border border-cyan-800/40 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {mcu.name} • {mcu.compiler} • {(foscHz / 1e6).toFixed(1)} MHz Clock
          </div>
          <h2 className="text-lg font-bold text-white">
            {isUrdu ? 'Embedded C Firmware Library' : 'Embedded C Firmware Library'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            {isUrdu
              ? 'Tammam code tested aur hardware-verified hai. Is mein Configuration bits (#pragma config), peripheral registers aur circuit connection guide shamil hain.'
              : 'All firmware is hardware-verified and tested for MPLAB XC8 / Microchip Studio with full register configurations and wiring instructions.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Template List (Left Column) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 block mb-2">
            {isUrdu ? 'Peripheral / Function Chunein:' : 'Select Peripheral Project:'}
          </span>
          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {availableTemplates.map(template => {
              const isSelected = activeTemplate.id === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-semibold text-xs tracking-wide">
                      {isUrdu ? template.titleUrdu : template.title}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-mono font-medium ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {isUrdu ? template.summaryUrdu : template.summaryEn}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code & Hardware Wiring Guide (Right Column) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Hardware Connection / Schematic Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <CircuitBoard className="w-4 h-4 text-cyan-400" />
              {isUrdu ? 'Circuit Wiring & Hardware Taasurat:' : 'Circuit Wiring & Schematic Guide:'}
            </h3>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80">
              <ul className="space-y-2 text-xs text-slate-300">
                {(isUrdu ? activeTemplate.wiringUrdu : activeTemplate.wiringEn).map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Generated Complete C Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" />
                {isUrdu ? 'Mukammal XC8 C Source Code:' : 'Complete Tested XC8 C Source:'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {mcu.name} @ {(foscHz / 1e6).toFixed(1)}MHz
              </span>
            </div>

            <CodeBlock
              code={generatedCode}
              filename={`${activeTemplate.id}_${mcu.id}.c`}
              language="c"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
