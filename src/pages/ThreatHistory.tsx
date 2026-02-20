import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Clock, 
  ExternalLink, 
  Search,
  Filter,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Threat {
  id: number;
  type: string;
  content: string;
  risk_score: number;
  severity: string;
  intent: string;
  verdict: string;
  timestamp: string;
}

export default function ThreatHistory() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const res = await fetch('/api/threats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setThreats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreats();
  }, []);

  const filteredThreats = threats.filter(t => 
    t.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.intent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.verdict.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Threat History</h2>
          <p className="text-zinc-500 text-sm mt-1">Audit log of all analyzed threats and system decisions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search threats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#0A0A0B] border border-white/5 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-[#0A0A0B] border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Content Preview</th>
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Risk Score</th>
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Severity</th>
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Verdict</th>
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredThreats.map((threat, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={threat.id} 
                  className="hover:bg-white/[0.01] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-[10px] font-mono rounded uppercase">
                      {threat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-sm text-zinc-300 truncate font-mono">{threat.content}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            threat.risk_score > 70 ? "bg-red-500" : threat.risk_score > 40 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${threat.risk_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-zinc-400">{threat.risk_score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-1 rounded-md text-[10px] font-bold border", getSeverityStyles(threat.severity))}>
                      {threat.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-zinc-400 italic">"{threat.verdict}"</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <Clock className="w-3 h-3" />
                      {new Date(threat.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filteredThreats.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                      <ShieldAlert className="w-12 h-12 opacity-20" />
                      <p className="text-sm">No threats found in history.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
