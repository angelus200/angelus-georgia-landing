import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { Link } from "wouter";

export default function Register() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const inviteToken = params.get("invite");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Deutschland");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // States
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [invitationValid, setInvitationValid] = useState<boolean | null>(null);
  const [invitationRole, setInvitationRole] = useState<string>("");
  const [invitationError, setInvitationError] = useState<string>("");

  // Validate invitation token
  const { data: invitationData, isLoading: isValidating } = trpc.users.validateInvitation.useQuery(
    { token: inviteToken || "" },
    { enabled: !!inviteToken }
  );

  useEffect(() => {
    if (invitationData) {
      if (invitationData.valid) {
        setInvitationValid(true);
        setEmail(invitationData.email || "");
        setInvitationRole(invitationData.role || "user");
      } else {
        setInvitationValid(false);
        setInvitationError(invitationData.message || "Einladung ungültig");
      }
    }
  }, [invitationData]);

  const acceptInvitationMutation = trpc.users.acceptInvitation.useMutation({
    onSuccess: () => {
      setRegistrationSuccess(true);
      toast.success("Registrierung erfolgreich! Sie können sich jetzt anmelden.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== passwordConfirm) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !street || !city || !postalCode || !country) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    acceptInvitationMutation.mutate({
      token: inviteToken || "",
      name: `${firstName} ${lastName}`,
      password,
      firstName,
      lastName,
      phone,
      street,
      city,
      postalCode,
      country,
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      manager: "Manager",
      sales: "Vertrieb",
      user: "Benutzer",
    };
    return labels[role] || role;
  };

  // No invite token
  if (!inviteToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Einladung erforderlich</CardTitle>
            <CardDescription>
              Um sich zu registrieren, benötigen Sie einen Einladungslink.
              Bitte kontaktieren Sie einen Administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-[#C4A052] hover:bg-[#B39142]">
                Zur Anmeldung
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Validating invitation
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#C4A052] mx-auto mb-4" />
            <p className="text-gray-600">Einladung wird überprüft...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid invitation
  if (invitationValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Einladung ungültig</CardTitle>
            <CardDescription>{invitationError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full bg-[#C4A052] hover:bg-[#B39142]">
                Zur Anmeldung
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get login URL based on role
  const getLoginDestination = () => {
    if (invitationRole === "admin" || invitationRole === "manager" || invitationRole === "sales") {
      return "/admin/login";
    }
    return "/login";
  };

  const getSuccessMessage = () => {
    if (invitationRole === "admin" || invitationRole === "manager" || invitationRole === "sales") {
      return "Ihr Admin-Konto wurde erstellt. Sie können sich jetzt im Admin-Bereich anmelden.";
    }
    return "Ihr Konto wurde erstellt. Sie können sich jetzt anmelden.";
  };

  const getButtonText = () => {
    if (invitationRole === "admin" || invitationRole === "manager" || invitationRole === "sales") {
      return "Zum Admin-Login";
    }
    return "Zur Anmeldung";
  };

  // Registration success
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Registrierung erfolgreich!</CardTitle>
            <CardDescription>
              {getSuccessMessage()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={getLoginDestination()}>
              <Button className="w-full bg-[#C4A052] hover:bg-[#B39142]">
                {getButtonText()}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UserPlus className="h-8 w-8 text-[#C4A052]" />
          </div>
          <CardTitle className="text-2xl">Registrierung</CardTitle>
          <CardDescription>
            Sie wurden als <span className="font-semibold text-[#C4A052]">{getRoleLabel(invitationRole)}</span> eingeladen.
            Bitte vervollständigen Sie Ihre Registrierung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@beispiel.de"
                  disabled={!!invitationData?.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 123 456789"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="street">Straße und Hausnummer *</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Musterstraße 123"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">PLZ *</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="12345"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Berlin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Land *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Land wählen" />
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Passwort *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Passwort bestätigen *</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Passwort wiederholen"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#C4A052] hover:bg-[#B39142]"
              disabled={acceptInvitationMutation.isPending}
            >
              {acceptInvitationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird registriert...
                </>
              ) : (
                "Registrierung abschließen"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Bereits registriert?{" "}
              <Link href="/login" className="text-[#C4A052] hover:underline">
                Zur Anmeldung
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
