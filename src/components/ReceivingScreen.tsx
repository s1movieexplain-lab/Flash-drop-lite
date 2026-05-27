import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Wifi, Heart, QrCode, Clipboard, Check, RefreshCw, XCircle, CheckCircle2, ShieldCheck, Download } from "lucide-react";
import QRCode from "qrcode";

interface ReceivingScreenProps {
  onBack: () => void;
  selfDevice: { id: string; name: string; avatar: string; ipAddress?: string };
  isOnline: boolean;
  incomingRequest: {
    sourceId: string;
    sourceName: string;
    sourceAvatar: string;
    files: Array<{ name: string; size: number; type: string }>;
  } | null;
  onAcceptIncoming: () => void;
  onRejectIncoming: () => void;
}

export function ReceivingScreen({
  onBack,
  selfDevice,
  isOnline,
  incomingRequest,
  onAcceptIncoming,
  onRejectIncoming
}: ReceivingScreenProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Derive direct pairing web link
  const appBaseUrl = window.location.origin;
  const pairingUrl = `${appBaseUrl}?pair=${selfDevice.id}`;

  useEffect(() => {
    // Generate pairing QR code using the installed `qrcode` package
    QRCode.toDataURL(pairingUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#0f172a", // Dark indigo Slate 900
        light: "#ffffff" // Pure white
      }
    })
      .then(url => {
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error("Error generating pairing QR code:", err);
      });
  }, [pairingUrl]);

  const copyPairingLink = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const totalIncomingSize = incomingRequest
    ? incomingRequest.files.reduce((acc, f) => acc + f.size, 0)
    : 0;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
            id="btn-back-receiver"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-sans font-extrabold text-base text-slate-100">Ready to Receive</h2>
            <p className="text-xs text-slate-400">Discoverable via QR & local sockets</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-emerald-400">
            Waiting...
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-20 justify-center">

        {/* Real-time Incoming Pre-Approval Dialog Overlay State */}
        {incomingRequest ? (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/20 shadow-2xl space-y-5 text-left bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/10 relative"
          >
            {/* Top design handle */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-slate-800" />
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-505/20 bg-slate-950 flex items-center justify-center text-4xl shadow border border-slate-800">
                {incomingRequest.sourceAvatar}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Arriving Connection</p>
                <h3 className="font-extrabold text-slate-100 text-normal">{incomingRequest.sourceName}</h3>
                <p className="text-[11px] font-mono text-slate-500">Wants to Drop files into your storage</p>
              </div>
            </div>

            {/* List of files arriving */}
            <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-bold uppercase font-sans">Incoming Files ({incomingRequest.files.length})</span>
                <span className="text-indigo-400 font-mono font-bold">{formatBytes(totalIncomingSize)}</span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {incomingRequest.files.map((file, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1">
                    <span className="text-slate-300 font-sans truncate pr-4 max-w-[200px]">{file.name}</span>
                    <span className="text-slate-500 font-mono text-[10px] flex-shrink-0">{formatBytes(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety policy disclaimer */}
            <div className="flex items-center gap-2 text-xs text-slate-400 leading-normal bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Approved transfers are copied to download storage with absolute zero quality degradation.</span>
            </div>

            {/* Accept / Deny button grids representing one-tap device approval */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <button
                onClick={onRejectIncoming}
                className="py-3 px-4 bg-slate-950 border border-slate-800 text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-900 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-reject-transfer"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Decline</span>
              </button>
              
              <button
                onClick={onAcceptIncoming}
                className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-5fd hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider select-none cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all"
                id="btn-accept-transfer"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Accept</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6 flex flex-col items-center justify-center">
            
            {/* Visual Listening State Animation */}
            <div className="relative flex items-center justify-center p-6 h-48 w-full max-w-xs mx-auto">
              {/* Radar circular rings */}
              <div className="absolute inset-4 rounded-full border border-indigo-500/10 animate-ping" />
              <div className="absolute inset-8 rounded-full border border-teal-500/10 animate-pulse" />
              <div className="absolute inset-12 rounded-full border border-indigo-500/20" />
              
              <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-2 text-center text-emerald-400 z-10 shadow-xl">
                <Wifi className="w-10 h-10 animate-pulse text-indigo-400" />
                <span className="text-[10px] font-mono font-bold mt-2 uppercase tracking-widest text-emerald-400">Discovering</span>
              </div>
            </div>

            {/* Discovery QR code Pairing Box */}
            <div className="bg-slate-900/60 rounded-3xl p-6 border border-slate-850 border-slate-800/80 text-center space-y-4 max-w-sm mx-auto flex flex-col items-center">
              
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-1.5 justify-center">
                  <QrCode className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Easy pairing QR</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                  Scan this QR code from another phone or tab on the same network to auto-initiate connection securely!
                </p>
              </div>

              {/* Generated QR container */}
              <div className="p-3 bg-white rounded-2xl w-44 h-44 flex items-center justify-center shadow-lg border-2 border-slate-800">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Pairing QR Link" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <RefreshCw className="w-8 h-8 text-indigo-505 animate-spin text-slate-400" />
                )}
              </div>

              {/* Pairing link copy widget */}
              <div className="w-full flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850 relative">
                <span className="text-[10px] font-mono text-slate-500 text-left truncate flex-1 pl-1">
                  {pairingUrl}
                </span>
                <button
                  onClick={copyPairingLink}
                  className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition flex items-center justify-center flex-shrink-0"
                  title="Copy Pairing Link URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Helpful instruction notes */}
            <div className="text-center space-y-1 max-w-xs mx-auto">
              <p className="font-bold text-xs text-slate-300">Name: &ldquo;{selfDevice.name}&rdquo;</p>
              <p className="text-[11px] font-mono text-slate-500">IP ADDRESS: {selfDevice.ipAddress || "Waiting for signal..."}</p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
