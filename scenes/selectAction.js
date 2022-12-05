import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectShedActionMenu} from '../keyboards/keyboards.js'
import { getSheduleToday } from '../utils.js'

const selectAction = new Scenes.BaseScene('SELECT_ACTION')
//--------------------------------------
selectAction.enter(async ctx => {
    const list = await getSheduleToday(ctx)
    await ctx.replyWithHTML(`<b>Расписание на сегодня:</b>`)
    await ctx.replyWithHTML(list)
    await ctx.reply('Выберите дальнейшее действие:', selectShedActionMenu())
})
//---------
selectAction.action('setTimesUr', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('SET_TIMES_UR')
})
//---------
selectAction.action('setSheduleDay', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('SET_SHEDULE_DAY')
})
//---------
selectAction.action('getClassInfo', async ctx => {
    await ctx.answerCbQuery()
    const cL = ctx.session.classList[ctx.session.i]
    ctx.reply(`Название класса: "${cL.name}"\nДлительность урока: "${cL.duration.slice(0,5)}"\nВаша роль: "${cL.role}"`)
    ctx.scene.reenter()
})
//----------------------
selectAction.action('appendClass', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('CREATE_CLASS')
})

selectAction.on('text', async ctx => {ctx.scene.reenter()})
selectAction.start( async ctx => {return await ctx.scene.leave()})
selectAction.command('start', async ctx => { return await ctx.scene.leave()})

export default selectAction
