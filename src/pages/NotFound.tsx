import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <Logo className="mx-auto mb-8 justify-center" />
        <p className="font-display text-7xl font-bold text-grad">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white">This node isn't in the mesh.</h1>
        <p className="mt-2 text-slate-400">The page you're looking for drifted off the graph.</p>
        <Link to="/dashboard" className="mt-7 inline-block">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
