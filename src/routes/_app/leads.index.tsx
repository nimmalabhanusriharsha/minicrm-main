import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Eye, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Filter, Users } from "lucide-react";
import { statusBadge, sourceLabel, STATUSES, SOURCES } from "@/lib/lead-utils";
import { readLocalLeads, deleteLocalLead, updateLocalLead } from "@/lib/lead-storage";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/leads/")({ component: LeadsPage });

const PAGE_SIZE = 8;

function LeadsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<any | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        const localLeads = readLocalLeads();
        const merged = [...localLeads, ...(data ?? [])];
        return merged.filter((lead, index, arr) => arr.findIndex((item) => item.id === lead.id) === index);
      } catch {
        return readLocalLeads();
      }
    },
  });

  const filtered = useMemo(() => {
    return leads.filter((lead: any) => {
      const matchesSearch =
        !search ||
        lead.name?.toLowerCase().includes(search.toLowerCase()) ||
        lead.email?.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id: string) => {
    const localLead = readLocalLeads().find((lead) => lead.id === id);
    if (localLead) {
      deleteLocalLead(id);
      toast.success("Lead deleted");
      qc.invalidateQueries({ queryKey: ["leads"] });
      return;
    }

    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Lead deleted");
      qc.invalidateQueries({ queryKey: ["leads"] });
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const { id, name, email, phone, source, status } = editing;
    const localLead = readLocalLeads().find((lead) => lead.id === id);
    if (localLead) {
      updateLocalLead(id, { name, email, phone, source, status });
      toast.success("Lead updated");
      qc.invalidateQueries({ queryKey: ["leads"] });
      setEditing(null);
      return;
    }

    const { error } = await supabase.from("leads").update({ name, email, phone, source, status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Lead updated");
      qc.invalidateQueries({ queryKey: ["leads"] });
      setEditing(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CardContent className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Lead roster</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Leads</h1>
            <p className="mt-2 text-sm text-slate-400">Manage all your client leads.</p>
          </div>
          <Button onClick={() => navigate({ to: "/leads/new" })} className="h-11 rounded-full bg-[#20c8b7] px-5 text-white hover:bg-[#17b2a4]">
            <Plus className="size-4" /> Add Lead
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CardContent className="space-y-4 p-5 md:p-6">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                className="h-12 rounded-full border-white/10 bg-white/5 pl-11 text-slate-100 placeholder:text-slate-500"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-12 w-full rounded-full border-white/10 bg-white/5 text-slate-100 lg:w-56">
                <Filter className="mr-2 size-4 text-slate-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusBadge(status).label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-white/8">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="text-slate-400">Name</TableHead>
                  <TableHead className="hidden text-slate-400 md:table-cell">Email</TableHead>
                  <TableHead className="hidden text-slate-400 lg:table-cell">Phone</TableHead>
                  <TableHead className="hidden text-slate-400 md:table-cell">Source</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="hidden text-slate-400 lg:table-cell">Created</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableCell colSpan={7} className="py-10 text-center text-slate-400">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : pageItems.length === 0 ? (
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableCell colSpan={7} className="py-10 text-center text-slate-400">
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((lead: any) => {
                    const badge = statusBadge(lead.status);
                    return (
                      <TableRow key={lead.id} className="border-white/8 hover:bg-white/5">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-[#21373a] text-sm font-semibold text-[#31d0be]">
                              {lead.name?.[0]?.toUpperCase() ?? "L"}
                            </div>
                            <div>
                              <p>{lead.name}</p>
                              <p className="text-xs text-slate-400 md:hidden">{lead.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-slate-400 md:table-cell">{lead.email}</TableCell>
                        <TableCell className="hidden text-slate-400 lg:table-cell">{lead.phone || "—"}</TableCell>
                        <TableCell className="hidden text-slate-400 md:table-cell">{sourceLabel(lead.source)}</TableCell>
                        <TableCell>
                          <Badge className={badge.className}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden text-slate-400 lg:table-cell">{format(new Date(lead.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button asChild variant="ghost" size="icon" className="text-slate-400 hover:bg-white/5 hover:text-white">
                              <Link to="/leads/$id" params={{ id: lead.id }}>
                                <Eye className="size-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/5 hover:text-white" onClick={() => setEditing({ ...lead })}>
                              <Pencil className="size-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/5 hover:text-[#fb7185]">
                                  <Trash2 className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-white/8 bg-[#18262a] text-slate-100">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-400">
                                    This will permanently remove {lead.name} and all related notes.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(lead.id)} className="bg-[#fb7185] text-white hover:bg-[#f43f5e]">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400">
            <p>
              Page {page} of {totalPages} · {filtered.length} leads
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="border-white/8 bg-[#18262a] text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit Lead</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label className="text-slate-400">Name</Label>
                <Input className="border-white/10 bg-white/5 text-slate-100" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label className="text-slate-400">Email</Label>
                <Input className="border-white/10 bg-white/5 text-slate-100" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div>
                <Label className="text-slate-400">Phone</Label>
                <Input className="border-white/10 bg-white/5 text-slate-100" value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-400">Source</Label>
                  <Select value={editing.source} onValueChange={(value) => setEditing({ ...editing, source: value })}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {sourceLabel(source)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-400">Status</Label>
                  <Select value={editing.status} onValueChange={(value) => setEditing({ ...editing, status: value })}>
                    <SelectTrigger className="border-white/10 bg-white/5 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusBadge(status).label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} className="border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#20c8b7] text-white hover:bg-[#17b2a4]">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
