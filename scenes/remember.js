import {Scenes, session} from "telegraf"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import { queryYesNoMenu, selectRemember, selectLesson } from '../keyboards/keyboards.js'
import UrDay from "../controllers/urDay.js"
import { outDate } from '../utils.js'

const remember = new Scenes.BaseScene('REMEMBER')
//--------------------------------------
remember.enter(async ctx => {
        await ctx.reply('Что хотим запомнить?', selectRemember())
})
//--------------------------------------
remember.start( ctx => ctx.scene.enter('FIRST_STEP'))
//--------------------------------------
remember.action('nextLesson', async ctx => {
    ctx.answerCbQuery()
    if(ctx.session.class_id > 0){
        const myClass = new MyClass(ctx)
        const listLessons = await myClass.getLessonsList(ctx.session.class_id)
        console.log("@@@", listLessons)
        ctx.reply('Выбирайте урок:', selectLesson(listLessons))
    } else {
        await ctx.reply('Для привязки к урокам нужно выбрать класс.')
        ctx.scene.enter('FIRST_STEP')
    }
})
//--------------------------------------
remember.action('menyWords', async ctx => {
    ctx.answerCbQuery()
    ctx.reply('Внемлю:')
})
//--------------------------------------
remember.action('setDate', async ctx => {
    ctx.answerCbQuery()
    ctx.reply('Внемлю:')
})
//---------------------------------------
remember.action(/^iSelectedLess_\d+$/, async ctx => {
    ctx.answerCbQuery()
    const name_id = parseInt(ctx.match[0].slice(14))
    const myClass = new MyClass(ctx)
    const urList = await myClass.getUrByNameId(name_id, ctx.session.class_id)
    const nd = (new Date()).getDay()
    let l = urList.length
    let ur = urList[0]
    if(l > 1){
        for(let i = l - 1; i > 0; i--){
            if((urList[i].dayOfWeek > nd) && (urList[i-1].dayOfWeek <= nd)){
                ur = urList[i]
                break
            }
        }
    }
    let d = new Date()
    if(ur.dayOfWeek > nd){
        d.setDate(d.getDate() + ur.dayOfWeek - nd)
    } else {
        d.setDate(d.getDate() + (ur.dayOfWeek - nd + 7))
    }
    //console.log("nd", d.getDay())
    const urDay = new UrDay(ctx)
    const fTime = await urDay.getTimeFirstUr(ctx.session.class_id, d.getDay())
    const arrTime = fTime.time_s.split(':')
    console.log('fTime =', fTime.time_s)
    d.setMinutes(arrTime[1])
    d.setHours(arrTime[0])
    console.log("####", d)
    const urName = await myClass.getUrByNameId(name_id, ctx.session.class_id)
    ctx.reply(`${urName[0].name}. Введите текст напоминания:`)
    ctx.scene.session.state.rmDay = d
})
//-------------------------------------------------------------------------------------
remember.on('text', async ctx => {
    ctx.scene.session.state.msgText = ctx.message.text.replaceAll("'", '"').replaceAll("`", '"').trim()
    const d = ctx.scene.session.state.rmDay
    const urDay = new UrDay(ctx)
    const nameDay = urDay.getNameDayWhenEmpty(d.getDay())
    ctx.reply(`Напоминание запланировано на ${nameDay} ${outDate(d)}: ${ctx.scene.session.state.msgText}`, queryYesNoMenu())
})
//-------------------------------------------------------------
remember.action('queryYes2', async ctx => {
    ctx.answerCbQuery()
    const eC = new EventsClass(ctx)
    eC.addEvent(ctx.scene.session.state.rmDay, ctx.scene.session.state.msgText)
})
//-------------------------------------------------------------
remember.action('queryNo2', async ctx => {
    ctx.answerCbQuery()
    ctx.scene.session.state = {}
    ctx.scene.reenter()
})

export default remember