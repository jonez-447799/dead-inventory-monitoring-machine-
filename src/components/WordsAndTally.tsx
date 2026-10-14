import React, { useState } from 'react';
import { VOCABULARY_WORDS, TALLY_EXPORT_STEPS, WHATSAPP_PITCH_TEMPLATES } from '../data/initialData';
import { 
  BookOpen, 
  HelpCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Keyboard, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Send
} from 'lucide-react';

export const WordsAndTally: React.FC = () => {
  const [copiedPitch, setCopiedPitch] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPitch(key);
    setTimeout(() => setCopiedPitch(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Vocabulary Section */}
      <div className="glass-card rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
            The Words: Said So You Can Repeat Them in the Factory
          </h2>
        </div>
        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
          Factory owners in Ambattur, Guindy, or Peenya respect plain talk. Learn these exact definitions so you never slip into academic consulting jargon.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VOCABULARY_WORDS.map((w, i) => (
            <div
              key={i}
              className="p-4 rounded-xl glass-card glass-card-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                    0{i + 1}.
                  </span>
                  <span className="industrial-badge bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700">Factory Term</span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {w.term}
                </h3>
                <p className="mt-2 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  "{w.short}"
                </p>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono">
                  {w.explanation}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-neutral-200/80 dark:border-neutral-800/80 text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                {w.factoryContext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tally Export Guide: Buttons & Columns */}
      <div className="glass-card rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              The Tally Buttons: Which Columns to Export from TallyPrime
            </h2>
          </div>
          <span className="industrial-badge industrial-badge-emerald">
            TallyPrime / ERP 9
          </span>
        </div>

        <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 font-mono">
          Tell his accountant exactly these keystrokes. It takes under 90 seconds. You need only 4 raw data columns:
          <strong className="text-neutral-900 dark:text-neutral-100 ml-1">Item Name, Closing Qty, Cost Rate, and Last Sale/Issue Date</strong>.
        </p>

        <div className="mt-4 space-y-3">
          {TALLY_EXPORT_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.step}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                    {step.title}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
                <Keyboard className="w-3.5 h-3.5 text-neutral-400" />
                <code className="text-xs font-mono px-2 py-1 rounded bg-white dark:bg-neutral-950 border border-neutral-300/80 dark:border-neutral-700/80 text-amber-800 dark:text-amber-300 font-semibold shadow-2xs">
                  {step.keys}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. The Rules of Engagement: What You Do NOT Do Today */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card glass-card-rose rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-400 font-bold text-sm">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h3 className="tracking-tight">What You Do NOT Do Today</h3>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed list-disc list-inside">
            <li><strong>Do not walk into Ambattur prematurely.</strong> Master the file and mechanics first.</li>
            <li><strong>Do not send unsolicited WhatsApp messages.</strong> Only reply when asked.</li>
            <li><strong>Do not mention external brand names or consulting terms.</strong> Keep it strictly on his rupees.</li>
            <li><strong>Never quote ₹2,23,110 as if it came from a real factory.</strong> That number is fake practice from this sample.</li>
            <li><strong>Do not build the stockout tool this week.</strong> Focus 100% on dead cash.</li>
          </ul>
        </div>

        <div className="glass-card glass-card-emerald rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="tracking-tight">The Only Ask &amp; Commercial Terms</h3>
          </div>
          <p className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            When the drill works, the pitch is simple:
          </p>
          <div className="mt-2 p-3 rounded-lg bg-white/80 dark:bg-neutral-900/80 border border-emerald-300/60 dark:border-emerald-800/60 text-xs font-mono text-neutral-800 dark:text-neutral-200 shadow-2xs">
            "Send item name, quantity, cost rate, and last movement date. In 48 hours I will show you how many rupees have not moved in six months. If the number is useless, you pay nothing."
          </div>
          <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
            <strong>Fee structure:</strong> First five real files at <strong>₹8,000–₹15,000</strong> each. Payment collected <em>after</em> he sees the page, not before.
          </div>
        </div>
      </div>

      {/* 4. The Exact WhatsApp Pitch Line */}
      <div className="glass-card rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              The Exact WhatsApp Script for Factory Owners
            </h3>
          </div>
          <button
            onClick={() => copyText(WHATSAPP_PITCH_TEMPLATES.initialPitch, 'initialPitch')}
            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center gap-1 shadow-2xs"
          >
            {copiedPitch === 'initialPitch' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedPitch === 'initialPitch' ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>

        <div className="mt-3 bg-neutral-950 text-neutral-200 font-mono text-xs p-4 rounded-lg whitespace-pre-line leading-relaxed border border-neutral-800 shadow-inner">
          {WHATSAPP_PITCH_TEMPLATES.initialPitch}
        </div>
      </div>
    </div>
  );
};
