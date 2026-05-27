import express from "express";
import path from "path";
import { WebSocket, WebSocketServer } from "ws";
import { createServer as createViteServer } from "vite";
import http from "http";

interface ConnectedDevice {
  id: string;
  name: string;
  avatar: string;
  deviceType: 'android' | 'ios' | 'desktop';
  status: 'idle' | 'pairing' | 'sending' | 'receiving';
  ipAddress: string;
  osVersion: string;
  ws: WebSocket;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Track connected devices
  const clients = new Map<string, ConnectedDevice>();

  // Use a dedicated WebSocket Server
  const wss = new WebSocketServer({ noServer: true });

  // JSON middleware
  app.use(express.json());

  // API Check Status
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", devicesOnline: clients.size });
  });

  // REST API and info for dynamic configuration if needed
  app.get("/api/devices", (req, res) => {
    const devices = Array.from(clients.values()).map(d => ({
      id: d.id,
      name: d.name,
      avatar: d.avatar,
      deviceType: d.deviceType,
      status: d.status,
      ipAddress: d.ipAddress,
      osVersion: d.osVersion,
    }));
    res.json(devices);
  });

  // Handle WebSocket upgrades
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    
    if (pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
    }
  });

  // Helper function to broadcast online devices
  function broadcastDeviceList() {
    const devicesPayload = JSON.stringify({
      type: "device_list",
      devices: Array.from(clients.values()).map(d => ({
        id: d.id,
        name: d.name,
        avatar: d.avatar,
        deviceType: d.deviceType,
        status: d.status,
        ipAddress: d.ipAddress,
        osVersion: d.osVersion,
      }))
    });

    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(devicesPayload);
      }
    });
  }

  // Set up WebSocket handlers
  wss.on("connection", (ws, request) => {
    const ip = request.socket.remoteAddress || "127.0.0.1";
    let deviceId: string | null = null;

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case "join": {
            deviceId = data.device.id;
            clients.set(deviceId!, {
              id: data.device.id,
              name: data.device.name,
              avatar: data.device.avatar,
              deviceType: data.device.deviceType || 'android',
              status: 'idle',
              ipAddress: ip.replace("::fff:", ""),
              osVersion: data.device.osVersion || "Android 13",
              ws
            });
            
            console.log(`Device joined: ${data.device.name} [${deviceId}]`);
            broadcastDeviceList();
            break;
          }

          case "update_status": {
            if (deviceId && clients.has(deviceId)) {
              const dev = clients.get(deviceId)!;
              dev.status = data.status;
              broadcastDeviceList();
            }
            break;
          }

          // Forward direct messages between devices (signaling, requests)
          case "pairing_request":
          case "pairing_response":
          case "transfer_request":
          case "transfer_response":
          case "transfer_chunk":
          case "transfer_paused":
          case "transfer_resumed":
          case "transfer_canceled":
          case "transfer_completed": {
            const targetId = data.targetId;
            const sourceId = deviceId || data.sourceId;
            
            if (targetId && clients.has(targetId)) {
              const dest = clients.get(targetId)!;
              if (dest.ws.readyState === WebSocket.OPEN) {
                dest.ws.send(JSON.stringify({
                  ...data,
                  sourceId // ensure source is verified
                }));
              }
            }
            break;
          }

          default:
            console.log(`Unknown event format: ${data.type}`);
        }
      } catch (e) {
        // Fallback for binary file chunks if they are sent with framing header
        console.error("WebSocket message parsing error:", e);
      }
    });

    ws.on("close", () => {
      if (deviceId) {
        console.log(`Device disconnected: ${deviceId}`);
        clients.delete(deviceId);
        broadcastDeviceList();
      }
    });

    ws.on("error", (err) => {
      console.error(`WebSocket Error for device ${deviceId}:`, err);
    });
  });

  // Vite static middleware for SPA front-end setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`FlashDrop Lite server running natively at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server startup crash:", err);
});
