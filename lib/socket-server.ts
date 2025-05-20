import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

export let io: SocketIOServer | null = null

export const initSocketServer = (server: HTTPServer) => {
  if (io) {
    console.log("Socket server already initialized")
    return io
  }
  
  try {
    console.log("Creating new Socket.IO server instance")
    io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: "/api/socketio",
      connectTimeout: 20000,
      pingTimeout: 20000,
      pingInterval: 10000,
      transports: ["websocket", "polling"],
    })

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`)
      const userId = socket.handshake.auth.userId || 'anonymous';
      console.log(`User connected: ${userId}`);

      // Handle task events
      socket.on("task:create", (task) => {
        console.log("Task created:", task);
        io?.emit("task:created", task);
      });

      socket.on("task:update", (task) => {
        console.log("Task updated:", task);
        io?.emit("task:updated", task);
      });

      socket.on("task:delete", (taskId) => {
        console.log("Task deleted:", taskId);
        io?.emit("task:deleted", taskId);
      });

      socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`)
      })

      socket.on("error", (error) => {
        console.error(`Socket error: ${socket.id}`, error)
      })
    })

    console.log("Socket.IO server initialized successfully")
    return io
  } catch (error) {
    console.error("Socket.IO server initialization error:", error)
    return null
  }
}

export const getIO = () => {
  if (!io) {
    console.warn("Socket.IO server not initialized")
    return null
  }
  return io
}
