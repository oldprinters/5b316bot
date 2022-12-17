import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import { searchByLessonName } from '../utils.js'
import UrDay from "../controllers/urDay.js"
import { selectActionAdminMenu } from '../keyboards/keyboards.js'
import { outShedule } from '../utils.js'

const viewShedule = new Scenes.BaseScene('VIEW_SHEDULE')
//------------
viewShedule.enter( async ctx => {
    const urDay = new UrDay()
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    let list = ''
    for(let i = 1; i < 7; i++){
        list += '\n<u>' + urDay.getNameDay(i) + '</u>\n'
        const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, i)
        list += await outShedule(listForDay, nLessons)
    }
    list += '\n<u>' + urDay.getNameDay(0) + '</u>\n'
    const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, 0)
    list += await outShedule(listForDay, nLessons)
    ctx.replyWithHTML(list)
})
//--------------------------------------
viewShedule.help(async ctx => {
    ctx.replyWithHTML(`<b><u>HELP</u></b>\nДополнительных функций нет, только просмотр.\nДля изменения расписания, обратитесь к администратору.`)
})
//-------------------------------------
viewShedule.start( async ctx => {
    await ctx.scene.enter('SELECT_ACTION')
})
//-------------------------------------------------
viewShedule.command('settings', async ctx => { 
    if(ctx.session.isAdmin == '1')
        await ctx.reply('Административное меню:', selectActionAdminMenu())
    else {
        await ctx.reply('Настройки доступны только администратору класса.')
        await ctx.scene.enter('FIRST_STEP')
    }
})
//------------------------------------------
viewShedule.on('text', async ctx => {
    await searchByLessonName(ctx)
})
//----------------

export default viewShedule