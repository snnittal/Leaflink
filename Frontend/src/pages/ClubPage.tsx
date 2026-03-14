import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";

type Club = {
  _id: string;
  name: string;
  description?: string;
  owner?: { name: string };
  members?: { name: string }[];
  currentBook?: { title: string; author: string };
  pinnedMessage?: {
    content: string;
    user?: { name: string };
    createdAt: string;
  };
};

type ClubMessage = {
  _id: string;
  content: string;
  createdAt: string;
  user: { _id?: string; name: string };
  seenBy?: string[]; // store userIds (simplified)
};

const ClubPage: React.FC = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const windowFocusedRef = useRef<boolean>(true);

  const myName = currentUser?.name || currentUser?.email || "Anonymous";
  const myId = currentUser?.id;

  const fetchClub = async () => {
    if (!id) return;
    const { data } = await api.get(`/clubs/${id}`);
    setClub(data);
  };

  const fetchMessages = async (pageNum = 1, append = false) => {
    if (!id) return;
    try {
      setLoadingMessages(true);
      const { data } = await api.get(
        `/clubs/${id}/messages?page=${pageNum}&limit=50`,
      );
      if (append) {
        setMessages((prev) => [...data.messages, ...prev]);
      } else {
        setMessages(data.messages);
      }
      setPage(data.currentPage);
      setHasMore(data.currentPage < data.totalPages);
    } catch (err) {
      logger.error("Error fetching club messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Initial load
  useEffect(() => {
    if (id) {
      fetchClub();
      fetchMessages();
    }
  }, [id]);

  // Track window focus for simple notifications
  useEffect(() => {
    const onFocus = () => {
      windowFocusedRef.current = true;
      setUnreadCount(0);
      document.title = club ? club.name : "LeafLink";
    };
    const onBlur = () => {
      windowFocusedRef.current = false;
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, [club?.name]);

  // Socket.IO setup
  useEffect(() => {
    if (!id) return;

    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.emit("joinClub", { clubId: id, userName: myName });

    socket.on("clubMessage", (msg: ClubMessage) => {
      setMessages((prev) => [...prev, msg]);

      // Simple in-tab notification: bump unread + change title if unfocused
      if (!windowFocusedRef.current) {
        setUnreadCount((c) => {
          const next = c + 1;
          if (club?.name) {
            document.title = `(${next}) ${club.name}`;
          }
          return next;
        });
      }
    });

    socket.on("typing", ({ userName }: { userName: string }) => {
      setTypingUsers((prev) =>
        prev.includes(userName) ? prev : [...prev, userName],
      );
    });

    socket.on("stopTyping", ({ userName }: { userName: string }) => {
      setTypingUsers((prev) => prev.filter((n) => n !== userName));
    });

    socket.on(
      "clubOnline",
      ({ clubId, users }: { clubId: string; users: string[] }) => {
        if (clubId === id) {
          setOnlineUsers(users);
        }
      },
    );

    socket.on("messageUpdated", (msg: ClubMessage) => {
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? msg : m)));
    });

    socket.on("messageDeleted", ({ msgId }: { msgId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    });

    socket.on(
      "messageSeen",
      ({ msgId, userId }: { msgId: string; userId: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === msgId
              ? {
                  ...m,
                  seenBy: m.seenBy?.includes(userId)
                    ? m.seenBy
                    : [...(m.seenBy || []), userId],
                }
              : m,
          ),
        );
      },
    );

    socket.on("pinnedUpdated", (pin: Club["pinnedMessage"]) => {
      setClub((prev) => (prev ? { ...prev, pinnedMessage: pin } : prev));
    });

    return () => {
      socket.emit("leaveClub", { clubId: id });
      socket.disconnect();
      setTypingUsers([]);
      setOnlineUsers([]);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [id, myName, club?.name]);

  const joinClub = async () => {
    if (!id) return;
    await api.post(`/clubs/${id}/join`);
    await fetchClub();
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);

    if (!id || !socketRef.current) return;

    socketRef.current.emit("typing", { clubId: id, userName: myName });

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      if (!socketRef.current) return;
      socketRef.current.emit("stopTyping", { clubId: id, userName: myName });
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !id) return;

    try {
      await api.post(`/clubs/${id}/messages`, { content: trimmed });
      setNewMessage("");

      if (socketRef.current) {
        socketRef.current.emit("stopTyping", {
          clubId: id,
          userName: myName,
        });
      }
    } catch (err) {
      logger.error("Error sending message:", err);
    }
  };

  // Mark messages seen (simple: mark all when loaded / updated)
  useEffect(() => {
    if (!id || !myId) return;
    messages.forEach((m) => {
      api.post(`/clubs/${id}/messages/${m._id}/seen`).catch(() => {});
    });
  }, [messages.length, id, myId]);

  const startEdit = (msg: ClubMessage) => {
    setEditingId(msg._id);
    setEditText(msg.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (msgId: string) => {
    if (!id) return;
    const trimmed = editText.trim();
    if (!trimmed) return;

    try {
      const { data } = await api.patch(`/clubs/${id}/messages/${msgId}`, {
        content: trimmed,
      });
      setMessages((prev) => prev.map((m) => (m._id === msgId ? data : m)));
      setEditingId(null);
      setEditText("");
    } catch (err) {
      logger.error("Error editing message:", err);
    }
  };

  const deleteMessage = async (msgId: string) => {
    if (!id) return;
    try {
      await api.delete(`/clubs/${id}/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      logger.error("Error deleting message:", err);
    }
  };

  const pinMessage = async (content: string) => {
    if (!id) return;
    try {
      const { data } = await api.post(`/clubs/${id}/pin`, { content });
      setClub((prev) => (prev ? { ...prev, pinnedMessage: data } : prev));
    } catch (err) {
      logger.error("Error pinning message:", err);
    }
  };

  const isOwnMessage = (m: ClubMessage) => {
    // backend should ideally populate user._id
    return !!myName && m.user.name === myName;
  };

  if (!club) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div className="page">
      {!club ? (
        <div className="loading">Loading club...</div>
      ) : (
        <div
          style={{
            height: "100vh",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ margin: "8px 0" }}>{club.name}</h2>
            {club.description && (
              <p style={{ fontSize: 14, marginBottom: 4 }}>
                {club.description}
              </p>
            )}
            {club.currentBook && (
              <p style={{ fontSize: 13, marginBottom: 4 }}>
                Current book: <strong>{club.currentBook.title}</strong> by{" "}
                {club.currentBook.author}
              </p>
            )}
            <p style={{ fontSize: 13, marginBottom: 4 }}>
              Owner: {club.owner?.name} · Members: {club.members?.length || 0}
            </p>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
              🟢 {onlineUsers.length} online
              {onlineUsers.length > 0 && (
                <>
                  {" "}
                  — {onlineUsers.slice(0, 3).join(", ")}
                  {onlineUsers.length > 3
                    ? ` +${onlineUsers.length - 3} more`
                    : ""}
                </>
              )}
            </p>
            <button
              style={{ marginBottom: 8, padding: "4px 8px", fontSize: 13 }}
              onClick={joinClub}
            >
              Join / Refresh Membership
            </button>
          </div>

          {/* Chat container */}
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              background: "#fafafa",
            }}
          >
            {/* Pinned */}
            {club.pinnedMessage && (
              <div
                style={{
                  background: "#fff8d6",
                  borderBottom: "1px solid #eee",
                  padding: 8,
                  fontSize: 13,
                }}
              >
                📌 {club.pinnedMessage.content}
              </div>
            )}

            <div
              style={{
                padding: 8,
                borderBottom: "1px solid #eee",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Club Chat</span>
              {unreadCount > 0 && (
                <span style={{ fontSize: 11, color: "#d9534f" }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: 8,
                overflowY: "auto",
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {loadingMessages ? (
                <div style={{ fontSize: 12, color: "#888" }}>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ fontSize: 12, color: "#888" }}>
                  No messages yet. Say hi 👋
                </div>
              ) : (
                messages.map((m) => {
                  const mine = isOwnMessage(m);
                  const seenCount = m.seenBy?.length || 0;
                  return (
                    <div
                      key={m._id}
                      style={{
                        alignSelf: mine ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          background: mine ? "#d6f5ff" : "#f7f7f7",
                          border: "1px solid #eee",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            marginBottom: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <strong>{m.user.name}</strong>
                          <span style={{ color: "#999" }}>
                            {new Date(m.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        {editingId === m._id ? (
                          <div>
                            <textarea
                              style={{
                                width: "100%",
                                fontSize: 13,
                                padding: 4,
                                borderRadius: 4,
                                border: "1px solid #ccc",
                              }}
                              rows={2}
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                            />
                            <div
                              style={{
                                marginTop: 4,
                                display: "flex",
                                gap: 4,
                                justifyContent: "flex-end",
                              }}
                            >
                              <button
                                type="button"
                                style={{ fontSize: 11, padding: "2px 6px" }}
                                onClick={() => saveEdit(m._id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                style={{ fontSize: 11, padding: "2px 6px" }}
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>{m.content}</div>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: 10,
                          color: "#999",
                          marginTop: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span>{seenCount > 0 && `Seen by ${seenCount}`}</span>
                        <span style={{ display: "flex", gap: 6 }}>
                          {mine && editingId !== m._id && (
                            <>
                              <button
                                type="button"
                                style={{
                                  fontSize: 10,
                                  padding: 0,
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                }}
                                onClick={() => startEdit(m)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                style={{
                                  fontSize: 10,
                                  padding: 0,
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                }}
                                onClick={() => deleteMessage(m._id)}
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            style={{
                              fontSize: 10,
                              padding: 0,
                              border: "none",
                              background: "none",
                              cursor: "pointer",
                            }}
                            onClick={() => pinMessage(m.content)}
                          >
                            📌 Pin
                          </button>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              {hasMore && (
                <button
                  onClick={() => fetchMessages(page + 1, true)}
                  disabled={loadingMessages}
                  style={{ padding: "5px 10px", margin: "10px 0" }}
                >
                  {loadingMessages ? "Loading..." : "Load More"}
                </button>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "#888",
                  padding: "0 8px 4px 8px",
                }}
              >
                {typingUsers.length === 1
                  ? `${typingUsers[0]} is typing...`
                  : `${typingUsers[0]} and ${
                      typingUsers.length - 1
                    } other${typingUsers.length - 1 > 1 ? "s" : ""} are typing...`}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={sendMessage}
              style={{
                borderTop: "1px solid #eee",
                padding: 8,
                display: "flex",
                gap: 8,
              }}
            >
              <input
                style={{
                  flex: 1,
                  padding: 8,
                  fontSize: 13,
                  borderRadius: 999,
                  border: "1px solid #ccc",
                }}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={() => {
                  if (!id || !socketRef.current) return;
                  socketRef.current.emit("stopTyping", {
                    clubId: id,
                    userName: myName,
                  });
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "6px 12px",
                  fontSize: 13,
                  borderRadius: 999,
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubPage;
