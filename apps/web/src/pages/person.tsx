import Person from "@/components/person/Person"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function PersonPage() {
    return (
        <ProtectedRoute>
            <div>
                <Person />
            </div>
        </ProtectedRoute>
    )
}