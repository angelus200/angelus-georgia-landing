import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Lock, MapPin, Phone, Mail, ArrowLeft, Save, CheckCircle } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: userLoading } = trpc.auth.me.useQuery();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = trpc.profile.get.useQuery(undefined, {
    enabled: !!user,
  });
  
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profil erfolgreich aktualisiert");
      refetchProfile();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren des Profils");
    },
  });
  
  const changePasswordMutation = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Passwort erfolgreich geändert");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Ändern des Passworts");
    },
  });
  
  useEffect(() => {
    if (profile) {
      setProfileData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        street: profile.street || "",
        city: profile.city || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "",
      });
    }
  }, [profile]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);
  
  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8f5f0] to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a54e]"></div>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error("Neues Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f5f0] to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#c9a54e]/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => setLocation("/dashboard")}
            className="flex items-center gap-2 text-[#2c2c2c] hover:text-[#c9a54e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück zum Dashboard</span>
          </button>
          <h1 className="text-xl font-semibold text-[#2c2c2c]">Mein Profil</h1>
          <div className="w-32 flex justify-end">
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#c9a54e] to-[#b8943d] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {profile?.firstName?.[0]?.toUpperCase() || profile?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-2xl font-bold text-[#2c2c2c]">
            {profile?.firstName && profile?.lastName 
              ? `${profile.firstName} ${profile.lastName}` 
              : profile?.name || "Benutzer"}
          </h2>
          <p className="text-gray-500">{profile?.email}</p>
          {profile?.emailVerified && (
            <div className="flex items-center justify-center gap-1 mt-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">E-Mail verifiziert</span>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Persönliche Daten
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sicherheit
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <form onSubmit={handleProfileSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-[#c9a54e]" />
                      Persönliche Informationen
                    </CardTitle>
                    <CardDescription>
                      Aktualisieren Sie Ihre persönlichen Daten
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Vorname</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          placeholder="Max"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nachname</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          placeholder="Mustermann"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-Mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500">E-Mail-Adresse kann nicht geändert werden</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefon
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+49 123 456789"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#c9a54e]" />
                      Adresse
                    </CardTitle>
                    <CardDescription>
                      Ihre Rechnungs- und Kontaktadresse
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Straße und Hausnummer</Label>
                      <Input
                        id="street"
                        value={profileData.street}
                        onChange={(e) => setProfileData({ ...profileData, street: e.target.value })}
                        placeholder="Musterstraße 123"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">PLZ</Label>
                        <Input
                          id="postalCode"
                          value={profileData.postalCode}
                          onChange={(e) => setProfileData({ ...profileData, postalCode: e.target.value })}
                          placeholder="12345"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Stadt</Label>
                        <Input
                          id="city"
                          value={profileData.city}
                          onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                          placeholder="Berlin"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Land</Label>
                      <Select
                        value={profileData.country}
                        onValueChange={(value) => setProfileData({ ...profileData, country: value })}
                      >
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
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-[#c9a54e] hover:bg-[#b8943d] text-white"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Änderungen speichern
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="security">
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#c9a54e]" />
                  Passwort ändern
                </CardTitle>
                <CardDescription>
                  Ändern Sie Ihr Passwort regelmäßig für mehr Sicherheit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Neues Passwort</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500">Mindestens 8 Zeichen</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#c9a54e] hover:bg-[#b8943d] text-white"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Passwort ändern...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Passwort ändern
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Account Info */}
            <Card className="max-w-xl mx-auto mt-6">
              <CardHeader>
                <CardTitle>Kontoinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Konto erstellt</span>
                  <span className="font-medium">
                    {profile?.createdAt 
                      ? new Date(profile.createdAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Letzte Aktualisierung</span>
                  <span className="font-medium">
                    {profile?.updatedAt 
                      ? new Date(profile.updatedAt).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">E-Mail-Status</span>
                  <span className={`font-medium ${profile?.emailVerified ? "text-green-600" : "text-orange-500"}`}>
                    {profile?.emailVerified ? "Verifiziert" : "Nicht verifiziert"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
