import { PropsWithChildren, useState } from "react";
import { useRouter } from "next/router";
import { Menu, DollarSign } from "lucide-react";
import Link from "next/link";
import NavBar from "./NavBar";

const SHELL_HIDDEN_ROUTES = ["/", "/login", "/register", "/forgot-password"];

export default function Layout({ children }: PropsWithChildren) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hideShell = SHELL_HIDDEN_ROUTES.includes(router.pathname);

  if (hideShell) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top header */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-card/95 backdrop-blur-xs border-b border-border px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-xs">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            CoinTrack
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-foreground hover:bg-secondary cursor-pointer transition-colors"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      <NavBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main
        className={`transition-all duration-300 ease-in-out min-h-[calc(100vh-3.5rem)] lg:min-h-screen ${
          sidebarOpen ? "lg:ml-[264px]" : "lg:ml-[76px]"
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
