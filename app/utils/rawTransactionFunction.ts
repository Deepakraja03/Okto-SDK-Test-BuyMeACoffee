import { OktoClient } from '@okto_web3/core-js-sdk';
import { evmRawTransaction } from '@okto_web3/react-sdk';
import { Abi, encodeFunctionData } from 'viem';
import { messageStorageAbi } from '../contract/MessageStorageabi';
 
const typedMessageStorageAbi: Abi = messageStorageAbi as Abi;

export const RawTransactionFunction = async(oktoClient: OktoClient, ciapId: string, userAddress: string, functionName: string, functionArgs: [string] | [], amount: bigint) => {

    const contractAddress = "0xf4fAA46a2cb1afE7D50d314A3464556d89a81015" as `0x${string}`;
    
    const functionData = encodeFunctionData({
    abi: typedMessageStorageAbi,
    functionName,
    args: functionArgs,
    });

    console.log("contract address", contractAddress);
    
    
    const rawTxParams = {
    caip2Id: ciapId,
    transaction: {
        from: userAddress as `0x${string}`,
        to: contractAddress,
        data: functionData,
        value: BigInt(amount),
    },
    };
    const result = await evmRawTransaction(oktoClient, rawTxParams);
    return result;
}