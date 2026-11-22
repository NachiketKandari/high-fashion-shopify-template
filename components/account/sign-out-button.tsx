export function SignOutButton() {
  return (
    <form action="/account/logout?return_to=/" method="post">
      <button
        className="type-body-sm flex min-h-9 cursor-pointer items-center text-left text-ink-strong hover:underline"
        type="submit"
      >
        Sign out
      </button>
    </form>
  );
}
