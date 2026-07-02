import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Clock3, CheckCircle2, ListTodo, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/tasks")({ component: TasksPage });

const tasks = [
  { label: "Review new leads", status: "high", done: true },
  { label: "Send follow-up sequence", status: "medium", done: false },
  { label: "Update pipeline notes", status: "low", done: false },
  { label: "Call warm prospects", status: "high", done: false },
];

function TasksPage() {
  return (
    <div className="space-y-6 text-foreground">
      <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Team focus</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">Tasks</h1>
            <p className="mt-2 text-sm text-muted-foreground">Keep the team moving on the right work each day.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background/60 px-4 py-2 text-sm text-muted-foreground">
            <Clock3 className="size-4 text-[#20c8b7]" />
            4 tasks queued
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Completed today</p>
            <p className="mt-2 text-4xl font-extrabold text-foreground">1</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Due soon</p>
            <p className="mt-2 text-4xl font-extrabold text-foreground">3</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Focus score</p>
            <p className="mt-2 text-4xl font-extrabold text-foreground">33%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ListTodo className="size-5 text-[#20c8b7]" /> Today&apos;s Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <label key={task.label} className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <Checkbox checked={task.done} readOnly />
                <span className={task.done ? "text-muted-foreground line-through" : "text-foreground"}>{task.label}</span>
              </div>
              <span className="rounded-full bg-muted/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{task.status}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Smart prompting</p>
            <p className="mt-1 text-lg font-semibold text-foreground">Use tasks to push leads from new to contacted every morning.</p>
          </div>
          <Button className="rounded-full bg-[#20c8b7] text-white hover:bg-[#17b2a4]">
            <Sparkles className="size-4" /> Create focus block
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}