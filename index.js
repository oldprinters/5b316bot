import {Telegraf} from "telegraf"
import {Markup} from "telegraf";
import {appendUser} from './components/appendUser.js'

import {query} from './config/query.js'
//const getMainMenu = () => {
//    return Markup.keyboard([['One'], ['Too'], ['Three']]).resize().expra()
//}

const f = async () => {
    const res = await query("show tables;")
    console.log("@@@ res =", res)
}
//f()
const bot = new Telegraf("5489794456:AAF89kL1SsQVK2-axyWO8VdARI8rlfAVxdM");

bot.start( ctx => ctx.reply("Start command."));
bot.help( ctx => ctx.reply("help commands: day, /d, /dd"));
bot.settings( ctx => ctx.reply("settings command."));

bot.command('stop', ctx => ctx.reply("stop command."))
bot.command('d', ctx => ctx.reply("day command."))

bot.hears('dd', ctx => ctx.reply("dd command."))
bot.hears('day', async ctx => {
    // ctx.reply(Date())
    //console.log("@@@@", ctx.from)
    const res = await appendUser(ctx.from.id)
    ctx.reply(res)
})

//getMainMenu()

bot.launch()
    .then(res => {
        console.log('Started')
    }).catch ( err => {
        console.log('Error', err)
    })
