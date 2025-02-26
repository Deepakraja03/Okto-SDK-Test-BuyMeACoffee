"use client";
import { getAccount, getOrdersHistory, getPortfolio, INTENT_TYPE, useOkto } from "@okto_web3/react-sdk";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { RawTransactionFunction } from "../utils/rawTransactionFunction";
import { FaSync } from "react-icons/fa";
// import CheckJobStatus from "../components/CheckJobStatus";

type AccountData = {
    caipId: string;
    networkName: string;
    address: string;
    caip2Id: string;
    networkSymbol: string;
};

type Job = {
    id: string;
    recipientAddress: string;
    amount: string;
    tokenAddress: string;
    status: string;
    intentType: string;
};

const RawTransaction = () => {
    const oktoClient = useOkto();
    const [accountData, setAccountData] = useState<AccountData | null>(null);
    const [message, setMessage] = useState<string>("");
    const [transactionResult, setTransactionResult] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [amount, setAmount] = useState("");
    const [selectedToken, setSelectedToken] = useState<"ETH" | "LINK">("ETH");
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);
    const [, setTokenAddress] = useState("");
    const [baseTestnetBalance, setBaseTestnetBalance] = useState<string | null>(null);
    const [isFetchingPortfolio, setIsFetchingPortfolio] = useState(false);
    const [portfolioData, setPortfolioData] = useState<unknown>(null);


    useEffect(() => {
        async function getacc() {
            if (!oktoClient) {
                console.error("Okto client is not initialized.");
                return null;
            }

            const accounts = await getAccount(oktoClient);
            const baseTestnetAccount = accounts.find(
                (account) => account.networkName === "BASE_TESTNET"
            );

            if (!baseTestnetAccount) {
                console.error("No account found for BASE_TESTNET.");
                return null;
            }
            return {
                caipId: baseTestnetAccount.caipId,
                networkName: baseTestnetAccount.networkName,
                address: baseTestnetAccount.address,
                caip2Id: baseTestnetAccount.caip2Id,
                networkSymbol: baseTestnetAccount.networkSymbol
            } as AccountData;
        }

        getacc().then((data) => {
            setAccountData(data ?? null);
        });
    }, [oktoClient]);

    function ethToWei(ethAmount: string): bigint {
        const [whole, fractional] = ethAmount.split(".");
        const wholeWei = BigInt(whole) * BigInt(10 ** 18);
        const fractionalWei = fractional
          ? BigInt(fractional.padEnd(18, "0").slice(0, 18))
          : BigInt(0);
        return wholeWei + fractionalWei;
    }

    // Store job data in both localStorage and state
    const storeJobData = (job: Job) => {
      const storedJobs = localStorage.getItem("jobsRaw");
      const existingJobs: Job[] = storedJobs ? JSON.parse(storedJobs) : [];
  
      // Ensure job has a unique id (generate one if missing)
      const jobWithId = job.id ? job : { ...job, id: crypto.randomUUID() };
  
      const updatedJobs = existingJobs.some((j) => j.id === jobWithId.id)
          ? existingJobs.map((j) => (j.id === jobWithId.id ? { ...j, ...jobWithId } : j))
          : [...existingJobs, jobWithId];
  
      localStorage.setItem("jobsRaw", JSON.stringify(updatedJobs));
      setJobs(updatedJobs);
  };  

    // Refresh job status and update state and localStorage
    const refreshJobStatus = async (jobId: string) => {
        try {
            const storedJobs = localStorage.getItem("jobsRaw");
            if (!storedJobs) return;

            const parsedJobs: Job[] = JSON.parse(storedJobs);
            const job = parsedJobs.find((j) => j.id === jobId);
            if (!job) return;

            const orderHistoryResponse = await getOrdersHistory(oktoClient, {
                intentId: jobId,
                intentType: job.intentType as INTENT_TYPE,
            });

            const updatedStatus = orderHistoryResponse?.[0]?.status || "Unknown";
            const updatedJob = { ...job, status: updatedStatus };

            storeJobData(updatedJob);
        } catch (error) {
            console.error("Failed to refresh job status:", error);
        }
    };

    // Load and refresh all jobs on component mount
    useEffect(() => {
      const fetchJobStatuses = async () => {
          const storedJobs = localStorage.getItem("jobsRaw");
          if (!storedJobs) return;
  
          let parsedJobs: Job[] = JSON.parse(storedJobs);
          
          // Filter out invalid jobs (missing id)
          parsedJobs = parsedJobs.filter((job) => job.id);
  
          const updatedJobs = await Promise.all(
              parsedJobs.map(async (job) => {
                  const orderHistoryResponse = await getOrdersHistory(oktoClient, {
                      intentId: job.id,
                      intentType: job.intentType as INTENT_TYPE,
                  });
  
                  return {
                      ...job,
                      status: orderHistoryResponse?.[0]?.status || "Unknown",
                  };
              })
          );
  
          localStorage.setItem("jobsRaw", JSON.stringify(updatedJobs));
          setJobs(updatedJobs);
      };
  
      if (oktoClient) {
          fetchJobStatuses();
      }
  }, [oktoClient]);  

  const fetchPortfolio = async () => {
    try {
      setIsFetchingPortfolio(true); // Start loading
      const portfolio = await getPortfolio(oktoClient);
      setPortfolioData(portfolio);

      // Extract balance of BASE_TESTNET
      if (portfolio?.groupTokens) {
        const baseTestnetToken = portfolio.groupTokens.find(
          (token) => token.networkName === "BASE_TESTNET"
        );
        if (baseTestnetToken) {
          setBaseTestnetBalance(baseTestnetToken.holdingsPriceUsdt);
        } else {
          setBaseTestnetBalance(null);
        }
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsFetchingPortfolio(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [oktoClient]);

    const buyCoffee = async () => {
        if (!oktoClient) {
            console.error("Okto client is not initialized.");
            return;
        }

        try {
            const amountInWei = ethToWei(amount);
            const result = await RawTransactionFunction(oktoClient, accountData?.caipId ?? "", accountData?.address ?? "", "pay", [message], amountInWei);
            console.log("Raw transaction result:", result);
            console.log("Transaction ID:", {result, transactionResult});
            const newJob: Job = {
                id: result as string,
                recipientAddress: accountData?.address || "",
                amount: "0.01", // Placeholder amount
                tokenAddress: "", // Placeholder token address
                status: "Pending",
                intentType: "RAW_TRANSACTION",
            };

            storeJobData(newJob);
            setTransactionResult(JSON.stringify(result, null, 2));
            await fetchPortfolio();
        } catch (error) {
            console.error("Transaction failed:", error);
            setTransactionResult("Transaction failed. Please try again.");
        }
    };

    const getAllMessages = async () => {
      try {

        const allMessages = await RawTransactionFunction(oktoClient, accountData?.caipId ?? "", accountData?.address ?? "", "getAllMessages", [], BigInt(0));
        console.log("All messages:", allMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }

    useEffect(() => {
        const fetchExchangeRate = async () => {
          try {
            const response = await fetch(
              "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
            );
            const data = await response.json();
            setExchangeRate(data.ethereum.usd);
          } catch (error) {
            console.error("Failed to fetch exchange rate:", error);
          }
        };
    
        fetchExchangeRate();
      }, []);

    // Handle amount button click
    const handleAmountClick = (usdAmount: number) => {
        if (exchangeRate) {
        const ethAmount = usdAmount / exchangeRate;
        setAmount(ethAmount.toString());
        } else {
        console.error("Exchange rate not available");
        }
    };

    // Handle token selection
    const handleTokenSelection = (token: "ETH" | "LINK") => {
        setSelectedToken(token);
        setTokenAddress(
        token === "ETH" ? "" : "0x514910771AF9Ca656af840dff83E8264EcF986CA"
        );
    };

    const isInsufficientBalance = (usdAmount: number): boolean => {
        if (!baseTestnetBalance) return true; // If balance is not available, assume insufficient
        return parseFloat(baseTestnetBalance) < usdAmount;
      };
    
      // Disable the "Send" button if the amount is greater than the balance
      const isSendButtonDisabled = (): boolean => {
        if (!amount || !baseTestnetBalance) return true;
        return parseFloat(baseTestnetBalance) < parseFloat(amount);
      };    

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4">
            <Navbar />
            <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center">Raw Transaction</h1>
                <div className="mt-4 mb-4">
                {portfolioData ? (
                    <div className="p-2 border border-gray-600 rounded-lg bg-gray-700 text-white inline-flex items-center space-x-2">
                        <span className="text-sm font-semibold">Balance:</span>
                        {isFetchingPortfolio ? (
                            <span className="text-sm text-gray-400">Updating...</span>
                        ) : baseTestnetBalance !== null ? (
                            <span className="text-sm font-medium">{baseTestnetBalance} USDT</span>
                        ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                        )}
                    </div>
                    ) : (
                    <p className="text-white text-sm">No portfolio data available</p>
                    )}
                </div>
                <div className="mt-4">
                    <input
                        type="text"
                        placeholder="Message"
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full p-2 border rounded bg-gray-700 text-white"
                    />
                </div>
                <div className="space-y-4">
                    <div className="flex space-x-2">
                    {[1, 2, 5].map((usdAmount) => (
                        <button
                        key={usdAmount}
                        onClick={() => handleAmountClick(usdAmount)}
                        className={`flex-1 px-4 py-2 rounded ${
                            isInsufficientBalance(usdAmount)
                            ? "bg-red-500 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-700"
                        } text-white`}
                        disabled={isInsufficientBalance(usdAmount)}
                        title={
                            isInsufficientBalance(usdAmount) ? "Insufficient balance" : ""
                        }
                        >
                        {usdAmount}$
                        </button>
                    ))}
                    </div>
                    <div className="flex space-x-2">
                    <button
                        onClick={() => handleTokenSelection("ETH")}
                        className={`flex-1 px-4 py-2 rounded ${
                        selectedToken === "ETH" ? "bg-green-500" : "bg-gray-500"
                        } text-white`}
                    >
                        ETH
                    </button>
                    <button
                        onClick={() => handleTokenSelection("LINK")}
                        className={`flex-1 px-4 py-2 rounded ${
                        selectedToken === "LINK" ? "bg-green-500" : "bg-gray-500"
                        } text-white`}
                    >
                        LINK
                    </button>
                    </div>
                    {/* <div>
                        Token Address : {tokenAddress}
                    </div> */}
                </div>
                <button 
                    onClick={buyCoffee} 
                    className={`w-full px-4 py-2 rounded ${
                        isSendButtonDisabled()
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700"
                    } text-white`}
                    disabled={isSendButtonDisabled()}
                >
                    Buy Coffee
                </button>

                {transactionResult && (
                    <div className="mt-4 p-3 bg-gray-700 rounded">
                        <h2 className="font-semibold">Transaction Result:</h2>
                        <pre className="text-sm overflow-auto">{transactionResult}</pre>
                    </div>
                )}
            </div>
            <div className="bg-gray-800 rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Job Status</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-2 text-white">Intent ID</th>
                                <th className="text-left py-2 text-white">Intent Type</th>
                                <th className="text-left py-2 text-white">Recipient</th>
                                <th className="text-left py-2 text-white">Amount</th>
                                <th className="text-left py-2 text-white">Status</th>
                                <th className="text-left py-2 text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                          {jobs.map((job) => (
                            <tr key={job.id || crypto.randomUUID()} className="border-b border-gray-700">
                                <td className="py-2 text-white">
                                    <div className="max-w-xs overflow-hidden truncate" title={job.id || "Unknown"}>
                                        {job.id ? `${job.id.slice(0, 8)}...${job.id.slice(-6)}` : "N/A"}
                                    </div>
                                </td>
                                <td className="py-2 text-white">{job.intentType}</td>
                                <td className="py-2 text-white">
                                    <div className="max-w-xs overflow-hidden truncate" title={job.recipientAddress}>
                                        {job.recipientAddress.slice(0, 8)}...{job.recipientAddress.slice(-6)}
                                    </div>
                                </td>
                                <td className="py-2 text-white">{job.amount}</td>
                                <td className="py-2 text-white">{job.status}</td>
                                <td className="py-2">
                                    <button
                                        onClick={() => job.id && refreshJobStatus(job.id)}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Refresh Status"
                                        disabled={!job.id}
                                    >
                                        <FaSync />
                                    </button>
                                </td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div>
              <button onClick={getAllMessages} className="mt-4 w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded">
                Get All Messages
              </button>
            </div>
            {/* <CheckJobStatus /> */}
        </div>
    );
};

export default RawTransaction;