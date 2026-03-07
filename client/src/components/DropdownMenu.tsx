import { ReactNode, useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 transition-all duration-300 hover:opacity-80 active:scale-95"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute top-full mt-2 bg-background border border-border rounded-lg shadow-lg z-50 min-w-max animate-slide-down ${
            align === "left" ? "left-0" : "right-0"
          }`}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick?: () => void;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  isDestructive?: boolean;
}

export function DropdownItem({
  onClick,
  className = "",
  children,
  icon,
  isDestructive = false,
}: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 transition-all duration-300 hover:bg-muted flex items-center gap-3 text-sm font-medium ${
        isDestructive ? "text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20" : ""
      } ${className}`}
      role="menuitem"
    >
      {icon && <span className="transition-transform duration-300 hover:scale-110">{icon}</span>}
      {children}
    </button>
  );
}

interface DropdownDividerProps {
  className?: string;
}

export function DropdownDivider({ className = "" }: DropdownDividerProps) {
  return <div className={`border-t border-border my-1 ${className}`} />;
}
