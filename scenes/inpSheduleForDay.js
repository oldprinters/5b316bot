import {Telegraf, Markup, Scenes, session} from "telegraf"
import UrDay from '../controllers/urDay.js'
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectDay} from '../keyboards/keyboards.js'

const inpSheduleForDay = new Scenes.BaseScene('INP_SHEDULE_FOR_DAY')
//--------------------------------------
inpSheduleForDay.enter(async ctx => {
    ctx.scene.session.state.urNum = 0
    ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
})
//------------------
inpSheduleForDay.start( ctx => { ctx.scene.leave()})
//------------------
inpSheduleForDay.hears(/\w*/, async ctx => {
    console.log("hears =", ctx.session)
    const urDay = new UrDay()
    const res = await urDay.insertUrDay(ctx.session.class_id, ctx.session.dayN, ctx.scene.session.state.urNum, ctx.message.text)
    console.log("@@@ res =", res)
})
//--------------------
inpSheduleForDay.on('text', async ctx => {
 //   if(ctx.message.text.length < 2){
        ctx.reply('Название урока не может эти символы')
//    } else {

//    }
    console.log("@@@ ctx =", ctx.message.text)
})
//----------------------
inpSheduleForDay.hears(/[qQйЙ]/, ctx => {
    ctx.reply('Завершение ввода')
    ctx.scene.enter('SET_SHEDULE_DAY')
})
export default inpSheduleForDay