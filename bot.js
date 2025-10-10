import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import { getBestTokenInfo } from './services/tokenFallback.js';

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
console.log('🤖 Sol Trading Bot started...');

const solanaAddrRe = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text || !solanaAddrRe.test(text)) return;

  bot.sendMessage(chatId, `🔍 Fetching token info for:\n<code>${text}</code>`, {
    parse_mode: 'HTML'
  });

  const info = await getBestTokenInfo(text);

  if (!info) {
    bot.sendMessage(chatId, '❌ Could not fetch token info for this CA.');
    return;
  }

  const reply = `
💎 <b>${info.symbol}</b> — ${info.name}
📡 <b>Source:</b> ${info.source}

💰 <b>Price:</b> $${Number(info.priceUsd).toFixed(6)}
💧 <b>Liquidity:</b> $${Number(info.liquidityUsd).toLocaleString()}
📊 <b>24h Volume:</b> $${Number(info.volume24hUsd).toLocaleString()}

🔗 <a href="${info.url}">View Details</a>
  `;

  bot.sendMessage(chatId, reply.trim(), {
    parse_mode: 'HTML',
    disable_web_page_preview: true
  });
});
