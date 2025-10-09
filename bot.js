import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { getTokenInfo } from './services/solanaTokenInfo.js';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log('🤖 Sol Trading Bot started...');

// Regex to match Solana contract addresses (base58 format)
const solanaAddrRe = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  // If message looks like a Solana address
  if (solanaAddrRe.test(text)) {
    bot.sendMessage(chatId, `🔍 Fetching token info for:\n<code>${text}</code>`, {
      parse_mode: 'HTML'
    });

    try {
      const info = await getTokenInfo(text);
      if (info) {
        const message = `
💎 <b>${info.symbol}</b> — ${info.name}

💰 <b>Price:</b> $${info.priceUsd}
💧 <b>Liquidity:</b> $${info.liquidityUsd}
📊 <b>24h Volume:</b> $${info.volume24hUsd}

🔗 <a href="https://dexscreener.com/solana/${text}">View Chart</a>
        `;
        bot.sendMessage(chatId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
      } else {
        bot.sendMessage(chatId, '❌ Could not fetch token info for this CA.');
      }
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '⚠️ Error fetching token details. Try again later.');
    }
  }
});
