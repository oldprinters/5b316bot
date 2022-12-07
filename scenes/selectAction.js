import {Telegraf, Markup, Scenes, session} from "telegraf"
import QueryAdmin from "../controllers/queryAdmin.js"
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
    const isAdmin = ctx.session.classList[ctx.session.i].isAdmin
    let nRequest = false
    if(isAdmin){
        const queryAdmin = new QueryAdmin()
        const arrRequest = await queryAdmin.getRequests(ctx.from.id, ctx.session.class_id)
//        console.log("@@@ arrRequest =", arrRequest)
        nRequest = arrRequest.length > 0
    }
    if(nLessons){
        const list = await getSheduleToday(ctx)
        if(list.length > 0){
            const d = new Date()
            
            await ctx.replyWithHTML(`<b>Расписание на сегодня</b> <i>(${urDay.getNameDay(d.getDay())})</i>:`)
            await ctx.replyWithHTML(list)
        } else {
            await ctx.reply('Для продолжения необходимо ввести расписание.')
        }
    } else {
        await ctx.reply('Для продолжения необходимо внести время начала уроков.')
    }
    await ctx.reply('Выберите действие:', selectShedActionMenu(nLessons, ctx.session.classList.length, ctx.session.classList[ctx.session.i].isAdmin, nRequest))
})
//-------------
selectAction.help(ctx => {
    ctx.replyWithHTML('<b><u>Основное меню</u></b>\n' +
        'Выберите нужный пункт меню. Далее следуйте указаниям.'
    )
})
//-------------
selectAction.action('viewSheduleDay', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('VIEW_SHEDULE')
})
//-------------
selectAction.action('viewRequests', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('PROCESS_REQUESTS')
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
