import { PropsWithChildren, useState } from "react"
import { useRouter } from "next/router"
import NavBar from "./NavBar"

export default function Layout({children}: PropsWithChildren) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    // Páginas públicas onde não mostrar a NavBar
    const publicPages = ['/login', '/register', '/forgot-password'];
    const isPublicPage = publicPages.includes(router.pathname);
    
    if (isPublicPage) {
        return <main>{children}</main>;
    }

    return (
        <div className="min-h-screen bg-background">
            <NavBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main 
                className={`transition-all duration-300 ease-in-out min-h-screen ${
                    sidebarOpen ? 'ml-[260px]' : 'ml-[72px]'
                }`}
            >
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
