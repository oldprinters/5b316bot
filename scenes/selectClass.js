import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectClassMenu} from '../keyboards/keyboards.js'

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
//--------------------------------------
selectClass.help(async ctx => {
    ctx.replyWithHTML(`<b><u>HELP</u></b>\nВы зарегистрированы в ${ctx.session.classList.length} классах. Выберите любой из них и Вы сможете смотреть его данные.\n`+
    'Для удаления класса наберите: delete [Имя класса]')
})
//----------------------------------------
selectClass.hears(/^delete [a-zA-Z. а-яА-ЯёЁйЙ-]*/, async ctx =>{
    const myClass = new MyClass(ctx)
    const name = ctx.message.text.slice(7)
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
    await ctx.answerCbQuery()
    ctx.session.i = ctx.callbackQuery.data.match(/[0-9]$/)[0]
    ctx.session.class_id = ctx.session.classList[ctx.session.i].class_id
    ctx.session.isAdmin = ctx.session.classList[ctx.session.i].isAdmin
    ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------

export default selectClass