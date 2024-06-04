import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.MINI_APP_TOKEN;
const APP_LINK = process.env.APP_LINK;

const bot = new Telegraf(TOKEN);
console.log('Mini App Bot Ready!');

bot.start((ctx) =>
    ctx.reply('Welcome To Open Graph', {
        reply_markup: {
            keyboard: [[{ text: 'Open Graph App', web_app: { url: APP_LINK } }]],
        },
    })
);

bot.help((ctx) => ctx.reply('Send me a sticker'));

bot.on(message('sticker'), (ctx) => ctx.reply('👍'));

bot.hears('hi', (ctx) => ctx.reply('Hey there'));

bot.launch();
