// bot.js
const { Telegraf } = require('telegraf');

// CONFIG — ADMIN ID HARD-CODED
const BOT_TOKEN = process.env.BOT_TOKEN || '8322599187:AAH79FQerisiK7cXnMfKXWX5yn-2NqOTH6c';
const ADMIN_ID = 1996765485; // ← YOUR ADMIN USER ID
const MINI_APP_URL = 'https://thakur-mini-app.itzsubratahere.workers.dev';

const bot = new Telegraf(BOT_TOKEN);

// /start command
bot.start((ctx) => {
  ctx.reply('Welcome!\nPlease enter your 10 digit mobile number 📞:');
});

// Handle text input (mobile number)
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;

  if (/^\d{10}$/.test(text)) {
    // Send Premium message + Watch Ads button
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

    // ADMIN LOG: Number entered
    await sendAdminLog(ctx, text, 'entered');

  } else {
    ctx.reply('❌ Please enter a valid 10-digit mobile number.');
  }
});

// Handle Mini App signal
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);

    if (data.action === 'ads_complete') {
      await ctx.reply('✅ Ad complete! Fetching your info...');

      // ADMIN LOG: Ad Completed
      await sendAdminLog(ctx, data.num, 'ad_completed');
    }
  } catch (err) {
    await ctx.reply('⚠️ Error: ' + err.message);
  }
});

// ADMIN LOG FUNCTION
async function sendAdminLog(ctx, number, action) {
  const user = ctx.from;
  const time = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  let status = '';
  let title = '';

  if (action === 'entered') {
    status = '📱 Number Entered';
    title = '*New Number Search*';
  } else if (action === 'ad_completed') {
    status = '📺 Ad Watched';
    title = '*Ad Completed*';
  }

  const logMessage = `
${title}
${status}
👤 *User:* ${user.first_name || 'N/A'} (@${user.username || 'N/A'})
🆔 User ID: \`${user.id}\`
📞 Number: \`${number}\`
🕒 Time: ${time}
  `.trim();

  try {
    await bot.telegram.sendMessage(ADMIN_ID, logMessage, { parse_mode: 'MarkdownV2' });
  } catch (err) {
    console.error('Failed to send admin log:', err.message);
  }
}

// Vercel Webhook Handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true, message: 'Webhook received' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal error', details: error.message });
    }
  } else {
    res.status(200).send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background: #f0f2f5; color: #333;">
        <h1>Thakur Premium Bot</h1>
        <p><strong>Status:</strong> ✅ Running</p>
        <p><strong>Admin ID:</strong> <code>${ADMIN_ID}</code></p>
        <p><strong>Webhook:</strong> <code>/api/webhook</code></p>
        <p><strong>Admin Logs:</strong> Enabled</p>
        <p>Made with ❤️ by @Numberinfofinderbot</p>
      </div>
    `);
  }
};

// Local Testing (Polling Mode)
if (process.env.NODE_ENV !== 'production') {
  bot.launch();
  console.log('🤖 Bot started in polling mode (local)');
}
