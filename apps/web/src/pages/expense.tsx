import Expense from "@/components/expense/Expense"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function ExpensePage() {
    return (
        <ProtectedRoute>
            <div>
                <Expense />
            </div>
        </ProtectedRoute>
    )
}