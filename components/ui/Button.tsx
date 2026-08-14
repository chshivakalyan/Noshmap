import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-neutral-800"
      : "border border-neutral-300 bg-white text-black hover:bg-neutral-50";

  const classes = `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${styles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes}>
      {children}
    </button>
  );
}