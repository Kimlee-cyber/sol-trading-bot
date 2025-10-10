import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { getBestTokenInfo } from "./tokenFallback.js";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log("✅ Sol Trading Bot has started...");

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  // Only react if message looks like a Solana CA
  if (!text || text.length < 30) return;

  bot.sendMessage(chatId, "🔍 Fetching token info...");

  try {
    const info = await getBestTokenInfo(text);

    if (!info) {
      return bot.sendMessage(chatId, "⚠️ Token not found or no market data available.");
    }

    const reply = `
📊 *${info.name}* — ${info.symbol}

💰 *Price:* $${Number(info.priceUsd).toFixed(6)}
💧 *Liquidity:* $${info.liquidityUsd ? "$" + info.liquidityUsd.toLocaleString() : "N/A"}
📈 *24h Volume:* $${info.volume24hUsd ? info.volume24hUsd.toLocaleString() : "N/A"}

🟢 *Source:* ${info.source}
🔗 [View Chart](${info.url})
    `;

    bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ Error fetching token info.");
  }
});
