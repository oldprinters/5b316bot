import {Scenes, session} from "telegraf"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
//import { queryYesNoMenu, selectRemember, selectLesson } from '../keyboards/keyboards.js'
//import UrDay from "../controllers/urDay.js"
import { dayToRem, outDateTime, remForDay, fullToRem, dmhmToRem, 
    nHoursToRem, nHMtoRem, nMinutesToRem, tomorrowRem, everyMonth, everyYear} from '../utils.js'

const freeWords  = new Scenes.BaseScene('FREE_WORDS')
//--------------------------------------
freeWords.enter(async ctx => {
        await ctx.reply('Когда и что? ( дд.мм.гггг чч:мм текст )')
})
//--------------------------------------
freeWords.help(ctx => {
    ctx.replyWithHTML('<u>Планирование:</u>\n дд.мм.уууу чч:мм [сообщение]\nдд.мм чч:мм [сообщение]\nчч:мм [сообщение] - на текущий день\nзавтра в чч:мм [сообщение]\n'+
    '[день недели] чч:мм [сообщение]\n'+
    '<u>Отложенное сообщение:</u>\nMM мин [сообщение] - <i>сообщение через несколько минут</i>\n' +
    'ЧЧ час [сообщение] - <i>отложить на несколько часов</i>\n\nсписок  - вывод списка активных напоминалок. (list тоже работает) ')
})
//--------------------------------------
freeWords.hears(/^(Список|список|list|List)$/, async ctx => {
    const eC = new EventsClass(ctx)
    const list = await eC.listForUser()
    if(list.length == 0){
        ctx.reply('Нет запланированных напоминалок.')
    } else {
        let arOut = ''
        for(let el of list){
            arOut += `${outDateTime(el.dateTime)} ${el.text}${el.cycle?' (c)':''}\n`
        }
        ctx.replyWithHTML(`Список напоминалок:\n${arOut}`)
    }
})
//--------------------------------------
freeWords.start( ctx => ctx.scene.enter('FIRST_STEP'))
//-------------------------------------------------
freeWords.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//-------------------------------------- dd.mm.yyyy hh:mm
freeWords.hears(/^\d{1,2}\.\d{1,2}\.\d{2,4} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await fullToRem(ctx)
})
//-------------------------------------- dd.mm hh:mm
freeWords.hears(/^\d{1,2}\.\d{1,2} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await dmhmToRem(ctx)
})
//-------------------------------------- hh:mm
freeWords.hears(/^\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await nHMtoRem(ctx)
})
//--------------------------------------
freeWords.hears(/^(завтра|Завтра) (в )?\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await tomorrowRem(ctx)
})
//--------------------------------------
freeWords.hears(/^\d{1,2} (мин)([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await nMinutesToRem(ctx)
})
//--------------------------------------
freeWords.hears(/^\d{1,2} (час)([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await nHoursToRem(ctx)
})
//-------------------------------------------------
freeWords.command('remember', async ctx => { 
    ctx.scene.reenter()
})
//------------------------------------------ обрабатываем каждый день недели 
freeWords.hears(/^(кажд|Кажд)(ый|ую|ое)\s(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)\s(в )?\d{1,2}[:жЖ]\d{1,2} [ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>]*/, 
    async (ctx, next) => {
        await remForDay(ctx, next)
})
//------------------------------------------- каждый месяц 
freeWords.hears(/^[пП](овтор) \d{1,2} (в )?\d{1,2}[:жЖ]\d{1,2} ([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await everyMonth(ctx)
})
//------------------------------------------- каждый год
freeWords.hears(/^[пП](овтор) \d{1,2}.\d{1,2} (в )?\d{1,2}[:жЖ]\d{1,2} ([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    await everyYear(ctx)
})
//--------------------------------------
freeWords.on('text', async ctx => {
    try {
        if(!(await dayToRem(ctx)))
            ctx.reply('Текст не распознан. После указания времени не забыли написать сообщение?')
    } catch (err) {
        ctx.reply('Не понял задания. Посмотрите /help')
        ctx.scene.reenter()
    }
})

export default freeWords