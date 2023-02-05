import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {createNewClassMenu, queryYesNoMenu, selectRoleMenu} from '../keyboards/keyboards.js'

const createClass = new Scenes.BaseScene('CREATE_CLASS')
//-----------------------------
createClass.enter(async ctx => {
    await ctx.reply('Введите код класса, состоящий, к примеру, из номера класса, буквы и номера школы (ex: 1a 33):')
})
//-----------------------------
createClass.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\nНазвание класса может быть любым. Я рекомендую составлять из номера и литеры класса и школы.\n'+
    'К примеру "5б 316" однозначно определяет класс в рамках города. Можно добавить любой дополнительный текст.')
})
//---------------------------------------------
createClass.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
//-------------------------------------------------
createClass.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//---------------------------------------------
createClass.on('text', async ctx => {
        ctx.session.className = ctx.message.text.match(/[а-яА-ЯёЁйЙa-zA-Z0-9-_ ]*/)[0]
        const myClass = new MyClass(ctx)
        await myClass.init()
        const tClass = await myClass.searchClassesByName(ctx.session.className)
        if(tClass == undefined){
            ctx.scene.enter('DURATION_LESSON')
        } else {
            const res = await myClass.getAdmin(tClass.id)
            ctx.session.admin = res[0]
            ctx.session.admin.class_id = tClass.id
            ctx.reply(`Класс с названием "${ctx.session.className}" существует.\n Отправить администратору запрос на допуск к группе?`, queryYesNoMenu())
        }
})
//-----------------------------------------
createClass.action('queryYes2', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.enter('SEND_QUERY_ADMIN')
})
//-----------------------------------------
createClass.action('queryNo2', async ctx => {
    await ctx.answerCbQuery('Loading')
    await ctx.scene.reenter()
})

export default createClass