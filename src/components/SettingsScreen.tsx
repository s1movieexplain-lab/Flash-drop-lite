import { useState } from "react";
import { ArrowLeft, Save, ShieldCheck, Smartphone, Laptop, Tablet, Moon, Sun, Sliders, ToggleLeft, ToggleRight, Wifi, Shield } from "lucide-react";
import { AppSettings } from "../types";

interface SettingsScreenProps {
  onBack: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export function SettingsScreen({ onBack, settings, onSave }: SettingsScreenProps) {
  const [deviceName, setDeviceName] = useState(settings.deviceName);
  const [deviceType, setDeviceType] = useState(settings.deviceType);
  const [wifiDirectEnabled, setWifiDirectEnabled] = useState(settings.wifiDirectEnabled);
  const [requireApproval, setRequireApproval] = useState(settings.requireApproval);
  const [speedLimit, setSpeedLimit] = useState(settings.speedLimit);
  const [darkMode, setDarkMode] = useState(settings.darkMode);
  const [aesEncryption, setAesEncryption] = useState(settings.aesEncryption);

  const handleSave = () => {
    onSave({
      deviceName,
      deviceType,
      savePath: settings.savePath,
      wifiDirectEnabled,
      requireApproval,
      speedLimit,
      darkMode,
      aesEncryption
    });
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background radial rays */}
      <div className="absolute top-[30px] left-[50px] w-56 h-56 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 transition-colors"
            id="btn-back-settings"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-sans font-extrabold text-base text-slate-100">App Preferences</h2>
            <p className="text-xs text-slate-400">Tweak network sockets & UI vibe</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-slate-950 transition flex items-center gap-1 font-bold text-xs uppercase"
          id="btn-save-settings"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      {/* Content Form */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 z-10 pb-20 justify-center">
        
        {/* Device Customizer Panel */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Device Identity</p>
          
          <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-850 space-y-4 border-slate-800/80">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-450 font-bold block text-slate-400">Device Name</label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                maxLength={25}
                className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 focus:border-indigo-500 text-sm font-sans focus:outline-none"
                placeholder="Device display label"
                id="input-device-name"
              />
            </div>

            {/* Device Type Selection */}
            <div className="space-y-2">
              <label className="text-xs text-slate-450 font-bold block text-slate-400">Device Form Factor</label>
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setDeviceType('android')}
                  className={`py-2 px-3 border rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    deviceType === 'android'
                      ? 'bg-indigo-505 bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceType('ios')}
                  className={`py-2 px-3 border rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    deviceType === 'ios'
                      ? 'bg-indigo-550 bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>iOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceType('desktop')}
                  className={`py-2 px-3 border rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    deviceType === 'desktop'
                      ? 'bg-indigo-550 bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Web App</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transfer preferences */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Transmission Settings</p>
          
          <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-850 space-y-4 border-slate-800/80">
            {/* WiFi Direct Switcher */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span>WiFi Direct Transceiver</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] leading-relaxed">Runs physical peer link over local WLAN sockets first for zero mobile billing</p>
              </div>
              <button
                type="button"
                onClick={() => setWifiDirectEnabled(prev => !prev)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                {wifiDirectEnabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-400 fill-emerald-500/10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-600" />
                )}
              </button>
            </div>

            {/* Approval Requirement Switcher */}
            <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
              <div>
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-451 text-indigo-400" />
                  <span>Require Transfer Approvals</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] leading-relaxed">Requires and validates each payload size visually before triggering high bandwidth sockets</p>
              </div>
              <button
                type="button"
                onClick={() => setRequireApproval(prev => !prev)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                {requireApproval ? (
                  <ToggleRight className="w-10 h-10 text-emerald-400 fill-emerald-500/10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-600" />
                )}
              </button>
            </div>

            {/* AES pre-encryption toggle */}
            <div className="flex items-center justify-between border-t border-slate-800/40 pt-4">
              <div>
                <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>AES Packet Handshake</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[210px] leading-relaxed">Cryptographically hashes chunk blocks locally with 0% proxy decryption leak risk</p>
              </div>
              <button
                type="button"
                onClick={() => setAesEncryption(prev => !prev)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                {aesEncryption ? (
                  <ToggleRight className="w-10 h-10 text-emerald-400 fill-emerald-500/10" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Speed and Bandwidth management */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Atmospheric Speed Cap</p>
          
          <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-850 border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400">Current Bandwidth Limit</span>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {speedLimit === 0 ? "UNLIMITED (Max WiFi Speed)" : `${speedLimit} MB/s`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[0, 10, 25, 50].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSpeedLimit(val)}
                  className={`py-1.5 px-2.5 border rounded-lg font-mono text-[10px] font-bold transition cursor-pointer ${
                    speedLimit === val
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  {val === 0 ? "Uncapped" : `${val} MB/s`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Theme select (dark mode support required) */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Vibe & Display Vibe</p>
          
          <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-850 border-slate-800/80 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                {darkMode ? <Moon className="w-4 h-4 text-yellow-400 fill-yellow-400/20" /> : <Sun className="w-4 h-4 text-yellow-550 text-yellow-400" />}
                <span>Slate Dark Mode UI</span>
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Emits soft eye-protective indigo frequencies for late night drops</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(prev => !prev)}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              {darkMode ? (
                <ToggleRight className="w-10 h-10 text-emerald-400 fill-emerald-500/10" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-[9px] font-mono text-slate-600 uppercase">FlashDrop Lite v1.0.4 &middot; Build stable-2026.1</p>
        </div>

      </div>
    </div>
  );
}
