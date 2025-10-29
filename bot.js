// bot.js
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const MINI_APP_URL = 'https://thakur-mini-app.itzsubratahere.workers.dev'; // ← Tera Cloudflare URL

// /start
bot.start((ctx) => {
  ctx.reply('Welcome!\nPlease enter 10 digit mobile number 📞:');
});

// Number daalne pe
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;

  if (/^\d{10}$/.test(text)) {
    await ctx.replyWithMarkdownV2(
      `💎 *This Bot is on Premium Version now!* 💎\n\n` +
      `📢 To get info, please watch the ads.\n` +
      `⚡ Unlock instant access after ad completion!\n` +
      `🙏 Thank you for supporting us! ❤️\n\n`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: 'Watch & Get 🚀',
              web_app: { url: `${MINI_APP_URL}/?num=${text}` }
            }
          ]]
        }
      }
    );
  } else {
    ctx.reply('Galat number! Sirf 10 digit daal.');
  }
});

// Vercel Webhook Handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal error' });
    }
  } else {
    res.status(200).send(`
      <h1>Thakur Premium Bot</h1>
      <p>Status: <strong>Running</strong></p>
      <p>Webhook: <code>/api/webhook</code></p>
    `);
  }
};
