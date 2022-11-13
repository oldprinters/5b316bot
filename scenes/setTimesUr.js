import {Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import UrTime from "../controllers/urTime.js"
import { queryYesNoMenu } from '../keyboards/keyboards.js'
import { compareTime, getPause, outTime } from '../utils.js'

const setTimesUr = new Scenes.BaseScene('SET_TIMES_UR')
//------------
setTimesUr.enter( async ctx => {
    const ut = new UrTime()
    const urTimeList = await ut.getListTimes(ctx.session.class_id)
    if(urTimeList.length == 0){
        ctx.scene.session.state.arTimesUr = []
        ctx.reply('Последовательно введите время начала каждого занятия в формате \'09:00\'. Для завершения введите букву q.')
        ctx.reply(`Введите время начала ${ctx.scene.session.state.arTimesUr.length + 1} занятия или q для завершения ввода.`)
        console.log("$$$ ctx =", ctx.scene.session.state)
    } else {
        ctx.reply('Продолжение следует.')
    }
})
//-----------
setTimesUr.hears(/^[0-9]{1,2}[:жЖ][0-5][0-9]$/, ctx =>{
    const ar = ctx.scene.session.state.arTimesUr
    ctx.message.text.replace('ж',':')
    ctx.message.text.replace('Ж',':')
    if(ar.length > 0){
        const pause = getPause(ar[ar.length - 1], ctx.message.text, ctx.session.classList[ctx.session.i].duration)
        if(pause <= 0){
            return ctx.reply('Предыдущий урок ещё не закончен, проверьте и повторите ввод.')
        } else {
            ctx.reply(`Перерыв ${outTime(pause)} мин.`)
        }
    }
    ctx.scene.session.state.arTimesUr.push(ctx.message.text)
    ctx.reply(`Введите время начала ${ctx.scene.session.state.arTimesUr.length + 1} занятия или q для завершения ввода.`)
})
//-----------
setTimesUr.hears(/^[0-9]{3,4}$/, ctx =>{
    const t = ctx.message.text.slice(0, -2) + ':' + ctx.message.text.slice(-2)
    const ar = ctx.scene.session.state.arTimesUr
    if(ar.length){
        const pause = getPause(ar[ar.length - 1], t, ctx.session.classList[ctx.session.i].duration)
        if(pause <= 0){
            return ctx.reply('Предыдущий урок ещё не закончен, проверьте и повторите ввод.')
        } else {
            ctx.reply(`Перерыв ${outTime(pause)} мин.`)
        }
    }
    ctx.scene.session.state.arTimesUr.push(t)
    ctx.reply(`Введите время начала ${ctx.scene.session.state.arTimesUr.length + 1} занятия или q для завершения ввода.`)
})
//-----------
setTimesUr.hears(/^[qQйЙ]$/, ctx =>{
    let text = ''
    const ar = ctx.scene.session.state.arTimesUr
    for (let i in ar){
        text = text.concat(`  ${ar[i]}\n`)
    }
    ctx.reply(`Подтвердите правильность введенных значений:\n${text}`, queryYesNoMenu())
    //console.log("@@@@ ctx.scene.session.state.arTimesUr =", ctx.scene.session.state.arTimesUr)
})
//-----------
setTimesUr.action('queryYes', async ctx => {
    ctx.answerCbQuery('Сохраняю данные.')
    const ut = new UrTime()
    const res = await ut.saveNewTimes(ctx.session.class_id, ctx.scene.session.state.arTimesUr, ctx.session.classList[ctx.session.i].duration)
})
//-----------
setTimesUr.action('queryNo', async ctx => {
    ctx.scene.reenter()
})
//-----------
setTimesUr.on('text', ctx => ctx.reply('Время указывается в формате ЧЧ:ММ, для завершения ввода нажмите кнопку q.'))
//-----------
setTimesUr.start(async ctx => {ctx.scene.leave()})

export default setTimesUr