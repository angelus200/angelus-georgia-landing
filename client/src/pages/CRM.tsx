import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Building,
  Euro,
  MessageSquare,
  FileText,
  ArrowRight,
  Flame,
  Thermometer,
  Snowflake,
  X,
  Upload,
  Trash2,
  Download,
  File,
  FileCheck,
  FileBadge,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Stage configuration
const STAGES = [
  { id: 'new', label: 'Neu', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Kontaktiert', color: 'bg-yellow-500' },
  { id: 'qualified', label: 'Qualifiziert', color: 'bg-purple-500' },
  { id: 'proposal', label: 'Angebot', color: 'bg-orange-500' },
  { id: 'negotiation', label: 'Verhandlung', color: 'bg-pink-500' },
  { id: 'won', label: 'Gewonnen', color: 'bg-green-500' },
  { id: 'lost', label: 'Verloren', color: 'bg-gray-500' },
];

const PRIORITY_CONFIG = {
  hot: { label: 'Heiß', icon: Flame, color: 'text-red-500' },
  warm: { label: 'Warm', icon: Thermometer, color: 'text-orange-500' },
  cold: { label: 'Kalt', icon: Snowflake, color: 'text-blue-500' },
};

const SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  referral: 'Empfehlung',
  social_media: 'Social Media',
  advertisement: 'Werbung',
  cold_call: 'Kaltakquise',
  event: 'Event',
  other: 'Sonstige',
};

const TIMELINE_LABELS: Record<string, string> = {
  immediate: 'Sofort',
  '1_3_months': '1-3 Monate',
  '3_6_months': '3-6 Monate',
  '6_12_months': '6-12 Monate',
  'over_12_months': 'Über 12 Monate',
};

export default function CRM() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("pipeline");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);

  // Fetch data
  const { data: leads, refetch: refetchLeads } = trpc.crm.leads.list.useQuery();
  const { data: stats } = trpc.crm.stats.useQuery();
  const { data: pendingTasks, refetch: refetchTasks } = trpc.crm.tasks.pending.useQuery();

  // Mutations
  const createLeadMutation = trpc.crm.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead erfolgreich erstellt");
      refetchLeads();
      setShowNewLeadModal(false);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const updateStageMutation = trpc.crm.leads.updateStage.useMutation({
    onSuccess: () => {
      toast.success("Phase aktualisiert");
      refetchLeads();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const deleteLeadMutation = trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      toast.success("Lead gelöscht");
      refetchLeads();
      setShowLeadDetail(false);
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  // Filter leads by search
  const filteredLeads = leads?.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(query) ||
      lead.lastName?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query)
    );
  }) || [];

  // Group leads by stage for pipeline view
  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(lead => lead.stage === stage.id);
    return acc;
  }, {} as Record<string, any[]>);

  const handleDragStart = (e: React.DragEvent, lead: any) => {
    e.dataTransfer.setData('leadId', lead.id.toString());
    e.dataTransfer.setData('oldStage', lead.stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    const oldStage = e.dataTransfer.getData('oldStage');
    
    if (oldStage !== newStage) {
      updateStageMutation.mutate({ id: leadId, newStage, oldStage });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
              <p className="text-sm text-gray-500">Kundenbeziehungsmanagement</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Leads suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setShowNewLeadModal(true)} className="bg-gold hover:bg-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Neuer Lead
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Gesamt Leads</p>
                  <p className="text-3xl font-bold">{stats?.totalLeads || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pipeline-Wert</p>
                  <p className="text-3xl font-bold">€{(stats?.pipelineValue || 0).toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Euro className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <p className="text-3xl font-bold">{(stats?.conversionRate || 0).toFixed(1)}%</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Offene Aufgaben</p>
                  <p className="text-3xl font-bold">{stats?.pendingTasks || 0}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="tasks">Aufgaben ({pendingTasks?.length || 0})</TabsTrigger>
          </TabsList>

          {/* Pipeline View */}
          <TabsContent value="pipeline">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.filter(s => !['won', 'lost'].includes(s.id)).map((stage) => (
                <div
                  key={stage.id}
                  className="flex-shrink-0 w-80"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  <div className="bg-white rounded-lg shadow">
                    <div className={`${stage.color} h-1 rounded-t-lg`} />
                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                        <Badge variant="secondary">{leadsByStage[stage.id]?.length || 0}</Badge>
                      </div>
                    </div>
                    <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
                      {leadsByStage[stage.id]?.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          onDragStart={handleDragStart}
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadDetail(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Won/Lost columns */}
              <div className="flex-shrink-0 w-80">
                <div className="bg-white rounded-lg shadow">
                  <div className="bg-green-500 h-1 rounded-t-lg" />
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Gewonnen</h3>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {leadsByStage['won']?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  <div 
                    className="p-2 space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'won')}
                  >
                    {leadsByStage['won']?.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={handleDragStart}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLeadDetail(true);
                        }}
                        compact
                      />
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow mt-4">
                  <div className="bg-gray-500 h-1 rounded-t-lg" />
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Verloren</h3>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {leadsByStage['lost']?.length || 0}
                      </Badge>
                    </div>
                  </div>
                  <div 
                    className="p-2 space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'lost')}
                  >
                    {leadsByStage['lost']?.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={handleDragStart}
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowLeadDetail(true);
                        }}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* List View */}
          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600">Name</th>
                      <th className="text-left p-4 font-medium text-gray-600">E-Mail</th>
                      <th className="text-left p-4 font-medium text-gray-600">Phase</th>
                      <th className="text-left p-4 font-medium text-gray-600">Priorität</th>
                      <th className="text-left p-4 font-medium text-gray-600">Erwarteter Wert</th>
                      <th className="text-left p-4 font-medium text-gray-600">Erstellt</th>
                      <th className="text-left p-4 font-medium text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const stage = STAGES.find(s => s.id === lead.stage);
                      const PriorityIcon = PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.icon || Thermometer;
                      return (
                        <tr 
                          key={lead.id} 
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowLeadDetail(true);
                          }}
                        >
                          <td className="p-4">
                            <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                            {lead.company && <div className="text-sm text-gray-500">{lead.company}</div>}
                          </td>
                          <td className="p-4 text-gray-600">{lead.email}</td>
                          <td className="p-4">
                            <Badge className={`${stage?.color} text-white`}>{stage?.label}</Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <PriorityIcon className={`h-4 w-4 ${PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.color}`} />
                              <span className="text-sm">{PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.label}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {lead.expectedValue ? `€${parseFloat(lead.expectedValue).toLocaleString()}` : '-'}
                          </td>
                          <td className="p-4 text-gray-500 text-sm">
                            {new Date(lead.createdAt).toLocaleDateString('de-DE')}
                          </td>
                          <td className="p-4">
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Keine Leads gefunden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks View */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>Offene Aufgaben</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingTasks && pendingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTasks.map((task) => (
                      <TaskItem key={task.id} task={task} onComplete={() => refetchTasks()} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Keine offenen Aufgaben
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Lead Modal */}
      {showNewLeadModal && (
        <NewLeadModal
          onClose={() => setShowNewLeadModal(false)}
          onSave={(data) => createLeadMutation.mutate(data)}
          isLoading={createLeadMutation.isPending}
        />
      )}

      {/* Lead Detail Modal */}
      {showLeadDetail && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => {
            setShowLeadDetail(false);
            setSelectedLead(null);
          }}
          onDelete={() => deleteLeadMutation.mutate({ id: selectedLead.id })}
          onUpdate={() => refetchLeads()}
        />
      )}
    </div>
  );
}

// Lead Card Component
function LeadCard({ lead, onDragStart, onClick, compact = false }: { 
  lead: any; 
  onDragStart: (e: React.DragEvent, lead: any) => void;
  onClick: () => void;
  compact?: boolean;
}) {
  const PriorityIcon = PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.icon || Thermometer;
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      onClick={onClick}
      className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-gray-900 truncate">
          {lead.firstName} {lead.lastName}
        </div>
        <PriorityIcon className={`h-4 w-4 flex-shrink-0 ${PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.color}`} />
      </div>
      
      {!compact && (
        <>
          {lead.company && (
            <div className="text-sm text-gray-500 flex items-center gap-1 mb-1">
              <Building className="h-3 w-3" />
              {lead.company}
            </div>
          )}
          <div className="text-sm text-gray-500 flex items-center gap-1 mb-2">
            <Mail className="h-3 w-3" />
            {lead.email}
          </div>
          {lead.expectedValue && (
            <div className="text-sm font-medium text-green-600">
              €{parseFloat(lead.expectedValue).toLocaleString()}
            </div>
          )}
        </>
      )}
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>{SOURCE_LABELS[lead.source] || lead.source}</span>
        <span>{new Date(lead.createdAt).toLocaleDateString('de-DE')}</span>
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({ task, onComplete }: { task: any; onComplete: () => void }) {
  const updateStatusMutation = trpc.crm.tasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Aufgabe erledigt");
      onComplete();
    },
  });

  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateStatusMutation.mutate({ id: task.id, status: 'completed' })}
          className="h-5 w-5 rounded border-2 border-gray-300 hover:border-green-500 flex items-center justify-center"
        >
          {updateStatusMutation.isPending && (
            <div className="h-3 w-3 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          )}
        </button>
        <div>
          <div className="font-medium">{task.title}</div>
          {task.description && <div className="text-sm text-gray-500">{task.description}</div>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={isOverdue ? "destructive" : "secondary"}>
          {new Date(task.dueDate).toLocaleDateString('de-DE')}
        </Badge>
        <Badge variant="outline">{task.priority}</Badge>
      </div>
    </div>
  );
}

// New Lead Modal Component
function NewLeadModal({ onClose, onSave, isLoading }: {
  onClose: () => void;
  onSave: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    source: "website",
    priority: "warm",
    country: "",
    city: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    expectedValue: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Neuer Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="font-medium mb-3">Kontaktdaten</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vorname *</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nachname</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-Mail *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefon</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Unternehmen</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Lead Info */}
          <div>
            <h3 className="font-medium mb-3">Lead-Informationen</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quelle</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priorität</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="cold">Kalt</option>
                  <option value="warm">Warm</option>
                  <option value="hot">Heiß</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget Min (€)</label>
                <Input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget Max (€)</label>
                <Input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Erwarteter Wert (€)</label>
                <Input
                  type="number"
                  value={formData.expectedValue}
                  onChange={(e) => setFormData({ ...formData, expectedValue: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zeitrahmen</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">-- Auswählen --</option>
                  {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full border rounded-md p-2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" className="bg-gold hover:bg-gold/90" disabled={isLoading}>
              {isLoading ? "Speichern..." : "Lead erstellen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Lead Detail Modal Component
function LeadDetailModal({ lead, onClose, onDelete, onUpdate }: {
  lead: any;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: () => void;
}) {
  const [activeTab, setActiveTab] = useState("info");
  const [newNote, setNewNote] = useState("");
  
  const { data: activities, refetch: refetchActivities } = trpc.crm.activities.list.useQuery({ leadId: lead.id });
  const { data: tasks, refetch: refetchTasks } = trpc.crm.tasks.list.useQuery({ leadId: lead.id });
  const { data: documents, refetch: refetchDocuments } = trpc.crm.documents.list.useQuery({ leadId: lead.id });
  
  const uploadDocumentMutation = trpc.crm.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Dokument hochgeladen");
      refetchDocuments();
      refetchActivities();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const deleteDocumentMutation = trpc.crm.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Dokument gelöscht");
      refetchDocuments();
      refetchActivities();
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });
  
  const createActivityMutation = trpc.crm.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Aktivität hinzugefügt");
      refetchActivities();
      setNewNote("");
    },
  });

  const stage = STAGES.find(s => s.id === lead.stage);
  const PriorityIcon = PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.icon || Thermometer;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    createActivityMutation.mutate({
      leadId: lead.id,
      type: 'note',
      title: 'Notiz',
      description: newNote,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{lead.firstName} {lead.lastName}</h2>
            <div className="flex items-center gap-3 mt-1">
              <Badge className={`${stage?.color} text-white`}>{stage?.label}</Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <PriorityIcon className={`h-4 w-4 ${PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.color}`} />
                {PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]?.label}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={onDelete}>
              Löschen
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-4">
            {['info', 'activities', 'tasks', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab 
                    ? 'border-gold text-gold' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'info' && 'Informationen'}
                {tab === 'activities' && `Aktivitäten (${activities?.length || 0})`}
                {tab === 'tasks' && `Aufgaben (${tasks?.length || 0})`}
                {tab === 'documents' && 'Dokumente'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Kontaktdaten</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${lead.phone}`} className="text-blue-600 hover:underline">{lead.phone}</a>
                    </div>
                  )}
                  {lead.company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{lead.company}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Lead-Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quelle:</span>
                    <span>{SOURCE_LABELS[lead.source] || lead.source}</span>
                  </div>
                  {lead.expectedValue && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Erwarteter Wert:</span>
                      <span className="font-medium text-green-600">€{parseFloat(lead.expectedValue).toLocaleString()}</span>
                    </div>
                  )}
                  {lead.timeline && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Zeitrahmen:</span>
                      <span>{TIMELINE_LABELS[lead.timeline] || lead.timeline}</span>
                    </div>
                  )}
                  {(lead.budgetMin || lead.budgetMax) && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Budget:</span>
                      <span>
                        {lead.budgetMin && `€${parseFloat(lead.budgetMin).toLocaleString()}`}
                        {lead.budgetMin && lead.budgetMax && ' - '}
                        {lead.budgetMax && `€${parseFloat(lead.budgetMax).toLocaleString()}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Erstellt:</span>
                    <span>{new Date(lead.createdAt).toLocaleString('de-DE')}</span>
                  </div>
                </div>
              </div>

              {lead.notes && (
                <div className="col-span-2">
                  <h3 className="font-medium mb-2">Notizen</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              {/* Add Note */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Notiz hinzufügen..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <Button onClick={handleAddNote} disabled={createActivityMutation.isPending}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4">
                {activities?.map((activity) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {activity.type === 'note' && <MessageSquare className="h-4 w-4 text-gray-500" />}
                      {activity.type === 'call' && <Phone className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'email' && <Mail className="h-4 w-4 text-green-500" />}
                      {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-purple-500" />}
                      {activity.type === 'stage_change' && <ArrowRight className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{activity.title}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(activity.createdAt).toLocaleString('de-DE')}
                        </span>
                      </div>
                      {activity.description && (
                        <p className="text-gray-600 mt-1">{activity.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    Keine Aktivitäten vorhanden
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {tasks?.map((task) => (
                <TaskItem key={task.id} task={task} onComplete={() => refetchTasks()} />
              ))}
              {(!tasks || tasks.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Keine Aufgaben vorhanden
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentsTab
              leadId={lead.id}
              documents={documents || []}
              onUpload={(data) => uploadDocumentMutation.mutate(data)}
              onDelete={(id) => deleteDocumentMutation.mutate({ id })}
              isUploading={uploadDocumentMutation.isPending}
              isDeleting={deleteDocumentMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}


// Document Type Labels
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  contract: 'Vertrag',
  id_document: 'Ausweis',
  proof_of_funds: 'Kapitalnachweis',
  correspondence: 'Korrespondenz',
  proposal: 'Angebot',
  other: 'Sonstiges',
};

const DOCUMENT_TYPE_ICONS: Record<string, any> = {
  contract: FileCheck,
  id_document: FileBadge,
  proof_of_funds: FileSpreadsheet,
  correspondence: Mail,
  proposal: FileText,
  other: File,
};

// Documents Tab Component
function DocumentsTab({ 
  leadId, 
  documents, 
  onUpload, 
  onDelete, 
  isUploading, 
  isDeleting 
}: {
  leadId: number;
  documents: any[];
  onUpload: (data: any) => void;
  onDelete: (id: number) => void;
  isUploading: boolean;
  isDeleting: boolean;
}) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    type: 'other' as string,
    file: null as File | null,
  });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
        name: prev.name || file.name.replace(/\.[^/.]+$/, ''), // Use filename without extension as default name
      }));
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file || !uploadData.name) {
      toast.error('Bitte wählen Sie eine Datei und geben Sie einen Namen ein');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onUpload({
        leadId,
        name: uploadData.name,
        type: uploadData.type,
        fileData: base64,
        fileName: uploadData.file!.name,
        mimeType: uploadData.file!.type,
        fileSize: uploadData.file!.size,
      });
      setShowUploadForm(false);
      setUploadData({ name: '', type: 'other', file: null });
    };
    reader.readAsDataURL(uploadData.file);
  };

  const handleDelete = (id: number) => {
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      setDeletingId(id);
      onDelete(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      {/* Upload Button */}
      <div className="mb-6">
        {!showUploadForm ? (
          <Button onClick={() => setShowUploadForm(true)} className="bg-gold hover:bg-gold/90">
            <Upload className="h-4 w-4 mr-2" />
            Dokument hochladen
          </Button>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium mb-4">Neues Dokument hochladen</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Datei auswählen *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full border rounded-md p-2 text-sm"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                />
                {uploadData.file && (
                  <p className="text-sm text-gray-500 mt-1">
                    {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dokumentname *</label>
                  <Input
                    value={uploadData.name}
                    onChange={(e) => setUploadData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Kaufvertrag Apartment 12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dokumenttyp</label>
                  <select
                    value={uploadData.type}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full border rounded-md p-2"
                  >
                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUploadForm(false);
                    setUploadData({ name: '', type: 'other', file: null });
                  }}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading || !uploadData.file || !uploadData.name}
                  className="bg-gold hover:bg-gold/90"
                >
                  {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => {
            const TypeIcon = DOCUMENT_TYPE_ICONS[doc.type] || File;
            return (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <TypeIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {DOCUMENT_TYPE_LABELS[doc.type] || doc.type}
                      </Badge>
                      {doc.fileSize && (
                        <span>{formatFileSize(doc.fileSize)}</span>
                      )}
                      <span>•</span>
                      <span>{new Date(doc.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Herunterladen"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting && deletingId === doc.id}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Löschen"
                  >
                    {isDeleting && deletingId === doc.id ? (
                      <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Keine Dokumente vorhanden</p>
          <p className="text-sm mt-1">Laden Sie Verträge, Ausweise oder andere Dokumente hoch</p>
        </div>
      )}
    </div>
  );
}
