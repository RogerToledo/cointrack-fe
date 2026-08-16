import Invoice from "@/components/invoice/Invoice"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function InvoicePage() {
    return (
        <ProtectedRoute>
            <Invoice />
        </ProtectedRoute>
    )
}
