import axios from 'axios';

export async function getTokenInfo(mintAddress) {
  try {
    // Try Jupiter Price API (for basic token info)
    const priceUrl = `${process.env.JUPITER_API}?ids=${mintAddress}`;
    const priceRes = await axios.get(priceUrl);
    const tokenData = priceRes.data.data[mintAddress];

    if (!tokenData) return null;

    return {
      name: tokenData.name || 'Unknown Token',
      symbol: tokenData.symbol || '???',
      priceUsd: tokenData.price || 0,
      liquidityUsd: tokenData.liquidity || 0,
      volume24hUsd: tokenData.volume || 0
    };
  } catch (err) {
    console.error('Token info fetch error:', err.message);
    return null;
  }
}
