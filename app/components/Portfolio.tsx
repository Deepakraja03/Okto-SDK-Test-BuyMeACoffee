import { getPortfolio, getPortfolioActivity, useOkto } from "@okto_web3/react-sdk";

const Portfolio = () => {
    const oktoClient = useOkto();

    async function fetchPortfolio() {
        try {
            const portfolio = await getPortfolio(oktoClient);
            console.log('Portfolio data:', portfolio);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        }
    }

    async function fetchActivity() {
        try {
            const activities = await getPortfolioActivity(oktoClient);
            console.log('Portfolio activities:', activities);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }




  return (
    <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-8">
        <button 
            className="border border-transparent rounded px-4 py-2 transition-colors bg-blue-500 hover:bg-blue-700 text-white"
            onClick={fetchPortfolio}>
            Fetch Portfolio
        </button>
        
        <button 
            className="border border-transparent rounded px-4 py-2 transition-colors bg-blue-500 hover:bg-blue-700 text-white"
            onClick={fetchActivity}>
            Fetch Portfolio Activity
        </button>
    </div>
  )
}

export default Portfolio;