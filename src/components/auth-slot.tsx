import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-9 animate-pulse rounded-full bg-sunken" />;
  }
  if (user) return <UserButton />;
  return (
    <Link
      to="/login"
      className="inline-flex h-11 min-h-11 items-center rounded-md px-3 text-sm font-medium text-ink hover:bg-sunken/70"
    >
      Sign in
    </Link>
  );
}
