"use client";
import { useSession } from "next-auth/react";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";
import { useEffect, useMemo, useState } from "react";
import { getAccount, getPortfolio, useOkto } from "@okto_web3/react-sdk";

const Dashboard = () => {
    const { data: session, status } = useSession();
    const oktoClient = useOkto();

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
            console.log("No Google login available", error);
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

    // Show loading spinner while Okto authentication is in progress
    if (isAuthenticating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Navbar />
                <div className="p-4">
                    <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                        <p className="ml-4 text-white">Authenticating with Okto...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Data Section */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-white">Account Data (JSON)</h2>
                        <div className="mt-4">
                            {accountData ? (
                                <pre className="p-4 border border-gray-600 rounded-lg bg-gray-700 text-white overflow-x-auto">
                                    {JSON.stringify(accountData, null, 2)}
                                </pre>
                            ) : (
                                <p className="text-white">No account data available</p>
                            )}
                        </div>
                    </div>

                    {/* Portfolio Data Section */}
                    <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-white">Portfolio Data (JSON)</h2>
                        <div className="mt-4">
                            {portfolioData ? (
                                <pre className="p-4 border border-gray-600 rounded-lg bg-gray-700 text-white overflow-x-auto">
                                    {JSON.stringify(portfolioData, null, 2)}
                                </pre>
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