import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { MapPin, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Report Problem", path: "/submit" },
    { label: "My Reports", path: "/history" },
    { label: "Live Map", path: "/community-map" },
    { label: "Profile", path: "/profile" },
    { label: "Analytics", path: "/analytics" },
  ];

  const handleNavClick = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-white">
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold hidden sm:block">LocalFix AI</h1>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick(item.path)}
                  className="text-sm"
                >
                  {item.label}
                </Button>
              ))}
              {user?.role === "admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick("/admin")}
                  className="text-sm font-semibold text-primary"
                >
                  Admin
                </Button>
              )}
            </>
          ) : null}
        </div>

        {/* Right Side - User Menu & Auth */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              {/* Desktop User Info */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>

              {/* Mobile Logout Button */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <Button asChild className="btn-primary">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container max-w-7xl mx-auto px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
            {user?.role === "admin" && (
              <button
                onClick={() => handleNavClick("/admin")}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-semibold text-primary"
              >
                Admin Dashboard
              </button>
            )}
            <div className="border-t border-border pt-2 mt-2">
              <div className="px-4 py-2 text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-colors text-sm font-medium text-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
