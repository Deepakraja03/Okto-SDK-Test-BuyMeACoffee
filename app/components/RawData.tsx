"use client"
import { evmRawTransaction, useOkto } from '@okto_web3/react-sdk';
import { encodeFunctionData } from 'viem';
import { useState } from 'react';

// RawTransaction component
export default function RawData() {
  const oktoClient = useOkto();

  // State to manage input value and transaction result
  
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-8 bg-clip-text text-white bg-gradient-to-r from-gray-700 to-gray-400">
              Raw Transaction
            </h1>
          </div>

          <div className="space-y-6 flex flex-col items-center">
            <p className="text-white">Enter a number to be used in the transaction.</p>

            {/* Input for the number */}
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              className="px-4 py-2 bg-white text-black rounded-lg"
              placeholder="Enter a number"
            />

            {/* Button to trigger the raw transaction */}
            <button
              onClick={handleRawTransaction}
              className="px-6 py-3 bg-black text-white rounded-lg font-bold shadow-lg hover:bg-white hover:text-black hover:shadow-xl transform hover:scale-105 transition-all duration-200 mt-4"
            >
              Execute Raw Transaction
            </button>

            {/* Display Transaction Result */}
            {transactionResult && (
              <div className="mt-4 text-white">
                <p>{transactionResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}