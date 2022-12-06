import {Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import UrTime from "../controllers/urTime.js"
import { queryYesNoCancelMenu, queryYesNoMenu, queryDelCancelMenu } from '../keyboards/keyboards.js'
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
    } else {
        const ar = urTimeList
//        console.log("@@@!@ ar =", ar, ar.length)
        let text = ''
        for (let el of ar){
            text = text.concat(`${el.time_s} - ${el.time_e}\n`)
        }
        await ctx.reply(text)
        await ctx.reply('Данные верны?', queryYesNoMenu())
    
    }
})
//-----------
setTimesUr.action('queryDel', async ctx => {
    ctx.answerCbQuery()
    const ut = new UrTime()
    const res = await ut.delTimesForClass(ctx.session.class_id)
    if(res.affectedRows > 0)
        await ctx.scene.enter('SET_TIMES_UR')
    else
        ctx.reply('Ошибка удаления данных времени.')
})
//-----------
setTimesUr.action('queryYes2', async ctx => {
    ctx.answerCbQuery()
    ctx.scene.enter('SELECT_ACTION')
})
//-----------
setTimesUr.action('queryNo2', async ctx => {
    ctx.answerCbQuery()
    ctx.reply('Удалить текущие установки?', queryDelCancelMenu())
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
setTimesUr.hears(/^[0-9]{3,4}$/, async ctx =>{
    const t = ctx.message.text.slice(0, -2) + ':' + ctx.message.text.slice(-2)
    const ar = ctx.scene.session.state.arTimesUr
    if(ar.length){
        const pause = getPause(ar[ar.length - 1], t, ctx.session.classList[ctx.session.i].duration)
        if(isNaN(pause)){
            return await ctx.reply('Считаем, что в часу не более 59 минут, повторите ввод.')
        } else if(pause <= 0){
            const myClass = new MyClass(ctx)
            const mc = await myClass.getClassById(ctx.session.class_id)
            return await ctx.reply(`Слишком рано, предыдущий урок ещё не закончен (продолжительность урока ${mc.duration.slice(0,5)}), проверьте и повторите ввод.`)
        } else {
            await ctx.reply(`Перерыв ${outTime(pause)} мин.`)
        }
    }
    ctx.scene.session.state.arTimesUr.push(t)
    ctx.reply(`Введите время начала ${ctx.scene.session.state.arTimesUr.length + 1} занятия или q для завершения ввода.`)
})
//-----------
setTimesUr.hears(/^[qQйЙ]$/, async ctx =>{
    let text = ''
    const ar = ctx.scene.session.state.arTimesUr
    if(ar.length > 0){
        for (let i in ar){
            text = text.concat(`  ${ar[i]}\n`)
        }
        await ctx.reply(`Подтвердите правильность введенных значений:\n${text}`, queryYesNoCancelMenu())
    } else {
        await ctx.reply('Отсутствуют введенные данные. Сохранять нечего.')
        await ctx.scene.enter('SELECT_ACTION')
    }
    //console.log("@@@@ ctx.scene.session.state.arTimesUr =", ctx.scene.session.state.arTimesUr)
})
//-----------
setTimesUr.action('queryYes3', async ctx => {
    ctx.answerCbQuery('Сохраняю данные.')
    if(ctx.session.classList.length > 0){
        const ut = new UrTime()
        const res = await ut.saveNewTimes(ctx.session.class_id, ctx.scene.session.state.arTimesUr, ctx.session.classList[ctx.session.i].duration)
        ctx.scene.enter('SELECT_ACTION')
    } else {
        await ctx.reply('Отсутствуют введенные данные. Сохранять нечего.')
        ctx.session.i = 0
        await ctx.scene.enter('SELECT_ACTION')
    }
})
//-----------
setTimesUr.action('queryNo3', async ctx => {
    ctx.answerCbQuery()
    ctx.scene.reenter()
})
//-----------
setTimesUr.action('queryCancel', async ctx => {
    ctx.session.i = 0
    ctx.scene.enter('SELECT_ACTION')
})
//-----------
setTimesUr.on('text', ctx => ctx.reply('Время указывается в формате ЧЧ:ММ, для завершения ввода нажмите кнопку q.'))
//-----------
setTimesUr.start(async ctx => {
    ctx.scene.enter('SELECT_ACTION')
})

export default setTimesUr