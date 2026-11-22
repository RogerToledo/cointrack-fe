import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import {
  User,
  LogOut,
  ChevronDown,
  ChevronLeft,
  Users,
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Wallet,
  Tag,
  DollarSign,
  Receipt,
  FileText,
  Menu,
  TrendingUp,
  Check,
  X,
  CircleDollarSign,
} from 'lucide-react';

interface NavBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const REGISTRATION_ROUTES = ['/creditCard', '/purchaseType', '/paymentType'];

function NavBar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}: NavBarProps) {
  const router = useRouter();
  const isOnRegistrationRoute = REGISTRATION_ROUTES.includes(router.pathname);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(isOnRegistrationRoute);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFamilyMenuOpen, setIsFamilyMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { families, selectedFamily, setSelectedFamily } = useFamily();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const familyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOnRegistrationRoute) {
      setIsRegistrationOpen(true);
    }
  }, [isOnRegistrationRoute]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname, setMobileMenuOpen]);

  // Close dropdown menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (familyMenuRef.current && !familyMenuRef.current.contains(event.target as Node)) {
        setIsFamilyMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFamilyChange = (familyId: string) => {
    const family = families.find((f) => f.id === familyId);
    if (family) {
      setSelectedFamily(family);
      setIsFamilyMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/earning') {
      return router.pathname === '/earning' || router.pathname === '/earnings';
    }
    return router.pathname === path;
  };

  const expanded = sidebarOpen || mobileMenuOpen;

  const navLinkClasses = (path: string) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive(path)
        ? 'bg-primary-light text-primary font-semibold'
        : 'text-muted hover:bg-secondary hover:text-foreground'
    }`;

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col
          ${mobileMenuOpen ? 'translate-x-0 w-[264px]' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'lg:w-[264px]' : 'lg:w-[76px]'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          {expanded && (
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-xs flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-lg font-bold tracking-tight text-foreground block leading-none">
                  CoinTrack
                </span>
                <span className="text-[11px] font-medium text-accent block mt-0.5">
                  Finanças Pessoais
                </span>
              </div>
            </Link>
          )}

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:inline-flex p-2 rounded-lg text-muted hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
            aria-label={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-lg text-muted hover:bg-secondary hover:text-foreground cursor-pointer transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          {expanded && (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
              Financeiro
            </p>
          )}

          <Link href="/dashboard" className={navLinkClasses('/dashboard')} title="Dashboard">
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Dashboard</span>}
          </Link>

          <Link href="/purchase" className={navLinkClasses('/purchase')} title="Compras">
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Compras</span>}
          </Link>

          <Link href="/expense" className={navLinkClasses('/expense')} title="Despesas">
            <Receipt className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Despesas</span>}
          </Link>

          <Link href="/earning" className={navLinkClasses('/earning')} title="Ganhos">
            <CircleDollarSign className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Ganhos</span>}
          </Link>

          <Link href="/investment" className={navLinkClasses('/investment')} title="Investimentos">
            <TrendingUp className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Investimentos</span>}
          </Link>

          <Link href="/invoice" className={navLinkClasses('/invoice')} title="Fatura">
            <FileText className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Fatura</span>}
          </Link>

          {/* Cadastros Section */}
          {expanded && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-light hover:text-foreground cursor-pointer transition-colors"
              >
                <span>Cadastros</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isRegistrationOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            </div>
          )}

          {(isRegistrationOpen || !expanded) && (
            <div className="space-y-1">
              <Link
                href="/creditCard"
                className={navLinkClasses('/creditCard')}
                title="Cartão de Crédito"
              >
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                {expanded && <span>Cartões de Crédito</span>}
              </Link>

              <Link
                href="/purchaseType"
                className={navLinkClasses('/purchaseType')}
                title="Tipo de Compra"
              >
                <Tag className="w-5 h-5 flex-shrink-0" />
                {expanded && <span>Tipos de Compra</span>}
              </Link>

              <Link
                href="/paymentType"
                className={navLinkClasses('/paymentType')}
                title="Tipo de Pagamento"
              >
                <Wallet className="w-5 h-5 flex-shrink-0" />
                {expanded && <span>Tipos de Pagamento</span>}
              </Link>
            </div>
          )}

          {/* Social Section */}
          {expanded && (
            <div className="pt-4 pb-1">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-light">
                Compartilhado
              </span>
            </div>
          )}

          <Link href="/family" className={navLinkClasses('/family')} title="Família">
            <Users className="w-5 h-5 flex-shrink-0" />
            {expanded && <span>Família</span>}
          </Link>
        </nav>

        {/* Bottom: Family Selector + User Menu */}
        <div className="border-t border-border p-3 space-y-2 bg-background/40">
          {isAuthenticated && families.length > 0 && expanded && (
            <div className="relative" ref={familyMenuRef}>
              <button
                type="button"
                onClick={() => setIsFamilyMenuOpen(!isFamilyMenuOpen)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:border-border-hover cursor-pointer transition-colors"
              >
                <Users className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="truncate flex-1 text-left">
                  {selectedFamily ? selectedFamily.name : 'Selecione família'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-muted transition-transform ${
                    isFamilyMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isFamilyMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1.5 w-full bg-card rounded-xl border border-border shadow-[var(--shadow-md)] overflow-hidden z-50">
                  {families.map((family) => (
                    <button
                      type="button"
                      key={family.id}
                      onClick={() => handleFamilyChange(family.id)}
                      className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium text-left cursor-pointer transition-colors ${
                        selectedFamily?.id === family.id
                          ? 'bg-primary-light text-primary'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate flex-1">{family.name}</span>
                      {selectedFamily?.id === family.id && (
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 w-full px-2.5 py-2 rounded-xl hover:bg-secondary cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-foreground text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold shadow-xs">
                  {userInitial}
                </div>
                {expanded && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 mb-1.5 w-full min-w-[200px] bg-card rounded-xl border border-border shadow-[var(--shadow-md)] overflow-hidden z-50">
                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4 text-accent" />
                    Meu Perfil
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger-light cursor-pointer transition-colors border-t border-border"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:bg-secondary hover:text-foreground transition-colors"
            >
              <User className="w-5 h-5" />
              {expanded && <span>Entrar</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

export default NavBar;
