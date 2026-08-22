import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { 
    User, LogOut, ChevronDown, ChevronLeft, Users, 
    LayoutDashboard, ShoppingCart, CreditCard, Wallet,
    Tag, DollarSign, Receipt, Menu, UserCircle
} from 'lucide-react';

interface NavBarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

function NavBar({ sidebarOpen, setSidebarOpen }: NavBarProps) {
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isFamilyMenuOpen, setIsFamilyMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { families, selectedFamily, setSelectedFamily } = useFamily();
    const router = useRouter();
    const userMenuRef = useRef<HTMLDivElement>(null);
    const familyMenuRef = useRef<HTMLDivElement>(null);

    // Close menus on outside click
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

    const handleLogout = () => {
        logout();
    };

    const handleFamilyChange = (familyId: string) => {
        const family = families.find(f => f.id === familyId);
        if (family) {
            setSelectedFamily(family);
            setIsFamilyMenuOpen(false);
        }
    };

    const isActive = (path: string) => router.pathname === path;

    const navLinkClasses = (path: string) => 
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive(path) 
                ? 'bg-primary-light text-primary' 
                : 'text-muted hover:bg-secondary hover:text-foreground'
        }`;

    return (
        <>
            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col ${
                    sidebarOpen ? 'w-[260px]' : 'w-[72px]'
                }`}
            >
                {/* Logo / Brand */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-border">
                    {sidebarOpen && (
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-foreground">CoinTrack</span>
                        </Link>
                    )}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg text-muted hover:bg-secondary hover:text-foreground transition-colors"
                        aria-label={sidebarOpen ? "Recolher menu" : "Expandir menu"}
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
                    <Link href="/dashboard" className={navLinkClasses('/dashboard')}>
                        <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Dashboard</span>}
                    </Link>

                    <Link href="/purchase" className={navLinkClasses('/purchase')}>
                        <ShoppingCart className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Compras</span>}
                    </Link>

                    <Link href="/expense" className={navLinkClasses('/expense')}>
                        <Receipt className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Despesas</span>}
                    </Link>

                    <Link href="/earning" className={navLinkClasses('/earning')}>
                        <DollarSign className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Ganhos</span>}
                    </Link>

                    {/* Cadastro Section */}
                    {sidebarOpen && (
                        <div className="pt-4">
                            <button
                                onClick={() => setIsRegistrationOpen(!isRegistrationOpen)}
                                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-light hover:text-muted"
                            >
                                <span>Cadastros</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isRegistrationOpen ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    )}

                    {(isRegistrationOpen || !sidebarOpen) && (
                        <div className="space-y-1">
                            <Link href="/creditCard" className={navLinkClasses('/creditCard')}>
                                <CreditCard className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Cartão de Crédito</span>}
                            </Link>

                            <Link href="/purchaseType" className={navLinkClasses('/purchaseType')}>
                                <Tag className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Tipo de Compra</span>}
                            </Link>

                            <Link href="/paymentType" className={navLinkClasses('/paymentType')}>
                                <Wallet className="w-5 h-5 flex-shrink-0" />
                                {sidebarOpen && <span>Tipo de Pagamento</span>}
                            </Link>
                        </div>
                    )}

                    {sidebarOpen && (
                        <div className="pt-4">
                            <span className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-light">
                                Social
                            </span>
                        </div>
                    )}

                    <Link href="/family" className={navLinkClasses('/family')}>
                        <Users className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>Família</span>}
                    </Link>
                </nav>

                {/* Bottom section: Family selector + User */}
                <div className="border-t border-border p-3 space-y-2">
                    {/* Family Selector */}
                    {isAuthenticated && families.length > 0 && sidebarOpen && (
                        <div className="relative" ref={familyMenuRef}>
                            <button
                                onClick={() => setIsFamilyMenuOpen(!isFamilyMenuOpen)}
                                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted hover:bg-secondary hover:text-foreground transition-colors"
                            >
                                <Users className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate flex-1 text-left">
                                    {selectedFamily ? selectedFamily.name : 'Selecione família'}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFamilyMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isFamilyMenuOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-full bg-card rounded-lg border border-border shadow-lg overflow-hidden z-50">
                                    {families.map((family) => (
                                        <button
                                            key={family.id}
                                            onClick={() => handleFamilyChange(family.id)}
                                            className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                                                selectedFamily?.id === family.id 
                                                    ? 'bg-primary-light text-primary' 
                                                    : 'text-foreground hover:bg-secondary'
                                            }`}
                                        >
                                            <Users className="w-4 h-4" />
                                            <span className="truncate">{family.name}</span>
                                            {selectedFamily?.id === family.id && (
                                                <svg className="w-4 h-4 ml-auto text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* User Menu */}
                    {isAuthenticated ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <UserCircle className="w-5 h-5 text-primary" />
                                </div>
                                {sidebarOpen && (
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                                        <p className="text-xs text-muted truncate">{user?.email}</p>
                                    </div>
                                )}
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute bottom-full left-0 mb-1 w-full bg-card rounded-lg border border-border shadow-lg overflow-hidden z-50">
                                    <Link 
                                        href="/profile" 
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Meu Perfil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted hover:bg-secondary hover:text-foreground transition-colors">
                            <User className="w-5 h-5" />
                            {sidebarOpen && <span>Login</span>}
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
}

export default NavBar;
