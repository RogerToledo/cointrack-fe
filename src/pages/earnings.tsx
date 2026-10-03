import Earnings from "@/components/earning/Earnings"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function EarningsPage() {
    return (
        <ProtectedRoute>
            <div>
                <Earnings />
            </div>
        </ProtectedRoute>
    )
}
