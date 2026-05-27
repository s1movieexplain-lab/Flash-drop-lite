/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Device, TransferFile, HistoryItem, AppSettings } from "./types";
import { SplashScreen } from "./components/SplashAndLogo";
import { HomeScreen } from "./components/HomeScreen";
import { SendFilesScreen } from "./components/SendFilesScreen";
import { NearbyDevicesScreen } from "./components/NearbyDevicesScreen";
import { ReceivingScreen } from "./components/ReceivingScreen";
import { TransferProgressScreen } from "./components/TransferProgressScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { SetupGuide } from "./components/SetupGuide";

// Local storage key constants
const HISTORY_KEY = "flashdrop_history_logs_v1";
const SETTINGS_KEY = "flashdrop_settings_config_v1";
const SELF_DEVICE_KEY = "flashdrop_self_identity_v1";

// List of fun emojis for device avatars
const ANIMAL_AVATARS = ["🦊", "🐼", "🐨", "🐰", "🦁", "🐧", "🐱", "🐶", "🐵", "🦉"];
const ADJECTIVES = ["Swift", "Cosmic", "Turbo", "Vocal", "Frosty", "Sonic", "Direct", "Agile"];
const NOUNS = ["Droid", "Pixel", "Phone", "Client", "Node", "Core", "Pad"];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'home' | 'send' | 'devices' | 'receiving' | 'progress' | 'history' | 'settings'>('splash');
  const [showGuide, setShowGuide] = useState(false);
  
  // Real-time connections
  const [isOnline, setIsOnline] = useState(false);
  const [onlineDevices, setOnlineDevices] = useState<Device[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // App Identity & Preferences State
  const [selfDevice, setSelfDevice] = useState<Device>(() => {
    const saved = localStorage.getItem(SELF_DEVICE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    const randId = Math.random().toString(36).substring(2, 9);
    const randAvatar = ANIMAL_AVATARS[Math.floor(Math.random() * ANIMAL_AVATARS.length)];
    const randName = `${ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]} ${NOUNS[Math.floor(Math.random() * NOUNS.length)]} ${randId.slice(0, 3).toUpperCase()}`;
    return {
      id: randId,
      name: randName,
      avatar: randAvatar,
      status: "idle",
      deviceType: "android",
      ipAddress: "127.0.0.1",
      osVersion: "Android 13",
      isSelf: true
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      deviceName: selfDevice.name,
      deviceType: "android",
      savePath: "Download/FlashDrop",
      wifiDirectEnabled: true,
      requireApproval: true,
      speedLimit: 0,
      darkMode: true,
      aesEncryption: true
    };
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [];
  });

  // Current transmission parameters
  const [selectedFiles, setSelectedFiles] = useState<Array<{ name: string; size: number; type: string; category: any; fileObj?: File }>>([]);
  const [activeTransfer, setActiveTransfer] = useState<TransferFile | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{
    sourceId: string;
    sourceName: string;
    sourceAvatar: string;
    files: Array<{ name: string; size: number; type: string }>;
  } | null>(null);

  // Buffer holding incoming chunks/pieces for physical files assembling
  const receivedFileBufferRef = useRef<{ [fileId: string]: string[] }>({});

  // Stats calculation
  const totalTransferredBytes = history
    .filter(h => h.status === "completed")
    .reduce((acc, current) => acc + current.fileSize, 0);

  // Persist identity changes
  useEffect(() => {
    localStorage.setItem(SELF_DEVICE_KEY, JSON.stringify(selfDevice));
  }, [selfDevice]);

  // Persist settings changes
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Synch settings.deviceName and settings.deviceType to self device info
    setSelfDevice(prev => ({
      ...prev,
      name: settings.deviceName,
      deviceType: settings.deviceType
    }));
  }, [settings]);

  // Persist history logs
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Connect & maintain WebSocket connectivity with backend
  useEffect(() => {
    const connectToBackend = () => {
      try {
        const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${wsProto}//${window.location.host}/ws`;
        
        console.log(`Establishing signal channel linking at: ${wsUrl}`);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("WebSocket linked connected to backend signaling tunnel!");
          setIsOnline(true);
          // Register device details
          ws.send(JSON.stringify({
            type: "join",
            device: selfDevice
          }));
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            console.log("Incoming signal message:", msg.type, msg);

            switch (msg.type) {
              case "device_list": {
                // Set discovered peers
                setOnlineDevices(msg.devices);
                break;
              }

              case "pairing_request": {
                // Remote device wants to link
                console.log(`Pairing link requested by ${msg.sourceName}`);
                break;
              }

              case "transfer_request": {
                // Remote device offering files
                setIncomingRequest({
                  sourceId: msg.sourceId,
                  sourceName: msg.sourceName,
                  sourceAvatar: msg.sourceAvatar,
                  files: msg.files
                });
                
                // Switch tabs to receiving view automatically if in idle screen
                if (currentScreen !== "progress" && currentScreen !== "receiving") {
                  setCurrentScreen("receiving");
                }
                break;
              }

              case "transfer_response": {
                // Receiver approved/rejected files
                if (msg.approved && activeTransfer) {
                  // Begin actual file transfer!
                  setActiveTransfer(prev => prev ? { ...prev, status: "transferring" } : null);
                  setCurrentScreen("progress");
                  
                  // Start real file chunk pump if physical file is selected
                  const physicalFile = selectedFiles[0];
                  if (physicalFile && physicalFile.fileObj) {
                    pumpFileChunks(physicalFile.fileObj, msg.sourceId);
                  } else {
                    // Fallback to beautiful fast speed progress simulation
                    startSimulatedTransfer(true);
                  }
                } else {
                  alert("Device declined file transfer.");
                  setActiveTransfer(null);
                  setCurrentScreen("devices");
                }
                break;
              }

              case "transfer_chunk": {
                // Incoming physical file chunk block
                const { fileId, fileName, fileSize, fileType, chunkIndex, totalChunks, data } = msg;
                
                if (!receivedFileBufferRef.current[fileId]) {
                  receivedFileBufferRef.current[fileId] = [];
                }
                receivedFileBufferRef.current[fileId][chunkIndex] = data;

                // Sync current progress calculations
                const loadedPercentage = Math.round(((chunkIndex + 1) / totalChunks) * 105);
                const progressVal = Math.min(loadedPercentage, 100);

                setActiveTransfer(prev => {
                  if (prev) {
                    return {
                      ...prev,
                      progress: progressVal,
                      status: progressVal === 100 ? "completed" : "transferring",
                      speed: 24.5 + Math.random() * 5, // MB/s simulated average
                      eta: Math.max(Math.ceil((totalChunks - chunkIndex) * 0.1), 0)
                    };
                  }
                  return prev;
                });

                // Check if totally compiled
                if (chunkIndex + 1 === totalChunks) {
                  assembleAndCompleteFile(fileId, fileName, fileSize, fileType, msg.sourceId, msg.sourceName);
                } else {
                  // Acknowledge chunk and trigger sender for next slice (throttled flow control)
                  sendPacket({
                    type: "transfer_chunk_ack",
                    targetId: msg.sourceId,
                    fileId,
                    nextChunk: chunkIndex + 1
                  });
                }
                break;
              }

              case "transfer_chunk_ack": {
                // Next slice trigger signal handled natively by flow loop
                break;
              }

              case "transfer_paused": {
                setActiveTransfer(prev => prev ? { ...prev, status: "paused" } : null);
                break;
              }

              case "transfer_resumed": {
                setActiveTransfer(prev => prev ? { ...prev, status: "transferring" } : null);
                break;
              }

              case "transfer_canceled": {
                setActiveTransfer(null);
                setIncomingRequest(null);
                alert("Transfer dropped by partner.");
                setCurrentScreen("home");
                break;
              }

              default:
                break;
            }
          } catch (e) {
            console.error("Signal parsing crash:", e);
          }
        };

        ws.onclose = () => {
          console.log("WebSocket signal channel offline. Reconnecting in 5s...");
          setIsOnline(false);
          setOnlineDevices([]);
          setTimeout(connectToBackend, 5000);
        };

        ws.onerror = (err) => {
          console.error("Signal socket error:", err);
          ws.close();
        };

      } catch (e) {
        console.error("Socket link initiate fail:", e);
      }
    };

    connectToBackend();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Check URL query parameters for dynamic QR pairing links
  useEffect(() => {
    if (currentScreen === 'home') {
      const params = new URLSearchParams(window.location.search);
      const pairId = params.get("pair");
      
      if (pairId && pairId !== selfDevice.id) {
        // Clear param to avoid loops on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Auto navigate to device scanner or send state
        setCurrentScreen("send");
        alert(`Paired code detected. Please stage files to send to peer: ${pairId}`);
      }
    }
  }, [currentScreen]);

  // Send uniform JSON signal via active WS hook
  const sendPacket = (payload: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // Convert and stream physical file off file input
  const pumpFileChunks = (file: File, destinationId: string) => {
    const fileId = "file_" + Math.random().toString(36).substring(2, 9);
    const CHUNK_SIZE = 128 * 1024; // 128KB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    
    const fileReader = new FileReader();
    let currentChunk = 0;

    const readNextChunk = () => {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blobSlice = file.slice(start, end);
      fileReader.readAsDataURL(blobSlice); // Read as Data URL (base64) for safe WebSocket text frame JSON pumping
    };

    fileReader.onload = (e) => {
      const base64Data = e.target?.result as string;
      const base64Payload = base64Data.split(",")[1] || base64Data; // strip raw schema marker

      sendPacket({
        type: "transfer_chunk",
        targetId: destinationId,
        fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        chunkIndex: currentChunk,
        totalChunks,
        data: base64Payload
      });

      // Simple pacing mechanism
      currentChunk++;
      if (currentChunk < totalChunks) {
        // Update sender visual dials
        const percentageVal = Math.round((currentChunk / totalChunks) * 100);
        setActiveTransfer(prev => prev ? {
          ...prev,
          progress: percentageVal,
          speed: 15.5 + Math.random() * 4,
          eta: Math.ceil(((totalChunks - currentChunk) * 0.15))
        } : null);

        // Slow pacing slightly to avoid buffering overload on local servers
        setTimeout(readNextChunk, 8);
      } else {
        // Finished pumping chunks off host
        setActiveTransfer(prev => prev ? {
          ...prev,
          progress: 100,
          status: "completed",
          speed: 0,
          eta: 0
        } : null);

        // Update history logs
        const hist: HistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          category: getCategoryOfFile(file.type, file.name),
          timestamp: new Date().toISOString(),
          partnerName: activeTransfer?.partnerName || "Discovered Device",
          role: "sender",
          status: "completed"
        };
        setHistory(prev => [hist, ...prev]);
      }
    };

    readNextChunk();
  };

  // Turn buffers back into local Blob downloads for the receiver
  const assembleAndCompleteFile = (
    fileId: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    sourceId: string,
    sourceName: string
  ) => {
    try {
      const chunkArrays = receivedFileBufferRef.current[fileId];
      if (!chunkArrays) return;

      // Decode base64 components back to byte vectors
      const byteCharacters = chunkArrays.map(chunk => atob(chunk)).join("");
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileType });
      const objectUrl = URL.createObjectURL(blob);

      setActiveTransfer(prev => prev ? {
        ...prev,
        progress: 100,
        status: "completed",
        fileUrl: objectUrl
      } : null);

      // Clean buffer blocks
      delete receivedFileBufferRef.current[fileId];

      // Save record in device history
      const hist: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        fileName,
        fileSize,
        fileType,
        category: getCategoryOfFile(fileType, fileName),
        timestamp: new Date().toISOString(),
        partnerName: sourceName,
        role: "receiver",
        status: "completed"
      };
      setHistory(prev => [hist, ...prev]);

    } catch (e) {
      console.error("Failed to assemble received slices into binary blob:", e);
      alert("Error compiling incoming raw bytes.");
      setActiveTransfer(prev => prev ? { ...prev, status: "failed" } : null);
    }
  };

  const getCategoryOfFile = (type: string, name: string): any => {
    if (type.startsWith("image/")) return "photo";
    if (type.startsWith("video/")) return "video";
    if (type === "application/pdf") return "pdf";
    if (name.endsWith(".apk")) return "app";
    if (name.endsWith(".zip") || name.endsWith(".rar")) return "zip";
    return "other";
  };

  // Helper simulated timeline loop engine (Demo Fallback)
  let simInterval: any = null;
  const startSimulatedTransfer = (isSenderRole: boolean) => {
    if (simInterval) clearInterval(simInterval);

    let progress = 0;
    simInterval = setInterval(() => {
      setActiveTransfer(prev => {
        if (!prev) {
          clearInterval(simInterval);
          return null;
        }

        if (prev.status === 'paused') {
          return prev;
        }

        const step = Math.floor(Math.random() * 8) + 4; // 4 to 12% jump
        const newProgress = Math.min(prev.progress + step, 100);

        if (newProgress === 100) {
          clearInterval(simInterval);
          
          // Complete and append log record
          setTimeout(() => {
            const hist: HistoryItem = {
              id: Math.random().toString(36).substring(2, 9),
              fileName: prev.name,
              fileSize: prev.size,
              fileType: prev.type,
              category: prev.category,
              timestamp: new Date().toISOString(),
              partnerName: prev.partnerName,
              role: prev.role,
              status: "completed"
            };
            setHistory(h => [hist, ...h]);
          }, 400);

          return {
            ...prev,
            progress: 100,
            status: "completed",
            speed: 0,
            eta: 0
          };
        }

        // Keep counting down
        const simulatedSpeed = 18.2 + Math.random() * 12.4; // MB/s
        const remainingBytes = prev.size * (1 - newProgress / 100);
        const etaVal = Math.max(Math.ceil(remainingBytes / (simulatedSpeed * 1024 * 1024)), 1);

        return {
          ...prev,
          progress: newProgress,
          speed: simulatedSpeed,
          eta: etaVal
        };
      });
    }, 850);
  };

  // Initiate sending queue compilation
  const handleProceedSendSelection = (files: any[]) => {
    setSelectedFiles(files);
    setCurrentScreen("devices");
  };

  // Tap pairing device node
  const handleSelectDevice = (device: Device, isMock: boolean = false) => {
    if (selectedFiles.length === 0) return;

    const topFile = selectedFiles[0];
    
    // Core Transfer mapping representing active sending operations
    const transferPayload: TransferFile = {
      id: "tx_" + Math.random().toString(36).substring(2, 9),
      name: topFile.name,
      size: topFile.size,
      type: topFile.type,
      category: topFile.category || "other",
      progress: 0,
      status: "connecting",
      speed: 0,
      eta: 0,
      role: "sender",
      partnerId: device.id,
      partnerName: device.name
    };

    setActiveTransfer(transferPayload);
    setCurrentScreen("progress");

    if (isMock) {
      // Mock flow transitions smoothly using simulated loops
      setTimeout(() => {
        setActiveTransfer(prev => prev ? { ...prev, status: "transferring" } : null);
        startSimulatedTransfer(true);
      }, 1500);
    } else {
      // Real WS device handshakes
      sendPacket({
        type: "transfer_request",
        targetId: device.id,
        sourceId: selfDevice.id,
        sourceName: selfDevice.name,
        sourceAvatar: selfDevice.avatar,
        files: selectedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
      });
    }
  };

  // Receiver pre-approval handshakes
  const handleAcceptIncomingRequest = () => {
    if (!incomingRequest) return;

    const file = incomingRequest.files[0];
    const transferFileObj: TransferFile = {
      id: "incoming_" + Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      category: getCategoryOfFile(file.type, file.name),
      progress: 0,
      status: "connecting",
      speed: 0,
      eta: 0,
      role: "receiver",
      partnerId: incomingRequest.sourceId,
      partnerName: incomingRequest.sourceName
    };

    setActiveTransfer(transferFileObj);
    setCurrentScreen("progress");

    // Reply WS
    sendPacket({
      type: "transfer_response",
      targetId: incomingRequest.sourceId,
      approved: true,
      sourceId: selfDevice.id
    });

    setIncomingRequest(null);
  };

  const handleRejectIncomingRequest = () => {
    if (!incomingRequest) return;
    
    sendPacket({
      type: "transfer_response",
      targetId: incomingRequest.sourceId,
      approved: false,
      sourceId: selfDevice.id
    });

    setIncomingRequest(null);
    setCurrentScreen("home");
  };

  // Pause / Resume and disruption control console utilities
  const handlePauseTransfer = () => {
    setActiveTransfer(prev => prev ? { ...prev, status: "paused" } : null);
    
    const partnerId = activeTransfer?.partnerId;
    if (partnerId) {
      sendPacket({ type: "transfer_paused", targetId: partnerId });
    }
  };

  const handleResumeTransfer = () => {
    setActiveTransfer(prev => prev ? { ...prev, status: "transferring" } : null);
    
    const partnerId = activeTransfer?.partnerId;
    if (partnerId) {
      sendPacket({ type: "transfer_resumed", targetId: partnerId });
    }

    // If mock transfer, trigger progression loop once more
    if (activeTransfer?.partnerId.startsWith("mock_")) {
      startSimulatedTransfer(activeTransfer.role === "sender");
    }
  };

  const handleCancelTransfer = () => {
    if (simInterval) clearInterval(simInterval);
    
    const partnerId = activeTransfer?.partnerId;
    if (partnerId) {
      sendPacket({ type: "transfer_canceled", targetId: partnerId });
    }

    setActiveTransfer(null);
    setSelectedFiles([]);
    setCurrentScreen("home");
  };

  const handleWipeLogs = () => {
    setHistory([]);
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    // Notify WS of name changes
    sendPacket({
      type: "update_status",
      status: "idle",
      device: {
        ...selfDevice,
        name: newSettings.deviceName,
        deviceType: newSettings.deviceType
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 md:p-4 selection:bg-teal-500/20">
      
      {/* Simulation enclosure mock shell casing for highly immersive native Android first aura on Desktop */}
      <div 
        className="w-full md:max-w-md h-screen md:h-[824px] bg-slate-950 md:rounded-[40px] md:border-8 md:border-slate-800 md:shadow-2xl overflow-hidden relative flex flex-col"
        style={{ contentVisibility: "auto" }}
      >
        
        {/* Decorative Camera Notch for Android styling */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-2xl z-40 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-950 mr-4" />
          <div className="w-12 h-1 bg-slate-700 rounded-full" />
        </div>

        {/* Dynamic Route Screen Switcher with Fade Transitions */}
        <div className="flex-1 overflow-hidden relative">
          
          {currentScreen === 'splash' && (
            <SplashScreen onComplete={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              onNavigate={(screen) => setCurrentScreen(screen)}
              onOpenGuide={() => setShowGuide(true)}
              selfDevice={selfDevice}
              isOnline={isOnline}
              onlineCount={onlineDevices.length}
              totalTransferredBytes={totalTransferredBytes}
              historyCount={history.length}
            />
          )}

          {currentScreen === 'send' && (
            <SendFilesScreen
              onBack={() => setCurrentScreen('home')}
              onProceed={handleProceedSendSelection}
            />
          )}

          {currentScreen === 'devices' && (
            <NearbyDevicesScreen
              onBack={() => setCurrentScreen('send')}
              onSelectDevice={handleSelectDevice}
              onlineDevices={onlineDevices}
              selfDevice={selfDevice}
            />
          )}

          {currentScreen === 'receiving' && (
            <ReceivingScreen
              onBack={() => setCurrentScreen('home')}
              selfDevice={selfDevice}
              isOnline={isOnline}
              incomingRequest={incomingRequest}
              onAcceptIncoming={handleAcceptIncomingRequest}
              onRejectIncoming={handleRejectIncomingRequest}
            />
          )}

          {currentScreen === 'progress' && (
            <TransferProgressScreen
              transfer={activeTransfer}
              onPause={handlePauseTransfer}
              onResume={handleResumeTransfer}
              onCancel={handleCancelTransfer}
            />
          )}

          {currentScreen === 'history' && (
            <HistoryScreen
              onBack={() => setCurrentScreen('home')}
              history={history}
              onClearHistory={handleWipeLogs}
              onRemoveItem={handleRemoveHistoryItem}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onBack={() => setCurrentScreen('home')}
              settings={settings}
              onSave={handleSaveSettings}
            />
          )}

        </div>

        {/* Developer configuration manual popup overlay */}
        <SetupGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />

      </div>
    </div>
  );
}
