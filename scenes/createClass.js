import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {createNewClassMenu} from '../keyboards/keyboards.js'

const createClass = new Scenes.BaseScene('CREATE_CLASS')
createClass.enter(async ctx => {
    await ctx.setMyCommands([{command: 'start', description: 'Перезапустить'}])
    await ctx.reply('Для работы с расписанием должен быть зарегистрирован хотя бы один класс.', createNewClassMenu())

    const myClass = new MyClass(ctx)
    await myClass.init()
    const classList = await myClass.searchClasses()
    console.log("@@# classList =", classList)
})

createClass.action('createNewClass', async ctx => {
    await ctx.answerCbQuery()
    ctx.reply('Введите код класса, состоящий из номера класса, буквы и номера школы')
})

createClass.on('text', async ctx => {
    ctx.session.className = ctx.message.text.match(/[a-zA-Z0-9 ]*/)[0]
    console.log("match =", ctx.session)
    const myClass = new MyClass(ctx)
    await myClass.init()
    const tClass = await myClass.searchClassesByName(ctx.session.className)
    console.log("tClass=", tClass)
    if(tClass == undefined){
        ctx.reply(`Код класса будет записан как "${ctx.session.className}"`)
        myClass.appendClass(ctx.session.className)
    } else {
        ctx.reply(`Класс с названием "${ctx.session.className}" существует.`)
    }
})

export default createClass