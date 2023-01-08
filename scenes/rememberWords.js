import {Scenes, session} from "telegraf"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
//import { queryYesNoMenu, selectRemember, selectLesson } from '../keyboards/keyboards.js'
//import UrDay from "../controllers/urDay.js"
import { outDate, outTimeDate, outDateTime } from '../utils.js'

const freeWords  = new Scenes.BaseScene('FREE_WORDS')
//--------------------------------------
freeWords.enter(async ctx => {
        await ctx.reply('Когда и что?')
})
//--------------------------------------
freeWords.help(ctx => {
    ctx.reply('Формат ввода: дд-мм-уууу чч:мм  [сообщение]\nМожно задать используя:\nMM мин [сообщение] - отложенное сообщение\n' +
    'чч:мм [сообщение] - заданное время текущего дня\nЧЧ час [сообщение] - отложить на несколько часов\nсписок  - вывод списка активных напоминалок. (list тоже работает) ')
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
    console.log("list", list)
})
//--------------------------------------
freeWords.start( ctx => ctx.scene.enter('FIRST_STEP'))
//--------------------------------------
freeWords.hears(/^\d{1,2}\.\d{1,2}\.\d{2,4} \d{1,2}:\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2)
    const textE = ctx.match[0].slice(p2)
    const arD = dateE.split('.')
    const date = new Date(`${arD[2]}-${arD[1]}-${arD[0]} ${timeE}`)
    const eC = new EventsClass(ctx)
    if(eC.addEvent(date, textE))
        ctx.reply("Напоминание запланировано.")
    else
        ctx.reply("Ошибка сохранения.")
})
//--------------------------------------
freeWords.hears(/^\d{1,2}:\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const timeE = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p1)
    const arT = timeE.split(':')
    const date = new Date()
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const eC = new EventsClass(ctx)
    if(eC.addEvent(date, textE))
        ctx.reply(`Напоминание запланировано на ${outDate(date)} ${outTimeDate(date)}.`)
    else
        ctx.reply("Ошибка сохранения.")
})
//--------------------------------------
freeWords.hears(/^\d{1,2} (мин)([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setMinutes(date.getMinutes() + parseInt(dt))
    const eC = new EventsClass(ctx)
    if(eC.addEvent(date, textE))
        ctx.reply(`Напоминание "${textE}" запланировано на ${outDate(date)} ${outTimeDate(date)}.`)
    else
        ctx.reply("Ошибка сохранения.")
})
//--------------------------------------
freeWords.hears(/^\d{1,2} (час)([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setHours(date.getHours() + parseInt(dt))
    const eC = new EventsClass(ctx)
    if(eC.addEvent(date, textE))
        ctx.reply(`Напоминание "${textE}" запланировано на ${outDate(date)} ${outTimeDate(date)}.`)
    else
        ctx.reply("Ошибка сохранения.")
})
//-------------------------------------------------
freeWords.command('remember', async ctx => { 
    ctx.scene.reenter()
})
//--------------------------------------
freeWords.on('text', ctx => {
    ctx.reply('Текст не распознан. После указания времени не забыли написать сообщение?')
})

export default freeWords