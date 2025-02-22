"use client";
import { useState, useEffect } from "react";
import { FaSync } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getAccount, getOrdersHistory, getPortfolio, INTENT_TYPE, tokenTransfer, useOkto } from "@okto_web3/react-sdk";

type Job = {
  id: string;
  recipientAddress: string;
  amount: string;
  tokenAddress: string;
  status: string;
  intentType: string;
};

const TransferToken = () => {
  const recipientAddress = "0x38588E4C064e0DC4CBF4F06895eBD5a682B878F3";
  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState<"ETH" | "LINK">("ETH");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [portfolioData, setPortfolioData] = useState<unknown>(null);
  const [baseTestnetBalance, setBaseTestnetBalance] = useState<string | null>(null);
  const [isFetchingPortfolio, setIsFetchingPortfolio] = useState(false); // Loading state
  const oktoClient = useOkto();

  // Fetch account details
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
    }
    return baseTestnetAccount;
  }

  // Convert ETH to WEI
  function ethToWei(ethAmount: string): bigint {
    const [whole, fractional] = ethAmount.split(".");
    const wholeWei = BigInt(whole) * BigInt(10 ** 18);
    const fractionalWei = fractional
      ? BigInt(fractional.padEnd(18, "0").slice(0, 18))
      : BigInt(0);
    return wholeWei + fractionalWei;
  }

  // Store job data in localStorage
  const storeJobData = (job: Job) => {
    const storedJobs = localStorage.getItem("jobs");
    const existingJobs: Job[] = storedJobs ? JSON.parse(storedJobs) : [];
    const updatedJobs = existingJobs.some((j) => j.id === job.id)
      ? existingJobs.map((j) => (j.id === job.id ? { ...j, ...job } : j))
      : [...existingJobs, job];
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));
    setJobs(updatedJobs);
  };

  // Fetch portfolio data and extract BASE_TESTNET balance
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

  // Handle token transfer
  async function handleTransfer() {
    try {
      const senderAccount = await getacc();
      if (!senderAccount || !senderAccount.address) {
        throw new Error("Sender account or address is invalid.");
      }
      const amountInWei = ethToWei(amount);

      const transferParams = {
        amount: amountInWei,
        recipient: recipientAddress as `0x${string}`,
        token: tokenAddress as `0x${string}`,
        caip2Id: senderAccount?.caipId,
      };

      const txHash = await tokenTransfer(oktoClient, transferParams);
      const orderHistoryResponse = await getOrdersHistory(oktoClient, {
        intentId: txHash,
        intentType: "TOKEN_TRANSFER",
      });

      const orderStatus = orderHistoryResponse?.[0]?.status || "Unknown";

      const newJob: Job = {
        id: txHash,
        recipientAddress,
        amount,
        tokenAddress,
        status: orderStatus,
        intentType: "TOKEN_TRANSFER",
      };

      storeJobData(newJob);
      setStatus(`Transfer complete! Hash: ${txHash}`);
      setModalVisible(true);

      // Refetch portfolio to update balance immediately
      await fetchPortfolio();
    } catch (error: unknown) {
      console.error("Transfer failed:", error);
      setStatus(`Transfer failed: ${(error as Error).message}`);
    }
  }

  // Refresh job status
  const refreshJobStatus = async (jobId: string) => {
    try {
      const storedJobs = localStorage.getItem("jobs");
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
    } catch (error: unknown) {
      console.error("Failed to refresh job status:", error);
    }
  };

  // Load and refresh all jobs on component mount
  useEffect(() => {
    const fetchJobStatuses = async () => {
      const storedJobs = localStorage.getItem("jobs");
      if (!storedJobs) return;

      const parsedJobs: Job[] = JSON.parse(storedJobs);
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

      localStorage.setItem("jobs", JSON.stringify(updatedJobs));
      setJobs(updatedJobs);
    };

    if (oktoClient) {
      fetchJobStatuses();
    }
  }, [oktoClient]);

  // Fetch exchange rate
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

  // Fetch portfolio data on component mount
  useEffect(() => {
    fetchPortfolio();
  }, [oktoClient]);

  // Check if the user has sufficient balance
  // Check if the user has sufficient balance
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-white">Transfer Token</h1>
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
        {/* Token Transfer Form */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Transfer Form
          </h2>
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
            <button
              onClick={handleTransfer}
              className={`w-full px-4 py-2 rounded ${
                isSendButtonDisabled()
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-700"
              } text-white`}
              disabled={isSendButtonDisabled()}
            >
              Send
            </button>
          </div>
        </div>

        {/* Status Modal */}
        {modalVisible && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-black rounded-lg w-11/12 max-w-2xl p-6">
              <div className="text-white">{status}</div>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setModalVisible(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Job Status Table */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
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
                  <tr key={job.id} className="border-b border-gray-700">
                    <td className="py-2 text-white">
                      <div
                        className="max-w-xs overflow-hidden truncate"
                        title={job.id}
                      >
                        {job.id.slice(0, 8)}...{job.id.slice(-6)}
                      </div>
                    </td>
                    <td className="py-2 text-white">{job.intentType}</td>
                    <td className="py-2 text-white">
                      <div
                        className="max-w-xs overflow-hidden truncate"
                        title={job.recipientAddress}
                      >
                        {job.recipientAddress.slice(0, 8)}...
                        {job.recipientAddress.slice(-6)}
                      </div>
                    </td>
                    <td className="py-2 text-white">{job.amount}</td>
                    <td className="py-2 text-white">{job.status}</td>
                    <td className="py-2">
                      <button
                        onClick={() => refreshJobStatus(job.id)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Refresh Status"
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
      </div>
    </div>
  );
};

export default TransferToken;