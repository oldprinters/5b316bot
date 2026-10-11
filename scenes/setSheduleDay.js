import {Telegraf, Markup, Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import {selectDay} from '../keyboards/keyboards.js'

const setSheduleDay = new Scenes.BaseScene('SET_SHEDULE_DAY')
//--------------------------------------
setSheduleDay.enter(async ctx => {
    await ctx.reply('Расписание вводится для каждого дня отдельно. Для начала ввода выберите день недели:', selectDay())
})
//--------------------------------------
setSheduleDay.hears('\w', async ctx => {
    await ctx.reply('Выберите день недели в меню.')
})
//-------------------------------
setSheduleDay.help( async ctx => {
    await ctx.replyWithHTML('<b><u>HELP</u></b>\nРасписание устанавливается отдельно на каждый день. Выбрав день Вы сможете добавлять и удалять уроки.\n/start для возврата в основное меню.')
})
//-------------------------------------------------
setSheduleDay.command('games', async ctx => {
    await ctx.scene.enter('GAMES')
})
//------------------
setSheduleDay.start( async ctx => { await ctx.scene.enter('SELECT_ACTION') })
//--------------------------------------- 
setSheduleDay.action(/^['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'][a-z]+$/, async ctx => {
    await ctx.answerCbQuery('Loading')
    // console.log("!@##@! ctx =", ctx)
})
//----------------------------------------
setSheduleDay.action('sundayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 0
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('mondayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 1
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('tuesdayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 2
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('wednesdayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 3
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('thursdayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 4
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('fridayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 5
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//---------------------------------------
setSheduleDay.action('saturdayDay', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.dayN = 6
    await ctx.scene.enter('INP_SHEDULE_FOR_DAY')
})
//-----------------------------------------

export default setSheduleDay
