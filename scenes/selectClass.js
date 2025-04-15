import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import { selectClassMenu } from '../keyboards/keyboards.js'
import { outTextRem, sanitizeInput } from '../utils.js'

const selectClass = new Scenes.BaseScene('SELECT_CLASS')
//--------------------------------------
selectClass.enter(async ctx => {
    ctx.reply('Выберите класс.', selectClassMenu(ctx.session.classList))
})
//--------------------------------------
selectClass.start( ctx => ctx.scene.enter('FIRST_STEP'))
//-------------------------------------------------
selectClass.command('remember', async ctx => { 
    ctx.scene.enter('REMEMBER')
})
//-------------------------------------------------
selectClass.command('settings', async ctx => { 
    ctx.scene.enter('FIRST_STEP')
})
//-------------------------------------------------
selectClass.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//-----------------------------
selectClass.action('createNewClass', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.scene.enter('CREATE_CLASS')
})
//--------------------------------------
selectClass.hears(/^(rem|Rem|напоминалки|Напоминалки)$/, ctx => {
    return ctx.scene.enter('FREE_WORDS')
})
//-------------------------------------------------
selectClass.help(async ctx => {
    ctx.replyWithHTML(`<b><u>HELP</u></b>\nВы зарегистрированы в ${ctx.session.classList.length} классах. Выберите любой из них и Вы сможете смотреть его данные.\n`+
    'Для удаления класса наберите: delete [Имя класса]')
})
//----------------------------------------
selectClass.hears(/^delete [a-zA-Z. а-яА-ЯёЁйЙ-]*/, async ctx =>{
    const myClass = new MyClass(ctx)
    const name = sanitizeInput(ctx.message.text.slice(7))
    const mC = await myClass.searchClassesByName(name)
    const users = new Users(ctx)
    users.init()
    const user = await users.getUserByTlgId(ctx.message.from.id)
    if(mC != undefined){
        const res = myClass.deleteUserClass (user.id, mC.id)
        if(res.affectedRows)
            ctx.reply('Класс удалён.')
    } else {
        ctx.reply(`Класс с именем ${name} не найден.`)
    }
    ctx.session.classList = await myClass.searchClasses(user.id)
    ctx.scene.enter('FIRST_STEP')
})
//----------------------------------------
selectClass.action(/^iClass_[0-9]*/, async ctx => {
    await ctx.answerCbQuery('Загружаю данные')
    ctx.session.i = ctx.callbackQuery.data.match(/[0-9]$/)[0]
    ctx.session.class_id = ctx.session.classList[ctx.session.i].class_id
    ctx.session.isAdmin = ctx.session.classList[ctx.session.i].isAdmin
    ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------
//--------------------------------------
selectClass.hears(/^\d{1,2}\.\d{1,2}\.\d{2,4} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2).replace(/[жЖ]/, ':')
    const textE = sanitizeInput(ctx.match[0].slice(p2 + 1))
    const arD = dateE.split('.')
    const date = new Date(`${arD[2]}-${arD[1]}-${arD[0]} ${timeE}`)
    outTextRem(ctx, date, textE)
})
//--------------------------------------
selectClass.hears(/^\d{1,2}\.\d{1,2} \d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2).replace(/[жЖ]/, ':')
    const textE = sanitizeInput(ctx.match[0].slice(p2 + 1))
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
selectClass.hears(/^\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const timeE = ctx.match[0].slice(0, p1).replace(/[жЖ]/, ':')
    const textE = sanitizeInput(ctx.match[0].slice(p1 + 1))
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
selectClass.hears(/^\d{1,2} (мин)([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = sanitizeInput(ctx.match[0].slice(p2))
    const date = new Date()
    date.setMinutes(date.getMinutes() + parseInt(dt))
    outTextRem(ctx, date, textE)
})
//--------------------------------------
selectClass.hears(/^\d{1,2} (час)([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/, async ctx => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = sanitizeInput(ctx.match[0].slice(p2))
    const date = new Date()
    date.setHours(date.getHours() + parseInt(dt))
    outTextRem(ctx, date, textE)
})
//------------------------------------------
selectClass.on('text', async ctx => {
    await ctx.reply('Выберите класс или введите напоминание.')
})

export default selectClass