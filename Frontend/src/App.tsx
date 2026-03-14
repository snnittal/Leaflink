import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import FeedPage from "./pages/FeedPage";
import BookPage from "./pages/BookPage";
import ClubPage from "./pages/ClubPage";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import ClubsPage from "./pages/ClubsPage";
import ProfilePage from "./pages/ProfilePage";
// import Sidebar from "./components/Sidebar"; // Uncomment if Sidebar is used

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/clubs/:id" element={<ClubPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/" element={<Navigate to={user ? "/feed" : "/login"} />} />
      </Routes>
    </div>
  );
};

export default App;
