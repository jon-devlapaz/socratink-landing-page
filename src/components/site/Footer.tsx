import { Wordmark } from "@/components/ui/Wordmark";
import { footer, site } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-tx/6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-[0.75rem] text-tx-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Wordmark />
        <p>
          © {site.name} {site.year}. All rights reserved.
        </p>
        <ul className="flex items-center gap-4">
          {footer.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="transition-colors hover:text-tx">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
