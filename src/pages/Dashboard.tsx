import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';

interface Stats {
  totalThreats: number;
  avgRisk: number;
  criticalThreats: number;
  recentThreats: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Threats', value: stats?.totalThreats || 0, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Avg Risk Score', value: stats?.avgRisk || 0, icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Critical Threats', value: stats?.criticalThreats || 0, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'System Health', value: '98.2%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  const pieData = [
    { name: 'Critical', value: stats?.criticalThreats || 0 },
    { name: 'Others', value: (stats?.totalThreats || 0) - (stats?.criticalThreats || 0) },
  ];

  const COLORS = ['#ef4444', '#10b981'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Security Overview</h2>
        <p className="text-zinc-500 text-sm mt-1">Real-time threat intelligence and risk monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
          >
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-10 blur-2xl rounded-full", card.bg)} />
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl border border-white/5", card.bg)}>
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white">Threat Trend</h3>
              <p className="text-zinc-500 text-xs">Risk score progression over time</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-mono text-emerald-500">+12.5%</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.recentThreats || []}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                />
                <YAxis stroke="#52525b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="risk_score" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorRisk)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0B] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white self-start mb-2">Risk Distribution</h3>
          <p className="text-zinc-500 text-xs self-start mb-8">Critical vs non-critical threats</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0B', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-zinc-400">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-400">Safe/Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
