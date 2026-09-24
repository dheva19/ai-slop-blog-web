import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/services/AuthContext";
import { Button } from "@/components/ui/button";
import {
  PenSquare, LayoutDashboard, LogOut, LogIn, BookOpen, Menu, X, User as UserIcon
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Link
          to="/"
          className="flex items-center space-x-2 font-bold text-xl tracking-tight"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span>DevBlog</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Link to="/write">
                <Button size="sm" variant="default" className="flex items-center gap-1.5 shadow-sm">
                  <PenSquare className="h-4 w-4" />
                  <span>Tulis Blog</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border object-cover"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleLogout}
                  title="Logout"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button size="sm" variant="ghost" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="default">Daftar</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border object-cover"
                />
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate">{user.full_name || user.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Link to="/write" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2" variant="default">
                    <PenSquare className="h-4 w-4" />
                    Tulis Blog Baru
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-start gap-2" variant="outline">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard Penulis
                  </Button>
                </Link>
                <Button
                  className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  variant="ghost"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar (Logout)
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Masuk</Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" className="w-full">Daftar</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
