import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectClassMenu} from '../keyboards/keyboards.js'

const selectAction = new Scenes.BaseScene('SELECT_ACTION')
//--------------------------------------
selectAction.enter(async ctx => {
    console.log("ctx.session.classList = ", ctx.session.classList)
    ctx.reply('Выберите дальнейшее действие:')
})

selectAction.start( async ctx => {return await ctx.scene.leave()})
selectAction.command('start', async ctx => { return await ctx.scene.leave()})

export default selectAction
