import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, UserCircle } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Erfolgreich angemeldet!");
      // Store user data in localStorage (simplified - in production use proper session management)
      localStorage.setItem("user", JSON.stringify(data.user));
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Registrierung erfolgreich! Sie können sich jetzt anmelden.");
      // Switch to login tab
      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
      loginTab?.click();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
  };

  const handleOAuthLogin = () => {
    // Redirect to Manus OAuth
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold/5 via-background to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/">
              <a>
                <img
                  src="/images/angelus-logo.png"
                  alt="Angelus Management Georgia"
                  className="h-16 w-auto object-contain"
                />
              </a>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2">
            <UserCircle className="h-6 w-6 text-gold" />
            <CardTitle className="text-2xl font-bold">Willkommen</CardTitle>
          </div>
          <CardDescription>
            Melden Sie sich an oder erstellen Sie ein neues Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
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

              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-gold hover:underline">
                  Passwort vergessen?
                </Link>
              </div>

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
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
                Mit Manus OAuth anmelden
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Ihr vollständiger Name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-Mail</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ihre@email.de"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Passwort</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Mindestens 8 Zeichen"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Passwort muss mindestens 8 Zeichen lang sein
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gold hover:bg-gold/90"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Wird registriert...
                    </>
                  ) : (
                    "Konto erstellen"
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
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
                Mit Manus OAuth registrieren
              </Button>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground pt-4 space-y-2">
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
        </CardContent>
      </Card>
    </div>
  );
}
