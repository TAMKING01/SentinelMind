import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Link, 
  useLocation,
  useNavigate
} from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Search, 
  History, 
  LogOut, 
  Menu, 
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import ThreatHistory from './pages/ThreatHistory';
import Login from './pages/Login';
import { cn } from './lib/utils';

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Search, label: 'Analysis', path: '/analysis' },
    { icon: History, label: 'Threat History', path: '/history' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-[#0A0A0B] border-r border-white/5 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">SentinelMind</h1>
            <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest">Shield v1.0</p>
          </div>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                location.pathname === item.path
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                location.pathname === item.path ? "text-emerald-500" : "text-zinc-500 group-hover:text-white"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-[#050505] text-zinc-100 flex">
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                
                <main className="flex-1 lg:ml-64 min-h-screen">
                  <header className="h-16 border-bottom border-white/5 flex items-center justify-between px-6 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-30">
                    <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="lg:hidden p-2 text-zinc-400 hover:text-white"
                    >
                      <Menu className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-4 ml-auto">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-emerald-500 uppercase tracking-wider">System Online</span>
                      </div>
                    </div>
                  </header>

                  <div className="p-6 max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/analysis" element={<Analysis />} />
                      <Route path="/history" element={<ThreatHistory />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
