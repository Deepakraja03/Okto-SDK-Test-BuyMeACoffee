"use client";
import React, { useState } from "react";
import { OktoClient, useOkto } from "@okto_web3/react-sdk";

interface GetButtonProps {
    title: string;
    apiFn: (client: OktoClient) => Promise<unknown>; // More specific type definition
}

const GetButton: React.FC<GetButtonProps> = ({ title, apiFn }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [resultData, setResultData] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const oktoClient = useOkto();

    const handleButtonClick = async () => {
        setLoading(true);
        try {
            const result = await apiFn(oktoClient);
            console.log(`${title}:`, result);
            setResultData(JSON.stringify(result, null, 2) || "No result");
        } catch (error) {
            console.error(`${title} error:`, error);
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";
            setResultData(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
            setModalVisible(true);
        }
    };

    return (
        <div className="text-center text-white">
            <button
                className="px-4 py-2 w-full bg-blue-500 text-white rounded disabled:opacity-50"
                onClick={handleButtonClick}
                disabled={loading}
            >
                {loading ? "Loading..." : title}
            </button>

            {modalVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="bg-black rounded-lg w-11/12 max-w-2xl p-6">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h2 className="text-lg font-semibold">{title} Result</h2>
                            <button
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setModalVisible(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="text-left text-white max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap break-words text-white">
                                {resultData}
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
};

export default GetButton;