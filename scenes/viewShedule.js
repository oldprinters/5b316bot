import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
import AdditionalClass from '../controllers/additionalClass.js'
import { searchByLessonName } from '../utils.js'
import UrDay from "../controllers/urDay.js"
import { selectActionAdminMenu, selectActionUserMenu } from '../keyboards/keyboards.js'
import { helpForSearch, outShedule } from '../utils.js'

const viewShedule = new Scenes.BaseScene('VIEW_SHEDULE')
//------------
viewShedule.enter( async ctx => {
    const aC = new AdditionalClass(ctx)
    const urDay = new UrDay()
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    let list = ''
    for(let i = 1; i < 7; i++){
        list += '\n<u>' + urDay.getNameDay(i) + '</u>\n'
        const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, i)
        list += await outShedule(listForDay, nLessons)
        list += await aC.getListForDay(i)
    }
    list += '\n<u>' + urDay.getNameDay(0) + '</u>\n'
    const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, 0)
    list += await outShedule(listForDay, nLessons)
    const cL = ctx.session.classList[ctx.session.i]
    list += `\n${cL.name}`
    ctx.replyWithHTML(list)
})
//--------------------------------------
viewShedule.help(async ctx => {
    let text = 'Для изменения расписания, обратитесь к администратору.\n\n'
    if(ctx.session.isAdmin == '1')
        text = ''
    ctx.replyWithHTML(`<b><u>HELP</u></b>\n${text} ${helpForSearch(ctx)}`)
})
//-------------------------------------------------
viewShedule.hears(/^(rem|Rem|напоминалки|Напоминалки)$/, ctx => {
    return ctx.scene.enter('FREE_WORDS')
})
//-------------------------------------------------
viewShedule.command('remember', ctx => { 
    ctx.scene.enter('REMEMBER')
})
//-------------------------------------------------
viewShedule.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//-------------------------------------
viewShedule.start( async ctx => {
    await ctx.scene.enter('SELECT_ACTION')
})
//-------------------------------------------------
viewShedule.command('settings', async ctx => { 
    await ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------
viewShedule.on('text', async ctx => {
    await searchByLessonName(ctx)
})
//----------------

export default viewShedule