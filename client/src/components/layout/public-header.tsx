import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import navimedLogo from "@assets/JPG_1753663321927.jpg";

interface PublicHeaderProps {
  className?: string;
}

export const PublicHeader = ({ className = "" }: PublicHeaderProps) => {
  const brandName = "NAVIMED";

  return (
    <header className={`fixed top-0 w-full z-50 border-b border-white/10 backdrop-blur-xl bg-white/80 supports-[backdrop-filter]:bg-white/60 ${className}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={navimedLogo} alt="NaviMed" className="h-12 w-12 rounded-lg object-contain" />
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  {brandName}
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/features" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">Features</Link>
            <Link href="/solutions" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">Solutions</Link>
            <Link href="/marketplace" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">Marketplace</Link>
            <Link href="/pricing" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">Pricing</Link>
            <Link href="/security" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">Security</Link>
            <a href="/supplier-login-direct" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              Supplier Login
            </a>
            <Link href="/contact" className="text-slate-600 hover:text-emerald-600 transition-colors font-medium">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-emerald-600 font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg shadow-emerald-600/25">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};