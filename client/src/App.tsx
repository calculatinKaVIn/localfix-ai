import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GeolocationProvider } from "./contexts/GeolocationContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SubmitProblem from "./pages/SubmitProblem";
import ProblemHistory from "./pages/ProblemHistory";
import AdminDashboard from "./pages/AdminDashboard";
import ProblemsMap from "./pages/ProblemsMap";
import InteractiveMap from "./pages/InteractiveMap";
import UserProfile from "./pages/UserProfile";
import Analytics from "./pages/Analytics";
import CommunityMap from "./pages/CommunityMap";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/submit"} component={SubmitProblem} />
      <Route path={"/history"} component={ProblemHistory} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/map"} component={ProblemsMap} />
      <Route path={"/interactive-map"} component={InteractiveMap} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/community-map"} component={CommunityMap} />
      {user?.role === "admin" && <Route path={"/admin"} component={AdminDashboard} />}
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <GeolocationProvider>
          <TooltipProvider>
            <Toaster />
            <Navbar />
            <Router />
          </TooltipProvider>
        </GeolocationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
