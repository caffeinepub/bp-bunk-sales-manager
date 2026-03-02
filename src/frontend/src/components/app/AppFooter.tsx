export function AppFooter() {
  const year = new Date().getFullYear();
  const href = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="no-print mt-auto py-4 text-center text-xs text-muted-foreground border-t border-border">
      © {year}. Built with ❤️ using{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-bp-blue hover:underline font-medium"
      >
        caffeine.ai
      </a>
    </footer>
  );
}
