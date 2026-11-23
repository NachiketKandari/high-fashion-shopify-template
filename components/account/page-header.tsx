interface AccountPageHeaderProps {
  breadcrumb?: string;
  description?: string;
  title: string;
}

export function AccountPageHeader({ breadcrumb, description, title }: AccountPageHeaderProps) {
  return (
    <div className="grid gap-3">
      <p className="type-body-sm text-ink-muted">Account &amp; Wallet / {breadcrumb ?? title}</p>
      <h1 className="type-h2 text-ink-strong">{title}</h1>
      {description ? <p className="type-body-sm text-ink-muted">{description}</p> : null}
    </div>
  );
}
