export type FileCategory = 'photo' | 'video' | 'app' | 'pdf' | 'zip' | 'document' | 'other';

export interface Device {
  id: string;
  name: string;
  avatar: string;
  status: 'idle' | 'pairing' | 'sending' | 'receiving';
  deviceType: 'android' | 'ios' | 'desktop';
  ipAddress?: string;
  osVersion?: string;
  isSelf?: boolean;
}

export interface TransferFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  progress: number; // 0 to 100
  status: 'pending' | 'connecting' | 'transferring' | 'paused' | 'completed' | 'failed' | 'rejected' | 'canceled';
  subStatus?: string; // Granular Android transport/handshake status
  speed: number; // in MB/s
  eta: number; // in seconds
  role: 'sender' | 'receiver';
  partnerId: string;
  partnerName: string;
  fileUrl?: string;
  chunksReceived?: number;
  totalChunks?: number;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: FileCategory;
  timestamp: string;
  partnerName: string;
  role: 'sender' | 'receiver';
  status: 'completed' | 'interrupted';
}

export interface AppSettings {
  deviceName: string;
  deviceType: 'android' | 'ios' | 'desktop';
  savePath: string;
  wifiDirectEnabled: boolean;
  requireApproval: boolean;
  speedLimit: number; // 0 for unlimited
  darkMode: boolean;
  aesEncryption: boolean;
}
