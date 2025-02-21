"use client";
import { useSession, signOut } from "next-auth/react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { useEffect, useMemo, useState } from "react";
import { useOkto } from "@okto_web3/react-sdk";
import { useRouter } from "next/navigation";

const Dashboard = () => {
    const { data: session, status } = useSession();
    const oktoClient = useOkto();
    const router = useRouter();

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticatedWithOkto, setIsAuthenticatedWithOkto] = useState(false);
    const [authenticationFailed, setAuthenticationFailed] = useState(false);
    const idToken = useMemo(() => (session ? session.id_token : null), [session]);

  // Authenticate with Okto using the Google id_token
  async function handleAuthenticate(): Promise<any> {
    if (!idToken) {
      setError("No Google login available.");
      setAuthenticationFailed(true); // Mark authentication failure
      return { result: false, error: "No google login" };
    }

    try {
      if (isAuthenticatedWithOkto) return;

      setIsAuthenticating(true);
      const user = await oktoClient.loginUsingOAuth({
        idToken: idToken,
        provider: "google",
      });
      console.log("Authentication Success", user);

      setIsAuthenticatedWithOkto(true);
      setIsAuthenticating(false);
      return JSON.stringify(user);
    } catch (err) {
      setError("Okto authentication failed.");
      setAuthenticationFailed(true); // Mark authentication failure
      setIsAuthenticating(false);
      console.error("Authentication Error:", err);
      return { result: false, error: "Okto authentication failed." };
    }
  }

  // Handle logout and redirect to the homepage
  async function handleLogout() {
    try {
      setIsAuthenticatedWithOkto(false);
      signOut();
      router.push('/'); // Redirect to homepage after logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  }

  // Authenticate with Okto once the idToken is available
  useEffect(() => {
    if (idToken && !isAuthenticatedWithOkto && !isAuthenticating && !authenticationFailed) {
      handleAuthenticate();  // Only attempt authentication once we have the idToken
    }
    
    // // If authentication failed, log out from Google and redirect to homepage
    // if (authenticationFailed) {
    //   handleLogout();
    // }
  }, [idToken, isAuthenticatedWithOkto, isAuthenticating, authenticationFailed]);

    if (status === "loading") {
        return <Spinner />;
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <p className="text-xl text-white">You are not logged in.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* User Details */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-white">User Details</h2>
                        <div className="mt-4 space-y-4">
                            {session.user?.image && (
                                <img
                                    src={session.user?.image ?? ""}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full mx-auto"
                                />
                            )}
                            <p className="text-white">
                                <strong>Name:</strong> {session.user?.name ?? "N/A"}
                            </p>
                            <p className="text-white">
                                <strong>Email:</strong> {session.user?.email ?? "N/A"}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="mt-4 w-full bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Accounts and Portfolio */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-white">Accounts and Portfolio</h2>
                        <div className="mt-4 space-y-4">
                            <p className="text-white">
                                <strong>Account Balance:</strong> 1000 ETH
                            </p>
                            <p className="text-white">
                                <strong>Portfolio Value:</strong> $50,000
                            </p>
                            <p className="text-white">
                                <strong>Tokens:</strong> ETH, BTC, USDT
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;