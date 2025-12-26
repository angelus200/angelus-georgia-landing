import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, Phone, User, Calendar, Trash2 } from "lucide-react";
import { Link } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ContactStatus = "new" | "contacted" | "closed";

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "all">("all");
  const [selectedInquiry, setSelectedInquiry] = useState<number | null>(null);

  const { data: inquiries, isLoading, refetch } = trpc.contact.list.useQuery();

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status erfolgreich aktualisiert");
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteMutation = trpc.contact.delete.useMutation({
    onSuccess: () => {
      toast.success("Anfrage erfolgreich gelöscht");
      setSelectedInquiry(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Admin-Bereich</h1>
            <p className="text-muted-foreground">
              Bitte melden Sie sich an, um auf den Admin-Bereich zuzugreifen.
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="w-full bg-gold text-white hover:bg-gold/90"
          >
            Anmelden
          </Button>
          <Link href="/">
            <a className="text-sm text-muted-foreground hover:text-gold transition-colors">
              ← Zurück zur Startseite
            </a>
          </Link>
        </Card>
      </div>
    );
  }

  // Filter inquiries
  const filteredInquiries = inquiries?.filter((inquiry) =>
    statusFilter === "all" ? true : inquiry.status === statusFilter
  );

  const selectedInquiryData = inquiries?.find((i) => i.id === selectedInquiry);

  const getStatusBadge = (status: ContactStatus) => {
    const variants: Record<ContactStatus, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      new: { variant: "default", label: "Neu" },
      contacted: { variant: "secondary", label: "Kontaktiert" },
      closed: { variant: "destructive", label: "Geschlossen" },
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="capitalize">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-6 sticky top-0 z-10">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <a>
                <img
                  src="/images/angelus-logo.png"
                  alt="Angelus Management Georgia"
                  className="h-12 w-auto object-contain"
                />
              </a>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Admin-Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-3xl font-bold text-foreground">{inquiries?.length || 0}</p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Neu</p>
                <p className="text-3xl font-bold text-gold">
                  {inquiries?.filter((i) => i.status === "new").length || 0}
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Kontaktiert</p>
                <p className="text-3xl font-bold text-blue-600">
                  {inquiries?.filter((i) => i.status === "contacted").length || 0}
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Geschlossen</p>
                <p className="text-3xl font-bold text-muted-foreground">
                  {inquiries?.filter((i) => i.status === "closed").length || 0}
                </p>
              </div>
            </Card>
          </div>

          {/* Filter & Table */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Kontaktanfragen</h2>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ContactStatus | "all")}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Status filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle anzeigen</SelectItem>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="contacted">Kontaktiert</SelectItem>
                    <SelectItem value="closed">Geschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                </div>
              ) : filteredInquiries && filteredInquiries.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>E-Mail</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            {new Date(inquiry.createdAt).toLocaleDateString("de-DE")}
                          </TableCell>
                          <TableCell className="font-medium">{inquiry.name}</TableCell>
                          <TableCell>{inquiry.email}</TableCell>
                          <TableCell>{inquiry.phone || "-"}</TableCell>
                          <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={inquiry.status}
                                onValueChange={(value: ContactStatus) => {
                                  updateStatusMutation.mutate({
                                    id: inquiry.id,
                                    status: value,
                                  });
                                }}
                              >
                                <SelectTrigger className="w-36 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Neu</SelectItem>
                                  <SelectItem value="contacted">Kontaktiert</SelectItem>
                                  <SelectItem value="closed">Geschlossen</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedInquiry(inquiry.id)}
                              >
                                Details
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Keine Anfragen gefunden</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={selectedInquiry !== null} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Anfrage-Details</DialogTitle>
            <DialogDescription>
              Vollständige Informationen zur Kontaktanfrage
            </DialogDescription>
          </DialogHeader>

          {selectedInquiryData && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Name</span>
                  </div>
                  <p className="font-semibold text-foreground">{selectedInquiryData.name}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Datum</span>
                  </div>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedInquiryData.createdAt).toLocaleString("de-DE")}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>E-Mail</span>
                  </div>
                  <a
                    href={`mailto:${selectedInquiryData.email}`}
                    className="font-semibold text-gold hover:underline"
                  >
                    {selectedInquiryData.email}
                  </a>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Telefon</span>
                  </div>
                  {selectedInquiryData.phone ? (
                    <a
                      href={`tel:${selectedInquiryData.phone}`}
                      className="font-semibold text-gold hover:underline"
                    >
                      {selectedInquiryData.phone}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Nicht angegeben</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Nachricht</p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">{selectedInquiryData.message}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedInquiryData.status)}
                  <Select
                    value={selectedInquiryData.status}
                    onValueChange={(value: ContactStatus) => {
                      updateStatusMutation.mutate({
                        id: selectedInquiryData.id,
                        status: value,
                      });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neu</SelectItem>
                      <SelectItem value="contacted">Kontaktiert</SelectItem>
                      <SelectItem value="closed">Geschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm("Möchten Sie diese Anfrage wirklich löschen?")) {
                      deleteMutation.mutate({ id: selectedInquiryData.id });
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? "Wird gelöscht..." : "Anfrage löschen"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
