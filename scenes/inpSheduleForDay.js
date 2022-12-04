import {Telegraf, Markup, Scenes, session} from "telegraf"
import UrDay from '../controllers/urDay.js'
import UrTime from "../controllers/urTime.js"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {queryDelCancelMenu, queryYesNoMenu} from '../keyboards/keyboards.js'

const inpSheduleForDay = new Scenes.BaseScene('INP_SHEDULE_FOR_DAY')
//--------------------------------------
inpSheduleForDay.enter(async ctx => {
    ctx.scene.session.state.urNum = 0
    const urDay = new UrDay()
    const listForDay = await urDay.ListSheduleForDay(ctx.session.class_id, ctx.session.dayN)    //Map
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    console.log("#@#@ listForDay", listForDay)
    console.log("#@#@ nLessons", nLessons)

    let list = ''
    for(let j = 0; j <= nLessons; j++){
        const el = listForDay.get(j)
        if(el == undefined){
            list += (j + 1) + ')\n'
        } else {
            list += (el.order_num + 1) + ') ' +el.time_s.slice(0,5) + '-' + el.time_s.slice(0,5) + ' ' + el.name + '\n'
        }

    }
    await ctx.reply(list)

    await ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
})
//------------------
inpSheduleForDay.start( ctx => { ctx.scene.leave()})
//----------------------
inpSheduleForDay.hears(/^[qQйЙ]$/, async ctx => {
    await ctx.reply('Завершение ввода')
    await ctx.scene.enter('SET_SHEDULE_DAY')
})
//----------------------
inpSheduleForDay.hears(/^[0-9]$/, async ctx => {
    ctx.scene.session.state.urNum = parseInt(ctx.message.text[0]) - 1
    await ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
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
    console.log("::: ur", ur)
    ctx.reply(`${urDay.getNameDayWhen(ctx.session.dayN)} удаляем ${ctx.scene.session.state.urNum + 1} урок (${ur.name}).`, queryDelCancelMenu())
})
//------------------------ редактирование конкретного урока
inpSheduleForDay.hears(/^[0-9] [a-zA-Zа-яА-ЯёЁ-]/, async ctx =>{
    const n = parseInt(ctx.message.text[0]) - 1
    if(!isNaN(n) && n >= 0){
        const str = ctx.message.text.slice(2).trim()
        ctx.reply(`Замена урока ${n+1} => ${str}`)
        const urTime = new UrTime()
        const urDay = new UrDay()
        const urTimeId = await urTime.getByOrder(ctx.session.class_id, n)
        if(urTimeId == undefined){
            await ctx.reply('Отсутствует время начала и окончания урока.')
            return await ctx.scene.enter('SET_TIMES_UR')
        }
        try {
            const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, str )
            if(res.affectedRows > 0){
                ctx.scene.session.state.urNum += 1
                ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
            }
        } catch(err){
            console.log("Catch inpSheduleForDay", err)
        }
    } else {
        ctx.reply('Такого урока не бывает.')
    }
})
//------------------ ввод нового урока
inpSheduleForDay.hears(/^[a-zA-Zа-яА-ЯёЁ-]+$/, async ctx => {
    console.log("hears =", ctx.session)
    const urDay = new UrDay()
    const ur = await urDay.getUrForDay(ctx.session.class_id, ctx.session.dayN, ctx.scene.session.state.urNum)
    if(ur[0] == undefined){
        const urTime = new UrTime()
        const urTimeId = await urTime.getByOrder(ctx.session.class_id, ctx.scene.session.state.urNum)
        if(urTimeId == undefined){
            await ctx.reply('Отсутствует время начала и окончания урока.')
            return await ctx.scene.enter('SET_TIMES_UR')
        }
        console.log("@@@#@ ", urTimeId)
        try {
            const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, ctx.message.text )
            if(res.affectedRows > 0){
                ctx.scene.session.state.urNum += 1
                ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
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
    console.log("@@@ ctx =", ctx.message.text)
})
//---------------------------------------
inpSheduleForDay.action('queryYes2', ctx => {
    ctx.answerCbQuery()

})
//---------------------------------------
inpSheduleForDay.action('queryDel', async ctx => {
    await ctx.answerCbQuery()
    const urDay = new UrDay()
    try {
        await urDay.delById(ctx.scene.session.state.delId)
        await ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
    } catch (err){
        console.log("Error urDay.delById", err)
    }
})
//---------------------------------------
inpSheduleForDay.action('queryCancel', async ctx => {
    await ctx.answerCbQuery()
    ctx.scene.reenter()
})
//---------------------------------------
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
        const res = await urDay.insertUrDayPermanent(ctx.session.class_id, ctx.session.dayN, urTimeId.id, ctx.scene.session.state.change, urDay.getDateEnd())
        if(res.affectedRows > 0){
            ctx.scene.session.state.urNum += 1
            await ctx.reply(`Введите название ${ctx.scene.session.state.urNum + 1} урока или q для окончания ввода:`)
        }
    } catch (err){
        console.log("Error urDay.insertUrDay", err)
    }
})

export default inpSheduleForDay