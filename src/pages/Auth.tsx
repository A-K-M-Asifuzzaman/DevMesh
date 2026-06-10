import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

function Field({
  icon: Icon,
  ...props
}: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 transition focus-within:border-neon-cyan/50 focus-within:shadow-glow">
      <Icon className="h-4 w-4 text-slate-500" />
      <input
        {...props}
        className="h-11 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
      />
    </div>
  );
}

function AuthLayout({ children, mode }: { children: React.ReactNode; mode: "login" | "signup" }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-16">
        <Link to="/" className="mb-10">
          <Logo />
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
      <div className="relative hidden items-center justify-center overflow-hidden border-l border-white/5 bg-ink-900/40 lg:flex">
        <div className="absolute inset-0 bg-neon-soft opacity-60" />
        <div className="absolute -right-20 top-10 h-80 w-80 animate-float rounded-full bg-neon-cyan/20 blur-[100px]" />
        <div className="relative z-10 max-w-sm px-10 text-center">
          <Badge tone="cyan" className="mb-5">DevMesh AI</Badge>
          <h2 className="font-display text-3xl font-bold leading-tight text-white">
            {mode === "login"
              ? "Welcome back to your mesh."
              : "Join developers building together."}
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            AI-matched collaborators, realtime team workspaces, and cofounder
            discovery — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}

// Google G icon
function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export function Login() {
  const { login, googleSignIn, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast(`Welcome back! 👋`);
      navigate(from, { replace: true });
    } catch (err: any) {
      toast(err.message ?? "Invalid credentials", "error");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await googleSignIn();
      toast("Welcome to DevMesh! 🚀");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast(err.message ?? "Google sign-in failed", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <h1 className="font-display text-2xl font-bold text-white">Log in</h1>
      <p className="mt-1 text-sm text-slate-400">Sign in to your account.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <Field icon={Mail} type="email" placeholder="you@dev.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field icon={Lock} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full">
          Log in <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-600">
        <span className="hairline flex-1" /> or <span className="hairline flex-1" />
      </div>
      <Button variant="outline" className="w-full" loading={googleLoading} onClick={handleGoogle}>
        <GoogleIcon /> Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-slate-400">
        New here?{" "}
        <Link to="/signup" className="text-neon-cyan hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

export function Signup() {
  const { signup, googleSignIn, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast("Name is required", "error"); return; }
    if (password.length < 8) { toast("Password must be at least 8 characters", "error"); return; }
    try {
      await signup(name.trim(), email, password);
      toast("Account created — welcome to DevMesh ✨");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast(err.message ?? "Something went wrong", "error");
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await googleSignIn();
      toast("Welcome to DevMesh! 🚀");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast(err.message ?? "Google sign-in failed", "error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout mode="signup">
      <h1 className="font-display text-2xl font-bold text-white">Create your account</h1>
      <p className="mt-1 text-sm text-slate-400">Free forever for individuals.</p>

      <Button variant="outline" className="mt-4 w-full" loading={googleLoading} onClick={handleGoogle}>
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-600">
        <span className="hairline flex-1" /> or sign up with email <span className="hairline flex-1" />
      </div>

      <form onSubmit={submit} className="space-y-3">
        <Field icon={UserIcon} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Field icon={Mail} type="email" placeholder="you@dev.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Field icon={Lock} type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" loading={loading} className="w-full">
          Create account <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-neon-cyan hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
