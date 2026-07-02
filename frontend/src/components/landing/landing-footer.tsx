import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-accent rounded-md" />
          <span className="font-semibold gradient-text">Nexus AI</span>
          <span className="text-text-muted text-sm ml-2">Simulate Decisions Before Reality Does.</span>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-sm text-text-muted">
          <Link href="/auth/login" className="hover:text-text-primary transition-colors">Sign In</Link>
          <Link href="/auth/register" className="hover:text-text-primary transition-colors">Register</Link>
          <Link href="#features" className="hover:text-text-primary transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
          <a href="mailto:hello@nexus-ai.com" className="hover:text-text-primary transition-colors">Contact</a>
        </nav>

        <p className="text-text-muted text-xs">
          © {new Date().getFullYear()} Nexus AI. Built with Gemini 2.5 Pro.
        </p>
      </div>
    </footer>
  );
}
