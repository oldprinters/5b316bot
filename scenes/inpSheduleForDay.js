import {Telegraf, Markup, Scenes, session} from "telegraf"
import UrDay from '../controllers/urDay.js'
import UrTime from "../controllers/urTime.js"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {queryDelCancelMenu, queryYesNoMenu} from '../keyboards/keyboards.js'
import { getDateBD, outShedule } from '../utils.js'
//inpSheduleForDay.js
const inpSheduleForDay = new Scenes.BaseScene('INP_SHEDULE_FOR_DAY')
//--------------------------------------
const getList = async (ctx) => {
    const urDay = new UrDay()
    let listForDay
    let nLessons
    try {
        listForDay = await urDay.listSheduleForDay(ctx.session.class_id, ctx.session.dayN)    //Map
    }catch(err){
        console.log("Catch. inpSheduleForDay.js listForDay err =", err)
    }
    try {
        nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    }catch(err){
        console.log("Catch. inpSheduleForDay.js nLessons err =", err)
    }
    let list = 'Нет данных.'
    if(nLessons != null)
        list = await outShedule(listForDay, nLessons)
    return list
}
//--------------------------------------
inpSheduleForDay.enter(async ctx => {
    ctx.scene.session.state.urNum = 0
    const list = await getList(ctx)
    await ctx.replyWithHTML(list)
    const urDay = new UrDay()
    await ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или "q" для окончания ввода:`)
})
//--------------------
inpSheduleForDay.help( async ctx => {
    await ctx.replyWithHTML('<b><u>Работа с расписанием</u></b>\n'+
        '<i>Удаление урока:</i> N del\n'+
        '<i>Постоянное изменение урока:</i> N [новый урок]\n'+
        '<i>Временное изменение урока (с ... по ...)</i>:\n dd.mm.yyyy dd.mm.yyyy N [новый урок]\n'+
        '<i>Где "N" - номер урока</i>.')
})
//------------------
inpSheduleForDay.start( ctx => { 
    ctx.scene.enter('SELECT_ACTION')
})
//----------------------
inpSheduleForDay.hears(/^[qQйЙ]$/, async ctx => {
    await ctx.reply('Завершение ввода')
    await ctx.scene.enter('SET_SHEDULE_DAY')
})
//----------------------
inpSheduleForDay.hears(/^[0-9]$/, async ctx => {
    const urDay = new UrDay()
    ctx.scene.session.state.urNum = parseInt(ctx.message.text[0]) - 1
    await ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
})
//------------------------
inpSheduleForDay.hears(/^[0-9] del+$/, async ctx =>{
    ctx.scene.session.state.urNum = parseInt(ctx.message.text[0]) - 1
    const urDay = new UrDay()
    const ur = (await urDay.getUrForDay(ctx.session.class_id, ctx.session.dayN, ctx.scene.session.state.urNum))[0]

    if(ur == undefined){
        await ctx.reply(`Этот урок в базе не обозначен.`)
        return await ctx.scene.reenter()
    }
    ctx.scene.session.state.delId = ur.id
    ctx.reply(`${urDay.getNameDayWhen(ctx.session.dayN)} удаляем ${ctx.scene.session.state.urNum + 1} урок (${ur.name}).`, queryDelCancelMenu())
})
//------------------------ редактирование конкретного урока
inpSheduleForDay.hears(/^[0-9] [a-zA-Z. а-яА-ЯёЁйЙ-]+/, async ctx =>{
    const n = parseInt(ctx.message.text[0]) - 1
    if(!isNaN(n) && n >= 0){
        const str = ctx.message.text.slice(2).trim()
        await ctx.reply(`Замена урока ${n+1} => ${str}`)
        const urTime = new UrTime()
        const urDay = new UrDay()
        const urTimeId = await urTime.getByOrder(ctx.session.class_id, n)
        if(urTimeId == undefined){
            await ctx.reply('Отсутствует время начала и окончания урока.')
            return await ctx.scene.enter('SET_TIMES_UR')
        }
        ctx.scene.session.state.urNum = n
        try {
            const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, str )
            if(res.affectedRows > 0){
                const list = await getList(ctx)
                await ctx.replyWithHTML(list)
                ctx.scene.session.state.urNum += 1
                await ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или "q" для окончания ввода:`)
            }
        } catch(err){
            console.log("Catch inpSheduleForDay", err)
        }
    } else {
        await ctx.reply('Такого урока не бывает.')
    }
})
//------------------------ временное изменение урока
inpSheduleForDay.hears(/^\d{1,2}.\d{1,2}.\d{4} \d{1,2}.\d{1,2}.\d{4} [0-9] [a-zA-Zа-я А-ЯёЁйЙ-]+/, async ctx =>{
    const text = ctx.message.text.trim().replaceAll('  ', ' ')
    const firstSpace = text.indexOf(' ')
    const secondSpace = text.indexOf(' ', firstSpace + 1)
    const date_s = text.slice(0, firstSpace)
    const date_e = text.slice(firstSpace, secondSpace)
    const n = parseInt(ctx.message.text[secondSpace+1]) - 1
    if(!isNaN(n) && n >= 0){
        const str = ctx.message.text.slice(secondSpace + 3).trim()
        ctx.reply(`Замена урока ${n+1} => ${str}`)
        const urTime = new UrTime()
        const urDay = new UrDay()
        const urTimeId = await urTime.getByOrder(ctx.session.class_id, n)
        if(urTimeId == undefined){
            await ctx.reply('Отсутствует время начала и окончания урока.')
            return await ctx.scene.enter('SET_TIMES_UR')
        }
        ctx.scene.session.state.urNum = n - 1
        try {
            const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, str, getDateBD(date_s), getDateBD(date_e) )
            if(res.affectedRows > 0){
                const list = await getList(ctx)
                await ctx.replyWithHTML(list)
                ctx.scene.session.state.urNum += 1
                ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
            }
        } catch(err){
            console.log("Catch inpSheduleForDay", err)
        }
    } else {
        ctx.reply('Такого урока не бывает.')
    }
})
//------------------ ввод нового урока
inpSheduleForDay.hears(/^[a-zA-Zа-яё. А-ЯЁйЙ-]+$/, async ctx => {
    const urDay = new UrDay()
    const ur = await urDay.getUrForDay(ctx.session.class_id, ctx.session.dayN, ctx.scene.session.state.urNum)
    if(ur[0] == undefined){
        const urTime = new UrTime()
        const urTimeId = await urTime.getByOrder(ctx.session.class_id, ctx.scene.session.state.urNum)
        if(urTimeId == undefined){
            await ctx.reply('Отсутствует время начала и окончания урока.')
            return await ctx.scene.enter('SET_TIMES_UR')
        }
        try {
            const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, ctx.message.text )
            if(res.affectedRows > 0){
                ctx.scene.session.state.urNum += 1
                ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или "q" для окончания ввода:`)
            }
        } catch(err){
            console.log("Catch inpSheduleForDay", err)
        }
    } else {
        await ctx.reply(`${urDay.getNameDayWhen(ctx.session.dayN)} с ${ur[0].time_s.slice(0, 5)} по ${ur[0].time_e.slice(0, 5)} "${ur[0].name}"`)
        ctx.scene.session.state.change = ctx.message.text
        ctx.scene.session.state.ud_id = ur[0].id
        ctx.reply( 'Временное изменение расписания?', queryYesNoMenu() )
    }
//    console.log("@@@ res =", res)
})
//-------------------- 
inpSheduleForDay.on('text', async ctx => {
 //   if(ctx.message.text.length < 2){
        ctx.reply('Название урока не может содержать эти символы')
//    } else {

//    }
})
//---------------------------------------
inpSheduleForDay.action('queryDel', async ctx => {
    await ctx.answerCbQuery()
    const urDay = new UrDay()
    try {
        await urDay.delById(ctx.scene.session.state.delId)
    } catch (err){
        console.log("Error urDay.delById", err)
    }
    const list = await getList(ctx)
    await ctx.replyWithHTML(list)
    await ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
})
//---------------------------------------
inpSheduleForDay.action('queryCancel', async ctx => {
    await ctx.answerCbQuery()
    ctx.scene.reenter()
})
//--------------------------------------- временное изменение расписание
inpSheduleForDay.action('queryYes2', ctx => {
    ctx.answerCbQuery()

})
//--------------------------------------- постоянное изменение расписания
inpSheduleForDay.action('queryNo2', async ctx => {
    await ctx.answerCbQuery()
    const urDay = new UrDay()
    try {
        await urDay.delById(ctx.scene.session.state.ud_id)
    } catch (err){
        console.log("Error urDay.delById", err)
    }
    const urTime = new UrTime()
    const urTimeId = await urTime.getByOrder(ctx.session.class_id, ctx.scene.session.state.urNum)
    if(urTimeId == undefined){
        await ctx.reply('Отсутствует время начала и окончания урока.')
        return await ctx.scene.enter('SET_TIMES_UR')
    }
try {
        const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, ctx.scene.session.state.change)
        if(res.affectedRows > 0){
            ctx.scene.session.state.urNum += 1
            await ctx.replyWithHTML(`<u>${urDay.getNameDay(ctx.session.dayN)}</u> Введите название ${ctx.scene.session.state.urNum + 1} урока или "q" для окончания ввода:`)
        }
    } catch (err){
        console.log("Error urDay.insertUrDay", err)
    }
})

export default inpSheduleForDay