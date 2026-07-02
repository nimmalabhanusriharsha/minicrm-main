import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusBadge, sourceLabel, STATUSES } from "@/lib/lead-utils";
import { format } from "date-fns";
import { ArrowLeft, Mail, Phone, Globe, Send, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/leads/$id")({ component: LeadDetails });

function LeadDetails() {
  const { id } = useParams({ from: "/_app/leads/$id" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [note, setNote] = useState("");

  const { data: lead } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["lead-notes", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("leads").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    }
  };

  const addNote = async () => {
    if (!note.trim() || !user) return;
    const { error } = await supabase.from("lead_notes").insert({ lead_id: id, author_id: user.id, message: note.trim() });
    if (error) toast.error(error.message);
    else {
      setNote("");
      qc.invalidateQueries({ queryKey: ["lead-notes", id] });
      toast.success("Note added");
    }
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase.from("lead_notes").delete().eq("id", noteId);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["lead-notes", id] });
  };

  if (!lead) return <p className="text-muted-foreground">Loading lead…</p>;
  const b = statusBadge(lead.status);

  return (
    <div className="space-y-6 text-slate-100">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/leads" })} className="gap-2 rounded-full border border-white/8 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
        <ArrowLeft className="size-4" /> Back to leads
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)] lg:col-span-1">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#21373a] text-xl font-semibold text-[#31d0be] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
                {lead.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{lead.name}</h2>
                <Badge className={b.className}>{b.label}</Badge>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-slate-500" /> {lead.email}
              </div>
              {lead.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-4 text-slate-500" /> {lead.phone}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Globe className="size-4 text-slate-500" /> {sourceLabel(lead.source)}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Status</p>
              <Select value={lead.status} onValueChange={updateStatus}>
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

            {lead.notes && (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Initial notes</p>
                <p className="rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-slate-300">{lead.notes}</p>
              </div>
            )}

            <p className="text-xs text-slate-500">Created {format(new Date(lead.created_at), "PPP")}</p>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="size-5 text-[#20c8b7]" /> Follow-up Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a follow-up note..."
                rows={2}
                className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500"
              />
              <Button onClick={addNote} disabled={!note.trim()} className="self-end rounded-full bg-[#20c8b7] text-white hover:bg-[#17b2a4]">
                <Send className="size-4" />
              </Button>
            </div>

            {notes.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No follow-up notes yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((n: any) => (
                  <div key={n.id} className="group relative rounded-2xl border border-white/8 bg-white/5 p-4">
                    <p className="text-sm text-slate-100">{n.message}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-500">{format(new Date(n.created_at), "PPp")}</p>
                      {n.author_id === user?.id && (
                        <Button variant="ghost" size="icon" className="opacity-0 text-slate-400 hover:bg-white/5 hover:text-[#fb7185] group-hover:opacity-100" onClick={() => deleteNote(n.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
