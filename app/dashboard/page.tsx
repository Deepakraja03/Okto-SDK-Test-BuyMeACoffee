"use client";
import { useSession, signOut } from "next-auth/react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { useEffect, useMemo, useState } from "react";
import { getAccount, getPortfolio, useOkto } from "@okto_web3/react-sdk";
import { useRouter } from "next/navigation";

const Dashboard = () => {
    const { data: session, status } = useSession();
    const oktoClient = useOkto();
    const router = useRouter();

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticatedWithOkto, setIsAuthenticatedWithOkto] = useState(false);
    const [authenticationFailed, setAuthenticationFailed] = useState(false);
    const [accountData, setAccountData] = useState<any>(null); // State to hold account data
    const [portfolioData, setPortfolioData] = useState<any>(null); // State to hold portfolio data
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
            router.push("/"); // Redirect to homepage after logout
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    async function fetchPortfolio() {
        try {
            const portfolio = await getPortfolio(oktoClient);
            console.log('Portfolio data:', portfolio);
            setPortfolioData(portfolio);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        }
    }

    async function fetchAccount() {
        try {
            const account = await getAccount(oktoClient);
            console.log('Account data:', account);
            setAccountData(account);
        } catch (error) {
            console.error('Error fetching user account:', error);
        }
    }

    // Authenticate with Okto once the idToken is available
    useEffect(() => {
        if (idToken && !isAuthenticatedWithOkto && !isAuthenticating && !authenticationFailed) {
            handleAuthenticate();
        }
        if (isAuthenticatedWithOkto && !authenticationFailed) {
            fetchAccount();
            fetchPortfolio();
        }
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
                    
                <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-white">Account</h2>
                  <div className="mt-4 space-y-4">
                      {/* Displaying Account data */}
                      {accountData ? (
                          <>
                              <p className="text-white">
                                  <strong>Network Name:</strong> {accountData?.data[0]?.network_name ?? "N/A"}
                              </p>
                              <p className="text-white">
                                  <strong>Address:</strong> {accountData?.data[0]?.address ?? "N/A"}
                              </p>
                              <p className="text-white">
                                  <strong>Network Symbol:</strong> {accountData?.data[0]?.network_symbol ?? "N/A"}
                              </p>
                          </>
                      ) : (
                          <p className="text-white">No account data available</p>
                      )}
                  </div>
              </div>

                    {/* Accounts and Portfolio */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-white">Portfolio</h2>
                        <div className="mt-4 space-y-4">
                            {portfolioData ? (
                                <>
                                    <p className="text-white">
                                        <strong>Account Balance:</strong> {portfolioData?.aggregated_data?.holdings_count ?? "N/A"}
                                    </p>
                                    <p className="text-white">
                                        <strong>Portfolio Value:</strong> {portfolioData?.aggregated_data?.total_holding_price_usdt ?? "N/A"} USDT
                                    </p>
                                    <p className="text-white">
                                        <strong>Tokens:</strong> {portfolioData?.group_tokens?.map((token: any) => token.symbol).join(", ") ?? "N/A"}
                                    </p>
                                </>
                            ) : (
                                <p className="text-white">No portfolio data available</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;