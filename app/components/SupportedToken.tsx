import { getChains, useOkto } from '@okto_web3/react-sdk';
import { getTokens } from '@okto_web3/react-sdk';
 
export function TokensList() {
    const oktoClient = useOkto();
 
    async function fetchTokens() {
        try {
            const tokens = await getTokens(oktoClient);
            console.log('Supported tokens:', tokens);
        } catch (error) {
            console.error('Error fetching tokens:', error);
        }
    }
 
    return (
        <button onClick={fetchTokens}>
            Fetch Supported Tokens
        </button>
    );
}

export function ChainsList() {
    const oktoClient = useOkto();
 
    async function fetchChains() {
        try {
            const chains = await getChains(oktoClient);
            console.log('Supported chains:', chains);
        } catch (error) {
            console.error('Error fetching chains:', error);
        }
    }
 
    return (
        <button onClick={fetchChains}>
            Fetch Supported Chains
        </button>
    );
}
