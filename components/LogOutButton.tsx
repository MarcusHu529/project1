"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export const LogOutButton = () => {
  const router = useRouter();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <button className="px-8 py-3 bg-red-600 text-white rounded-full 
    hover:bg-red-700 transition-colors font-semibold text-lg" onClick={handleSignOut}>
      Log Out
    </button>
  );
};