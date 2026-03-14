import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <img
            src="/GeminiLeaflinkLogov2.png"
            alt="LeafLink Logo"
            className="navbar-logo"
          />
          LeafLink
        </Link>
        <div className="navbar-links">
          <Link to="/feed" className="navbar-link">
            Feed
          </Link>
          <Link to="/explore" className="navbar-link">
            Explore Books
          </Link>
          <Link to="/admin" className="navbar-link">
            Admin
          </Link>
          <Link to="/clubs" className="navbar-link">
            Clubs
          </Link>
          {user ? (
            <>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              <span className="navbar-user">Hi, {user.name}</span>
              <button onClick={logout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="navbar-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
