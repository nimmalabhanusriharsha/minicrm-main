import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { BrainCircuit, ChartColumnBig, CircleGauge, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/insights")({ component: InsightsPage });

function InsightsPage() {
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const weekly = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day) => ({
    day: format(day, "EEE"),
    total: leads.filter((lead: any) => isSameDay(new Date(lead.created_at), day)).length,
  }));

  const byStatus = [
    { name: "New", value: leads.filter((lead: any) => lead.status === "new").length, color: "#2dd4bf" },
    { name: "Contacted", value: leads.filter((lead: any) => lead.status === "contacted").length, color: "#f59e0b" },
    { name: "Converted", value: leads.filter((lead: any) => lead.status === "converted").length, color: "#3b82f6" },
  ];

  const total = leads.length;

  return (
    <div className="space-y-6 text-foreground">
      <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Performance layer</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Insights</h1>
            <p className="mt-2 text-sm text-muted-foreground">A quick read on pipeline health and conversion shape.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground">
            <CircleGauge className="size-4 text-[#20c8b7]" />
            {total} total leads
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-5">
            <BrainCircuit className="size-5 text-[#20c8b7]" />
            <p className="mt-3 text-sm text-muted-foreground">Pipeline intelligence</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">Live</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-5">
            <ChartColumnBig className="size-5 text-[#f59e0b]" />
            <p className="mt-3 text-sm text-muted-foreground">Weekly trend</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">7 days</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-5">
            <Sparkles className="size-5 text-[#3b82f6]" />
            <p className="mt-3 text-sm text-muted-foreground">Conversion shape</p>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{byStatus[2]?.value ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-foreground">Lead Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-4 pb-6 md:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid stroke="rgba(148,163,184,0.25)" strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(148,163,184,0.25)" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(148,163,184,0.25)" }} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 16, color: "var(--card-foreground)" }} />
                <Bar dataKey="total" fill="#20c8b7" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Status Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] px-4 pb-6 md:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={6}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid rgba(148,163,184,0.25)", borderRadius: 16, color: "var(--card-foreground)" }} />
                <Legend wrapperStyle={{ color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}