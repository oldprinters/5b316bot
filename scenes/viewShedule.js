import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
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
//-------------------------------------
selectAction.start( async ctx => {
    await ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------
viewShedule.on('text', async ctx => {
    const myClass = new MyClass(ctx)
    const urDay = new UrDay(ctx)
    await myClass.init()
    const resNames = await myClass.searchLessonByName(ctx)
    const class_id = ctx.session.class_id
    if(resNames.length == 0){
        ctx.reply(`Урок, в название которого входит "${ctx.message.text}", не найден.`)
    } else if(resNames.length == 1){
        const res = await myClass.getUrByNameId(resNames[0].name_id, class_id)
        await ctx.replyWithHTML(`<b><u>${res[0].name}</u></b>`)
        for(let item of res){
            await ctx.reply(`${urDay.getNameDay(item.dayOfWeek)}, c ${item.time_s}, по ${item.time_e}`)
        }
    } else {
        for(let el of resNames){
            const res = await myClass.getUrByNameId(el.name_id, class_id)
            await ctx.replyWithHTML(`<b><u>${el.name}</u></b>`)
            for(let item of res){
                await ctx.reply(`${urDay.getNameDay(item.dayOfWeek)}, c ${item.time_s}, по ${item.time_e}`)
            }    
        }
    }
//    ctx.scene.reenter()
})
//----------------

export default viewShedule