import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DEX_API = process.env.DEX_API;
const JUPITER_API = process.env.JUPITER_API;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;

// Try DEX Screener first, then Jupiter, then RPC fallback
export async function getBestTokenInfo(address) {
  // 1️⃣ Try DEX Screener
  try {
    const dexRes = await axios.get(`${DEX_API}${address}`);
    const data = dexRes.data.pairs?.[0];
    if (data) {
      return {
        source: "DEX Screener",
        name: data.baseToken.name,
        symbol: data.baseToken.symbol,
        priceUsd: data.priceUsd,
        liquidityUsd: data.liquidity?.usd,
        volume24hUsd: data.volume?.h24,
        url: data.url,
      };
    }
  } catch (err) {
    console.warn("DEX Screener failed:", err.message);
  }

  // 2️⃣ Try Jupiter API
  try {
    const jupRes = await axios.get(`${JUPITER_API}?ids=${address}`);
    const jupData = jupRes.data.data?.[address];
    if (jupData) {
      return {
        source: "Jupiter",
        name: jupData.name || "Unknown",
        symbol: jupData.symbol || "???",
        priceUsd: jupData.price,
        liquidityUsd: 0,
        volume24hUsd: 0,
        url: `https://jup.ag/swap/SOL-${address}`,
      };
    }
  } catch (err) {
    console.warn("Jupiter API failed:", err.message);
  }

  // 3️⃣ Fallback: basic RPC lookup
  try {
    const res = await axios.post(SOLANA_RPC_URL, {
      jsonrpc: "2.0",
      id: 1,
      method: "getAccountInfo",
      params: [address, { encoding: "jsonParsed" }],
    });
    if (res.data.result) {
      return {
        source: "RPC",
        name: "Unknown",
        symbol: "???",
        priceUsd: 0,
        liquidityUsd: 0,
        volume24hUsd: 0,
        url: `https://solscan.io/token/${address}`,
      };
    }
  } catch (err) {
    console.warn("RPC fallback failed:", err.message);
  }

  return null;
}
