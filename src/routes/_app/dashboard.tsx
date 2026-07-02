import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Users, UserCheck, UserPlus, TrendingUp, Plus, SlidersHorizontal, Filter, ArrowUpRight, Phone, CheckCircle2, Sparkles } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const total = leads.length;
  const byStatus = (status: string) => leads.filter((lead: any) => lead.status === status).length;
  const newLeads = byStatus("new");
  const contacted = byStatus("contacted");
  const converted = byStatus("converted");
  const conversionRate = total ? Math.round((converted / total) * 100) : 0;
  const pipelinePressure = Math.max(0, newLeads - contacted);

  const leadGrowth = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() }).map((day) => ({
    day: format(day, "EEE"),
    leads: leads.filter((lead: any) => isSameDay(new Date(lead.created_at), day)).length,
  }));

  const pieData = [
    { name: "New", value: newLeads, color: "#2dd4bf" },
    { name: "Contacted", value: contacted, color: "#f59e0b" },
    { name: "Converted", value: converted, color: "#3b82f6" },
  ];

  const stats = [
    { label: "Total Leads", value: total, icon: Users, accent: "bg-[#183f43] text-[#31d0be]" },
    { label: "New Leads", value: newLeads, icon: UserPlus, accent: "bg-[#3c2f1b] text-[#f59e0b]" },
    { label: "Contacted", value: contacted, icon: Phone, accent: "bg-[#3b3320] text-[#f59e0b]" },
    { label: "Converted", value: converted, icon: CheckCircle2, accent: "bg-[#173d31] text-[#34d399]" },
  ];

  const focusItems = [
    { label: "Review new leads", checked: true },
    { label: "Send follow-ups", checked: false },
    { label: "Update call notes", checked: false },
  ];

  return (
    <div className="space-y-6 text-foreground">
      <Card className="overflow-hidden border-border bg-card shadow-[0_20px_70px_rgba(0,0,0,0.12)]">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Pipeline command center</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Live overview of momentum, conversion quality, and team focus.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="h-11 rounded-full bg-[#20c8b7] px-5 text-white hover:bg-[#17b2a4]">
              <Plus className="size-4" /> Add
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full border-border bg-background/60 px-5 text-foreground hover:bg-accent hover:text-accent-foreground">
              <Link to="/leads">
                <Filter className="size-4" /> Leads
              </Link>
            </Button>
            <Button variant="outline" className="h-11 rounded-full border-border bg-background/60 px-5 text-foreground hover:bg-accent hover:text-accent-foreground">
              <SlidersHorizontal className="size-4" /> Setup
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
                </div>
                <div className={`flex size-14 items-center justify-center rounded-full ${stat.accent}`}>
                  <Icon className="size-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-1">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Strength</p>
                <p className="mt-2 text-4xl font-extrabold text-foreground">{conversionRate}%</p>
              </div>
              <ArrowUpRight className="size-4 text-[#20c8b7]" />
            </div>
            <Progress value={conversionRate} className="h-2 bg-muted/70 [&>div]:bg-[#20c8b7]" />
            <p className="text-sm text-muted-foreground">Converted {converted} out of {total} total leads.</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-1">
          <CardContent className="space-y-4 p-5 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today Focus</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">33% Done</p>
              </div>
              <Sparkles className="size-4 text-[#f59e0b]" />
            </div>
            <div className="space-y-3">
              {focusItems.map((item) => (
                <label key={item.label} className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox checked={item.checked} readOnly />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-1">
          <CardContent className="space-y-4 p-5 md:p-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pipeline Pressure</p>
              <p className="mt-2 text-sm text-muted-foreground">Leads needing movement from &quot;new&quot; to &quot;contacted&quot;.</p>
            </div>
            <p className="text-4xl font-extrabold tracking-tight text-foreground">{pipelinePressure}</p>
            <p className="text-sm text-muted-foreground">Tip: Keep this under 40% of total for better velocity.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Lead Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[290px] px-4 pb-6 md:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadGrowth}>
                <CartesianGrid stroke="rgba(148,163,184,0.25)" strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(148,163,184,0.25)" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={{ stroke: "rgba(148,163,184,0.25)" }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid rgba(148,163,184,0.25)",
                    borderRadius: 16,
                    color: "var(--card-foreground)",
                  }}
                  labelStyle={{ color: "var(--card-foreground)" }}
                />
                <Line type="monotone" dataKey="leads" stroke="#20c8b7" strokeWidth={3} dot={{ r: 4, fill: "#20c8b7" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)] xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[290px] px-4 pb-6 md:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={108} paddingAngle={6}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid rgba(148,163,184,0.25)",
                    borderRadius: 16,
                    color: "var(--card-foreground)",
                  }}
                />
                <Legend wrapperStyle={{ color: "#64748b" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
