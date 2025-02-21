"use client";
import { useState } from "react";
import { FaSync } from "react-icons/fa";
import Navbar from "../components/Navbar";

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newJob = {
            id: jobs.length + 1,
            recipientAddress,
            amount,
            tokenAddress,
            status: "Pending",
        };
        setJobs([...jobs, newJob]);
        setRecipientAddress("");
        setAmount("");
        setTokenAddress("");
    };

    const refreshJobStatus = (id: number) => {
        const updatedJobs = jobs.map((job) =>
            job.id === id ? { ...job, status: "Completed" } : job
        );
        setJobs(updatedJobs);
    };

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