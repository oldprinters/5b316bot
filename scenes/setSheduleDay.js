import {Telegraf, Markup, Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import {selectDay} from '../keyboards/keyboards.js'

const setSheduleDay = new Scenes.BaseScene('SET_SHEDULE_DAY')
//--------------------------------------
setSheduleDay.enter(async ctx => {
    ctx.reply('Расписание вводится для каждого дня отдельно. Для начала ввода выберите день недели:', selectDay())
})
//--------------------------------------
setSheduleDay.hears('\w', async ctx => {
    ctx.reply('Выберите день недели в меню.')
})
//-------------------------------
setSheduleDay.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\nРасписание устанавливается отдельно на каждый день. Выбрав день Вы сможете добавлять и удалять уроки.\n/start для возврата в основное меню.')
})
//-------------------------------------------------
setSheduleDay.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//------------------
setSheduleDay.start( ctx => { ctx.scene.enter('SELECT_ACTION') })
//--------------------------------------- 
setSheduleDay.action(/^['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'][a-z]+$/, ctx => {
    ctx.answerCbQuery('Loading')
    // console.log("!@##@! ctx =", ctx)
})
//----------------------------------------
setSheduleDay.action('sundayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 0
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('mondayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 1
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('tuesdayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 2
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('wednesdayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 3
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('thursdayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 4
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('fridayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 5
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('saturdayDay', ctx => {
    ctx.answerCbQuery('Loading')
    ctx.session.dayN = 6
    ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//-----------------------------------------

export default setSheduleDay
