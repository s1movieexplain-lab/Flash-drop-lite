import { motion } from "motion/react";
import { Send, Download, History, Settings, Info, Wifi, WifiOff, ShieldCheck, Zap, Laptop, Tablet, Smartphone, Folder } from "lucide-react";
import { Device } from "../types";

interface HomeScreenProps {
  onNavigate: (screen: 'home' | 'send' | 'devices' | 'receiving' | 'progress' | 'history' | 'settings' | 'explorer') => void;
  onOpenGuide: () => void;
  selfDevice: Device;
  isOnline: boolean;
  onlineCount: number;
  totalTransferredBytes: number;
  historyCount: number;
}

export function HomeScreen({
  onNavigate,
  onOpenGuide,
  selfDevice,
  isOnline,
  onlineCount,
  totalTransferredBytes,
  historyCount
}: HomeScreenProps) {
  
  // Format byte size
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const DeviceIcon = () => {
    switch (selfDevice.deviceType) {
      case 'desktop':
        return <Laptop className="w-5 h-5 text-indigo-400" />;
      case 'ios':
        return <Tablet className="w-5 h-5 text-indigo-400" />;
      default:
        return <Smartphone className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Gradient Blurs */}
      <div className="absolute top-[-100px] left-[-50px] w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-50px] w-72 h-72 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />

      {/* Header Area */}
      <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-slate-100 shadow-md">
            ⚡
          </div>
          <div>
            <h1 className="font-sans font-extrabold text-lg text-slate-100 uppercase tracking-wide">
              FlashDrop <span className="text-teal-400 text-xs font-normal">Lite</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                {isOnline ? `Online (${onlineCount + 1} devices)` : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Top interactive shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGuide}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Setup / Developer Info"
            id="btn-guide"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Preferences"
            id="btn-settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stats Scrollable Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-28">
        
        {/* Device Information Card */}
        <div className="rounded-2xl border border-slate-805 bg-slate-900/30 p-4 border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-3xl">
              {selfDevice.avatar}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-mono tracking-widest">Your Device Identity</p>
              <h3 className="font-bold text-slate-100 text-base">{selfDevice.name}</h3>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5 uppercase">
                {selfDevice.ipAddress || "Detecting Node IP..."}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-1">
              <DeviceIcon />
              <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase">
                {selfDevice.deviceType}
              </span>
            </div>
          </div>
        </div>

        {/* Massive Send and Receive buttons (One-tap core flow) */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Send Files Button */}
          <button
            onClick={() => onNavigate('send')}
            className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-sans shadow-xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-48 overflow-hidden border border-emerald-400/20"
            id="btn-home-send"
          >
            <div className="absolute top-[-10px] right-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-center w-14 h-14 bg-slate-950 text-emerald-400 rounded-2xl shadow-lg ring-4 ring-emerald-300/20 mb-4 group-hover:rotate-12 transition-transform">
              <Send className="w-7 h-7" />
            </div>
            <span className="font-bold text-lg leading-tight tracking-tight uppercase">Send Files</span>
            <span className="text-[11px] text-emerald-950/80 mt-1 font-medium">To another nearby device</span>
          </button>

          {/* Receive Files Button */}
          <button
            onClick={() => onNavigate('receiving')}
            className="group relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-slate-100 font-sans shadow-xl shadow-indigo-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer h-48 overflow-hidden border border-indigo-500/20"
            id="btn-home-receive"
          >
            <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-center w-14 h-14 bg-slate-950 text-indigo-400 rounded-2xl shadow-lg ring-4 ring-indigo-500/20 mb-4 group-hover:-bounce transition-transform">
              <Download className="w-7 h-7 animate-bounce" />
            </div>
            <span className="font-bold text-lg leading-tight tracking-tight uppercase">Receive</span>
            <span className="text-[11px] text-indigo-200/80 mt-1 font-medium">Wait for connection QR</span>
          </button>

        </div>

        {/* Speed & Loss-free highlight banner */}
        <div className="rounded-2xl border border-dashed border-teal-500/20 bg-teal-550/5 p-4 bg-teal-950/10 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-teal-400 text-sm">0% Compression, Raw Quality Loss-Free</h4>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
              Your videos and images are shared directly as raw byte arrays. True Wi-Fi speed and zero proxy resizing ensures perfect copies.
            </p>
          </div>
        </div>

        {/* Grid statistics highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Data Shared</p>
            <p className="text-2xl font-black text-slate-200 mt-1 font-mono">
              {formatBytes(totalTransferredBytes)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total Transactions</p>
            <p className="text-2xl font-black text-slate-200 mt-1 font-mono">
              {historyCount} <span className="text-xs text-slate-500 font-normal">items</span>
            </p>
          </div>
        </div>

        {/* Security badge and endorsement */}
        <div className="flex items-center justify-center gap-1.5 py-2 text-slate-500 max-w-xs mx-auto text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
          <span>AES-256 SECURED WiFi TUNNEL</span>
        </div>

      </div>

      {/* Floating Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-6 right-6 h-16 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800/90 z-25 flex items-center justify-around px-2 shadow-xl">
        <button
          onClick={() => onNavigate('home')}
          className="flex flex-col items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase font-sans py-1"
          id="btn-nav-home"
        >
          <Zap className="w-4.5 h-4.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate('explorer')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase font-sans py-1 transition-colors"
          id="btn-nav-explorer"
        >
          <Folder className="w-4.5 h-4.5" />
          <span>Files</span>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase font-sans py-1 transition-colors"
          id="btn-nav-history"
        >
          <History className="w-4.5 h-4.5" />
          <span>History</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase font-sans py-1 transition-colors"
          id="btn-nav-settings"
        >
          <Settings className="w-4.5 h-4.5" />
          <span>Setup</span>
        </button>
      </div>
    </div>
  );
}
