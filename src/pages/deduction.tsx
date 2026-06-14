import Deduction from "@/components/deduction/Deduction"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function DeductionPage() {
    return (
        <ProtectedRoute>
            <div>
                <Deduction />
            </div>
        </ProtectedRoute>
    )
}