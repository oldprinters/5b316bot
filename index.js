import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from './controllers/users.js'
import MyClass from './controllers/classes.js'
//const getMainMenu = () => {
//    return Markup.keyboard([['One'], ['Too'], ['Three']]).resize().expra()
//}

import createClass from './scenes/createClass.js'

const stage = new Scenes.Stage([createClass])

const bot = new Telegraf("5489794456:AAF89kL1SsQVK2-axyWO8VdARI8rlfAVxdM");
bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
    ctx.reply("Start command.")
    const myClass = new MyClass(ctx)
    await myClass.init()
    const res = await myClass.searchClasses()
    if(res == 0){
        console.log("@@@@ res =", res)
        ctx.scene.enter('CREATE_CLASS')
    }
});
bot.help( ctx => ctx.reply("help commands: day, /d, /dd"));
bot.settings( ctx => ctx.reply("settings command."));

bot.command('stop', ctx => ctx.reply("stop command."))
bot.command('d', ctx => ctx.reply("day command."))

bot.hears('dd', ctx => ctx.reply("dd command."))

//getMainMenu()

bot.launch()
    .then(res => {
        console.log('Started')
    }).catch ( err => {
        console.log('Error', err)
    })
