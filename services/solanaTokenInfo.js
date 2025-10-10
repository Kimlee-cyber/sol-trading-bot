import { getDexInfo } from './dexScreener.js';
import { getJupiterInfo } from './solanaTokenInfo.js';
import axios from 'axios';

export async function getBestTokenInfo(mintAddress) {
  let info = null;

  // 1. Try DEX Screener
  try {
    info = await getDexInfo(mintAddress);
    if (info) {
      console.log(`✅ DEX Screener success for ${mintAddress}`);
      return {
        source: 'DEX Screener',
        ...info
      };
    }
  } catch (err) {
    console.warn(`❌ DEX Screener failed: ${err.message}`);
  }

  // 2. Try Jupiter
  try {
    const jupiterData = await getJupiterInfo(mintAddress);
    if (jupiterData) {
      console.log(`✅ Jupiter fallback success for ${mintAddress}`);
      return {
        source: 'Jupiter',
        ...jupiterData
      };
    }
  } catch (err) {
    console.warn(`❌ Jupiter fallback failed: ${err.message}`);
  }

  // 3. Try Solana RPC for metadata only
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL;
    const res = await axios.post(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [mintAddress, { encoding: 'jsonParsed' }]
    });

    if (res.data?.result?.value?.data?.parsed?.info) {
      const meta = res.data.result.value.data.parsed.info;
      console.log(`✅ RPC metadata success for ${mintAddress}`);
      return {
        source: 'Solana RPC',
        symbol: meta.symbol || '???',
        name: meta.name || 'Unknown Token',
        priceUsd: 0,
        liquidityUsd: 0,
        volume24hUsd: 0,
        url: `https://solscan.io/token/${mintAddress}`
      };
    }
  } catch (err) {
    console.warn(`❌ RPC fallback failed: ${err.message}`);
  }

  console.warn(`⚠️ All data sources failed for ${mintAddress}`);
  return null;
}
