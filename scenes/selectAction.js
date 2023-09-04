import {Telegraf, Markup, Scenes, session} from "telegraf"
import QueryAdmin from "../controllers/queryAdmin.js"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import UrDay from '../controllers/urDay.js'
import { selectShedActionMenu, selectActionAdminMenu, selectActionUserMenu } from '../keyboards/keyboards.js'
import { 
    dayToRem, getRoleName, getSheduleToday, helpForSearch, everyMonth, everyYear,
    fullToRem, dmhmToRem, nHoursToRem, nHMtoRem, nMinutesToRem, outSelectedDay, outDateTime, 
    remForDay, searchByLessonName, tomorrowRem 
} from '../utils.js'

const selectAction = new Scenes.BaseScene('SELECT_ACTION')
//--------------------------------------
selectAction.enter(async ctx => {
    const eC = new EventsClass(ctx)
    if(ctx.session.i >=0){
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
        // await ctx.reply('Выберите действие:', selectShedActionMenu(nLessons, ctx.session.classList.length, ctx.session.classList[ctx.session.i].isAdmin, nRequest))
    } else {
        const list = await eC.listForDayUser()
        if(list.length == 0)
            await ctx.reply('На сегодня ничего не запланировано.')
        else 
            await ctx.replyWithHTML(`${list}`)
    }
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
            arOut += `${el.cycle?'<u>':''}${outDateTime(el.dateTime)}${el.cycle?'</u>':''} ${el.text}\n`
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
        '/start - перезапуск бота\n/settings - настройки расписания\n\n' +
        '<u><b>Планирование:</b></u>\nдд.мм.гггг чч:мм [сообщение]\nдд.мм чч:мм [сообщение]\nчч:мм [сообщение] - на текущий день\nзавтра в чч:мм [сообщение]\n'+
        '[День недели] чч:мм [сообщение] - напоминалка на ближайший день недели.\n'+
        '<u>Отложенное сообщение:</u>\nMM мин [сообщение] - <i>сообщение через несколько минут</i>\n' +
        'ЧЧ час [сообщение] - <i>отложить на несколько часов</i>\n\nСписок - вывод списка активных напоминалок. (list тоже работает)\n\n'+
        '<b>Повторяющиеся напоминания:</b>\n'+
        'Каждый(ую, ое) [день недели] в ЧЧ:ММ ТЕКСТ - еженедельное напоминание.\n<i>Каждое воскресенье в 19:00 проверить форму.</i>\n'+
        'Повтор [дд.мм] [чч:мм] [сообщение] - ежегодное напоминание\n'+
        '<i>Повтор 4.02 10:00 др Лёни</i> - напоминалки о днях рождения\n'+
        'Повтор [дд] [чч:мм] [сообщение] - ежемесячное напоминание\n'+
        '<i>Повтор 6 11:05 оплатить телефон</i> - ежемесячная оплата 6-го числа.\n\n'+
        '<b><u>Удаление напоминалок</u></b> - Меню -> Напоминалки -> Удаление напоминалок\n\n'+
        helpForSearch(ctx)
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
//------------------------------------------- каждый месяц 
selectAction.hears(/^[пП](овтор) \d{1,2} (в )?\d{1,2}[:жЖ]\d{1,2} ([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await everyMonth(ctx)
})
//------------------------------------------- каждый год
selectAction.hears(/^[пП](овтор) \d{1,2}.\d{1,2} (в )?\d{1,2}[:жЖ]\d{1,2} ([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await everyYear(ctx)
})
//-------------------------------------- дата с годом однократно
selectAction.hears(/^\d{1,2}\.\d{1,2}\.\d{2,4} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await fullToRem(ctx)
})
//-------------------------------------- дата однократно
selectAction.hears(/^\d{1,2}\.\d{1,2} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await dmhmToRem(ctx)
})
//--------------------------------------
selectAction.hears(/^\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await nHMtoRem(ctx)
})
//--------------------------------------
selectAction.hears(/^\d{1,2} (мин)([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await nMinutesToRem(ctx)
})
//--------------------------------------
selectAction.hears(/^\d{1,2} (час)([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await nHoursToRem(ctx)
})
//------------------------------------------ обрабатываем каждый день недели 
selectAction.hears(/^(кажд|Кажд)(ый|ую|ое)\s(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)\s(в )?\d{1,2}[:жЖ]\d{1,2} [ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>]*/, 
    async (ctx, next) => {
        await remForDay(ctx, next)
})
//-------------------------------------------
selectAction.hears(/^(завтра|Завтра) (в )?\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await tomorrowRem(ctx)
})
//--------------------------------------
selectAction.on('text', async (ctx) => {
    try {
        await dayToRem(ctx)
    } catch (err) {
        if(!(await searchByLessonName(ctx)))
            await ctx.reply('Не понял запрос, извините.')
    }
})

export default selectAction
