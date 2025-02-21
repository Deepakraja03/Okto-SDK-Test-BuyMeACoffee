"use client";
import { useState, useEffect } from "react";
import { FaSync } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getAccount, getOrdersHistory, tokenTransfer, useOkto } from "@okto_web3/react-sdk";
import { ChainsList, TokensList } from "../components/SupportedToken";

type Job = {
    id: string;
    recipientAddress: string;
    amount: string;
    tokenAddress: string;
    status: string;
    intentType: string;
};

const TransferToken = () => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [status, setStatus] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const oktoClient = useOkto();
    if (!oktoClient) {
        console.error("Okto client is not initialized");
        return;
    }

    // Fetch account details
    async function getacc() {
        if (!oktoClient) {
            console.error("Okto client is not initialized.");
            return null;
        }
    
        const accounts = await getAccount(oktoClient);
        console.log("Fetched accounts:", accounts);
    
        const baseTestnetAccount = accounts.find(account => account.networkName === "BASE_TESTNET");
        if (!baseTestnetAccount) {
            console.error("No account found for BASE_TESTNET.");
        }
        return baseTestnetAccount;
    }

    // Convert ETH to WEI
    function ethToWei(ethAmount: string): bigint {
        const [whole, fractional] = ethAmount.split(".");
        const decimals = fractional?.length || 0;
        return BigInt(whole + (fractional || "")) * BigInt(10 ** (18 - decimals));
    }

    // Store job data in localStorage
    const storeJobData = (job: Job) => {
        const storedJobs = localStorage.getItem("jobs");
        const existingJobs: Job[] = storedJobs ? JSON.parse(storedJobs) : [];
        
        // Update existing job or add new one
        const updatedJobs = existingJobs.some(j => j.id === job.id)
            ? existingJobs.map(j => j.id === job.id ? { ...j, ...job } : j)
            : [...existingJobs, job];
        
        localStorage.setItem("jobs", JSON.stringify(updatedJobs));
        setJobs(updatedJobs);
    };
    
    // Handle token transfer
    async function handleTransfer() {
        try {
            const senderAccount = await getacc();
            if (!senderAccount || !senderAccount.address) {
                throw new Error("Sender account or address is invalid.");
            }

            const transferParams = {
                amount: ethToWei(amount),
                recipient: recipientAddress as `0x${string}`,
                token: tokenAddress as `0x${string}`,
                caip2Id: senderAccount?.caipId
            };

            const txHash = await tokenTransfer(oktoClient, transferParams);
            
            const orderHistoryResponse = await getOrdersHistory(oktoClient, {
                intentId: txHash,
                intentType: "TOKEN_TRANSFER"
            });

            const orderStatus = orderHistoryResponse?.[0]?.status || "Unknown";

            const newJob: Job = {
                id: txHash,
                recipientAddress,
                amount,
                tokenAddress,
                status: orderStatus,
                intentType: "TOKEN_TRANSFER"
            };

            storeJobData(newJob);
            setStatus(`Transfer complete! Hash: ${txHash}`);
            setModalVisible(true);

        } catch (error: any) {
            console.error("Transfer failed:", error);
            setStatus(`Transfer failed: ${error.message}`);
        }
    }

    // Refresh job status
    const refreshJobStatus = async (jobId: string) => {
        try {
            const storedJobs = localStorage.getItem("jobs");
            if (!storedJobs) return;

            const parsedJobs: Job[] = JSON.parse(storedJobs);
            const job = parsedJobs.find(j => j.id === jobId);

            if (!job) return;

            const orderHistoryResponse = await getOrdersHistory(oktoClient, {
                intentId: jobId,
                intentType: job.intentType
            });

            const updatedStatus = orderHistoryResponse?.[0]?.status || "Unknown";
            const updatedJob = { ...job, status: updatedStatus };
            
            storeJobData(updatedJob);

        } catch (error: any) {
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
                        intentType: job.intentType
                    });
    
                    return {
                        ...job,
                        status: orderHistoryResponse?.[0]?.status || "Unknown"
                    };
                })
            );
    
            localStorage.setItem("jobs", JSON.stringify(updatedJobs));
            setJobs(updatedJobs);
        };
    
        fetchJobStatuses();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <Navbar />
            <div className="p-4 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-white">Transfer Token</h1>

                {/* Token Transfer Form */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Transfer Form</h2>
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Recipient Address" 
                            value={recipientAddress} 
                            onChange={(e) => setRecipientAddress(e.target.value)} 
                            className="w-full p-2 border rounded bg-gray-700 text-white" 
                        />
                        <input 
                            type="number" 
                            placeholder="Amount" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="w-full p-2 border rounded bg-gray-700 text-white" 
                        />
                        <input 
                            type="text" 
                            placeholder="Token Address" 
                            value={tokenAddress} 
                            onChange={(e) => setTokenAddress(e.target.value)} 
                            className="w-full p-2 border rounded bg-gray-700 text-white" 
                        />
                        <button 
                            onClick={handleTransfer} 
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
                            <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setModalVisible(false)}>Close</button>
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
                                            <div className="max-w-xs overflow-hidden truncate" title={job.id}>
                                                {job.id.slice(0, 8)}...{job.id.slice(-6)}
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
            <TokensList />
            <ChainsList />
        </div>
    );
};

export default TransferToken;