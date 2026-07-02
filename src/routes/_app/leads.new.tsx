import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, SOURCES, sourceLabel, statusBadge } from "@/lib/lead-utils";
import { addLocalLead, readLocalLeads } from "@/lib/lead-storage";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_app/leads/new")({ component: NewLead });

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(30).optional(),
  source: z.enum(["website", "social_media", "referral", "other"]),
  status: z.enum(["new", "contacted", "converted"]),
  notes: z.string().max(2000).optional(),
});

function NewLead() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "website", status: "new", notes: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    if (loading) {
      toast.error("Please wait for your session to load.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const activeUser = sessionData.session?.user ?? user;

    if (!activeUser) {
      toast.error("Please sign in again and try saving the lead.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.from("leads").insert({
        owner_id: activeUser.id,
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        source: parsed.data.source,
        status: parsed.data.status,
        notes: parsed.data.notes || null,
      });

      if (error) {
        console.error("Lead insert failed", error);
        addLocalLead({
          owner_id: activeUser.id,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone || null,
          source: parsed.data.source,
          status: parsed.data.status,
          notes: parsed.data.notes || null,
        });
        qc.setQueryData(["leads"], (prev: any[] = []) => {
          const stored = readLocalLeads();
          return stored.filter((lead, index, arr) => arr.findIndex((item) => item.id === lead.id) === index).concat(
            prev.filter((lead) => !stored.some((item) => item.id === lead.id)),
          );
        });
        toast.error(error.message || "Could not save lead to Supabase. Saved locally instead.");
      } else {
        toast.success("Lead added");
      }
      navigate({ to: "/leads" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-slate-100">
      <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/leads" })} className="gap-2 rounded-full border border-white/8 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
        <ArrowLeft className="size-4" /> Back to leads
      </Button>
      <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <CardTitle className="text-xl text-white">Add New Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-slate-400">Name *</Label>
                <Input className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label className="text-slate-400">Email *</Label>
                <Input className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <Label className="text-slate-400">Phone</Label>
                <Input className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <Label className="text-slate-400">Source</Label>
                <Select value={form.source} onValueChange={(value) => setForm({ ...form, source: value })}>
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
              <div className="sm:col-span-2">
                <Label className="text-slate-400">Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
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
              <div className="sm:col-span-2">
                <Label className="text-slate-400">Initial notes</Label>
                <Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any context about this lead..." className="border-white/10 bg-white/5 text-slate-100 placeholder:text-slate-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/leads" })} className="rounded-full border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 hover:text-white">
                Cancel
              </Button>
              <Button type="submit" disabled={busy} className="rounded-full bg-[#20c8b7] text-white hover:bg-[#17b2a4]">
                {busy && <Loader2 className="size-4 animate-spin" />} Save lead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
