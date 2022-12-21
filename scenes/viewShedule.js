import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import { searchByLessonName } from '../utils.js'
import UrDay from "../controllers/urDay.js"
import { selectActionAdminMenu, selectActionUserMenu } from '../keyboards/keyboards.js'
import { helpForSearch, outShedule } from '../utils.js'

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
    let text = 'Для изменения расписания, обратитесь к администратору.\n\n'
    if(ctx.session.isAdmin == '1')
        text = ''
    ctx.replyWithHTML(`<b><u>HELP</u></b>\n${text} ${helpForSearch()}`)
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
        await ctx.reply('Вы можете:', selectActionUserMenu())
//        await ctx.scene.enter('FIRST_STEP')
    }
})
//------------------------------------------
viewShedule.on('text', async ctx => {
    await searchByLessonName(ctx)
})
//----------------

export default viewShedule