import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
//import MyClass from '../controllers/classes.js'
//import UrTime from "../controllers/urTime.js"
import UrDay from "../controllers/urDay.js"
//import { queryYesNoCancelMenu, queryYesNoMenu, queryDelCancelMenu } from '../keyboards/keyboards.js'
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
//----------------

export default viewShedule