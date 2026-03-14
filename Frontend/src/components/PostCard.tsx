import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";

type Comment = {
  _id: string;
  content: string;
  createdAt: string;
  user: { name: string };
  parentComment?: string;
};

type CommentNode = Comment & { replies: CommentNode[] };

type PostCardProps = {
  id: string;
  content: string;
  rating?: number;
  createdAt: string;
  user?: { name: string } | null;
  book: { _id: string; title: string; author: string; coverUrl?: string };
  likesCount: number;
  onLike: () => void;
  type?: "text" | "video";
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  textSummary?: string;
};

const PostCard: React.FC<PostCardProps> = ({
  id,
  content,
  rating,
  createdAt,
  user,
  book,
  likesCount,
  onLike,
  type,
  videoUrl,
  thumbnailUrl,
  durationSeconds,
  textSummary,
}) => {
  const { user: currentUser } = useAuth();
  if (!book) return null;

  const displayUserName = user?.name || "Unknown user";
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Build tree from flat comments
  const buildCommentTree = (items: Comment[]): CommentNode[] => {
    const map = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    items.forEach((c) => {
      map.set(c._id, { ...c, replies: [] });
    });

    map.forEach((node) => {
      if (node.parentComment) {
        const parent = map.get(node.parentComment);
        if (parent) {
          parent.replies.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const commentTree = buildCommentTree(comments);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const { data } = await api.get(`/posts/${id}/comments`);
      setComments(data);
    } catch (err) {
      logger.error("Error fetching comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      fetchComments();
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed) return;

    try {
      const { data } = await api.post(`/posts/${id}/comments`, {
        content: trimmed,
        parentCommentId: replyTo || undefined,
      });
      setComments((prev) => [...prev, data]);
      setNewComment("");
      setReplyTo(null);
    } catch (err) {
      logger.error("Error creating comment", err);
    }
  };

  const renderComments = (nodes: CommentNode[], depth = 0) => {
    return nodes.map((c) => (
      <div
        key={c._id}
        style={{
          marginTop: 8,
          marginLeft: depth * 12,
          paddingLeft: 8,
          borderLeft: depth > 0 ? "1px solid #eee" : "none",
        }}
      >
        <div style={{ fontSize: 12, marginBottom: 2 }}>
          <strong>{c.user?.name || "Unknown user"}</strong>{" "}
          <span style={{ color: "#888" }}>
            · {new Date(c.createdAt).toLocaleString()}
          </span>
        </div>
        <div style={{ fontSize: 13, marginBottom: 4 }}>{c.content}</div>
        {currentUser && (
          <button
            type="button"
            onClick={() =>
              setReplyTo((prev) => (prev === c._id ? null : c._id))
            }
            style={{
              fontSize: 11,
              border: "none",
              background: "none",
              color: "#555",
              cursor: "pointer",
              padding: 0,
              marginBottom: 4,
            }}
          >
            {replyTo === c._id ? "Cancel reply" : "Reply"}
          </button>
        )}

        {replyTo === c._id && currentUser && (
          <form onSubmit={submitComment} style={{ marginTop: 4 }}>
            <input
              style={{
                width: "100%",
                padding: 4,
                fontSize: 12,
                marginBottom: 4,
              }}
              placeholder={`Reply to ${c.user?.name || "this user"}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              type="submit"
              style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4 }}
            >
              Send
            </button>
          </form>
        )}

        {replyTo === c._id && !currentUser && (
          <div style={{ marginTop: 4, fontSize: 11, color: "#666" }}>
            <a
              href="/login"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              Sign in to reply
            </a>
          </div>
        )}

        {c.replies.length > 0 && renderComments(c.replies, depth + 1)}
      </div>
    ));
  };

  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        display: "flex",
        gap: 12,
        flexDirection: "row",
      }}
    >
      {book.coverUrl && (
        <img
          src={book.coverUrl}
          alt={book.title}
          style={{ width: 60, height: 90, objectFit: "cover", borderRadius: 4 }}
        />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          <strong>{displayUserName}</strong> on{" "}
          <Link to={`/books/${book._id}`}>{book.title}</Link>
        </div>
        {type === "video" && videoUrl ? (
          <>
            <div style={{ marginBottom: 4 }}>
              <video
                src={videoUrl}
                controls
                muted
                playsInline
                style={{
                  width: "100%",
                  maxHeight: 320,
                  borderRadius: 8,
                  backgroundColor: "#000",
                }}
                poster={thumbnailUrl}
              />
            </div>
            {(textSummary || content) && (
              <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
                {textSummary || content}
              </div>
            )}
            {durationSeconds !== undefined && (
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
                ~{Math.round(durationSeconds)}s video reaction
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 13, color: "#555", marginBottom: 4 }}>
            {content}
          </div>
        )}
        {rating !== undefined && (
          <div style={{ fontSize: 12, marginBottom: 4 }}>
            Rating: {rating}/5
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            color: "#888",
            marginBottom: 4,
          }}
        >
          {new Date(createdAt).toLocaleString()}
        </div>

        {/* actions: like + comments toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          {currentUser ? (
            <button
              onClick={onLike}
              style={{ fontSize: 12, padding: "2px 6px", borderRadius: 4 }}
            >
              ❤️ {likesCount}
            </button>
          ) : (
            <span style={{ fontSize: 12, color: "#666" }}>❤️ {likesCount}</span>
          )}
          <button
            type="button"
            onClick={toggleComments}
            style={{
              fontSize: 12,
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            💬{" "}
            {comments.length > 0 ? `${comments.length} comments` : "Comments"}
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div
            style={{
              marginTop: 8,
              paddingTop: 8,
              borderTop: "1px solid #eee",
            }}
          >
            {/* Top-level comment form (when not replying to a specific comment) */}
            {replyTo === null && currentUser && (
              <form onSubmit={submitComment} style={{ marginBottom: 8 }}>
                <input
                  style={{
                    width: "100%",
                    padding: 6,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  style={{ fontSize: 12, padding: "2px 6px", borderRadius: 4 }}
                >
                  Comment
                </button>
              </form>
            )}

            {replyTo === null && !currentUser && (
              <div style={{ marginBottom: 8, fontSize: 12, color: "#666" }}>
                <a
                  href="/login"
                  style={{ color: "#007bff", textDecoration: "none" }}
                >
                  Sign in to comment
                </a>
              </div>
            )}

            {loadingComments ? (
              <div style={{ fontSize: 12, color: "#888" }}>
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div style={{ fontSize: 12, color: "#888" }}>
                No comments yet. Be the first!
              </div>
            ) : (
              <div>{renderComments(commentTree)}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
