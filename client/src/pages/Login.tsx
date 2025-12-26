import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Loader2, UserCircle, Mail, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Extended registration fields
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerStreet, setRegisterStreet] = useState("");
  const [registerCity, setRegisterCity] = useState("");
  const [registerPostalCode, setRegisterPostalCode] = useState("");
  const [registerCountry, setRegisterCountry] = useState("Deutschland");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState("");
  
  // Registration success state
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Erfolgreich angemeldet!");
      localStorage.setItem("user", JSON.stringify(data.user));
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      setRegisteredEmail(registerEmail);
      setRegistrationSuccess(true);
      toast.success("Registrierung erfolgreich! Bitte bestätigen Sie Ihre E-Mail-Adresse.");
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
    
    // Validate passwords match
    if (registerPassword !== registerPasswordConfirm) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    
    // Validate required fields
    if (!registerFirstName || !registerLastName || !registerEmail || !registerPhone || 
        !registerStreet || !registerCity || !registerPostalCode || !registerCountry) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }
    
    registerMutation.mutate({
      name: `${registerFirstName} ${registerLastName}`,
      email: registerEmail,
      password: registerPassword,
      firstName: registerFirstName,
      lastName: registerLastName,
      phone: registerPhone,
      street: registerStreet,
      city: registerCity,
      postalCode: registerPostalCode,
      country: registerCountry,
    });
  };

  const handleOAuthLogin = () => {
    window.location.href = getLoginUrl();
  };

  // Show success message after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold/5 via-background to-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Bestätigen Sie Ihre E-Mail</CardTitle>
            <CardDescription className="text-base">
              Wir haben eine Bestätigungs-E-Mail an <strong>{registeredEmail}</strong> gesendet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Nächste Schritte:</h4>
              <ol className="list-decimal list-inside text-sm text-amber-700 space-y-1">
                <li>Öffnen Sie Ihre E-Mail</li>
                <li>Klicken Sie auf den Bestätigungslink</li>
                <li>Melden Sie sich mit Ihren Zugangsdaten an</li>
              </ol>
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              Keine E-Mail erhalten? Prüfen Sie Ihren Spam-Ordner oder{" "}
              <button 
                onClick={() => setRegistrationSuccess(false)}
                className="text-gold hover:underline"
              >
                registrieren Sie sich erneut
              </button>
            </p>
            
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setRegistrationSuccess(false);
                const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                loginTab?.click();
              }}
            >
              Zurück zur Anmeldung
            </Button>
            
            <div className="text-center">
              <Link href="/" className="text-sm text-gold hover:underline">
                Zurück zur Startseite
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold/5 via-background to-background p-4">
      <Card className="w-full max-w-lg">
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
                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Persönliche Daten</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="register-firstName">Vorname *</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        placeholder="Max"
                        value={registerFirstName}
                        onChange={(e) => setRegisterFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-lastName">Nachname *</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        placeholder="Mustermann"
                        value={registerLastName}
                        onChange={(e) => setRegisterLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-email">E-Mail *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="ihre@email.de"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-phone">Telefon *</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="+49 123 456789"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Adresse</h3>
                  <div className="space-y-1">
                    <Label htmlFor="register-street">Straße und Hausnummer *</Label>
                    <Input
                      id="register-street"
                      type="text"
                      placeholder="Musterstraße 123"
                      value={registerStreet}
                      onChange={(e) => setRegisterStreet(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="register-postalCode">PLZ *</Label>
                      <Input
                        id="register-postalCode"
                        type="text"
                        placeholder="12345"
                        value={registerPostalCode}
                        onChange={(e) => setRegisterPostalCode(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="register-city">Stadt *</Label>
                      <Input
                        id="register-city"
                        type="text"
                        placeholder="Berlin"
                        value={registerCity}
                        onChange={(e) => setRegisterCity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-country">Land *</Label>
                    <Select value={registerCountry} onValueChange={setRegisterCountry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Land auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                        <SelectItem value="Österreich">Österreich</SelectItem>
                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                        <SelectItem value="Georgien">Georgien</SelectItem>
                        <SelectItem value="Andere">Andere</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Passwort</h3>
                  <div className="space-y-1">
                    <Label htmlFor="register-password">Passwort *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Mindestens 8 Zeichen"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="register-password-confirm">Passwort bestätigen *</Label>
                    <Input
                      id="register-password-confirm"
                      type="password"
                      placeholder="Passwort wiederholen"
                      value={registerPasswordConfirm}
                      onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Passwort muss mindestens 8 Zeichen lang sein
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Nach der Registrierung erhalten Sie eine E-Mail zur Bestätigung Ihrer Adresse.
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
