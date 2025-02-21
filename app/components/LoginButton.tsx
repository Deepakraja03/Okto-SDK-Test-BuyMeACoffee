"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

export function LoginButton() {
  const { data: session } = useSession(); // Get session data
  const router = useRouter();
  
  const handleLogin = () => {
    signIn("google", {  
      prompt: "select_account",
      callbackUrl: "/dashboard"
    });
  };

  return (
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center space-x-2"
      onClick={handleLogin}
    >
      <FaGoogle />
      <span>Sign in with Google</span>
    </button>
  );
}