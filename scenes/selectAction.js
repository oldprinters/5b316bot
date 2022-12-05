import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectShedActionMenu} from '../keyboards/keyboards.js'

const selectAction = new Scenes.BaseScene('SELECT_ACTION')
//--------------------------------------
selectAction.enter(async ctx => {
    ctx.reply('Выберите дальнейшее действие:', selectShedActionMenu())
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
//    await ctx.scene.enter('SET_SHEDULE_DAY')
    console.log("!@#", ctx.session.classList[ctx.session.i])
    const cL = ctx.session.classList[ctx.session.i]
    ctx.reply(`Название класса: "${cL.name}"\nДлительность урока: "${cL.duration.slice(0,5)}"\nВаша роль: "${cL.role}"`)
    ctx.scene.reenter()
})

selectAction.on('text', async ctx => {ctx.scene.reenter()})
selectAction.start( async ctx => {return await ctx.scene.leave()})
selectAction.command('start', async ctx => { return await ctx.scene.leave()})

export default selectAction
