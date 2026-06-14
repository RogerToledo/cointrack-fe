import PaymentType from "@/components/paymentType/PaymentType";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PaymentTypePage() {
    return (
        <ProtectedRoute>
            <div>
                <PaymentType />
            </div>
        </ProtectedRoute>
    )
}