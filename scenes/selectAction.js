import {Telegraf, Markup, Scenes, session} from "telegraf"
import QueryAdmin from "../controllers/queryAdmin.js"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import UrDay from '../controllers/urDay.js'
import { selectShedActionMenu, selectActionAdminMenu, selectActionUserMenu } from '../keyboards/keyboards.js'
import { getDateTimeBD, getRoleName, getSheduleToday, helpForSearch, 
    outDate, outTimeDate, outSelectedDay, outDateTime, outTextRem, 
    remForDay, searchByLessonName, selectDay } from '../utils.js'

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
        const eC = new EventsClass(ctx)

        let list = await getSheduleToday(ctx)
        list += await eC.listForDayUser()

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
    ctx.replyWithHTML('<b><u>Основное меню слева от поля ввода</u></b>\n' +
        '/start - перезапуск бота\n/settings - настройки расписания\n' +
        '/remember - установка нвпоминалок\n\n' +
        '<u>Планирование:</u>\n дд.мм.гггг чч:мм [сообщение]\nдд.мм чч:мм [сообщение]\nчч:мм [сообщение] - на текущий день\nзавтра в чч:мм [сообщение]\n'+
        '<u>Отложенное сообщение:</u>\nMM мин [сообщение] - <i>сообщение через несколько минут</i>\n' +
        'ЧЧ час [сообщение] - <i>отложить на несколько часов</i>\n\nСписок - вывод списка активных напоминалок. (list тоже работает)\n\n'+
        'Каждый(ую, ое) [день недели] в ЧЧ:ММ ТЕКСТ - еженедельное напоминание.\n <i>Каждое воскресенье в 19:00 проверить форму.</i>\n'+
        '<b>Удаление напоминалок</b> - Меню -> Напоминалки -> Удаление напоминалок\n\n'+
        '"rem" - переход в напоминалки\n\n' +
        helpForSearch()
    )
})
//-------------
selectAction.action('viewSheduleDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('VIEW_SHEDULE')
})
//-------------
selectAction.action('viewRequests', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('PROCESS_REQUESTS')
})
//-------------
selectAction.action('selectClass', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('SELECT_CLASS')
})
//---------
selectAction.action('setTimesUr', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('SET_TIMES_UR')
})
//---------
selectAction.action('setSheduleDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('SET_SHEDULE_DAY')
})
//---------
selectAction.action('getClassInfo', async ctx => {
    await ctx.answerCbQuery('Loading')
    const cL = ctx.session.classList[ctx.session.i]
    await ctx.replyWithHTML(`<i>Название класса:</i> "${cL.name}"\n<i>Длительность урока:</i> "${cL.duration.slice(0,5)}"\n<i>Ваша роль:</i> "${getRoleName(cL.role)}"`)
    await ctx.scene.reenter()
})
//----------------------
selectAction.action('appendClass', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('CREATE_CLASS')
})

selectAction.start( async ctx => {
    await ctx.scene.enter('FIRST_STEP')
})
//-------------------------------------------------
selectAction.action('additionalLessons', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('ADDITIONAL_LESSONS')
})
//-------------------------------------------------
selectAction.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//-------------------------------------------------
selectAction.command('settings', async ctx => { 
    if(ctx.session.isAdmin == 1)
        await ctx.reply('Административное меню:', selectActionAdminMenu())
    else {
        await ctx.reply('Вы можете:', selectActionUserMenu())
    }
})
//-------------------------------------------------
selectAction.command('remember', ctx => { 
    ctx.scene.enter('REMEMBER')
})
//--------------------------------------
selectAction.hears(/^\d{1,2}\.\d{1,2}\.\d{2,4} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2).replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p2 + 1)
    const arD = dateE.split('.')
    const date = new Date(`${arD[2]}-${arD[1]}-${arD[0]} ${timeE}`)
    outTextRem(ctx, date, textE)
})
//--------------------------------------
selectAction.hears(/^\d{1,2}\.\d{1,2} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2).replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p2 + 1)
    const arD = dateE.split('.')
    const arT = timeE.split(':')
    const date = new Date()
    date.setDate(arD[0])
    date.setMonth(arD[1] - 1)
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const now = new Date()
    if(now > date)
        date.setFullYear(date.getFullYear() + 1)
    outTextRem(ctx, date, textE)
})
//--------------------------------------
selectAction.hears(/^\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const timeE = ctx.match[0].slice(0, p1).replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p1 + 1)
    const arT = timeE.split(':')
    const date = new Date()
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const nDate = new Date()
    if(nDate > date){
        date.setDate(date.getDate() + 1)
    }
    outTextRem(ctx, date, textE)
})
//--------------------------------------
selectAction.hears(/^\d{1,2} (мин)([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setMinutes(date.getMinutes() + parseInt(dt))
    outTextRem(ctx, date, textE)
})
//--------------------------------------
selectAction.hears(/^\d{1,2} (час)([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setHours(date.getHours() + parseInt(dt))
    outTextRem(ctx, date, textE)
})
//------------------------------------------ обрабатываем каждый день недели 
selectAction.hears(/^(кажд|Кажд)(ый|ую|ое)\s(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)\s(в )?\d{1,2}[:жЖ]\d{1,2} [ _.,а-яА-ЯйЙa-zA-Z0-9]*/, 
    async (ctx, next) => {
        await remForDay(ctx, next)
})
//-------------------------------------------
//------------------------------------------
selectAction.on('text', async (ctx, next) => {
    if(!(await searchByLessonName(ctx)))
        next()
})


export default selectAction
