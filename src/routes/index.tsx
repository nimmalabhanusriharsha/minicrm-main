import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? "/dashboard" : "/auth"} replace />;
}
