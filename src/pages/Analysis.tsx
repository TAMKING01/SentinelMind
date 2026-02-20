import { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info,
  Terminal,
  Cpu,
  BrainCircuit,
  Zap,
  Target,
  FileText,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeThreat, AnalysisResult } from '../services/gemini';
import { cn } from '../lib/utils';

export default function Analysis() {
  const [type, setType] = useState<'URL' | 'Email'>('URL');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const analysis = await analyzeThreat(type, content);
      setResult(analysis);

      // Save to backend history
      await fetch('/api/threats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          content,
          risk_score: analysis.risk_score,
          severity: analysis.severity,
          intent: analysis.intent,
          verdict: analysis.verdict
        })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Threat Analysis Engine</h2>
        <p className="text-zinc-500">Multi-agent AI analysis for URLs and suspicious communications.</p>
      </div>

      <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setType('URL')}
            className={cn(
              "flex-1 py-4 flex items-center justify-center gap-2 transition-all",
              type === 'URL' ? "bg-emerald-500/5 text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500 hover:text-white"
            )}
          >
            <LinkIcon className="w-4 h-4" />
            <span className="font-medium">URL Scan</span>
          </button>
          <button
            onClick={() => setType('Email')}
            className={cn(
              "flex-1 py-4 flex items-center justify-center gap-2 transition-all",
              type === 'Email' ? "bg-emerald-500/5 text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500 hover:text-white"
            )}
          >
            <FileText className="w-4 h-4" />
            <span className="font-medium">Email/Content Analysis</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={type === 'URL' ? "Enter URL to scan (e.g., https://secure-login-bank.com)" : "Paste the email body or suspicious message content here..."}
            className="w-full h-40 bg-black/40 border border-white/5 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all resize-none font-mono text-sm"
          />
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !content.trim()}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Engaging Multi-Agent Framework...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Execute Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Risk Score Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Risk Score</p>
                <div className="relative">
                  <svg className="w-24 h-24">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                    <circle 
                      cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * result.risk_score) / 100}
                      className={cn("transition-all duration-1000", result.risk_score > 70 ? "text-red-500" : result.risk_score > 40 ? "text-amber-500" : "text-emerald-500")}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{result.risk_score}</span>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Severity</p>
                <div className={cn("px-4 py-2 rounded-full border font-bold text-lg", getSeverityColor(result.severity))}>
                  {result.severity}
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mb-2">Confidence</p>
                <div className="text-3xl font-bold text-white">{result.confidence}%</div>
                <p className="text-zinc-600 text-[10px] mt-1 italic">AI Confidence Level</p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-white">Agent Intelligence</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Intent Classification</p>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-sm text-zinc-300">
                        {result.intent}
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Manipulation Patterns</p>
                      <div className="flex flex-wrap gap-2">
                        {result.manipulation_patterns.map(p => (
                          <span key={p} className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] rounded-md">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-white">Pattern Detection</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.patterns_found.map((p, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-white">SOC Recommendation</h3>
                </div>
                <div className="flex-1 bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-lg font-bold text-white">{result.verdict}</p>
                  <p className="text-zinc-400 text-sm italic">"{result.recommendation}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
