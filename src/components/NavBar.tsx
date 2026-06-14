import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { User, LogOut, ChevronDown, Users } from 'lucide-react';

function NavBar() {
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isFamilyMenuOpen, setIsFamilyMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { families, selectedFamily, setSelectedFamily } = useFamily();

    const toggleRegistration = () => {
        setIsRegistrationOpen(!isRegistrationOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const toggleFamilyMenu = () => {
        setIsFamilyMenuOpen(!isFamilyMenuOpen);
    };

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

    return (
        <nav className="bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <div className="flex">
                    <div>
                        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
                            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo"/>
                            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
                        </a>
                    </div>
                    <div>
                        <Link
                            href="/purchase"
                            className="className= ml-12 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            <svg className="w-3.5 h-3.5 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 21">
                                <path d="M15 12a1 1 0 0 0 .962-.726l2-7A1 1 0 0 0 17 3H3.77L3.175.745A1 1 0 0 0 2.208 0H1a1 1 0 0 0 0 2h.438l.6 2.255v.019l2 7 .746 2.986A3 3 0 1 0 9 17a2.966 2.966 0 0 0-.184-1h2.368c-.118.32-.18.659-.184 1a3 3 0 1 0 3-3H6.78l-.5-2H15Z"/>
                            </svg>
                            Compras
                        </Link>
                    </div>
                </div>
                
                <div className="hidden w-full md:block md:w-auto" id="navbar-dropdown">
                    <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                        <li>
                            <Link href="/dashboard" className="block py-2 px-3 text-white bg-blue-700 rounded-sm md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500 dark:bg-blue-600 md:dark:bg-transparent" aria-current="page">Home</Link>
                        </li>
                        <li>
                            <button
                                id="dropdownNavbarLink"
                                className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                                onClick={toggleRegistration}
                            >
                                Cadastro
                                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                                </svg>
                            </button>
                            {/* Dropdown menu */}
                                <div
                                    id="dropdownNavbar"
                                    className={`${isRegistrationOpen ? 'block' : 'hidden'} absolute z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600`}
                                >
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-400" aria-labelledby="dropdownLargeButton">
                                        <li>
                                            <Link 
                                                href="/creditCard" 
                                                onClick={toggleRegistration}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                    Cartão de Crédito
                                                </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                href="/purchaseType" 
                                                onClick={toggleRegistration}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                    Tipo de Compra
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                href="/paymentType" 
                                                onClick={toggleRegistration}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                    Tipo de Pagamento
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                href="/earning" 
                                                onClick={toggleRegistration}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                    Ganho
                                            </Link>
                                        </li>
                                        <li>
                                            <Link 
                                                href="/expense" 
                                                onClick={toggleRegistration}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                    Despesa
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                        </li>
                        <li>
                            <a href="#" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Relatórios</a>
                        </li>
                        <li>
                            <Link href="/family" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">Família</Link>
                        </li>
                        
                        {/* Dropdown de Famílias */}
                        {isAuthenticated && families.length > 0 && (
                            <li className="relative">
                                <button
                                    id="familyMenuButton"
                                    className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                                    onClick={toggleFamilyMenu}
                                >
                                    <Users className="w-4 h-4 me-2" />
                                    {selectedFamily ? selectedFamily.name : 'Selecione'}
                                    <ChevronDown className="w-3 h-3 ms-2" />
                                </button>
                                {/* Family Dropdown menu */}
                                <div
                                    id="familyDropdown"
                                    className={`${isFamilyMenuOpen ? 'block' : 'hidden'} absolute right-0 z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-48 dark:bg-gray-700 dark:divide-gray-600`}
                                >
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                                        {families.map((family) => (
                                            <li key={family.id}>
                                                <button
                                                    onClick={() => handleFamilyChange(family.id)}
                                                    className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white ${
                                                        selectedFamily?.id === family.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : ''
                                                    }`}
                                                >
                                                    <Users className="w-4 h-4 me-2" />
                                                    {family.name}
                                                    {selectedFamily?.id === family.id && (
                                                        <svg className="w-4 h-4 ms-auto" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        )}
                        
                        {isAuthenticated ? (
                            <li className="relative">
                                <button
                                    id="userMenuButton"
                                    className="flex items-center justify-between w-full py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto dark:text-white md:dark:hover:text-blue-500 dark:focus:text-white dark:border-gray-700 dark:hover:bg-gray-700 md:dark:hover:bg-transparent"
                                    onClick={toggleUserMenu}
                                >
                                    <User className="w-4 h-4 me-2" />
                                    {user?.name}
                                    <ChevronDown className="w-3 h-3 ms-2" />
                                </button>
                                {/* User Dropdown menu */}
                                <div
                                    id="userDropdown"
                                    className={`${isUserMenuOpen ? 'block' : 'hidden'} absolute right-0 z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600`}
                                >
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-400">
                                        <li>
                                            <Link 
                                                href="/profile" 
                                                onClick={toggleUserMenu}
                                                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                <User className="w-4 h-4 me-2" />
                                                Meu Perfil
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                                <LogOut className="w-4 h-4 me-2" />
                                                Sair
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        ) : (
                            <li>
                                <Link href="/login" className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                                    Login
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;