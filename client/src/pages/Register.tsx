import { SignUp } from "@clerk/clerk-react";
import { Link } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold/5 via-background to-background p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/">
            <a>
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-20 w-auto object-contain"
              />
            </a>
          </Link>
        </div>

        {/* Clerk Sign Up Component */}
        <SignUp
          routing="path"
          path="/register"
          signInUrl="/login"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            }
          }}
        />

        {/* Footer Links */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div>
            <Link href="/">
              <a className="hover:text-gold hover:underline">
                Zurück zur Startseite
              </a>
            </Link>
          </div>
          <div className="text-xs">
            Mit der Registrierung stimmen Sie unseren{" "}
            <Link href="/agb">
              <a className="text-gold hover:underline">AGB</a>
            </Link>{" "}
            und{" "}
            <Link href="/datenschutz">
              <a className="text-gold hover:underline">Datenschutzbestimmungen</a>
            </Link>{" "}
            zu.
          </div>
        </div>
      </div>
    </div>
  );
}
