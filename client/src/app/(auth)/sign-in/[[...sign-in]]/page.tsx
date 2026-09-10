import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="shell grid min-h-[70vh] place-items-center py-12">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" />
    </div>
  );
}
