import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck, Sparkles, Eye, EyeOff, Rocket, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberEmail, setRememberEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!authLoading && user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) toast.error(error);
      else {
        toast.success("Welcome back");
        navigate({ to: "/dashboard" });
      }
    } else {
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error);
      else toast.success("Account created. Check your email to confirm, then sign in.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(248,221,197,0.7),_transparent_24%),linear-gradient(180deg,_#f7f1e8_0%,_#efe7dc_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1240px] overflow-hidden rounded-[2rem] border border-[#e5dccd] bg-[#fffdf9] shadow-[0_25px_80px_rgba(60,43,22,0.14)]">
        <section className="relative hidden w-[54%] flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,_#169f95_0%,_#21b5a8_40%,_#1f9e96_100%)] p-12 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_26%)]" />
          <div className="relative space-y-8">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/85">
              <Sparkles className="size-4" />
              Next-gen lead engine
            </div>
            <div className="max-w-lg space-y-6 pt-8">
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-white">
                Build a pipeline that closes faster.
              </h1>
              <p className="max-w-md text-lg leading-8 text-white/85">
                From first contact to conversion, Apex gives your team a focused command center for high-intent deals.
              </p>
            </div>
          </div>

          <div className="relative space-y-4">
            <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/75">Pipeline velocity</p>
              <div className="mt-2 text-4xl font-extrabold tracking-tight">+38% Faster</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/18 bg-white/10 px-5 py-4 text-sm font-semibold text-white/90">Auto insights</div>
              <div className="rounded-2xl border border-white/18 bg-white/10 px-5 py-4 text-sm font-semibold text-white/90">Smart status flow</div>
            </div>
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <Card className="w-full max-w-lg border-0 bg-transparent shadow-none">
            <div className="mx-auto flex max-w-md flex-col justify-center">
              <div className="mb-8 flex items-center gap-4 lg:mb-10">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-[#18a699] text-white shadow-[0_16px_36px_rgba(24,166,153,0.28)]">
                  <Zap className="size-6" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Welcome to Apex</h2>
                <p className="text-lg text-slate-500">Sign in and continue building your pipeline.</p>
              </div>

              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                      Full name
                    </Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required={mode === "signup"} placeholder="Jane Doe" className="h-14 rounded-2xl border-[#e4d8c6] bg-[#fffdf9] px-4 text-base shadow-[0_1px_0_rgba(255,255,255,0.8)]" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className="h-14 rounded-2xl border-[#e4d8c6] bg-[#fffdf9] px-4 text-base shadow-[0_1px_0_rgba(255,255,255,0.8)]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                    Password
                  </Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" className="h-14 rounded-2xl border-[#e4d8c6] bg-[#fffdf9] px-4 pr-14 text-base shadow-[0_1px_0_rgba(255,255,255,0.8)]" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl px-1 text-sm text-slate-600">
                  <Checkbox checked={rememberEmail} onCheckedChange={(value) => setRememberEmail(value === true)} />
                  <span>Remember this email</span>
                </div>

                <Button type="submit" disabled={busy} className="h-14 w-full rounded-2xl bg-[#18a699] text-base font-semibold text-white shadow-[0_18px_40px_rgba(24,166,153,0.28)] hover:bg-[#14998d]">
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  {mode === "signin" ? "Sign in securely" : "Create account"}
                </Button>

                <div className="flex items-center justify-between rounded-2xl border border-[#eadfcf] bg-[#fcfaf5] px-4 py-3 text-sm text-slate-600">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-[#18a699]" />
                    Encrypted auth powered by Supabase.
                  </span>
                  <Rocket className="size-4 text-[#f97316]" />
                </div>

                <button type="button" onClick={() => setMode((current) => (current === "signin" ? "signup" : "signin"))} className="block w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-900">
                  {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
                </button>
              </form>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
