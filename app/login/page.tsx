import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
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
            Welcome back
          </h1>

          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Continue your food journey.
          </p>
        </div>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-black underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}