import { AppearanceToggle } from "@/components/theme/AppearanceToggle";
import { Wordmark } from "@/components/ui/Wordmark";

export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
      <div className="border-b border-tx/5 bg-paper/80 backdrop-blur-xl py-2">
        <div className="mx-auto flex h-10 max-w-6xl items-center justify-between px-3 sm:px-8">
          <Wordmark />
          <AppearanceToggle />
        </div>
      </div>
    </header>
  );
}
