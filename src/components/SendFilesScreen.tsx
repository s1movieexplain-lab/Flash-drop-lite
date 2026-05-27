import { useState, useRef, ChangeEvent } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Upload, File, Image, Video, FileText, AppWindow, Gift, Trash2, LayoutGrid, CheckCircle2, ShieldCheck } from "lucide-react";

interface SendFilesScreenProps {
  onBack: () => void;
  onProceed: (selectedFiles: Array<{ name: string; size: number; type: string; category: any; fileObj?: File }>) => void;
}

const CATEGORIES = [
  { id: 'photo', label: 'Photos', icon: Image, color: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'video', label: 'Videos', icon: Video, color: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'pdf', label: 'PDFs', icon: FileText, color: 'text-yellow-400 bg-yellow-500/10' },
  { id: 'app', label: 'Apps', icon: AppWindow, color: 'text-pink-400 bg-pink-500/10' },
  { id: 'zip', label: 'ZIPs', icon: File, color: 'text-orange-400 bg-orange-500/10' },
  { id: 'folder', label: 'Folders', icon: LayoutGrid, color: 'text-cyan-400 bg-cyan-500/10' },
];

const PRESET_DEMO_FILES = [
  { name: "RAW_IMG_2026_4K.DNG", size: 45.2 * 1024 * 1024, type: "image/x-adobe-dng", category: "photo" as const },
  { name: "UHD_Cinematic_Vlog_60fps.mp4", size: 185.0 * 1024 * 1024, type: "video/mp4", category: "video" as const },
  { name: "FlashDrop_Android_Production.apk", size: 32.5 * 1024 * 1024, type: "application/vnd.android.package-archive", category: "app" as const },
  { name: "Annual_Security_Audit_2026.pdf", size: 14.8 * 1024 * 1024, type: "application/pdf", category: "pdf" as const },
  { name: "Archive_Main_Workspace_Release.zip", size: 850.4 * 1024 * 1024, type: "application/zip", category: "zip" as const },
];

export function SendFilesScreen({ onBack, onProceed }: SendFilesScreenProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<Array<{ name: string; size: number; type: string; category: string; fileObj?: File }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File size formatter
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Handle local physical file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const list = Array.from(e.target.files) as File[];
      const newFiles = list.map((f: File) => {
        let cat: 'photo' | 'video' | 'pdf' | 'app' | 'zip' | 'document' | 'other' = 'other';
        if (f.type.startsWith('image/')) cat = 'photo';
        else if (f.type.startsWith('video/')) cat = 'video';
        else if (f.type === 'application/pdf') cat = 'pdf';
        else if (f.name.endsWith('.apk')) cat = 'app';
        else if (f.name.endsWith('.zip') || f.name.endsWith('.rar') || f.name.endsWith('.tar')) cat = 'zip';
        else if (f.type.startsWith('text/') || f.name.endsWith('.docx') || f.name.endsWith('.xlsx')) cat = 'document';

        return {
          name: f.name,
          size: f.size,
          type: f.type,
          category: cat,
          fileObj: f
        };
      });

      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Add simulated demo file
  const addDemoFile = (file: typeof PRESET_DEMO_FILES[0]) => {
    setSelectedFiles(prev => {
      // Avoid duplicate names for visual clarity
      if (prev.some(f => f.name === file.name)) return prev;
      return [...prev, file];
    });
  };

  // Remove a selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Trigger click on hidden file input
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Calculate stats
  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  // Filter criteria
  const displayedFiles = selectedFiles.filter(f => activeCategory === 'all' || f.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Search Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
            id="btn-back-send-files"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-sans font-extrabold text-base text-slate-100">Select Files</h2>
            <p className="text-xs text-slate-400">Zero compression, raw packets</p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <button
            onClick={() => setSelectedFiles([])}
            className="text-xs font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-400/5 px-2.5 py-1.5 rounded-lg border border-red-500/10 transition-all"
            id="btn-clear-selection"
          >
            <Trash2 className="w-3.5 h-3.5" />
            CLEAR ALL
          </button>
        )}
      </div>

      {/* Selector Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-36">
        
        {/* Category Selector Pills */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Quick Categories</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850'
              }`}
            >
              All Types ({selectedFiles.length})
            </button>
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = selectedFiles.filter(f => f.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag Drop File Picker Card (Direct input) */}
        <div
          onClick={triggerFileSelect}
          className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-emerald-500/40 bg-slate-900/10 hover:bg-slate-900/35 p-6 text-center select-none cursor-pointer transition-all flex flex-col items-center justify-center p-8 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 group-hover:scale-110 transition-transform mb-3 border border-slate-800">
            <Upload className="w-5 h-5" />
          </div>
          <p className="font-bold text-slate-200 text-sm">Select Real Device Files</p>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Photos, HD Videos, PDFs, ZIPs, or local executable APK files
          </p>
        </div>

        {/* High Speed Simulation Quick-Add section */}
        <div className="space-y-3 bg-slate-900/20 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-slate-200 text-xs uppercase font-mono tracking-wider">
              Simulation High-Vibe Presets
            </h3>
          </div>
          <p className="text-slate-400 text-xs pl-5 leading-normal">
            No big files handy? Click a preset below to instantly stage massive files (e.g. 185MB video) to test the lightning speed transfer and recovery features.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 pl-5">
            {PRESET_DEMO_FILES.map(demo => {
              const isSelected = selectedFiles.some(f => f.name === demo.name);
              return (
                <button
                  key={demo.name}
                  onClick={() => addDemoFile(demo)}
                  disabled={isSelected}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1 ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                      : 'bg-indigo-950/20 border-indigo-900/30 text-indigo-300 hover:bg-indigo-900/40 cursor-pointer'
                  }`}
                >
                  <span>+ {demo.name.slice(0, 16)}...</span>
                  <span className="text-[10px] text-indigo-400">({formatBytes(demo.size)})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected List Output */}
        <div className="space-y-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
            Files in Queue ({displayedFiles.length})
          </p>
          
          {displayedFiles.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-900 text-center rounded-2xl p-4 bg-slate-900/5 text-slate-500 text-xs">
              No files are selected. Tap above to select files or choose high-vibe presets.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {displayedFiles.map((file, idx) => {
                const isPreset = PRESET_DEMO_FILES.some(f => f.name === file.name);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-800/40 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-emerald-400">
                        <File className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs line-clamp-1 max-w-[160px]">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-mono">
                            {formatBytes(file.size)}
                          </span>
                          {isPreset && (
                            <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase">
                              Preset Demo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Floating Transfer Status Actions (Sticky footer) */}
      {selectedFiles.length > 0 && (
        <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/95 z-20 flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="text-left">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Selected Size</p>
            <p className="text-sm font-black text-slate-200 font-mono">
              {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} &middot; {formatBytes(totalSize)}
            </p>
          </div>
          <button
            onClick={() => onProceed(selectedFiles)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-5ff hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-sans rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-102 transition-all active:scale-98"
            id="btn-proceed-to-discovery"
          >
            <span>Find Devices</span>
          </button>
        </div>
      )}
    </div>
  );
}
