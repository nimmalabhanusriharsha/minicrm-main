import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      setFullName(data?.full_name ?? "");
      setEmail(data?.email ?? user.email ?? "");
    });
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
    setSavingProfile(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPassword(""); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-slate-100">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Workspace control</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="mt-2 text-slate-400">Manage your admin profile and security.</p>
      </div>

      <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <CardTitle className="text-white">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <Label className="text-slate-400">Full name</Label>
              <Input className="border-white/10 bg-white/5 text-slate-100" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label className="text-slate-400">Email</Label>
              <Input className="border-white/10 bg-white/5 text-slate-400" value={email} disabled />
            </div>
            <Button type="submit" disabled={savingProfile} className="rounded-full bg-[#20c8b7] text-white hover:bg-[#17b2a4]">
              {savingProfile && <Loader2 className="size-4 animate-spin" />} Save profile
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-[#18262a] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <CardTitle className="text-white">Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <Label className="text-slate-400">New password</Label>
              <Input className="border-white/10 bg-white/5 text-slate-100" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
            </div>
            <Button type="submit" disabled={savingPassword || !newPassword} className="rounded-full bg-[#20c8b7] text-white hover:bg-[#17b2a4]">
              {savingPassword && <Loader2 className="size-4 animate-spin" />} Update password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
