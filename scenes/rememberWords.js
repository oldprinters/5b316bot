import {Scenes, session} from "telegraf"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import { queryYesNoMenu, selectRemember, selectLesson } from '../keyboards/keyboards.js'
import UrDay from "../controllers/urDay.js"
import { outDate } from '../utils.js'

const freeWords  = new Scenes.BaseScene('FREE_WORDS')
//--------------------------------------
freeWords.enter(async ctx => {
        await ctx.reply('Когда и что?')
})
//--------------------------------------
freeWords.help(ctx => {
    ctx.reply('Дата и время: дд-мм-уууу чч:мм\nМожно задать используя:\n Через mm мин\nЧерез чч:мм\n и т.д.')
})
//--------------------------------------
freeWords.start( ctx => ctx.scene.enter('FIRST_STEP'))
//--------------------------------------
freeWords.hears(/^\d{1,2}.\d{1,2}\d.{2,4} \d{1,2}:\d{1,2}([ _.,а-яА-ЯйЙa-zA-Z0-9])*/, async ctx => {
    ctx.reply(ctx.match[0])
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const p3 = ctx.match[0].indexOf(' ', p2 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2)
    const textE = ctx.match[0].slice(p2)
    console.log("date =", dateE)
    console.log("timeE =", timeE)
    console.log("textE =", textE)
})
//--------------------------------------
freeWords.on('text', ctx => {
    ctx.reply('text не распознан')
})

export default freeWords