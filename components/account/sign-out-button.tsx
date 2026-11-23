import { cn } from "cn";

interface SignOutButtonProps {
  className?: string;
  variant?: "menu" | "sidebar";
}

export function SignOutButton({ className, variant = "sidebar" }: SignOutButtonProps) {
  return (
    <form action="/account/logout?return_to=/" method="post">
      <button
        className={cn(
          "type-body-sm focus-ring flex min-h-9 w-full cursor-pointer items-center text-left text-ink transition-colors hover:bg-surface",
          variant === "sidebar" ? "px-3" : "px-4",
          className,
        )}
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
