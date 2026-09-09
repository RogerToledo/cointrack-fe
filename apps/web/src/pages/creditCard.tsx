import CreditCard from "@/components/creditCard/CreditCard"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function CreditCardPage() {
    return (
        <ProtectedRoute>
            <div>
                <CreditCard />
            </div>
        </ProtectedRoute>
    )
}