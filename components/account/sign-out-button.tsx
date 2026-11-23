import { cn } from "cn";

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form action="/account/logout?return_to=/" method="post">
      <button
        className={cn(
          "type-body-sm flex min-h-9 cursor-pointer items-center text-left text-ink-strong hover:underline",
          className,
        )}
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
