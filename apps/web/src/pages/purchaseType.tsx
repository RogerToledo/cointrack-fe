import PurchaseType from "@/components/purchaseType/PurchaseType";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PurchaseTypePage() {
    return (
        <ProtectedRoute>
            <div>
                <PurchaseType />
            </div>
        </ProtectedRoute>
    )
}