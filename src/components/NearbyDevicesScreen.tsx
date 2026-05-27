import { motion } from "motion/react";
import { ArrowLeft, Compass, QrCode, Smartphone, Laptop, Tablet, RefreshCw, PlusCircle, CheckCircle, Shield } from "lucide-react";
import { Device } from "../types";
import { useState, useEffect } from "react";

interface NearbyDevicesScreenProps {
  onBack: () => void;
  onSelectDevice: (device: Device, isMock?: boolean) => void;
  onlineDevices: Device[];
  selfDevice: Device;
}

const MOCK_NEARBY_DEVICES: Device[] = [
  { id: "mock_pixel_8", name: "Google Pixel 8 Pro", avatar: "🦊", status: "idle", deviceType: "android", ipAddress: "192.168.1.144", osVersion: "Android 14" },
  { id: "mock_iphone_15", name: "iPhone 15 Pro Max", avatar: "🐼", status: "idle", deviceType: "ios", ipAddress: "192.168.1.189", osVersion: "iOS 17" },
  { id: "mock_macbook", name: "MacBook Pro M3", avatar: "🐨", status: "idle", deviceType: "desktop", ipAddress: "192.168.1.102", osVersion: "macOS Sonoma" }
];

export function NearbyDevicesScreen({ onBack, onSelectDevice, onlineDevices = [], selfDevice }: NearbyDevicesScreenProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMocks, setShowMocks] = useState(true);

  // Filter out self if included in onlineDevices
  const actualPeers = onlineDevices.filter(d => d.id !== selfDevice.id);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const DeviceIcon = ({ type }: { type: 'android' | 'ios' | 'desktop' }) => {
    switch (type) {
      case 'desktop':
        return <Laptop className="w-4 h-4 text-emerald-400" />;
      case 'ios':
        return <Tablet className="w-4 h-4 text-emerald-400" />;
      default:
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background radial rays mimicking device scanner */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
            id="btn-back-nearby"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-sans font-extrabold text-base text-slate-100">Nearby Devices</h2>
            <p className="text-xs text-slate-400">Searching WiFi & local sockets</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Simulated Devices */}
          <button
            onClick={() => setShowMocks(prev => !prev)}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              showMocks
                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle simulated nearby devices for demonstration"
          >
            SIMULATOR
          </button>
          
          <button
            onClick={handleRefresh}
            className={`p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            id="btn-scan-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Radar Scan Interactive Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-20 justify-center">
        
        {/* Pulsating Radar Bubble */}
        <div className="relative flex flex-col items-center justify-center py-8">
          
          {/* Pulsating circles */}
          <div className="absolute w-44 h-44 rounded-full border border-emerald-500/10 animate-ping" />
          <div className="absolute w-64 h-64 rounded-full border border-teal-500/5 animate-pulse" />
          <div className="absolute w-28 h-28 rounded-full border border-emerald-500/20" />

          {/* Central Logo node */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-xl shadow-emerald-900/30 border-4 border-slate-950 z-10"
          >
            <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
          </motion.div>
          
          <p className="text-center text-xs text-slate-400 mt-6 z-10 font-mono tracking-wide">
            {isRefreshing ? "PROBING SYSTEM SOCKETS..." : "PEERS CONNECTED ON THE SAME LAN:"}
          </p>
        </div>

        {/* Device selection rows */}
        <div className="space-y-3">
          
          {/* Real Online Devices */}
          {actualPeers.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest pl-1">
                Real Devices Online ({actualPeers.length})
              </p>
              {actualPeers.map(device => (
                <button
                  key={device.id}
                  onClick={() => onSelectDevice(device, false)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-3xl border border-emerald-500/20">
                      {device.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                        <span>{device.name}</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 uppercase font-mono tracking-widest animate-pulse">
                          Real Peer
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        {device.ipAddress} &middot; {device.osVersion || "Unknown OS"}
                      </p>
                    </div>
                  </div>
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick instructions if no real devices */}
          {actualPeers.length === 0 && (
            <div className="rounded-xl border border-slate-850 bg-slate-900/10 p-4 border-slate-800/60">
              <p className="text-xs text-slate-400 text-center leading-relaxed">
                🚀 No other real devices connected yet. To test <strong>real-time instant pairing</strong>, copy this tab's URL and open it in another browser tab, or scan on your phone!
              </p>
            </div>
          )}

          {/* Simulated Devices List (Demo Mode) */}
          {showMocks && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest pl-1">
                Simulated Nearby Peers (Demo Simulator)
              </p>
              {MOCK_NEARBY_DEVICES.map(device => (
                <button
                  key={device.id}
                  onClick={() => onSelectDevice(device, true)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-900/30 border border-slate-800 hover:border-indigo-500/20 hover:bg-slate-900/65 cursor-pointer text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-3xl border border-slate-800">
                      {device.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                        <span>{device.name}</span>
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                          Simulator
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {device.ipAddress} &middot; {device.osVersion}
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-slate-900 text-slate-500 border border-slate-800 rounded-xl text-xs flex items-center gap-1">
                    <DeviceIcon type={device.deviceType} />
                    <span className="text-[9px] uppercase font-bold font-mono text-slate-400">
                      {device.deviceType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* AES Encryption Badge */}
        <div className="flex items-center justify-center gap-1.5 text-slate-505 dark:text-slate-500 text-xs text-slate-500 py-3 font-mono">
          <Shield className="w-4 h-4 text-emerald-500/50" />
          <span>PAIRED CONNECTIONS REQUIRE PRE-APPROVAL</span>
        </div>

      </div>
    </div>
  );
}
