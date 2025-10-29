// bot.js
const { Telegraf } = require('telegraf');

// Initialize Bot
const bot = new Telegraf(process.env.BOT_TOKEN);
const MINI_APP_URL = 'https://thakur-mini-app.itzsubratahere.workers.dev'; // Cloudflare mini-app

// /start
bot.start((ctx) => {
  ctx.reply('Welcome!❤️\nPlease enter 10 digit mobile number 📞');
});

// Number input handler
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  // Check for 10-digit mobile number
if (/^\d{10}$/.test(text)) {
  const titleHtml = '💎 <b>This Bot is on Premium Version now!</b> 💎';
  const bodyHtml = '📢 To get info, please watch the ads. ⚡ Unlock instant access after ad completion! 🙏 Thank you for supporting us ❤️';
  const msgHtml = `${titleHtml}<br>${bodyHtml}`; // ✅ Safe template literal

  await ctx.reply(msgHtml, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[
        {
          text: 'Watch & Get 🚀',
          web_app: { url: `${MINI_APP_URL}/?num=${text}` }
        }
      ]]
    }
  });
} else {
  await ctx.reply('❌ Please enter a valid 10-digit mobile number.');
}





});

// Webhook handler for Vercel
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Internal error' });
    }
  } else {
    // Web page for manual check
    res.status(200).send(`
      <h1>🤖 Thakur Premium Bot</h1>
      <p>Status: <strong>Running</strong></p>
      <p>Webhook Endpoint: <code>/api/webhook</code></p>
    `);
  }
};
