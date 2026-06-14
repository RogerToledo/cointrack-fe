import { PropsWithChildren } from "react"
import { useRouter } from "next/router"
import NavBar from "./NavBar"

export default function Layout({children}: PropsWithChildren) {
    const router = useRouter();
    
    // Páginas públicas onde não mostrar a NavBar
    const publicPages = ['/login', '/register', '/forgot-password'];
    const isPublicPage = publicPages.includes(router.pathname);
    
    return (
        <>
            {!isPublicPage && <NavBar />}
            <main>
                {children}
            </main>
        </>
    )
} 