import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Calendar } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#projects", label: "Projekte" },
  { href: "/immobilien", label: "Immobilien" },
  { href: "/#services", label: "Services" },
  { href: "/videos", label: "Videos" },
  { href: "/#contact", label: "Kontakt" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const sectionId = href.replace("/#", "");
      if (location === "/") {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  const openCalendly = () => {
    window.open('https://calendly.com/t-gross-lce/besprechung', '_blank');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/">
            <img
              src="/images/angelus-logo.png"
              alt="Angelus Management"
              className="h-10 lg:h-12 cursor-pointer"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href.startsWith("/#") ? "/" : link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-gray-700 hover:text-[#C4A052] transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Button
              onClick={openCalendly}
              className="bg-[#C4A052] hover:bg-[#B39142] text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Termin buchen
            </Button>
            {user ? (
              <>
                <Link href="/investor-dashboard">
                  <Button variant="outline" className="border-[#C4A052] text-[#C4A052] hover:bg-[#C4A052]/10">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" onClick={logout}>
                  Abmelden
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-[#C4A052] text-[#C4A052] hover:bg-[#C4A052]/10">
                  Anmelden
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href.startsWith("/#") ? "/" : link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 hover:text-[#C4A052] transition-colors font-medium py-2"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2" />
              <Button
                onClick={openCalendly}
                className="bg-[#C4A052] hover:bg-[#B39142] text-white w-full"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Termin buchen
              </Button>
              {user ? (
                <>
                  <Link href="/investor-dashboard">
                    <Button variant="outline" className="w-full border-[#C4A052] text-[#C4A052]">
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={logout} className="w-full">
                    Abmelden
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="outline" className="w-full border-[#C4A052] text-[#C4A052]">
                    Anmelden
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
