import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export const useAuth = () => {
  const { data: user, isLoading: isAuthLoading } = trpc.auth.me.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      // Invalider la requête 'me' pour forcer la mise à jour de l'état
      trpc.auth.me.invalidate();
      toast.success("Logged out successfully!");
    },
    onError: (error) => {
      toast.error(`Logout failed: ${error.message}`);
    }
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthLoading,
    logout,
    isLoggingOut: logoutMutation.isLoading,
  };
};
