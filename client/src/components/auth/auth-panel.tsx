"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, LoaderCircle, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { SignIn, SignUp, useClerk } from "@clerk/nextjs";
import { forgotPassword, login, register, resendOtp, resetPassword, verifyEmail } from "@/services/auth";
import { useLocalAuth } from "@/components/auth/local-auth-provider";

type FieldProps = { label: string; hint?: string; onValue?: (value: string) => void } & React.InputHTMLAttributes<HTMLInputElement>;
function Field({ label, hint, onValue, ...props }: FieldProps) {
  return <label className="block text-sm font-semibold">{label}<input className="input mt-2" required onChange={(event) => onValue?.(event.target.value)} {...props} />{hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}</label>;
}

function AuthShell({ eyebrow, title, note, children }: { eyebrow: string; title: string; note: string; children: React.ReactNode }) {
  return <div className="shell grid min-h-[78vh] items-center gap-8 py-10 lg:grid-cols-[.85fr_1fr] lg:py-16"><aside className="hidden rounded-[2rem] bg-slate-950 p-10 text-white lg:block"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#2dd4bf] text-slate-950"><Sparkles size={22} /></span><p className="mt-10 text-sm font-bold uppercase tracking-[.18em] text-[#2dd4bf]">Morrow member</p><h2 className="mt-4 max-w-sm font-serif text-5xl leading-none tracking-[-.055em]">One account.<br />Every good find.</h2><p className="mt-6 max-w-sm leading-7 text-slate-300">Use a Morrow password or a Clerk account. Both create the same secure store session.</p><div className="mt-12 flex items-center gap-3 text-sm text-slate-300"><ShieldCheck className="text-[#2dd4bf]" size={19} /> Your account and checkout stay protected.</div></aside><section className="auth-card w-full max-w-md justify-self-center p-7 sm:p-9"><div className="flex items-center gap-3 text-violet-700"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100"><Mail size={18} /></span><p className="eyebrow">{eyebrow}</p></div><h1 className="mt-6 font-serif text-5xl tracking-[-0.05em] text-slate-950">{title}</h1><p className="mt-3 leading-7 text-slate-600">{note}</p>{children}<p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400"><CheckCircle2 size={14} /> Secure store session</p></section></div>;
}

function ClerkOption({ mode }: { mode: "sign-in" | "sign-up" }) {
  const label = mode === "sign-in" ? "Continue with Clerk" : "Create with Clerk";
  const href = mode === "sign-in" ? "/sign-in?method=clerk" : "/sign-up?method=clerk";
  return <div className="mt-6 border-t border-slate-200 pt-6"><p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">or continue another way</p><Link href={href} className="btn btn-light w-full"><KeyRound size={16} /> {label}</Link></div>;
}

function ClerkScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const other = mode === "sign-in" ? "/sign-in" : "/sign-up";
  const appearance = { variables: { colorPrimary: "#4f46e5", colorText: "#0b1220", colorBackground: "#ffffff", borderRadius: "0.9rem" } };
  return <div className="shell grid min-h-[78vh] place-items-center py-10"><div className="w-full max-w-md"><Link href={other} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700"><ArrowLeft size={16} /> Use local Morrow account</Link><div className="auth-card p-2">{mode === "sign-in" ? <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/clerk-callback" appearance={appearance} /> : <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/clerk-callback" appearance={appearance} />}</div></div></div>;
}

function VerifyBox({ email, force = false }: { email: string; force?: boolean }) {
  const router = useRouter(); const [otp, setOtp] = useState(""); const [busy, setBusy] = useState(false);
  if (!force && !email) return null;
  const verify = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { const result = await verifyEmail(email, otp); toast.success(result.message); router.push("/sign-in"); } catch (error) { toast.error(error instanceof Error ? error.message : "Verification failed"); } finally { setBusy(false); } };
  const resend = async () => { try { const result = await resendOtp(email); toast.success(result.message); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not resend code"); } };
  return <form onSubmit={verify} className="mt-7 border-t border-slate-200 pt-6"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-700"><ShieldCheck size={18} /></span><p className="text-sm leading-6 text-slate-600">Enter the six-digit code we sent to activate your local account.</p></div><label className="mt-4 block text-sm font-semibold">Verification code<input className="input mt-2 tracking-[0.35em]" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} required /></label><button disabled={busy || !email} className="btn btn-light mt-3 w-full">{busy ? "Verifying..." : "Verify email"}</button><button type="button" onClick={() => void resend()} disabled={!email} className="mt-3 w-full text-sm font-semibold text-violet-700">Resend code</button></form>;
}

export function SignInPanel() {
  const router = useRouter(); const { setSession } = useLocalAuth(); const { signOut: clerkSignOut } = useClerk(); const [pending, setPending] = useState(false); const [email, setEmail] = useState(""); const search = useSearchParams();
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget); const next = search.get("next"); const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"; try { await clerkSignOut(); const result = await login(String(data.get("email")), String(data.get("password"))); setSession(result.user); toast.success(result.message); router.replace(destination); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to sign in"); } finally { setPending(false); } };
  if (search.get("method") === "clerk") return <ClerkScreen mode="sign-in" />;
  return <AuthShell eyebrow="Welcome back" title="Good to see you." note="Sign in with the Morrow account you already know."><form className="mt-7 space-y-4" onSubmit={submit}><Field label="Email address" name="email" type="email" value={email} onValue={setEmail} /><Field label="Password" name="password" type="password" minLength={8} /><div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-semibold text-violet-700 hover:text-violet-900">Forgot your password?</Link></div><button className="btn btn-dark w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <>Sign in <ArrowRight size={17} /></>}</button></form><ClerkOption mode="sign-in" /><p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-semibold text-violet-700" href="/sign-up">Create an account</Link></p><VerifyBox email={email} /></AuthShell>;
}

export function ForgotPasswordPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requested, setRequested] = useState(false);
  const [pending, setPending] = useState(false);

  const requestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      const result = await forgotPassword(email);
      toast.success(result.message);
      setRequested(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send a reset code");
    } finally {
      setPending(false);
    }
  };

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPending(true);
    try {
      const result = await resetPassword(email, otp, password);
      toast.success(result.message);
      router.push("/sign-in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reset your password");
    } finally {
      setPending(false);
    }
  };

  if (!requested) {
    return <AuthShell eyebrow="Password help" title="Reset your password." note="Enter your local Morrow account email and we will send a six-digit reset code."><form className="mt-7 space-y-4" onSubmit={requestCode}><Field label="Email address" name="email" type="email" value={email} onValue={setEmail} autoComplete="email" /><button className="btn btn-dark w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <>Send reset code <ArrowRight size={17} /></>}</button></form><p className="mt-6 text-center text-sm text-slate-500">Remembered it? <Link className="font-semibold text-violet-700" href="/sign-in">Back to sign in</Link></p></AuthShell>;
  }

  return <AuthShell eyebrow="Check your inbox" title="Set a new password." note={`Enter the code sent to ${email} and choose a new password.`}><form className="mt-7 space-y-4" onSubmit={submitReset}><label className="block text-sm font-semibold">Reset code<input className="input mt-2 tracking-[0.35em]" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value)} required /></label><label className="block text-sm font-semibold">New password<input className="input mt-2" type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /></label><label className="block text-sm font-semibold">Confirm new password<input className="input mt-2" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /></label><button className="btn btn-dark w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <>Reset password <ArrowRight size={17} /></>}</button></form><button type="button" disabled={pending} onClick={() => setRequested(false)} className="mt-5 w-full text-sm font-semibold text-violet-700">Use a different email</button></AuthShell>;
}

export function SignUpPanel() {
  const [pending, setPending] = useState(false); const [email, setEmail] = useState(""); const [registered, setRegistered] = useState(false); const search = useSearchParams();
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget); const address = String(data.get("email")); try { const result = await register(String(data.get("name")), address, String(data.get("password"))); setEmail(address); setRegistered(true); toast.success(result.message); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create your account"); } finally { setPending(false); } };
  if (search.get("method") === "clerk") return <ClerkScreen mode="sign-up" />;
  if (registered) return <AuthShell eyebrow="One last step" title="Confirm your email." note="We sent a six-digit code to your inbox."><VerifyBox email={email} force /></AuthShell>;
  return <AuthShell eyebrow="Join Morrow" title="Make it yours." note="Create a local account for orders, favourites, and easy checkout."><form className="mt-7 space-y-4" onSubmit={submit}><Field label="Full name" name="name" autoComplete="name" minLength={2} /><Field label="Email address" name="email" type="email" value={email} onValue={setEmail} /><Field label="Password" name="password" type="password" minLength={8} hint="At least 8 characters" /><button className="btn btn-dark w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <>Create account <ArrowRight size={17} /></>}</button></form><ClerkOption mode="sign-up" /><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-violet-700" href="/sign-in">Sign in</Link></p></AuthShell>;
}
