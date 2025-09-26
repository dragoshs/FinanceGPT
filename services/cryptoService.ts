import { CryptoCoin, CryptoPrice } from '../types';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache supported coins in sessionStorage to avoid fetching on every load
let supportedCoinsCache: CryptoCoin[] | null = null;

export const fetchSupportedCoins = async (): Promise<CryptoCoin[]> => {
  if (supportedCoinsCache) {
    return supportedCoinsCache;
  }
  
  const cache = sessionStorage.getItem('top500Coins');
  if (cache) {
      supportedCoinsCache = JSON.parse(cache);
      return supportedCoinsCache!;
  }

  try {
    const fetchPage = async (page: number): Promise<CryptoCoin[]> => {
        const response = await fetch(`${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`);
        if (!response.ok) {
            throw new Error(`Failed to fetch top coins page ${page}`);
        }
        const data = await response.json();
        // Map the response to the CryptoCoin interface
        return data.map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol,
            name: coin.name,
        }));
    };

    // Fetch page 1 and 2 in parallel to get the top 500 coins
    const [page1, page2] = await Promise.all([
        fetchPage(1),
        fetchPage(2)
    ]);

    const top500Coins: CryptoCoin[] = [...page1, ...page2];
    
    supportedCoinsCache = top500Coins;
    sessionStorage.setItem('top500Coins', JSON.stringify(top500Coins));
    return top500Coins;

  } catch (error) {
    console.error('Error fetching top 500 supported coins:', error);
    return [];
  }
};

export const fetchCryptoPrices = async (
  coinIds: string[],
  vsCurrencies: string[]
): Promise<CryptoPrice | null> => {
  if (coinIds.length === 0 || vsCurrencies.length === 0) {
    return {};
  }

  try {
    const ids = coinIds.join(',');
    const currencies = vsCurrencies.join(',');
    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=${ids}&vs_currencies=${currencies.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }
    const data: CryptoPrice = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return null;
  }
};