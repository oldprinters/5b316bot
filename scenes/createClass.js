import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {createNewClassMenu, queryYesNoMenu, selectRoleMenu} from '../keyboards/keyboards.js'
import { getRoleName } from '../utils.js'
const createClass = new Scenes.BaseScene('CREATE_CLASS')
createClass.enter(async ctx => {
    await ctx.setMyCommands([{command: 'start', description: 'Перезапустить'}])
    await ctx.reply('Для регистрфции класса ответте на вопросы:', createNewClassMenu())

//    const myClass = new MyClass(ctx)
//    await myClass.init()
//    const classList = await myClass.searchClasses()
//    console.log("@@# classList =", classList)
})

createClass.action('createNewClass', async ctx => {
    await ctx.answerCbQuery()
    ctx.reply('Укажите продолжительность занятия в минутах:')
})
//---------------------------------------------
createClass.start( ctx => {ctx.scene.leave()})
//---------------------------------------------
createClass.on('text', async ctx => {
    if(ctx.session.duration == undefined){
        if(/^\d{1,3}$/.test(ctx.message.text)){
            ctx.session.duration = parseInt(ctx.message.text)
            ctx.reply('Введите код класса, состоящий из номера класса, буквы и номера школы')
        } else {
            ctx.reply('Укажите продолжительность занятия в минутах цифрами (45, 90 и т.д.):')
        }
    } else {
        ctx.session.className = await ctx.message.text.match(/[а-яА-ЯёЁa-zA-Z0-9-_ ]*/)[0]
        const myClass = new MyClass(ctx)
        await myClass.init()
        const tClass = await myClass.searchClassesByName(ctx.session.className)
        if(tClass == undefined){
            ctx.session.class_id = await myClass.appendClass(ctx.session.className, ctx.session.duration)
            const classList = await myClass.searchClasses()
            ctx.session.classList = classList   //сделать отдельную сцену инициализации
            ctx.session.isAdmin = 1
            await ctx.reply(`Код класса "${ctx.session.className}" записан.`, selectRoleMenu())
        } else {
            const res = await myClass.getAdmin(tClass.id)
            ctx.scene.session.state.admin = res[0]
            console.log("&&&& res =", res)
            ctx.reply(`Класс с названием "${ctx.session.className}" существует.\n Отправить запрос администратору на допуск к группе?`, queryYesNoMenu())
        }
    }
})
//-----------------------------------------
createClass.action('queryYes2', async ctx => {
    await ctx.answerCbQuery()
    await ctx.reply(`Пишем письмо. \nАдминистратор: ${getRoleName(ctx.scene.session.state.admin.role)} id: ${ctx.scene.session.state.admin.tlg_id}`)
})
//-----------------------------------------
createClass.action('queryNo2', async ctx => {
    await ctx.answerCbQuery()
})
//-----------------------------------------
createClass.action('studentRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'student'
    const myClass = new MyClass(ctx)
    await myClass.init()
    await myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role, ctx.session.isAdmin)
    ctx.reply('Класс ')
    ctx.scene.enter('CREATE_SCHEDULE')
})
//-----------------------------------------
createClass.action('parentRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'parent'
    const myClass = new MyClass(ctx)
    await myClass.init()
    await myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role, ctx.session.isAdmin)
    ctx.scene.enter('CREATE_SCHEDULE')
})
//-----------------------------------------
createClass.action('teacherRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'teacher'
    const myClass = new MyClass(ctx)
    await myClass.init()
    await myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role, ctx.session.isAdmin)
    ctx.scene.enter('CREATE_SCHEDULE')
})
//-----------------------------------------
createClass.action('c_teacherRole', async ctx => {
    await ctx.answerCbQuery()
    ctx.session.role = 'c_teacher'
    const myClass = new MyClass(ctx)
    await myClass.init()
    await myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role, ctx.session.isAdmin)
    ctx.scene.enter('CREATE_SCHEDULE')
})

export default createClass