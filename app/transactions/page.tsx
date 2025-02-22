"use client";
import { getPortfolioActivity, useOkto } from "@okto_web3/react-sdk";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import Image from "next/image";

type Transaction = {
  symbol: string;
  image: string;
  name: string;
  description: string;
  amount: string;
  txHash: string;
  networkName: string;
  networkExplorerUrl: string;
  timestamp: number;
  groupId: string;
  orderType: string;
  transferType: string;
};

const Transactions = () => {
  const oktoClient = useOkto();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivity() {
      try {
        setIsLoading(true);
        const activities = await getPortfolioActivity(oktoClient);
  
        const formattedTransactions: Transaction[] = activities.map((activity) => ({
          symbol: activity.symbol || "",
          image: activity.image || "",
          name: activity.name || "",
          description: activity.description || "",
          amount: activity.amount || "0", // Ensure `amount` exists
          txHash: activity.txHash || "",
          networkName: activity.networkName || "",
          networkExplorerUrl: activity.networkExplorerUrl || "",
          timestamp: activity.timestamp || 0,
          groupId: activity.groupId || "",
          orderType: activity.orderType || "",
          transferType: activity.transferType || "",
        }));
  
        setTransactions(formattedTransactions);
        setError(null);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setError("Failed to fetch transaction history");
      } finally {
        setIsLoading(false);
      }
    }
  
    fetchActivity();
  }, [oktoClient]);
  

  const formatTimestampToIST = (timestamp: number): string => {
    // Create a date object from the timestamp (in milliseconds)
    // Since Unix timestamp is in seconds, multiply by 1000
    const date = new Date(timestamp * 1000);
    
    // Format to IST using built-in methods
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
  };  
  
  

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Transactions</h1>
        <div className="p-6 bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading transactions...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full mt-4">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-4 py-3 text-left text-white">Asset</th>
                    <th className="px-4 py-3 text-left text-white">Type</th>
                    <th className="px-4 py-3 text-left text-white">Network</th>
                    <th className="px-4 py-3 text-left text-white">Amount</th>
                    <th className="px-4 py-3 text-left text-white">Transaction Hash</th>
                    <th className="px-4 py-3 text-left text-white">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => (
                    <tr 
                      key={tx.txHash + index} 
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {tx.image && (
                            <Image 
                              src={tx.image} 
                              alt={tx.symbol} 
                              className="w-6 h-6 rounded-full"
                              width={100} height={100}
                            />
                          )}
                          <div>
                            <div className="text-white font-medium">{tx.symbol}</div>
                            <div className="text-gray-400 text-sm">{tx.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-white">
                          <div>{tx.orderType}</div>
                          <div className="text-gray-400 text-sm">{tx.transferType}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{tx.networkName}</td>
                      <td className="px-4 py-3 text-white">{tx.amount}</td>
                      <td className="px-4 py-3">
                        <a 
                          href={`${tx.networkExplorerUrl}/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {truncateHash(tx.txHash)}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-white">{formatTimestampToIST(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;