import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, Folder, File, Image as ImageIcon, Film, FileText, 
  AppWindow, Music, Layers, Trash2, Heart, ExternalLink, 
  HelpCircle, Eye, RefreshCw, Key, ShieldCheck, CheckCircle2, Search, Smartphone
} from "lucide-react";
import { HistoryItem } from "../types";

export interface ExplorerFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'photo' | 'video' | 'document' | 'app' | 'music' | 'other';
  savedPath: string;
  timestamp: string;
  sha256: string;
  fileUrl?: string;
}

interface FileExplorerScreenProps {
  onBack: () => void;
  history: HistoryItem[];
  virtualFiles: ExplorerFile[];
  onDeleteVirtualFile: (id: string) => void;
}

export function FileExplorerScreen({
  onBack,
  history,
  virtualFiles,
  onDeleteVirtualFile
}: FileExplorerScreenProps) {
  // Folder navigation state: null = Root (/Internal Storage/FlashDrop/), or category folder string
  const [currentFolder, setCurrentFolder] = useState<'photo' | 'video' | 'document' | 'app' | 'music' | 'other' | null>(null);
  const [selectedFile, setSelectedFile] = useState<ExplorerFile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mediaScanIsRefreshing, setMediaScanIsRefreshing] = useState(false);
  const [mediaScanLog, setMediaScanLog] = useState<string[]>([]);

  // Format size helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Run a manual MediaStore scanner scan
  const triggerMediaStoreScan = () => {
    setMediaScanIsRefreshing(true);
    setMediaScanLog(prev => [
      `[${new Date().toLocaleTimeString()}] Querying external volume...`,
       ...prev
    ]);

    setTimeout(() => {
      setMediaScanLog(prev => [
        `[${new Date().toLocaleTimeString()}] Rescanning folder '/Internal Storage/FlashDrop/'`,
        ...prev
      ]);
      
      setTimeout(() => {
        setMediaScanLog(prev => [
          `[${new Date().toLocaleTimeString()}] Syncing MediaStore records. Gallery & Files app state synced!`,
          ...prev
        ]);
        setMediaScanIsRefreshing(false);
      }, 700);
    }, 600);
  };

  // Extract counts for each mock category
  const getCategoryCount = (cat: 'photo' | 'video' | 'document' | 'app' | 'music' | 'other') => {
    return virtualFiles.filter(f => f.category === cat).length;
  };

  // Render file type icons helper
  const getFileIcon = (cat: string) => {
    switch (cat) {
      case 'photo': return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'video': return <Film className="w-5 h-5 text-indigo-400" />;
      case 'document': return <FileText className="w-5 h-5 text-yellow-500" />;
      case 'app': return <AppWindow className="w-5 h-5 text-rose-400" />;
      case 'music': return <Music className="w-5 h-5 text-pink-400" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  // Get full human category names
  const getFolderName = (cat: 'photo' | 'video' | 'document' | 'app' | 'music' | 'other') => {
    switch (cat) {
      case 'photo': return 'Photos';
      case 'video': return 'Videos';
      case 'document': return 'Documents';
      case 'app': return 'APKs';
      case 'music': return 'Music';
      default: return 'Others';
    }
  };

  const getFolderPath = (cat: 'photo' | 'video' | 'document' | 'app' | 'music' | 'other') => {
    return `/Internal Storage/FlashDrop/${getFolderName(cat)}/`;
  };

  // Filter items in current subfolder
  const itemsInCurrentFolder = virtualFiles.filter(f => {
    if (currentFolder && f.category !== currentFolder) return false;
    if (searchQuery.trim() !== "") {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Search and route Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (currentFolder) {
                  setCurrentFolder(null);
                } else {
                  onBack();
                }
              }}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
              id="btn-explorer-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-sans font-extrabold text-base text-slate-100 flex items-center gap-2">
                <span>Storage Explorer</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                  Scoped Storage
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {currentFolder ? getFolderPath(currentFolder) : "/Internal Storage/FlashDrop/"}
              </p>
            </div>
          </div>

          <button
            onClick={triggerMediaStoreScan}
            className={`p-2 rounded-lg text-[10px] font-mono font-bold border border-slate-800 transition uppercase flex items-center gap-1 ${
              mediaScanIsRefreshing ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${mediaScanIsRefreshing ? 'animate-spin' : ''}`} />
            <span>Rescan</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved files..."
            className="w-full bg-slate-950/80 pl-9 pr-4 py-2 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition"
          />
        </div>
      </div>

      {/* Main viewport explorer directories list */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-20 justify-center">

        {/* SCANNER LOG DIAGNOSTICS LOG CONTAINER */}
        {mediaScanLog.length > 0 && (
          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-slate-800/40 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <span>Android MediaStore Triggers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="max-h-20 overflow-y-auto font-mono text-[9px] text-slate-500 space-y-1 scrollbar-thin">
              {mediaScanLog.slice(0, 4).map((log, index) => (
                <p key={index} className="truncate">{log}</p>
              ))}
            </div>
          </div>
        )}

        {/* ROOT LEVEL VIEW: Show 6 core directory folders */}
        {!currentFolder ? (
          <div className="space-y-4">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">APP DIRECTORY SUBFOLDERS</p>

            <div className="grid grid-cols-2 gap-3.5">
              {(['photo', 'video', 'document', 'app', 'music', 'other'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCurrentFolder(cat)}
                  className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/30 border border-slate-850 hover:border-slate-700/80 text-left transition hover:bg-slate-900/60 cursor-pointer text-slate-200 select-none relative overflow-hidden group shadow-sm hover:scale-[1.01]"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center p-2 mb-3 border border-slate-800 shrink-0">
                    <Folder className="w-6 h-6 text-emerald-500 fill-emerald-500/10 group-hover:scale-110 transition-transform" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-100">{getFolderName(cat)}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{getCategoryCount(cat)} saved files</p>
                  
                  <span className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-600 uppercase">/FlashDrop/{getFolderName(cat)}</span>
                </button>
              ))}
            </div>

            {/* Quick stats on storage */}
            <div className="bg-slate-900/10 border border-slate-850 rounded-2xl p-4 flex gap-3 items-center">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left text-xs">
                <h4 className="font-bold text-indigo-300">Auto Storage Distribution Engine</h4>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Incoming transfers automatically parse format structures to store assets in correct Scoped system paths.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* SUBFOLDER CONTENT LIST */
          <div className="space-y-4">
            
            {/* Folder Header trace */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <Folder className="w-4 h-4 text-emerald-500 fill-emerald-500/10" />
              <span className="text-xs font-bold text-slate-300">
                Directory: {getFolderName(currentFolder)} ({itemsInCurrentFolder.length} items)
              </span>
            </div>

            {itemsInCurrentFolder.length === 0 ? (
              <div className="py-20 text-center rounded-2xl border border-dashed border-slate-905 p-8 border-slate-900 text-slate-500 flex flex-col items-center justify-center">
                <File className="w-10 h-10 text-slate-650 mb-3 text-slate-600 animate-pulse" />
                <p className="font-bold text-slate-450 text-xs">Folder is empty</p>
                <p className="text-[10px] text-slate-500 max-w-[180px] mt-1 pr-1">Received files of this format type will auto compile here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {itemsInCurrentFolder.map(file => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-900/30 border border-slate-850 hover:border-slate-800 text-left transition hover:bg-slate-900/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center shrink-0 border border-slate-850">
                        {getFileIcon(file.category)}
                      </div>
                      <div className="truncate text-xs">
                        <h4 className="font-bold text-slate-200 truncate" title={file.name}>{file.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {formatBytes(file.size)} &middot; {new Date(file.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteVirtualFile(file.id);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-400 transition"
                        title="Delete file permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* FILE PREVIEW MODAL DETAIL INTERACTION */}
      {selectedFile && (
        <div className="absolute inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-5 shadow-2xl relative select-none">
            
            <button 
              onClick={() => setSelectedFile(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              id="btn-close-preview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Simulated file visual header depending on type */}
            <div className="w-20 h-20 rounded-2.5xl rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg text-4xl">
              {selectedFile.category === 'photo' ? "🖼️" : selectedFile.category === 'video' ? "🎬" : selectedFile.category === 'document' ? "📄" : selectedFile.category === 'app' ? "🤖" : selectedFile.category === 'music' ? "🎵" : "📦"}
            </div>

            <div className="space-y-1.5 w-full">
              <h3 className="font-extrabold text-slate-100 text-sm truncate px-4" title={selectedFile.name}>{selectedFile.name}</h3>
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Verified file block</p>
            </div>

            {/* File statistics checklist */}
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2.5 text-left text-xs font-mono">
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-900 pb-1.5 font-bold uppercase text-[9px]">
                <span>Metadata Details</span>
                <span className="text-emerald-400 font-bold font-sans">STATUS: OK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Type:</span>
                <span className="text-slate-350 text-[11px] truncate max-w-[170px]">{selectedFile.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Raw Size:</span>
                <span className="text-slate-355 text-slate-300">{formatBytes(selectedFile.size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saved Directory:</span>
                <span className="text-slate-300 text-right truncate max-w-[160px]" title={selectedFile.savedPath}>
                  {selectedFile.savedPath}
                </span>
              </div>
              <div className="flex flex-col space-y-1 pt-1.5 border-t border-slate-900">
                <span className="text-emerald-400 font-bold uppercase text-[9px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SHA-256 Checksum Signature</span>
                </span>
                <span className="text-[9px] text-slate-400 break-all leading-tight">
                  {selectedFile.sha256}
                </span>
              </div>
            </div>

            {/* Actions for the selected file */}
            <div className="w-full flex gap-3 text-center">
              <button
                onClick={() => setSelectedFile(null)}
                className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 text-xs font-bold rounded-xl uppercase tracking-wider cursor-pointer"
              >
                Back Folder
              </button>
              
              {selectedFile.fileUrl && (
                <a
                  href={selectedFile.fileUrl}
                  download={selectedFile.name}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-lg"
                  id="btn-download-file-explorer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open File</span>
                </a>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
