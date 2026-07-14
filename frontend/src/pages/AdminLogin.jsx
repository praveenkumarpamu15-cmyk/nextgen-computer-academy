import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { Lock, Mail, GraduationCap, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { token } = await authApi.login(email.trim().toLowerCase(), password);
      localStorage.setItem("ngca_token", token);
      toast.success("Welcome back!");
      nav("/admin/dashboard");
    } catch {
      toast.error("Invalid credentials");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-navy/10 blur-3xl -z-0" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center border border-gold/40 group-hover:bg-gold transition-colors">
            <GraduationCap className="w-5 h-5 text-gold group-hover:text-black" />
          </div>
          <div>
            <div className="font-display font-bold text-navy">NextGen Computer Academy</div>
            <div className="text-[10px] text-slate-500 tracking-widest">ADMIN PANEL</div>
          </div>
        </Link>

        <div className="glass rounded-3xl p-8">
          <h1 className="font-display text-3xl font-bold text-navy">Welcome back</h1>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to manage your website content.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@nextgen.local"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none bg-white"
                />
              </div>
            </div>
            <button
              data-testid="admin-login-submit"
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Sign In
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          Default seed: <span className="font-mono text-slate-700">admin@nextgen.local</span> / <span className="font-mono text-slate-700">NextGen@2025</span>
        </div>
      </div>
    </div>
  );
}
