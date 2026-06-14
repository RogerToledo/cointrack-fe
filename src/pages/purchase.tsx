import Purchase from "@/components/purchase/Purchase";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PurchasePage() {
  return (
    <ProtectedRoute>
      <div>
        <Purchase />
      </div>
    </ProtectedRoute>
  );
}