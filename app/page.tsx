"use client";
import React, { useEffect, useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
// import GetButton from "@/app/components/GetButton";
import { useOkto } from '@okto_web3/react-sdk';
import { useRouter } from "next/navigation"; // For redirecting
import NavbarHome from "./components/NavbarHome";

export default function Home() {
  const { data: session } = useSession();
  const oktoClient = useOkto();
  const router = useRouter();  // For redirection
  
  const idToken = useMemo(() => (session ? session.id_token : null), [session]);

  useEffect(() => {
    async function handleAuthenticate(): Promise<unknown> {
      if (!idToken) {
        return { result: false, error: "No google login" };
      }
      const user = await oktoClient.loginUsingOAuth({
        idToken: idToken,
        provider: 'google',
      });
      console.log("Authentication Success", user);
  
      router.push("/dashboard");
      return JSON.stringify(user);
    }

    if (idToken) {
      handleAuthenticate();
    }
  }, [idToken, oktoClient, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <NavbarHome />
            <div className="flex flex-col items-center justify-center p-12 space-y-6">

                {/* Buy Me a Coffee Section */}
                <div className="mt-12 p-8 bg-gray-800 rounded-lg shadow-md text-center max-w-2xl w-full">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Support the Developer
                    </h3>
                    <p className="text-gray-300 mb-6">
                        If you find this app helpful, consider donating some tokens to support the development and maintenance of this project. Every contribution counts!
                    </p>
                    <p className="text-gray-300 mb-6">
                        You can send your donations to the following wallet address:
                    </p>
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-gray-200 font-mono break-words">
                            0x38588E4C064e0DC4CBF4F06895eBD5a682B878F3
                        </p>
                    </div>
                    <p className="text-gray-300 mt-6">
                        Thank you for your support! ❤️
                    </p>
                </div>
                <p className="text-lg text-gray-300">
                    {session ? "You are logged in!" : "Please sign in to continue."}
                </p>
                {!session && (
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold flex items-center space-x-2"
                        onClick={() => signIn("google", { prompt: "select_account", callbackUrl: "/dashboard" })}
                    >
                        <span>Get Started</span>
                    </button>
                )}
            </div>
        </main>
  );
}
