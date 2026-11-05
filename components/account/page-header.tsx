export function AccountPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className="type-display">{title}</h1>
      {description && (
        <p className="mt-1 type-body-sm leading-6 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
