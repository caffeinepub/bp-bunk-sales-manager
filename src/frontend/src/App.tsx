import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BunkSetupProvider } from "./contexts/BunkSetupContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { AnalysisPage } from "./pages/AnalysisPage";
import { CreditSettledPage } from "./pages/CreditSettledPage";
import { EditSalesPage } from "./pages/EditSalesPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NewSalesPage } from "./pages/NewSalesPage";
import { PrintSalesPage } from "./pages/PrintSalesPage";
import { SetupPage } from "./pages/SetupPage";

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bp-gradient flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full bg-bp-yellow flex items-center justify-center shadow-xl">
        <img
          src="/assets/generated/bp-logo-transparent.dim_120x120.png"
          alt="BP"
          className="w-14 h-14 rounded-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2 text-white">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-display font-medium text-lg">{message}</span>
      </div>
    </div>
  );
}

function LoginGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return <LoadingScreen message="Loading..." />;
  }

  const isLoggedIn = identity != null && !identity.getPrincipal().isAnonymous();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return <>{children}</>;
}

type SetupState = "loading" | "needs-setup" | "done";

function SetupGuard({ children }: { children: React.ReactNode }) {
  const { actor, isFetching } = useActor();
  const [setupState, setSetupState] = useState<SetupState>("loading");

  useEffect(() => {
    if (isFetching || !actor) return;

    let cancelled = false;
    actor
      .getSetup()
      .then((setup) => {
        if (!cancelled) {
          setSetupState(setup != null ? "done" : "needs-setup");
        }
      })
      .catch(() => {
        if (!cancelled) setSetupState("needs-setup");
      });

    return () => {
      cancelled = true;
    };
  }, [actor, isFetching]);

  if (setupState === "loading" || isFetching) {
    return <LoadingScreen message="Loading your station..." />;
  }

  if (setupState === "needs-setup") {
    return <SetupPage onComplete={() => setSetupState("done")} />;
  }

  return <BunkSetupProvider>{children}</BunkSetupProvider>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <LoginGuard>
      <SetupGuard>{children}</SetupGuard>
    </LoginGuard>
  );
}

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  ),
});

const newSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/new-sales",
  component: () => (
    <AuthGuard>
      <NewSalesPage />
    </AuthGuard>
  ),
});

const creditSettledRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/credit-settled",
  component: () => (
    <AuthGuard>
      <CreditSettledPage />
    </AuthGuard>
  ),
});

const analysisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analysis",
  component: () => (
    <AuthGuard>
      <AnalysisPage />
    </AuthGuard>
  ),
});

const editSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit-sales",
  component: () => (
    <AuthGuard>
      <EditSalesPage />
    </AuthGuard>
  ),
});

const printSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/print-sales",
  component: () => (
    <AuthGuard>
      <PrintSalesPage />
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  newSalesRoute,
  creditSettledRoute,
  analysisRoute,
  editSalesRoute,
  printSalesRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
