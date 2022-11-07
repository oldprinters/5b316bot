import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'

const createClass = new Scenes.BaseScene('CREATE_CLASS')
createClass.enter(async ctx => {
    await ctx.setMyCommands([{command: 'start', description: 'Перезапустить'}])
    await ctx.reply('Мы в классе')
})

export default createClass