import { motion } from "motion/react";
import { BookOpen, Copy, Check, Terminal, Wifi, Shield, AppWindow } from "lucide-react";
import { useState } from "react";

export function SetupGuide({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const flutterCode = `// lib/transfer_service.dart
import 'dart:io';
import 'package:flutter_p2p_connection/flutter_p2p_connection.dart';

class FlashDropTransfer {
  final _flutterP2pConnectionPlugin = FlutterP2pConnection();
  
  Future<bool> initializeWifiDirect() async {
    return await _flutterP2pConnectionPlugin.initialize();
  }

  Future<bool> startDiscovery() async {
    return await _flutterP2pConnectionPlugin.discover();
  }

  Future<bool> connectToDevice(String address) async {
    return await _flutterP2pConnectionPlugin.connect(address);
  }

  // Pure socket connection with 0% loss
  void sendFileSocket(File file, String receiverIp) async {
    Socket socket = await Socket.connect(receiverIp, 4040);
    var rawBytes = file.openRead();
    await socket.addStream(rawBytes);
    await socket.close();
  }
}`;

  const nodeSetupGuide = `# Initialize FlashDrop Lite server on local machines
npm install
npm run dev

# Flutter build for Android:
flutter pub get
flutter build apk --release`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-slate-100 max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-sans font-bold text-lg text-slate-100">Setup & Developer Guide</h3>
              <p className="text-xs text-slate-400">FlashDrop Lite integration steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm font-sans">
          
          {/* Quick Start for regular users */}
          <div>
            <h4 className="font-semibold text-emerald-400 mb-2 flex items-center gap-2">
              <Wifi className="w-4 h-4" /> 1. How a Web Transfer Works
            </h4>
            <p className="text-slate-300 leading-relaxed pl-6">
              Open <strong>FlashDrop Lite</strong> on two devices connected to the same WiFi network (or local area network). They will automatically discover each other in real-time. You can trigger scans, choose files, pair via QR code, and send items instantly at maximum bandwidth with <strong>0% compression</strong>.
            </p>
          </div>

          {/* Secure Transfer Architecture */}
          <div>
            <h4 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 2. Security & Zero Loss
            </h4>
            <ul className="list-disc pl-10 space-y-1.5 text-slate-300">
              <li><strong>Local WiFi Encrypted Tunnel:</strong> All file streams are protected locally before transmission.</li>
              <li><strong>Device Approval Required:</strong> Receivers must review the name, size, and category of arriving files and tap 'Accept' to authorize downloads.</li>
              <li><strong>Raw Chunks:</strong> No secondary compression is applied to ensure full quality for raw camera photos (RAW, PNG), high-bitrate 4K UHD videos, documents (PDF, Docx), ZIPs, and app bundles.</li>
            </ul>
          </div>

          {/* Android Flutter Code Base Guide */}
          <div>
            <h4 className="font-semibold text-emerald-404 mb-2 flex items-center gap-2 text-emerald-400">
              <AppWindow className="w-4 h-4" /> 3. Flutter Android App Integration (.dart)
            </h4>
            <p className="text-slate-300 leading-relaxed mb-2 pl-6">
              To bundle FlashDrop Lite into a fully-functional high-performance native Android application, you can use compile-ready WiFi Direct libraries (like <code className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">flutter_p2p_connection</code>).
            </p>
            
            <div className="relative pl-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-emerald-300 max-h-56">
                <pre>{flutterCode}</pre>
              </div>
              <button
                onClick={() => copyToClipboard(flutterCode, 'flutter')}
                className="absolute top-2 right-2 bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition"
                title="Copy code snippet"
              >
                {copiedId === 'flutter' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Server Config & Scripts */}
          <div>
            <h4 className="font-semibold text-indigo-400 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> 4. Local Execution & Build Setup
            </h4>
            <div className="relative pl-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300">
                <pre>{nodeSetupGuide}</pre>
              </div>
              <button
                onClick={() => copyToClipboard(nodeSetupGuide, 'setup')}
                className="absolute top-4 right-2 bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition"
              >
                {copiedId === 'setup' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/30">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-semibold font-sans rounded-xl transition-all text-xs"
          >
            Got it, thanks!
          </button>
        </div>
      </motion.div>
    </div>
  );
}
