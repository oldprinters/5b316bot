import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {createNewClassMenu, selectRoleMenu} from '../keyboards/keyboards.js'

const createClass = new Scenes.BaseScene('CREATE_CLASS')
createClass.enter(async ctx => {
    await ctx.setMyCommands([{command: 'start', description: 'Перезапустить'}])
    await ctx.reply('Для работы с расписанием должен быть зарегистрирован хотя бы один класс.', createNewClassMenu())

//    const myClass = new MyClass(ctx)
//    await myClass.init()
//    const classList = await myClass.searchClasses()
//    console.log("@@# classList =", classList)
})

createClass.action('createNewClass', async ctx => {
    await ctx.answerCbQuery()
    ctx.reply('Укажите продолжительность занятия в минутах:')
})

createClass.start( ctx => {ctx.scene.leave()})

createClass.hears(/[0-9]*/, async (ctx, next) => {
    if(ctx.session.duration == undefined){
        console.log("@#@#@ ctx", ctx.message)
        ctx.session.duration = parseInt(ctx.message.text)
        ctx.reply('Введите код класса, состоящий из номера класса, буквы и номера школы')
    } else {
        next()
    }
})

createClass.on('text', async ctx => {
    ctx.session.className = ctx.message.text.match(/[а-яА-ЯёЁa-zA-Z0-9-_ ]*/)[0]
    console.log("match =", ctx.session)
    const myClass = new MyClass(ctx)
    await myClass.init()
    const tClass = await myClass.searchClassesByName(ctx.session.className)
    if(tClass == undefined){
        ctx.session.class_id = await myClass.appendClass(ctx.session.className, ctx.session.duration)
        ctx.reply(`Код класса "${ctx.session.className}" записан.`, selectRoleMenu())
    } else {
        ctx.reply(`Класс с названием "${ctx.session.className}" существует.`)
    }
})
//-----------------------------------------
createClass.action('studentRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'student'
    const myClass = new MyClass(ctx)
    await myClass.init()
    myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role)
    ctx.reply('Класс ')
    ctx.scene.enter('CREATE_SCHEDULE')
})
//-----------------------------------------
createClass.action('parentRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'parent'
    const myClass = new MyClass(ctx)
    await myClass.init()
    myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role)
    ctx.scene.enter('CREATE_SCHEDULE')
})
//-----------------------------------------
createClass.action('teacherRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'teacher'
    const myClass = new MyClass(ctx)
    await myClass.init()
    myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role)
    ctx.scene.enter('CREATE_SCHEDULE')
})
//-----------------------------------------
createClass.action('c_teacherRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'c_teacher'
    const myClass = new MyClass(ctx)
    await myClass.init()
    myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role)
    ctx.scene.enter('CREATE_SCHEDULE')
})

export default createClass