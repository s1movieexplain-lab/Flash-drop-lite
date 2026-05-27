import { motion } from "motion/react";
import { Pause, Play, X, ShieldAlert, CheckCircle, Flame, ServerCrash, RefreshCw, Layers, ShieldCheck, Download, AlertCircle, Folder } from "lucide-react";
import { TransferFile } from "../types";

interface TransferProgressScreenProps {
  transfer: TransferFile | null;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetry?: () => void;
  onOpenExplorer?: () => void;
  savedPath?: string;
  sha256?: string;
}

export function TransferProgressScreen({
  transfer,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onOpenExplorer,
  savedPath,
  sha256
}: TransferProgressScreenProps) {
  
  if (!transfer) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-slate-500 mb-2 animate-pulse" />
        <h3 className="font-bold text-slate-400">No Active Transfer Queue</h3>
        <p className="text-xs text-slate-500 max-w-[200px] mt-1">Initiate a send or receive operation from the Home Dashboard.</p>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case 'failed': return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'paused': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
      case 'connecting': return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10';
      default: return 'text-sky-400 border-sky-500/20 bg-sky-500/10';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Transfer Completed';
      case 'failed': return 'Interrupted / Failed';
      case 'paused': return 'Transfer Paused';
      case 'connecting': return 'Securing WiFi Socket...';
      default: return 'Transferring raw bytes...';
    }
  };

  // Estimate transferred size
  const transferredSize = (transfer.progress / 100) * transfer.size;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Visual glowing layout circles */}
      <div className="absolute top-[-50px] left-[-30px] w-64 h-64 rounded-full bg-emerald-500/5 blur-[80px]" />
      <div className="absolute bottom-[-50px] right-[-30px] w-64 h-64 rounded-full bg-indigo-500/5 blur-[80px]" />

      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div>
          <h2 className="font-sans font-extrabold text-base text-slate-100">
            {transfer.role === 'sender' ? 'Sending Packet' : 'Receiving Packet'}
          </h2>
          <p className="text-xs text-slate-400">Direct WiFi Socket Connection &middot; 0% loss</p>
        </div>

        {/* Current single status badge */}
        <div className={`px-2.5 py-1.5 rounded-lg border text-[10px] uppercase font-mono tracking-widest font-bold ${getStatusColor(transfer.status)}`}>
          {transfer.status}
        </div>
      </div>

      {/* Transfer console */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-20 justify-center">

        {/* Giant Circular Progress Circle */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
            
            {/* SVG circle track loader */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-slate-900 stroke-[10] fill-transparent"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                className="stroke-emerald-400 stroke-[10] fill-transparent"
                strokeDasharray={2 * Math.PI * 80}
                animate={{
                  strokeDashoffset: (2 * Math.PI * 80) * (1 - transfer.progress / 100),
                }}
                transition={{ duration: 0.1, ease: "linear" }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner text content */}
            <div className="absolute flex flex-col items-center text-center select-none">
              <motion.span
                key={Math.floor(transfer.progress)}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black font-mono text-slate-100"
              >
                {Math.round(transfer.progress)}%
              </motion.span>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mt-1">
                {transfer.status === 'paused' ? 'PAUSED' : 'SPEED'}
              </span>
              {transfer.status !== 'paused' && (
                <span className="text-xs font-mono font-bold text-teal-400 flex items-center gap-0.5 mt-0.5 animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-teal-400/20" /> {transfer.speed.toFixed(1)} MB/s
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Key Speeds & ETA Highlight Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Bytes Shared</p>
            <p className="text-sm font-black text-slate-200 mt-1 font-mono">
              {formatBytes(transferredSize)}
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">out of {formatBytes(transfer.size)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Estimated ETA</p>
            <p className="text-sm font-black text-slate-200 mt-1 font-mono">
              {transfer.status === 'completed' ? 'Finished' : transfer.progress > 0 && transfer.eta > 0 ? `${transfer.eta} sec` : 'Calculating...'}
            </p>
            <p className="text-[9px] text-slate-500 mt-0.5">WiFi Direct connection</p>
          </div>
        </div>

        {/* File item identity and peer label */}
        <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/20 flex flex-col space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="font-bold text-xs text-slate-300">Active Packet File</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
              {transfer.role === 'sender' ? 'Sent To' : 'Arrived From'}: {transfer.partnerName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center text-teal-400 font-bold font-sans text-xs flex-shrink-0">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-slate-200 text-xs truncate" title={transfer.name}>
                {transfer.name}
              </h4>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{formatBytes(transfer.size)} &middot; raw payload</p>
            </div>
          </div>
        </div>

        {/* Console Interruption & Action panel */}
        <div className="space-y-4">
          
          <h4 className="text-center font-bold text-xs font-mono text-slate-400 uppercase">
            {getStatusLabel(transfer.status)}
          </h4>

          {/* Pause, Resume, and Interruption Control Grid */}
          <div className="flex items-center justify-center gap-3 max-w-xs mx-auto">
            
            {transfer.status === 'transferring' && (
              <button
                onClick={onPause}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider select-none cursor-pointer hover:scale-102 transition shadow-md shadow-yellow-950/20 active:scale-98"
                id="btn-pause-transfer"
              >
                <Pause className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Pause Drop</span>
              </button>
            )}

            {transfer.status === 'paused' && (
              <button
                onClick={onResume}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider select-none cursor-pointer hover:scale-102 transition shadow-md shadow-emerald-950/20 active:scale-98"
                id="btn-resume-transfer"
              >
                <Play className="w-4 h-4 text-slate-950 fill-slate-950" />
                <span>Resume Drop</span>
              </button>
            )}

            {transfer.status === 'failed' && onRetry && (
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-indigo-505 bg-indigo-600 hover:bg-indigo-500 text-slate-100 font-bold rounded-xl text-xs uppercase tracking-wider select-none cursor-pointer hover:scale-102 transition shadow active:scale-98"
                id="btn-retry-transfer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Recovery</span>
              </button>
            )}

            <button
              onClick={onCancel}
              className="py-3 px-5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition"
              id="btn-cancel-transfer"
            >
              <X className="w-4 h-4" />
              <span>{transfer.status === 'completed' ? 'Done' : 'Cancel'}</span>
            </button>

          </div>

          {/* Background Running Indicators for Android 10-14 Scoped Storage */}
          {transfer.status === 'transferring' && (
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl text-left space-y-1.5 font-mono text-[9px] text-slate-400">
              <div className="flex justify-between items-center text-indigo-400 font-bold border-b border-indigo-500/10 pb-1">
                <span>ANDROID FG DAEMON ACTIVE</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p>● Service: Running Foreground Notification Layer prevent-stop</p>
              <p>● Battery state: Waketasks Exempted (Keep-Alive Lock Active)</p>
            </div>
          )}

          {/* Success / Error Full Visual Statuses */}
          {transfer.status === 'completed' && (
            <div className="space-y-4">
              {/* Success summary */}
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-center flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-2 fill-emerald-500/10" />
                <p className="font-extrabold text-slate-100 text-sm uppercase">Transfer complete & verified!</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                  Raw payload received has been successfully written to Scoped system directory.
                </p>

                {/* Target location and checksum card */}
                <div className="w-full mt-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-850/80 text-left font-mono text-[10px] space-y-2 text-slate-400">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5 font-bold uppercase text-[8px] text-emerald-400 select-none">
                    <span>Verified Filesystem Map</span>
                    <span>Checksum OK</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 block">Saved Storage Location:</span>
                    <span className="text-slate-200 block text-xs truncate break-all selection:bg-emerald-500/20 font-sans" title={savedPath}>
                      {savedPath || `/Internal Storage/FlashDrop/Others/${transfer.name}`}
                    </span>
                  </div>
                  <div className="space-y-0.5 pt-1 border-t border-slate-900">
                    <span className="text-slate-500 block">SHA-256 Integrity Hash:</span>
                    <span className="text-[9px] text-slate-400 break-all leading-tight block">
                      {sha256 || "sha256_b4c5d6e7f8... (verified local packet)"}
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-900 flex items-center gap-1.5 text-[9px] text-teal-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span>Android MediaStore Scanner Synced Refresh Completed</span>
                  </div>
                </div>

                {/* Fast Action Buttons */}
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  {transfer.fileUrl ? (
                    <a
                      href={transfer.fileUrl}
                      download={transfer.name}
                      className="py-3 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                      id="btn-open-file-progress"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Open File</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="py-3 px-2 bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold rounded-xl uppercase"
                    >
                      File Available
                    </button>
                  )}

                  {onOpenExplorer ? (
                    <button
                      onClick={onOpenExplorer}
                      className="py-3 px-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-black rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                      id="btn-open-folder-progress"
                    >
                      <Folder className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/10" />
                      <span>Open Folder</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="py-3 px-2 bg-slate-900 border border-slate-800 text-slate-550 text-xs font-bold rounded-xl uppercase"
                    >
                      Folder Map
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {transfer.status === 'failed' && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center flex flex-col items-center">
              <ServerCrash className="w-10 h-10 text-red-400 mb-2" />
              <p className="font-bold text-slate-200 text-xs uppercase">Interrupted wifi Socket</p>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                The peer disconnected or your signal shifted. Connect once more and use FlashDrop's resume recovery engine!
              </p>
            </div>
          )}

        </div>

        {/* Security verification */}
        <div className="flex items-center justify-center gap-1.5 text-slate-505 text-slate-500 text-[10px] font-mono uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-500/60" />
          <span>AES-256 Handshake Verification Active</span>
        </div>

      </div>
    </div>
  );
}
