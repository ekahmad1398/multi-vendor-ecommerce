"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { login, register, resendOtp, verifyEmail } from "@/services/auth";
import { useLocalAuth } from "@/components/auth/local-auth-provider";
import { SignIn, SignUp } from "@clerk/nextjs";

type FieldProps = { label: string; hint?: string; onValue?: (value: string) => void } & React.InputHTMLAttributes<HTMLInputElement>;
function Field({ label, hint, onValue, ...props }: FieldProps) {
  return <label className="block text-sm font-semibold">{label}<input className="input mt-2" required onChange={(e) => onValue?.(e.target.value)} {...props} />{hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}</label>;
}

function AuthShell({ eyebrow, title, note, children }: { eyebrow: string; title: string; note: string; children: React.ReactNode }) {
  return <div className="shell grid min-h-[76vh] place-items-center py-10"><section className="auth-card w-full max-w-md p-7 sm:p-9"><div className="flex items-center gap-3 text-amber-800"><span className="grid h-10 w-10 place-items-center rounded-full bg-amber-100"><Mail size={18} /></span><p className="eyebrow">{eyebrow}</p></div><h1 className="mt-6 font-serif text-5xl tracking-[-0.05em] text-slate-950">{title}</h1><p className="mt-3 leading-7 text-slate-600">{note}</p>{children}<p className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400"><CheckCircle2 size={14} /> Secure local account</p></section></div>;
}

function ClerkOption({ mode }: { mode: "sign-in" | "sign-up" }) {
  const label = mode === "sign-in" ? "Continue with Clerk" : "Create with Clerk";
  const href = mode === "sign-in" ? "/sign-in?method=clerk" : "/sign-up?method=clerk";
  return <div className="mt-6 border-t border-stone-200 pt-6"><p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">or use Clerk</p><Link href={href} className="btn w-full border border-slate-200 bg-white text-slate-800 hover:border-slate-400">{label}</Link></div>;
}

function ClerkScreen({ mode }: { mode: "sign-in" | "sign-up" }) {
  const other = mode === "sign-in" ? "/sign-in" : "/sign-up";
  return <div className="shell grid min-h-[76vh] place-items-center py-10"><div className="w-full max-w-md"><Link href={other} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-800">← Use local account instead</Link>{mode === "sign-in" ? <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" fallbackRedirectUrl="/" /> : <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" fallbackRedirectUrl="/" />}</div></div>;
}

function VerifyBox({ email, force = false }: { email: string; force?: boolean }) {
  const router = useRouter(); const [otp, setOtp] = useState(""); const [busy, setBusy] = useState(false);
  if (!force && !email) return null;
  const verify = async (event: FormEvent) => { event.preventDefault(); setBusy(true); try { const r = await verifyEmail(email, otp); toast.success(r.message); router.push("/sign-in"); } catch (e) { toast.error(e instanceof Error ? e.message : "Verification failed"); } finally { setBusy(false); } };
  const resend = async () => { try { const r = await resendOtp(email); toast.success(r.message); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not resend code"); } };
  return <form onSubmit={verify} className="mt-7 border-t border-stone-200 pt-6"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-800"><ShieldCheck size={18} /></span><p className="text-sm leading-6 text-slate-600">Have a verification code? Enter it here to activate your account.</p></div><label className="mt-4 block text-sm font-semibold">Verification code<input className="input mt-2 tracking-[0.35em]" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} required /></label><button disabled={busy || !email} className="btn btn-light mt-3 w-full">{busy ? "Verifying…" : "Verify email"}</button><button type="button" onClick={() => void resend()} disabled={!email} className="mt-3 w-full text-sm font-semibold text-amber-800">Resend code</button></form>;
}

export function SignInPanel() {
  const router = useRouter(); const { refresh } = useLocalAuth(); const [pending, setPending] = useState(false); const [email, setEmail] = useState("");
  const search = useSearchParams();
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget); try { const result = await login(String(data.get("email")), String(data.get("password"))); await refresh(); toast.success(result.message); router.push("/"); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to sign in"); } finally { setPending(false); } };
  if (search.get("method") === "clerk") return <ClerkScreen mode="sign-in" />;
  return <AuthShell eyebrow="Welcome back" title="Good to see you." note="Sign in to manage your orders, saved pieces, and bag."><form className="mt-7 space-y-4" onSubmit={submit}><Field label="Email address" name="email" type="email" value={email} onValue={setEmail} /><Field label="Password" name="password" type="password" minLength={8} /><button className="btn btn-dark w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <>Sign in <ArrowRight size={17} /></>}</button></form><ClerkOption mode="sign-in" /><p className="mt-6 text-center text-sm text-slate-500">New here? <Link className="font-semibold text-amber-800" href="/sign-up">Create an account</Link></p><VerifyBox email={email} /></AuthShell>;
}

export function SignUpPanel() {
  const [pending, setPending] = useState(false); const [email, setEmail] = useState(""); const [registered, setRegistered] = useState(false);
  const search = useSearchParams();
  const submit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setPending(true); const data = new FormData(event.currentTarget); const address = String(data.get("email")); try { const result = await register(String(data.get("name")), address, String(data.get("password"))); setEmail(address); setRegistered(true); toast.success(result.message); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create your account"); } finally { setPending(false); } };
  if (search.get("method") === "clerk") return <ClerkScreen mode="sign-up" />;
  if (registered) return <AuthShell eyebrow="One last step" title="Confirm your email." note="We sent a six-digit code to your inbox."><VerifyBox email={email} force /></AuthShell>;
  return <AuthShell eyebrow="Join the edit" title="Make it yours." note="Create one account for orders, favourites, and easy checkout."><form className="mt-7 space-y-4" onSubmit={submit}><Field label="Full name" name="name" autoComplete="name" minLength={2} /><Field label="Email address" name="email" type="email" value={email} onValue={setEmail} /><Field label="Password" name="password" type="password" minLength={8} hint="At least 8 characters" /><button className="btn btn-dark w-full" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" size={17} /> : <>Create account <ArrowRight size={17} /></>}</button></form><ClerkOption mode="sign-up" /><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-amber-800" href="/sign-in">Sign in</Link></p></AuthShell>;
}
