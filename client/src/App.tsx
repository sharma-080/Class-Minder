import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";

import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Subjects from "@/pages/Subjects";
import Timetable from "@/pages/Timetable";
import History from "@/pages/History";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    window.location.href = "/";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/subjects">
          <ProtectedRoute component={Subjects} />
        </Route>
        <Route path="/timetable">
          <ProtectedRoute component={Timetable} />
        </Route>
        <Route path="/history">
          <ProtectedRoute component={History} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
