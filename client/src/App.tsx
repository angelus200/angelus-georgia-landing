import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import InvestorDashboard from "./pages/InvestorDashboard";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import ServicePackages from "./pages/ServicePackages";
import AdminDirect from "./pages/AdminDirect";

// Session token handler - reads session from URL and sets cookie
function SessionHandler() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionToken = urlParams.get('_session');
    
    if (sessionToken) {
      // Set the session cookie manually (for browsers that block server-set cookies)
      const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
      document.cookie = `app_session_id=${sessionToken}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      
      console.log("[Session] Cookie set from URL parameter");
      
      // Remove the session parameter from URL without reloading
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      
      // Force a page reload to apply the new session
      window.location.reload();
    }
  }, []);
  
  return null;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/impressum"} component={Impressum} />
      <Route path={"/datenschutz"} component={Datenschutz} />
      <Route path={"/agb"} component={AGB} />
      <Route path={"/login"} component={Login} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/verify-email"} component={VerifyEmail} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/admin/direct/:token"} component={AdminDirect} />
      <Route path={"/dashboard"} component={InvestorDashboard} />
      <Route path={"/immobilien"} component={Properties} />
      <Route path={"/immobilien/:id"} component={PropertyDetail} />
      <Route path={"/service-pakete"} component={ServicePackages} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SessionHandler />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
