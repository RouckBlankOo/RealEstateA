import { useAuth } from "../contexts/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // You could show a loading screen here
  }

  if (isAuthenticated) {
    return <Redirect href="../(tabs)/Explore" />;
  }

  return <Redirect href="/onboarding/HomePage" />;
}
