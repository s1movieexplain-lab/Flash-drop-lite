import { motion } from "motion/react";
import { ArrowLeft, Trash2, History, Share2, Download, AlertTriangle, CheckCircle2, FileUp, FileDown } from "lucide-react";
import { HistoryItem } from "../types";
import { useState } from "react";

interface HistoryScreenProps {
  onBack: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
}

export function HistoryScreen({
  onBack,
  history,
  onClearHistory,
  onRemoveItem
}: HistoryScreenProps) {
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredHistory = history.filter(item => {
    if (filter === 'sent') return item.role === 'sender';
    if (filter === 'received') return item.role === 'receiver';
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Search Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
            id="btn-back-history"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-sans font-extrabold text-base text-slate-100">Transfer History</h2>
            <p className="text-xs text-slate-400">Archived raw transmissions</p>
          </div>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-400/5 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-all"
            id="btn-clear-history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            WIPE LOGS
          </button>
        )}
      </div>

      {/* Main Filter Bar */}
      <div className="px-6 pt-4 flex gap-2 z-10">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase border transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-indigo-505 bg-indigo-600 border-indigo-500/20 text-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          All ({history.length})
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase border transition-all cursor-pointer ${
            filter === 'sent'
              ? 'bg-indigo-505 bg-indigo-600 border-indigo-500/20 text-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          Sent ({history.filter(h => h.role === 'sender').length})
        </button>
        <button
          onClick={() => setFilter('received')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold font-mono uppercase border transition-all cursor-pointer ${
            filter === 'received'
              ? 'bg-indigo-505 bg-indigo-600 border-indigo-500/20 text-slate-100'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
          }`}
        >
          Received ({history.filter(h => h.role === 'receiver').length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 z-10 pb-20 justify-center">
        
        {filteredHistory.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-900 p-8 text-slate-500 flex flex-col items-center justify-center">
            <History className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
            <p className="font-bold text-slate-400 text-sm">No History Records</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Transmissions sent or received will appear here in chronological order.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between hover:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Role Icon */}
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-850">
                      {item.role === 'sender' ? (
                        <FileUp className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <FileDown className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs max-w-[160px] truncate" title={item.fileName}>
                        {item.fileName}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.role === 'sender' ? 'Sent to' : 'From'}: <span className="font-bold text-slate-350">{item.partnerName}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-mono text-slate-500">{formatBytes(item.fileSize)}</span>
                        <span className="text-[9px] font-mono text-slate-500">&middot;</span>
                        <span className="text-[9px] font-mono text-slate-550 text-slate-500">{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Status Badge */}
                    {item.status === 'completed' ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-550/10 rounded font-bold font-mono text-[8px] text-emerald-400 uppercase">
                        OK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/10 rounded font-bold font-mono text-[8px] text-red-400 uppercase">
                        PAUSED
                      </span>
                    )}

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition"
                      title="Delete record from device history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
