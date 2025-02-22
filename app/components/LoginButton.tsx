"use client";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export function LoginButton() {
  
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