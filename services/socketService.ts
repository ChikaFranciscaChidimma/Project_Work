// socketService.ts
import { io, Socket } from "socket.io-client";
import { notificationService } from "./notificationService";

interface ProductUpdateEvent {
  product: {
    _id: string;
    name: string;
    stock: number;
    minStock: number;
    branch: string;
    price: number;
    status?: string;
  };
  prevStock: number;
}

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private listeners: Map<string, (data: any) => void> = new Map();

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public emit(event: string, data: any): void {
  this.socket?.emit(event, data);
}

public joinRoom(room: string): void {
  this.socket?.emit('join-room', room);
}

public leaveRoom(room: string): void {
  this.socket?.emit('leave-room', room);
}

  // Public method to get the socket instance
  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public connect(): void {
    if (this.socket?.connected) return;

    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:5000";
    console.log(`🔌 Connecting to Socket.IO at ${wsUrl}`);

    this.socket = io(wsUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      autoConnect: true,
      query: {
        clientType: "inventory-panel"
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log(`✅ Connected. ID: ${this.socket?.id}`);
      this.resubscribeAll();
    });

    this.socket.on("disconnect", (reason) => {
      console.log(`❌ Disconnected: ${reason}`);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔴 Connection error:", error.message);
    });
  }

  public subscribe(event: string, callback: (data: any) => void): void {
    this.listeners.set(event, callback);
    this.socket?.on(event, callback);
  }

  public unsubscribe(event: string): void {
    this.listeners.delete(event);
    this.socket?.off(event);
  }

  private resubscribeAll(): void {
    this.listeners.forEach((callback, event) => {
      this.socket?.on(event, callback);
    });
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

export const socketService = SocketService.getInstance();