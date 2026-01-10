import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, Shield } from "lucide-react";
import { Link } from "wouter";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      if (data.user.role !== "admin") {
        toast.error("Zugriff verweigert: Nur Administratoren können sich hier anmelden");
        return;
      }
      
      toast.success("Erfolgreich angemeldet!");
      // Invalidate auth.me query to refetch user data
      await utils.auth.me.invalidate();
      // Store user data in localStorage (simplified - in production use proper session management)
      localStorage.setItem("user", JSON.stringify(data.user));
      setLocation("/admin");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleOAuthLogin = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold/5 via-background to-background p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <img
                src="/images/angelus-logo.png"
                alt="Angelus Management Georgia"
                className="h-16 w-auto object-contain cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-gold" />
            <CardTitle className="text-2xl font-bold">Admin-Anmeldung</CardTitle>
          </div>
          <CardDescription>
            Melden Sie sich mit Ihren Administrator-Zugangsdaten an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@angelusmanagement.ge"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gold hover:bg-gold/90"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Oder</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleOAuthLogin}
          >
            <Shield className="h-5 w-5 mr-2" />
            Zur Standard-Anmeldung
          </Button>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <Link href="/" className="hover:text-gold hover:underline">
              Zurück zur Startseite
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
