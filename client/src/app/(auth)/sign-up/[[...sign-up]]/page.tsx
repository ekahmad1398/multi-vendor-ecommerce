import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="shell grid min-h-[70vh] place-items-center py-12">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/" />
    </div>
  );
}
