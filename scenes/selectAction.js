import {Telegraf, Markup, Scenes, session} from "telegraf"
import QueryAdmin from "../controllers/queryAdmin.js"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import UrDay from '../controllers/urDay.js'
import { selectShedActionMenu, selectActionAdminMenu, selectActionUserMenu } from '../keyboards/keyboards.js'
import { getRoleName, getSheduleToday, helpForSearch, outSelectedDay, outDateTime, searchByLessonName } from '../utils.js'

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
        nRequest = arrRequest.length > 0
    }
    if(nLessons){
        const list = await getSheduleToday(ctx)
        if(list.length > 0){
            const d = new Date()
            await ctx.replyWithHTML(`<b>Расписание на сегодня</b> <i>(${urDay.getNameDay(d.getDay())})</i>:\n\n${list}`)
            //await ctx.replyWithHTML(list)
        } else {
            await ctx.reply('На сегодня расписание отсутствует.')
        }
        const d = new Date()
        if(d.getHours() > 15){
            const nDay = d.getDay()
            await outSelectedDay(ctx, nDay + 1)
        }
    } else {
        await ctx.reply('Для продолжения необходимо внести время начала уроков.')
    }
    await ctx.reply('Выберите действие:', selectShedActionMenu(nLessons, ctx.session.classList.length, ctx.session.classList[ctx.session.i].isAdmin, nRequest))
})
//--------------------------------------
selectAction.hears(/^(Список|список|list|List)$/, async ctx => {
    const eC = new EventsClass(ctx)
    const list = await eC.listForUser()
    if(list.length == 0){
        ctx.reply('Нет запланированных напоминалок.')
    } else {
        let arOut = ''
        for(let el of list){
            arOut += `${outDateTime(el.dateTime)} ${el.text}\n`
        }
        ctx.replyWithHTML(`Список напоминалок:\n${arOut}`)
    }
})
//-------------
selectAction.hears(/^(rem|Rem|напоминалки|Напоминалки)$/, ctx => {
    return ctx.scene.enter('FREE_WORDS')
})
//-------------------------------------------------
selectAction.help(ctx => {
    ctx.replyWithHTML('<b><u>Основное меню</u></b>\n' +
        'Выберите нужный пункт меню. Далее следуйте указаниям.\n' +
        helpForSearch()
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

selectAction.start( async ctx => {
    await ctx.scene.enter('FIRST_STEP')
})
//-------------------------------------------------
selectAction.action('additionalLessons', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('ADDITIONAL_LESSONS')
})
//-------------------------------------------------
selectAction.command('settings', async ctx => { 
    if(ctx.session.isAdmin == '1')
        await ctx.reply('Административное меню:', selectActionAdminMenu())
    else {
        await ctx.reply('Вы можете:', selectActionUserMenu())
    }
})
//-------------------------------------------------
selectAction.command('remember', ctx => { 
    ctx.scene.enter('REMEMBER')
})
//------------------------------------------
selectAction.on('text', async ctx => {
    await searchByLessonName(ctx)
})

export default selectAction
