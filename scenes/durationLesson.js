import {Telegraf, Markup, Scenes, session} from "telegraf"
import MyClass from '../controllers/classes.js'
import {createNewClassMenu, queryYesNoMenu, selectRoleMenu} from '../keyboards/keyboards.js'

const durationLesson = new Scenes.BaseScene('DURATION_LESSON')
//-----------------------------
durationLesson.enter(async ctx => {
    await ctx.reply('Укажите продолжительность занятия в минутах:')
})
//-----------------------------
durationLesson.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\nУкажите продолжительность урока <b>в минутах</b>, она необходима для расчета времени окончания занятия.\n'+
                        'Только число.\n'+
                        'К примеру: для детских садов можно поставить "540" :-), что составляет 9 часов, а для студентов "90" - пара.')
})
//---------------------------------------------
durationLesson.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
//-------------------------------------------------
durationLesson.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//---------------------------------------------
durationLesson.hears(/^\d{1,3}$/, async ctx => {
    if(/^\d{1,3}$/.test(ctx.message.text)){
        const myClass = new MyClass(ctx)
        await myClass.init()
        ctx.session.duration = parseInt(ctx.message.text)
        ctx.session.class_id = await myClass.appendClass(ctx.session.className, ctx.session.duration)
        ctx.session.isAdmin = 1
        await ctx.reply(`Код класса "${ctx.session.className}" записан.`)
    ctx.reply('Выберите роль в меню:', selectRoleMenu())
    } else {
        ctx.reply('Укажите продолжительность занятия в минутах цифрами (45, 90 и т.д.):')
    }
})
//-----------------------------------------
const saveCUR = async (ctx) => {
    const myClass = new MyClass(ctx)
    await myClass.init()
    await myClass.saveClassUserRole(ctx.session.class_id, ctx.session.role, ctx.session.isAdmin)
    const classList = await myClass.searchClasses()
    ctx.session.i = classList.length - 1
    ctx.session.classList = classList   //сделать отдельную сцену инициализации
    ctx.scene.enter('SET_TIMES_UR')
}
//-----------------------------------------
durationLesson.action('studentRole', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.role = 'student'
    await saveCUR(ctx)
})
//-----------------------------------------
durationLesson.action('parentRole', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.role = 'parent'
    await saveCUR(ctx)
})
//-----------------------------------------
durationLesson.action('teacherRole', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.role = 'teacher'
    await saveCUR(ctx)
})
//-----------------------------------------
durationLesson.action('c_teacherRole', async ctx => {
    await ctx.answerCbQuery('Loading')
    ctx.session.role = 'c_teacher'
    await saveCUR(ctx)
})

export default durationLesson