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
    <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background text-foreground transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <button
          onClick={() => handleNavClick("/")}
          className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-110">
            <MapPin className="w-6 h-6 text-primary-foreground transition-transform duration-300 hover:rotate-12" />
          </div>
          <h1 className="text-xl font-bold hidden sm:block transition-all duration-300">LocalFix AI</h1>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {isAuthenticated ? (
            <>
              {navItems.map((item, idx) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick(item.path)}
                  className="text-sm transition-all duration-300 hover:bg-muted hover:translate-y-[-2px] active:scale-95 relative overflow-hidden group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-0 bg-primary/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Button>
              ))}
              {user?.role === "admin" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavClick("/admin")}
                  className="text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary/10 hover:translate-y-[-2px] active:scale-95"
                >
                  Admin
                </Button>
              )}
            </>
          ) : null}
        </div>

        {/* Right Side - User Menu & Auth */}
        <div className="flex items-center gap-2">
          <div className="transition-all duration-300 hover:scale-110">
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <>
              {/* Desktop User Info */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border transition-all duration-300">
                <div className="text-right transition-all duration-300 hover:opacity-80">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] active:scale-95"
                >
                  <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  Logout
                </Button>
              </div>

              {/* Mobile Logout Button */}
              <div className="md:hidden transition-all duration-300">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] active:scale-95"
                >
                  <LogOut className="w-4 h-4 transition-transform duration-300 hover:translate-x-1" />
                </Button>
              </div>
            </>
          ) : (
            <Button asChild className="btn-primary transition-all duration-300">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="w-5 h-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-t border-border bg-background animate-slide-in-up">
          <div className="container max-w-7xl mx-auto px-4 py-3 space-y-2">
            {navItems.map((item, idx) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-all duration-300 text-sm font-medium hover:translate-x-1 active:scale-95 animate-slide-in-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {item.label}
              </button>
            ))}
            {user?.role === "admin" && (
              <button
                onClick={() => handleNavClick("/admin")}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition-all duration-300 text-sm font-semibold text-primary hover:translate-x-1 active:scale-95 animate-slide-in-up"
              >
                Admin Dashboard
              </button>
            )}
            <div className="border-t border-border pt-2 mt-2 animate-slide-in-up">
              <div className="px-4 py-2 text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-300 text-sm font-medium text-red-600 hover:translate-x-1 active:scale-95 animate-slide-in-up"
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
