import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginGate } from "@/components/auth/login-gate";
import { Link } from "@/components/ui/link";
import { isCustomerLoggedIn } from "@/lib/auth/server";
import { shopConfig } from "@/lib/config";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Log in or register",
};

export default function LoginPage() {
  if (!shopConfig.auth.isEnabled) notFound();

  return (
    <>
      <Suspense fallback={null}>
        <SignedInRedirect />
      </Suspense>
      <div className="flex flex-1 flex-col desktop:min-h-[674px] desktop:flex-row">
        <section className="flex flex-col px-6 pt-14 pb-10 desktop:w-[592px] desktop:shrink-0 desktop:px-20 desktop:pt-[129px]">
          <div className="mx-auto grid w-full max-w-[431px] gap-10 desktop:mx-0">
            <h1 className="type-h4 text-ink-strong">LOG IN OR REGISTER</h1>
            <LoginGate />
            <p className="type-control text-right text-ink-muted">
              trouble with login?{" "}
              <Link
                className="focus-ring underline-offset-4 hover:underline"
                href="/pages/contact-us"
              >
                contact us
              </Link>
            </p>
          </div>
        </section>
        <div className="relative hidden flex-1 overflow-hidden desktop:block">
          <Image
            alt=""
            className="object-cover object-[62%_50%]"
            fill
            sizes="100vw"
            src="/reference/design-i/login/model-duo.jpg"
          />
        </div>
      </div>
    </>
  );
}

async function SignedInRedirect() {
  if (await isCustomerLoggedIn()) redirect("/account");
  return null;
}
