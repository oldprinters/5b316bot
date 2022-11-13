import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {createNewClassMenu, selectRoleMenu} from '../keyboards/keyboards.js'
//import { outTime } from '../utils.js'
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

createClass.on('text', async ctx => {
    if(ctx.session.duration == undefined){
        if(/^\d{1,3}$/.test(ctx.message.text)){
            ctx.session.duration = parseInt(ctx.message.text)
            ctx.reply('Введите код класса, состоящий из номера класса, буквы и номера школы')
        } else {
            ctx.reply('Укажите продолжительность занятия в минутах цифрами (45, 90 и т.д.):')
        }
    } else {
        ctx.session.className = ctx.message.text.match(/[а-яА-ЯёЁa-zA-Z0-9-_ ]*/)[0]
        const myClass = new MyClass(ctx)
        await myClass.init()
        const tClass = await myClass.searchClassesByName(ctx.session.className)
        if(tClass == undefined){
            ctx.session.class_id = await myClass.appendClass(ctx.session.className, ctx.session.duration)
            ctx.reply(`Код класса "${ctx.session.className}" записан.`, selectRoleMenu())
            const classList = await myClass.searchClasses()
            ctx.session.classList = classList   //сделать отдельную сцену инициализации
        } else {
            ctx.reply(`Класс с названием "${ctx.session.className}" существует.`)
        }
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