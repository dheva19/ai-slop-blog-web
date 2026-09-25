import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { WriteBlogPage } from "./pages/WriteBlogPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/write" element={<WriteBlogPage />} />
              <Route path="/edit/:id" element={<WriteBlogPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <div className="container max-w-7xl mx-auto px-4">
              &copy; {new Date().getFullYear()} DevBlog Platform. Ditenagai oleh FastAPI & React.
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
