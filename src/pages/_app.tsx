import Layout from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";

export default function App({ Component, pageProps }: AppProps) {

  return (
    <AuthProvider>
      <FamilyProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </FamilyProvider>
    </AuthProvider>
  );
}
