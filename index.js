import {Telegraf, Markup, Scenes, session} from "telegraf"
import dotenv from 'dotenv'
import Users from './controllers/users.js'
import MyClass from './controllers/classes.js'
import additionalLesson from './scenes/additionalLessons.js'
import createClass from './scenes/createClass.js'
import createSchedule from './scenes/createSchedule.js'
import selectClass from './scenes/selectClass.js'
import selectAction from './scenes/selectAction.js'
import setTimesUr from './scenes/setTimesUr.js'
import setSheduleDay from './scenes/setSheduleDay.js'
import inpSheduleForDay from './scenes/inpSheduleForDay.js'
import sendQueryAdmin from './scenes/queryMessage.js'
import processRequests from './scenes/processRequests.js'
import viewShedule from './scenes/viewShedule.js'
import firstStep from './scenes/firstStep.js'

import * as cron from 'node-cron'

cron.schedule('* */10 * * * *', () => {
    console.log(Date());
  });

dotenv.config()

const stage = new Scenes.Stage([additionalLesson, createClass, createSchedule, firstStep, inpSheduleForDay, processRequests, 
    selectClass, selectAction, sendQueryAdmin, setTimesUr, setSheduleDay, viewShedule])

const bot = new Telegraf(process.env.KEY);//"5489794456:AAF89kL1SsQVK2-axyWO8VdARI8rlfAVxdM"
bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
    await ctx.scene.enter('FIRST_STEP')
    // await ctx.setMyCommands([{'command': 'start', 'description': 'Перезапуск'}, {'command': 'help', 'description': 'Вызов справки'}])
    // const myClass = new MyClass(ctx)
    // await myClass.init()
    // const classList = await myClass.searchClasses()
    // if(classList.length == 0){
    //     ctx.scene.enter('CREATE_CLASS')
    // } else {
    //     ctx.session.classList = classList
    //     if(classList.length > 1){
    //         ctx.scene.enter('SELECT_CLASS')
    //     } else {
    //         ctx.session.i = 0   //index текущего класса в массиве
    //         ctx.session.class_id = classList[0].class_id
    //         ctx.scene.enter('SELECT_ACTION')
    //     }
    // }
});
//getMainMenu()

bot.launch()
    .then(res => {
        console.log('Started')
    }).catch ( err => {
        console.log('Error', err)
    })
