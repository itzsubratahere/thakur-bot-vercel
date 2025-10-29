// bot.js
const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);
let userNumbers = {};

// /start
bot.start((ctx) => {
  ctx.reply('Welcome! Apna 10 digit mobile number daal:');
});

// Number daalne pe
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;

  if (/^\d{10}$/.test(text)) {
    userNumbers[userId] = text;

    await ctx.replyWithMarkdownV2(
      `*This Bot is on Premium Version now\\!* \n\nTo get info, please watch the ads`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: 'Watch & Get',
              web_app: { url: `https://thakur-mini-app.itzsubratahere.workers.dev/?num=${text}` }
            }
          ]]
        }
      }
    );
  } else {
    ctx.reply('Galat number! Sirf 10 digit daal.');
  }
});

// Mini App se signal
bot.on('web_app_data', async (ctx) => {
  try {
    const data = JSON.parse(ctx.webAppData.data);
    const userId = ctx.from.id;
    const savedNum = userNumbers[userId];

    if (data.action === 'ads_complete' && data.num === savedNum) {
      await ctx.reply('Ad complete! Info bhej raha hoon...');

      // bot.js (sirf yeh line change kar)
const res = await axios.get(`https://thakur-pd.kro7836k.workers.dev/?num=${data.num}`);
      const results = res.data.data?.data;

      if (!results || results.length === 0) {
        return ctx.reply('Koi info nahi mila.');
      }

      let message = `*Found ${results.length} record(s) for ${data.num}:*\n\n`;
      results.forEach((entry, i) => {
        const isMain = entry.mobile === data.num;
        message += `${isMain ? 'Main' : `Entry ${i + 1}`}:\n`;
        message += `┌ *Name:* ${escape(entry.name || 'N/A')}\n`;
        message += `├ *Father:* ${escape(entry.fname || 'N/A')}\n`;
        message += `├ *Mobile:* \`${entry.mobile}\`\n`;
        if (entry.email) message += `├ *Email:* ${escape(entry.email)}\n`;
        message += `└ *Address:* ${escape(entry.address || 'N/A')}\n\n`;
      });

      const chunks = splitMessage(message, 4000);
      for (const chunk of chunks) {
        await ctx.replyWithMarkdownV2(chunk);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    await ctx.reply('Kuch galat hua. Try again.');
  }
});

// ESCAPE
function escape(t) {
  return t ? t.toString().replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1') : 'N/A';
}

// SPLIT MESSAGE
function splitMessage(text, max) {
  if (text.length <= max) return [text];
  const parts = [];
  let current = '';
  const lines = text.split('\n');
  for (const line of lines) {
    if ((current + line + '\n').length > max) {
      parts.push(current.trim());
      current = line + '\n';
    } else {
      current += line + '\n';
    }
  }
  if (current) parts.push(current.trim());
  return parts;
}

// VER CEL HANDLER (WEBHOOK)
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
    }
  } else {
    res.status(200).json({ status: 'Bot is running', node: process.version });
  }
};
