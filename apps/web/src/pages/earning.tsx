import Earning from "@/components/earning/Earning"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function EarningPage() {
    return (
        <ProtectedRoute>
            <div>
                <Earning />
            </div>
        </ProtectedRoute>
    )
}