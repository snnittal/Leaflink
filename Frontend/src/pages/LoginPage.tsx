import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logger from "../logger";
import PageLayout from "../components/PageLayout";

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err: any) {
      logger.error("Auth error:", err);
      const msg = err?.response?.data?.message;
      const errs = err?.response?.data?.errors;
      if (errs && errs.length) {
        setError(errs.map((e: any) => e.msg).join(", "));
      } else {
        setError(msg || "Something went wrong");
      }
    }
  };

  return (
    <PageLayout>
      <div
        className="page"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="card" style={{ width: "320px" }}>
        <h2 className="card-title" style={{ textAlign: "center" }}>
          LeafLink
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            marginBottom: "1rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          A social home for readers.
        </p>

        <form onSubmit={onSubmit}>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <div style={{ fontSize: "0.875rem", textAlign: "center" }}>
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="btn btn-outline"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="btn btn-outline"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem" }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
    </PageLayout>
  );
};

export default LoginPage;
