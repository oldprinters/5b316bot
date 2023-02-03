import {Scenes, session} from "telegraf"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
//import { queryYesNoMenu, selectRemember, selectLesson } from '../keyboards/keyboards.js'
//import UrDay from "../controllers/urDay.js"
import { getDnTime, outDateTime, outTextRem, remForDay } from '../utils.js'

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
            arOut += `${outDateTime(el.dateTime)} ${el.text}\n`
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
//--------------------------------------
freeWords.hears(/^\d{1,2}\.\d{1,2}\.\d{2,4} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
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
freeWords.hears(/^\d{1,2}\.\d{1,2} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
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
freeWords.hears(/^\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
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
freeWords.hears(/^(завтра|Завтра) (в )?\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const d1 = ctx.match[0].search(/\d{1,2}[:жЖ]\d{1,2}/)
    const p1 = ctx.match[0].indexOf(' ', d1 + 3)
    const timeE = (ctx.match[0].match(/\d{1,2}[:жЖ]\d{1,2}/))[0].replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p1)
    const arT = timeE.split(':')
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    outTextRem(ctx, date, textE)
})
//--------------------------------------
freeWords.hears(/^\d{1,2} (мин)([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setMinutes(date.getMinutes() + parseInt(dt))
    outTextRem(ctx, date, textE)
})
//--------------------------------------
freeWords.hears(/^\d{1,2} (час)([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setHours(date.getHours() + parseInt(dt))
    outTextRem(ctx, date, textE)
})
//-------------------------------------------------
freeWords.command('remember', async ctx => { 
    ctx.scene.reenter()
})
//------------------------------------------ обрабатываем каждый день недели 
freeWords.hears(/^(кажд|Кажд)(ый|ую|ое)\s(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)\s(в )?\d{1,2}[:жЖ]\d{1,2} [ _.,а-яА-ЯйЙa-zA-Z0-9]*/, 
    async (ctx, next) => {
        await remForDay(ctx, next)
})
//--------------------------------------
freeWords.on('text', ctx => {
    const str = ctx.message.text.trim().toLowerCase()
    try {
        const res = getDnTime(str)
        if(res != undefined && res.dn >= 1){
            const d1 = ctx.message.text.search(/\d{1,2}:\d{1,2}/)

            const p1 = ctx.message.text.indexOf(' ', d1 + 3)
            const textE = ctx.message.text.slice(p1 + 1)
            const d = new Date()
            const nd = d.getDay()
            if(res.dn > nd){
                d.setDate(d.getDate() + res.dn - nd)
            } else {
                d.setDate(d.getDate() + (res.dn - nd + 7))
            }
            const arT = res.time_s.split(':')
            d.setHours(arT[0])
            d.setMinutes(arT[1])
            outTextRem(ctx, d, textE)
        } else 
            ctx.reply('Текст не распознан. После указания времени не забыли написать сообщение?')
    } catch (err) {
        ctx.reply('Не понял задания. Посмотрите /help')
        ctx.scene.reenter()
    }
})

export default freeWords