import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChurchLogo } from "@/components/church-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { useLang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register — Virgin Mary & St. Bishoy Church" },
      { name: "description", content: "Create your member account." },
    ],
  }),
  component: Register,
});

function Register() {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [spousePhone, setSpousePhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          birthday,
          spousePhone,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Success, route to login page
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex flex-col pb-10">
      <header className="flex items-center justify-between px-5 pt-5">
        <Link
          to="/"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
        <LanguageToggle subtle />
      </header>

      <div className="flex flex-col items-center px-6 pt-4 text-center">
        <ChurchLogo size={56} />
        <h1 className="mt-3 text-xl font-bold text-foreground" dir="rtl" lang="ar">
          كنيسة العذراء والأنبا بيشوي
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">{t("registration")}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 px-5">
        <div className="space-y-4 rounded-3xl bg-card p-5 shadow-card">
          <p className="text-sm font-semibold text-foreground">
            {lang === "ar" ? "املأ بياناتك للانضمام" : "Fill in your details to join"}
          </p>

          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="first" className="text-xs font-semibold text-muted-foreground">
                {t("firstName")}
              </Label>
              <Input
                id="first"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={lang === "ar" ? "مينا" : "Mina"}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last" className="text-xs font-semibold text-muted-foreground">
                {t("lastName")}
              </Label>
              <Input
                id="last"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={lang === "ar" ? "عادل" : "Adel"}
                className="h-11 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">
              {t("phone")}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 100 000 0000"
              className="h-11 rounded-xl"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bday" className="text-xs font-semibold text-muted-foreground">
              {t("birthday")}
            </Label>
            <Input
              id="bday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="spouse" className="text-xs font-semibold text-muted-foreground">
              {t("spousePhone")}
            </Label>
            <Input
              id="spouse"
              type="tel"
              value={spousePhone}
              onChange={(e) => setSpousePhone(e.target.value)}
              placeholder="+20 …"
              className="h-11 rounded-xl"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-11 rounded-xl"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pass" className="text-xs font-semibold text-muted-foreground">
              {t("password")}
            </Label>
            <Input
              id="pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 rounded-xl"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-5 h-12 w-full rounded-xl text-base font-semibold shadow-card primary-gradient"
        >
          {loading ? (lang === "ar" ? "جاري التسجيل..." : "Registering...") : t("register")}
        </Button>

        <Link
          to="/"
          className="mt-4 flex h-11 w-full items-center justify-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {t("backToSignIn")}
        </Link>
      </form>
    </div>
  );
}
