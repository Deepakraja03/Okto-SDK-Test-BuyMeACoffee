"use client";
import Navbar from "../components/Navbar";

const Transactions = () => {
    const transactions = [
        { id: 1, type: "Sent", amount: "0.5 ETH", date: "2023-10-01" },
        { id: 2, type: "Received", amount: "1.0 ETH", date: "2023-10-02" },
        { id: 3, type: "Sent", amount: "0.2 ETH", date: "2023-10-03" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <Navbar />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6 text-white">Transactions</h1>
                <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-white">Transaction History</h2>
                    <table className="w-full mt-4">
                        <thead>
                            <tr>
                                <th className="text-left text-white">ID</th>
                                <th className="text-left text-white">Type</th>
                                <th className="text-left text-white">Amount</th>
                                <th className="text-left text-white">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="text-white">{tx.id}</td>
                                    <td className="text-white">{tx.type}</td>
                                    <td className="text-white">{tx.amount}</td>
                                    <td className="text-white">{tx.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;