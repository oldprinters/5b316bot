import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {createNewClassMenu, queryYesNoMenu, selectRoleMenu} from '../keyboards/keyboards.js'

const createClass = new Scenes.BaseScene('CREATE_CLASS')
//-----------------------------
createClass.enter(async ctx => {
    await ctx.reply('Для регистрации класса ответьте на вопросы:', createNewClassMenu())
})
//-----------------------------
createClass.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\nУкажите продолжительность урока, она необходима для расчета времени окончания занятия.\n'+
    'Название класса может быть любым. Я рекомендую составлять из номера и литеры класса и школы.\n'+
    'К примеру "5б 316" однозначно определяет класс в рамках СПб.')
})
//-----------------------------
createClass.action('createNewClass', async ctx => {
    await ctx.answerCbQuery()
    ctx.reply('Укажите продолжительность занятия в минутах:')
})
//---------------------------------------------
createClass.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
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
        ctx.session.className = ctx.message.text.match(/[а-яА-ЯёЁa-zA-Z0-9-_ ]*/)[0]
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
            ctx.session.admin = res[0]
            ctx.session.admin.class_id = tClass.id
            ctx.reply(`Класс с названием "${ctx.session.className}" существует.\n Отправить администратору запрос на допуск к группе?`, queryYesNoMenu())
        }
    }
})
//-----------------------------------------
createClass.action('queryYes2', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.enter('SEND_QUERY_ADMIN')
})
//-----------------------------------------
createClass.action('queryNo2', async ctx => {
    await ctx.answerCbQuery()
    await ctx.scene.reenter()
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