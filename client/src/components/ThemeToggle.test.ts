import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ThemeToggle from "./ThemeToggle";

describe("ThemeToggle Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render theme toggle button when switchable is true", () => {
    render(
      <ThemeProvider switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should not render when switchable is false", () => {
    const { container } = render(
      <ThemeProvider switchable={false}>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should show moon icon in light mode", () => {
    render(
      <ThemeProvider defaultTheme="light" switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("gap-2");
  });

  it("should toggle theme when button is clicked", () => {
    render(
      <ThemeProvider defaultTheme="light" switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should persist theme preference in localStorage", () => {
    const { rerender } = render(
      <ThemeProvider defaultTheme="light" switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(localStorage.getItem("theme")).toBe("dark");

    rerender(
      <ThemeProvider defaultTheme="light" switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("should have proper accessibility attributes", () => {
    render(
      <ThemeProvider switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("title");
  });

  it("should display text label on desktop", () => {
    render(
      <ThemeProvider defaultTheme="light" switchable>
        <ThemeToggle />
      </ThemeProvider>
    );

    const label = screen.getByText("Dark");
    expect(label).toBeInTheDocument();
  });
});
