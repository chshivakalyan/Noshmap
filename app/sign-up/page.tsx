import Link from "next/link";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.04em]"
        >
          nosh<span className="text-neutral-400">Map</span>
        </Link>

        <div className="mt-10">
          <h1 className="text-4xl font-black tracking-[-0.04em]">
            Create your account
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Start building your personal food diary.
          </p>
        </div>

        <div className="mt-8">
          <SignUpForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-black underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}