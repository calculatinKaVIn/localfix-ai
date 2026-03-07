import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DropdownMenu, DropdownItem, DropdownDivider } from "./DropdownMenu";

describe("DropdownMenu Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render trigger element", () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    expect(trigger).toBeInTheDocument();
  });

  it("should show menu when trigger is clicked", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const item = screen.getByText("Item 1");
      expect(item).toBeInTheDocument();
    });
  });

  it("should hide menu when trigger is clicked again", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    
    // Open menu
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    // Close menu
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("should close menu when clicking outside", async () => {
    render(
      <div>
        <DropdownMenu trigger={<button>Open Menu</button>}>
          <DropdownItem>Item 1</DropdownItem>
        </DropdownMenu>
        <div data-testid="outside">Outside Element</div>
      </div>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    const outside = screen.getByTestId("outside");
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("should close menu when Escape key is pressed", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    });
  });

  it("should call onClick handler when menu item is clicked", async () => {
    const handleClick = vi.fn();

    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem onClick={handleClick}>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const item = screen.getByText("Item 1");
      fireEvent.click(item);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  it("should render menu items with icons", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem icon={<span data-testid="icon">📁</span>}>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const icon = screen.getByTestId("icon");
      expect(icon).toBeInTheDocument();
    });
  });

  it("should render divider between items", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
        <DropdownDivider />
        <DropdownItem>Item 2</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });

  it("should apply destructive styling to destructive items", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem isDestructive>Delete</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const deleteItem = screen.getByText("Delete");
      expect(deleteItem).toHaveClass("text-red-600");
    });
  });

  it("should align menu to the left when align prop is 'left'", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>} align="left">
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("left-0");
    });
  });

  it("should align menu to the right when align prop is 'right'", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>} align="right">
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("right-0");
    });
  });

  it("should have proper accessibility attributes", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "true");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    await waitFor(() => {
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("should apply slide-down animation class to menu", async () => {
    render(
      <DropdownMenu trigger={<button>Open Menu</button>}>
        <DropdownItem>Item 1</DropdownItem>
      </DropdownMenu>
    );

    const trigger = screen.getByText("Open Menu");
    fireEvent.click(trigger);

    await waitFor(() => {
      const menu = screen.getByRole("menu");
      expect(menu).toHaveClass("animate-slide-down");
    });
  });
});
