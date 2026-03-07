import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, toggleTheme, switchable } = useTheme();

  if (!switchable || !toggleTheme) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="gap-2 transition-all duration-300 hover:bg-muted"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:rotate-180" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-180" />
      )}
      <span className="hidden sm:inline text-sm">
        {theme === "light" ? "Dark" : "Light"}
      </span>
    </Button>
  );
}
