import Investment from "@/components/investment/Investment";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function InvestmentPage() {
  return (
    <ProtectedRoute>
      <div>
        <Investment />
      </div>
    </ProtectedRoute>
  );
}
