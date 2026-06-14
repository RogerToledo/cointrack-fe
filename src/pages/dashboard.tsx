import Dashboard from "@/components/Dashboard"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <div>
                <Dashboard />
            </div>
        </ProtectedRoute>
    )
}