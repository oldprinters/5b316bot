import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectClassMenu} from '../keyboards/keyboards.js'

const selectClass = new Scenes.BaseScene('SELECT_CLASS')
//--------------------------------------
selectClass.enter(async ctx => {
    ctx.reply('Выберите класс.', selectClassMenu(ctx.session.classList))
})
//----------------------------------------
selectClass.action(/[0-9]*/, async ctx => {
    await ctx.answerCbQuery()
    ctx.session.i = ctx.callbackQuery.data.match(/[0-9]$/)[0]
    ctx.session.class_id = ctx.session.classList[ctx.session.i].class_id
    ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------
selectClass.start( ctx => ctx.scene.enter('SELECT_ACTION'))

export default selectClass