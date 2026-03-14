import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { MONGO_URI, PORT, FRONTEND_URL } from "./config";
import logger from "./logger";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import bookRoutes from "./routes/books";
import postRoutes from "./routes/posts";
import clubRoutes from "./routes/clubs";
import recommendationRoutes from "./routes/recommendations";
import userRoutes from "./routes/users";

const app = express();
const server = http.createServer(app);
const onlineByClub = new Map<string, Map<string, string>>();

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});
// make io available in routes via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  const broadcastOnline = (clubId: string) => {
    const m = onlineByClub.get(clubId) || new Map<string, string>();
    const users = Array.from(m.values());
    io.to(`club_${clubId}`).emit("clubOnline", {
      clubId,
      users,
      count: users.length,
    });
  };

  socket.on(
    "joinClub",
    ({ clubId, userName }: { clubId: string; userName?: string }) => {
      if (!clubId) return;
      socket.join(`club_${clubId}`);
      (socket.data as any).clubId = clubId;
      (socket.data as any).userName = userName || "Anonymous";

      if (!onlineByClub.has(clubId)) onlineByClub.set(clubId, new Map());
      onlineByClub.get(clubId)!.set(socket.id, (socket.data as any).userName);

      broadcastOnline(clubId);
    },
  );

  socket.on("leaveClub", ({ clubId }: { clubId: string }) => {
    if (!clubId) return;
    socket.leave(`club_${clubId}`);
    const m = onlineByClub.get(clubId);
    if (m) {
      m.delete(socket.id);
      if (m.size === 0) onlineByClub.delete(clubId);
    }
    broadcastOnline(clubId);
  });

  socket.on("typing", ({ clubId, userName }) => {
    if (!clubId || !userName) return;
    socket.to(`club_${clubId}`).emit("typing", { userName });
  });

  socket.on("stopTyping", ({ clubId, userName }) => {
    if (!clubId || !userName) return;
    socket.to(`club_${clubId}`).emit("stopTyping", { userName });
  });

  socket.on("disconnect", () => {
    const clubId = (socket.data as any).clubId as string | undefined;
    if (clubId) {
      const m = onlineByClub.get(clubId);
      if (m) {
        m.delete(socket.id);
        if (m.size === 0) onlineByClub.delete(clubId);
      }
      broadcastOnline(clubId);
    }
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Auth routes have stricter limits
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit auth attempts
  message: "Too many auth attempts, please try again later.",
});
app.use("/api/auth", authLimiter);

app.get("/", (_req, res) => {
  res.json({ message: "LeafLink API up" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/users", userRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected");
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Mongo connection error:", err);
  });
