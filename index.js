import {Telegraf, Markup, Scenes, session} from "telegraf"
import dotenv from 'dotenv'
import additionalLesson from './scenes/additionalLessons.js'
import createClass from './scenes/createClass.js'
import createSchedule from './scenes/createSchedule.js'
import EventsClass from './controllers/eventsClass.js'
import freeWords from './scenes/rememberWords.js'
import selectClass from './scenes/selectClass.js'
import selectAction from './scenes/selectAction.js'
import setTimesUr from './scenes/setTimesUr.js'
import setSheduleDay from './scenes/setSheduleDay.js'
import inpSheduleForDay from './scenes/inpSheduleForDay.js'
import sendQueryAdmin from './scenes/queryMessage.js'
import processRequests from './scenes/processRequests.js'
import remember from './scenes/remember.js'
import viewShedule from './scenes/viewShedule.js'
import firstStep from './scenes/firstStep.js'

import * as cron from 'node-cron'
import { getNotesTime } from './utils.js'

dotenv.config()

const stage = new Scenes.Stage([additionalLesson, createClass, createSchedule, firstStep, freeWords, inpSheduleForDay, processRequests, remember,
    selectClass, selectAction, sendQueryAdmin, setTimesUr, setSheduleDay, viewShedule])

const bot = new Telegraf(process.env.KEY);//"5489794456:AAF89kL1SsQVK2-axyWO8VdARI8rlfAVxdM"
bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
    await ctx.scene.enter('FIRST_STEP')
});

bot.hears(/^(rem|Rem|напоминалки|Напоминалки)$/, ctx => {
    return ctx.scene.enter('FREE_WORDS')
})
//---------------------------------------------
bot.action(/^answerAccepted\d{1,12}/, ctx => {
    ctx.answerCbQuery()
    const eC = new EventsClass(ctx)
    const ec_id = ctx.match[0].slice(14)
    eC.updateActive(ec_id, 0)
    ctx.replyWithHTML('<i>Готов к выполнению новых заданий! Обращайтесь.</i>')
})

cron.schedule('* * * * *', () => {getNotesTime()});

// if(process.env.ENVIRONMENT == 'PRODUCTION'){
//     bot.launch({
//         webhook: {
//             domain: 'szppk.oldprinters.ru',
//             port: 8443,
        
//             // Optional path to listen for.
//             // `bot.secretPathComponent()` will be used by default
//             //hookPath: webhookPath,
        
//             // Optional secret to be sent back in a header for security.
//             // e.g.: `crypto.randomBytes(64).toString("hex")`
//             //secretToken: randomAlphaNumericString,
//         },
//     }).then(res => {
//         console.log('Started production')
//     }).catch ( err => {
//         console.log('Error:', err)
//     })
// } else {
    bot.launch()
        .then(res => {
            console.log('Started')
        }).catch ( err => {
            console.log('Error', err)
        })
// }
