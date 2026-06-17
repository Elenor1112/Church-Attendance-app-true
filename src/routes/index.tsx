import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChurchLogo } from "@/components/church-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Lock, ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";
import { saveSession, clearSession } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign In — Virgin Mary & St. Bishoy Church" },
      { name: "description", content: "Sign in to the church attendance app." },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (phoneVal: string, passwordVal: string) => {
    setError(null);
    setLoading(true);
    clearSession();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneVal, password: passwordVal }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Save session
      saveSession(data);

      // Navigate based on role
      const role = data.user.role;
      if (role === "member") {
        navigate({ to: "/member" });
      } else if (role === "admin") {
        navigate({ to: "/admin" });
      } else if (role === "super-admin") {
        navigate({ to: "/super" });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLogin(phone, password);
  };

  return (
    <div className="app-shell flex flex-col">
      <div className="absolute inset-x-0 top-0 h-72 primary-gradient opacity-95" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(120%_60%_at_50%_0%,oklch(0.85_0.12_85_/_0.35),transparent_70%)]" aria-hidden />

      <div className="relative z-10 flex items-center justify-end px-5 pt-5">
        <LanguageToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pt-6 text-center">
        <div className="rounded-3xl bg-card/95 p-3 shadow-elevated backdrop-blur">
          <ChurchLogo size={72} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-primary-foreground" dir="rtl" lang="ar">
          كنيسة العذراء والأنبا بيشوي
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/80">Virgin Mary & St. Bishoy Church</p>
      </div>

      <main className="relative z-10 mx-4 mt-8 flex-1 rounded-t-[2rem] bg-card px-6 pb-8 pt-7 shadow-card">
        <h2 className="text-lg font-bold text-foreground">{t("welcomeBack")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {lang === "ar" ? "سجل دخولك للمتابعة إلى حسابك" : "Sign in to continue to your account"}
        </p>

        {error && (
          <div className="mt-4 p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">
              {t("phone")}
            </Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 000 0000"
                className="h-12 rounded-xl ps-10"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
              {t("password")}
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-xl ps-10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl text-base font-semibold shadow-card primary-gradient"
          >
            {loading ? (lang === "ar" ? "جاري الدخول..." : "Signing In...") : t("signIn")}
            <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Button>
        </form>

        <Link
          to="/register"
          className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-border bg-secondary text-sm font-semibold text-secondary-foreground transition hover:border-primary/30 hover:bg-primary-soft"
        >
          {t("newMember")}
        </Link>
      </main>
    </div>
  );
}
