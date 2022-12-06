import {Telegraf, Markup, Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import UrDay from '../controllers/urDay.js'
import {selectShedActionMenu} from '../keyboards/keyboards.js'
import { getRoleName, getSheduleToday } from '../utils.js'

const selectAction = new Scenes.BaseScene('SELECT_ACTION')
//--------------------------------------
selectAction.enter(async ctx => {
    const urDay = new UrDay()
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    console.log("#### nLessons =", nLessons)
    if(nLessons){
        const list = await getSheduleToday(ctx)
        if(list.length > 0){
            await ctx.replyWithHTML(`<b>Расписание на сегодня:</b>`)
            await ctx.replyWithHTML(list)
        }
    }
    await ctx.reply('Для продолжения необходимо внести время начала уроков:', selectShedActionMenu(nLessons, ctx.session.classList.length))
})
//-------------
selectAction.action('selectClass', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('SELECT_CLASS')
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
    await ctx.replyWithHTML(`<i>Название класса:</i> "${cL.name}"\n<i>Длительность урока:</i> "${cL.duration.slice(0,5)}"\n<i>Ваша роль:</i> "${getRoleName(cL.role)}"`)
    await ctx.scene.reenter()
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
