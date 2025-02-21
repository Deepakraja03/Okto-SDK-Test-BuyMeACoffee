"use client";
import { useState, useEffect } from "react";
import { FaSync } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getAccount, getOrdersHistory, tokenTransfer, useOkto } from "@okto_web3/react-sdk";

type Job = {
    id: number;
    recipientAddress: string;
    amount: string;
    tokenAddress: string;
    status: string;
};

const TransferToken = () => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const [amount, setAmount] = useState("");
    const [tokenAddress, setTokenAddress] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [status, setStatus] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const oktoClient = useOkto();

    async function getacc() {
        const accounts = await getAccount(oktoClient);
        const base_testnet = accounts.find(account => account.networkName === "BASE_TESTNET");
        return base_testnet;
    }

    function ethToWei(ethAmount: string): bigint {
        const ethBigInt = BigInt(ethAmount);
        return ethBigInt * BigInt(10 ** 18);
    }    
    
    async function handleTransfer() {
        try {
            const senderAccount = await getacc();
            if (!senderAccount || !senderAccount.address) {
                throw new Error("Sender account or address is invalid.");
            }

            const recipient: `0x${string}` = recipientAddress as `0x${string}`;
            const transferParams = {
                amount: ethToWei(amount),
                recipient: recipient,
                token: tokenAddress as `0x${string}` || "" as `0x${string}`,
                caip2Id: senderAccount?.caipId
            };

            // Perform the token transfer
            const txHash = await tokenTransfer(oktoClient, transferParams);

            // Store txHash (job ID) in local storage
            localStorage.setItem('txHash', txHash);

            // Fetch orders history and check its response structure
            const orderHistoryResponse = await getOrdersHistory(oktoClient,  {
                intentId: txHash,
                intentType: "TOKEN_TRANSFER"
            });

            // Now directly access the status of the first order in the array
            const orderStatus = orderHistoryResponse?.[0]?.status || "Unknown"; // Default to "Unknown" if no status

            console.log("Transfer transaction hash:", txHash);
            setStatus(`Transfer complete! Hash: ${txHash}`);
            setModalVisible(true);

            // Update the jobs list with the response from getOrdersHistory
            const newJob: Job = {
                id: Number(txHash), // Assuming txHash can be used as a job ID
                recipientAddress,
                amount,
                tokenAddress,
                status: orderStatus, // Use the status from the first order in the array
            };
            setJobs([newJob]); // Add the new job to the jobs array

        } catch (error: any) {
            console.error("Transfer failed:", error);
            setStatus(`Transfer failed: ${error.message}`);
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleTransfer();
    };

    const refreshJobStatus = async (id: number) => {
        try {
            // Retrieve the txHash from localStorage
            const storedTxHash = localStorage.getItem('txHash');
            if (!storedTxHash) {
                console.error("No txHash found in localStorage.");
                return;
            }

            const orderHistoryResponse = await getOrdersHistory(oktoClient, {
                intentId: storedTxHash,
                intentType: "TOKEN_TRANSFER"
            });

            // Now directly access the status of the first order in the array
            const orderStatus = orderHistoryResponse?.[0]?.status || "Unknown"; // Default to "Unknown" if no status

            // Update the job status based on the fetched order history
            const updatedJobs = jobs.map((job) =>
                job.id === id ? { ...job, status: orderStatus } : job
            );
            setJobs(updatedJobs);

        } catch (error: any) {
            console.error("Failed to refresh job status:", error);
        }
    };

    useEffect(() => {
        // When the component mounts, we can attempt to load the jobs from localStorage (if necessary)
        const storedTxHash = localStorage.getItem('txHash');
        if (storedTxHash) {
            // If there is a job stored in localStorage, we might want to load and display it
            const initialJob: Job = {
                id: Number(storedTxHash),
                recipientAddress,
                amount,
                tokenAddress,
                status, // Initially set as the status we receive from the transfer
            };
            setJobs([initialJob]);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <Navbar />
            <div className="p-4 max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-white">Transfer Token</h1>

                {/* Transfer Form */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Transfer Form</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Recipient Address</label>
                            <input
                                type="text"
                                value={recipientAddress}
                                onChange={(e) => setRecipientAddress(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Token Address</label>
                            <input
                                type="text"
                                value={tokenAddress}
                                onChange={(e) => setTokenAddress(e.target.value)}
                                className="w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Send
                        </button>
                    </form>
                </div>

                {modalVisible && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-black rounded-lg w-11/12 max-w-2xl p-6">
                            <div className="flex justify-between items-center border-b pb-2 mb-4">
                                <h2 className="text-lg font-semibold">Token Transfer Status</h2>
                                <button
                                    className="text-gray-500 hover:text-gray-700"
                                    onClick={() => setModalVisible(false)}
                                >
                                    ×
                                </button>
                            </div>
                            <div className="text-left text-white max-h-96 overflow-y-auto">
                                <pre className="whitespace-pre-wrap break-words text-white">
                                    {status}
                                </pre>
                            </div>
                            <div className="mt-4 text-right">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded"
                                    onClick={() => setModalVisible(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Job Status Table */}
                <div className="bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Job Status</h2>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-2 text-white">Job ID</th>
                                <th className="text-left py-2 text-white">Status</th>
                                <th className="text-left py-2 text-white">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => (
                                <tr key={job.id} className="border-b border-gray-700">
                                    <td className="py-2 text-white">{job.id}</td>
                                    <td className="py-2 text-white">{job.status}</td>
                                    <td className="py-2">
                                        <button
                                            onClick={() => refreshJobStatus(job.id)}
                                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
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
    );
};

export default TransferToken;