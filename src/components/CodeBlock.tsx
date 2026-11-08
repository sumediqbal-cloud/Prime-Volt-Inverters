import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  filename?: string;
  language?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  filename = 'main.c',
  language = 'c',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-c' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fast syntax highlighter for C code
  const highlightLine = (line: string): React.ReactNode => {
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return <span className="text-emerald-400/90 italic">{line}</span>;
    }

    if (line.trim().startsWith('#pragma') || line.trim().startsWith('#define') || line.trim().startsWith('#include')) {
      const parts = line.split(' ');
      const directive = parts[0];
      const rest = line.substring(directive.length);
      return (
        <>
          <span className="text-amber-400 font-semibold">{directive}</span>
          <span className="text-amber-200/90">{rest}</span>
        </>
      );
    }

    // Split words and tokens
    const tokens = line.split(/(\b|["']|[\s,;(){}[\]=+\-*/<>!&|^])/);
    let inString = false;
    let stringChar = '';

    const keywords = new Set([
      'void', 'int', 'char', 'float', 'double', 'unsigned', 'signed', 'long', 'short',
      'while', 'for', 'if', 'else', 'return', 'switch', 'case', 'break', 'default',
      'const', 'static', 'volatile', 'struct', 'typedef', 'sizeof', '__interrupt'
    ]);

    const registers = new Set([
      'TRISA', 'TRISB', 'TRISC', 'TRISD', 'TRISE', 'TRISIO',
      'PORTA', 'PORTB', 'PORTC', 'PORTD', 'PORTE', 'GPIO',
      'LATA', 'LATB', 'LATC', 'LATD', 'LATE',
      'ADCON0', 'ADCON1', 'ADCON2', 'ADRESH', 'ADRESL', 'ANSEL',
      'OPTION_REG', 'INTCON', 'PIE1', 'PIR1', 'T1CON', 'T2CON', 'TMR0', 'TMR1', 'TMR2',
      'PR2', 'CCP1CON', 'CCP2CON', 'CCPR1L', 'CCPR1H',
      'TXSTA', 'RCSTA', 'SPBRG', 'TXREG', 'RCREG', 'CMCON'
    ]);

    return tokens.map((token, idx) => {
      if (token === '"' || token === "'") {
        if (!inString) {
          inString = true;
          stringChar = token;
          return <span key={idx} className="text-emerald-300">{token}</span>;
        } else if (token === stringChar) {
          inString = false;
          return <span key={idx} className="text-emerald-300">{token}</span>;
        }
      }

      if (inString) {
        return <span key={idx} className="text-emerald-300">{token}</span>;
      }

      if (keywords.has(token)) {
        return <span key={idx} className="text-purple-400 font-semibold">{token}</span>;
      }

      if (registers.has(token) || token.includes('bits')) {
        return <span key={idx} className="text-cyan-300 font-semibold">{token}</span>;
      }

      if (/^0x[0-9a-fA-F]+$/.test(token) || /^[0-9]+$/.test(token) || /^0b[01]+$/.test(token)) {
        return <span key={idx} className="text-orange-300">{token}</span>;
      }

      return <span key={idx} className="text-slate-200">{token}</span>;
    });
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col my-3 font-mono text-xs sm:text-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-slate-300 font-medium text-xs tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            {filename}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-sans uppercase">
            {language}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-medium transition-colors bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white"
            aria-label="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-sans font-medium transition-colors bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-200 hover:text-white border border-cyan-700/40"
            aria-label="Download C source file"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download .c</span>
          </button>
        </div>
      </div>

      <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                <td className="w-10 pr-4 text-right text-slate-600 select-none text-[11px] font-mono align-top py-0.5">
                  {idx + 1}
                </td>
                <td className="whitespace-pre font-mono text-slate-200 py-0.5">
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
