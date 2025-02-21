"use client";
import { getAccount, tokenTransfer, useOkto ,getOrdersHistory} from "@okto_web3/react-sdk";
// import { tokenTransfer } from "@okto_web3/react-sdk/abstracted";
import { useState } from "react";
 
export function TokenTransfer() {
    const oktoClient = useOkto();
    const [status, setStatus] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    async function getacc() {
        const accounts = await getAccount(oktoClient);
        const base_testnet = accounts.find(account => account.networkName === "BASE_TESTNET");
        return base_testnet;
    }

    async function handleTransfer() {
        try {
            const senderAccount = await getacc();
            // console.log("recipient", senderAccount);
            if (!senderAccount || !senderAccount.address) {
                throw new Error("Sender account or address is invalid.");
            }
            // const recipient = senderAccount.address as `0x${string}`;
            console.log("recipient account caipId", senderAccount?.caipId);
            const recipient : `0x${string}` = "0x38588E4C064e0DC4CBF4F06895eBD5a682B878F3"
            const transferParams = {
                amount: BigInt("100000000000000"), // 1 token with 18 decimals
                recipient: recipient,
                token: "" as `0x${string}`, // Token contract address
                caip2Id: senderAccount?.caipId
            };
 
            // Create the user operation
            const txHash = await tokenTransfer(oktoClient, transferParams);
            
           
           
            const status= await getOrdersHistory(oktoClient,  {
                intentId: txHash,
                intentType: "TOKEN_TRANSFER"
            });
            console.log("status of order history", status);
            
            console.log('Transfer transaction hash:', txHash);
            setStatus(`Transfer complete! Hash: ${txHash}`);
            setModalVisible(true);
        } catch (error: any) {
            console.error("Transfer failed:", error);
            setStatus(`Transfer failed: ${error.message}`);
        }
    }
 
    return (
        <div className="text-center text-white">
            <button
                className="px-4 py-2 w-full bg-blue-500 text-white rounded"
                onClick={handleTransfer}
            >
                Send 1 SOL
            </button>
 
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
        </div>
    );
}