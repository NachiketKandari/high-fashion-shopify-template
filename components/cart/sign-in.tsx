import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";

export async function CartSignIn() {
  if (await isCustomerLoggedIn()) return null;
  return (
    <div className="grid gap-3">
      <p className="type-body-sm text-ink">Enjoy a faster shopping experience</p>
      <Link
        className="type-control focus-ring w-fit underline underline-offset-4"
        href="/account/login"
      >
        SIGN IN
      </Link>
    </div>
  );
}
