import Layout from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "@/contexts/AuthContext";
import { FamilyProvider } from "@/contexts/FamilyContext";
import { ToastProvider } from "@/contexts/ToastContext";
import React from "react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-[var(--shadow-sm)]">
            <h1 className="text-xl font-bold text-danger mb-2">Algo deu errado</h1>
            <p className="text-sm text-muted mb-6">
              {this.state.error?.message || "Ocorreu um erro inesperado na interface."}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FamilyProvider>
          <ToastProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ToastProvider>
        </FamilyProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
