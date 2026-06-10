import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuroraBackground } from "@/components/layout/AuroraBackground";
import { AppShell } from "@/components/layout/AppShell";

import Landing from "@/pages/Landing";
import { Login, Signup } from "@/pages/Auth";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Discover = lazy(() => import("@/pages/Discover"));
const Chat = lazy(() => import("@/pages/Chat"));
const Teams = lazy(() => import("@/pages/Teams"));
const Startups = lazy(() => import("@/pages/Startups"));
const Recruiter = lazy(() => import("@/pages/Recruiter"));
const Billing = lazy(() => import("@/pages/Billing"));
const Profile = lazy(() => import("@/pages/Profile"));
const UserProfile = lazy(() => import("@/pages/UserProfile"));
const Connections = lazy(() => import("@/pages/Connections"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function PageFallback() {
  return (
    <div className="grid h-[60vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AuroraBackground />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Onboarding — authenticated but outside AppShell */}
              <Route
                path="/onboarding"
                element={
                  <RequireAuth>
                    <Onboarding />
                  </RequireAuth>
                }
              />

              {/* Authenticated app */}
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/messages" element={<Navigate to="/chat" replace />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/startups" element={<Startups />} />
                <Route path="/recruiter" element={<Recruiter />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/connections" element={<Connections />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
