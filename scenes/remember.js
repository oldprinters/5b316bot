import {Scenes, session} from "telegraf"
import EventsClass from '../controllers/eventsClass.js'
//import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import { queryYesNoMenu, selectRemember, selectLesson } from '../keyboards/keyboards.js'
import UrDay from "../controllers/urDay.js"
import { outDate, outDateTime, remForDay } from '../utils.js'

const remember = new Scenes.BaseScene('REMEMBER')
//--------------------------------------
remember.enter(async ctx => {
    if(ctx.session.class_id > 0)
        await ctx.reply('Чем могу помочь?', selectRemember(ctx.session.class_id))
    else {
        ctx.scene.enter('FREE_WORDS')
    }
})
//--------------------------------------
remember.start( ctx => ctx.scene.enter('FIRST_STEP'))
//--------------------------------------
remember.help(ctx => {
    ctx.replyWithHTML('<b><u>Привязка к уроку</u></b>\n Напоминание оповестит в день занятия, за 90 мин до начала первого урока\n\n' +
    '<i>У "привязки к дате и времени" своя подсказка.</i>')
})
//-------------------------------------------------
remember.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//--------------------------------------
remember.hears(/^(Список|список|list|List)$/, async ctx => {
    const eC = new EventsClass(ctx)
    const list = await eC.listForUser()
    if(list.length == 0){
        ctx.reply('Нет запланированных напоминалок.')
    } else {
        let arOut = ''
        for(let el of list){
            arOut += `${outDateTime(el.dateTime)} ${el.text}\n`
        }
        ctx.replyWithHTML(`Список напоминалок:\n${arOut}`)
    }
})
//--------------------------------------
remember.action('nextLesson', async ctx => {
    ctx.answerCbQuery('Loading')
    if(ctx.session.class_id > 0){ 
        const myClass = new MyClass(ctx)
        const listLessons = await myClass.getLessonsList(ctx.session.class_id)
        if(listLessons.length == 0){
            ctx.reply('Не введены расписания уроков. Прошу ввести.')
            ctx.scene.enter('SET_SHEDULE_DAY')
        } else {
            ctx.reply('Выбирайте урок:', selectLesson(listLessons))
        }
    } else {
        await ctx.reply('Для привязки к урокам нужно выбрать класс.')
        ctx.scene.enter('FIRST_STEP')
    }
})
//--------------------------------------
remember.action('freeWords', async ctx => {
    ctx.answerCbQuery('Loading')
    ctx.scene.enter('FREE_WORDS')
})
//--------------------------------------
remember.action('delRems', async ctx => {
    ctx.answerCbQuery('Loading')
    ctx.scene.enter('DEL_REMS')
})
//---------------------------------------
remember.action(/^iSelectedLess_\d+$/, async ctx => {
    ctx.answerCbQuery('Loading')
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
    d.setHours(arrTime[0], arrTime[1] - 90)
    const urName = await myClass.getUrByNameId(name_id, ctx.session.class_id)
    ctx.reply(`${urName[0].name}. Введите текст напоминания:`)
    ctx.scene.session.state.rmDay = d
    ctx.scene.session.state.urName = urName[0].name
})
//------------------------------------------ обрабатываем каждый день недели 
remember.hears(/^(кажд|Кажд)(ый|ую|ое)\s(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)\s(в )?\d{1,2}[:жЖ]\d{1,2} [ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>]*/, 
    async (ctx, next) => {
        await remForDay(ctx, next)
})
//-------------------------------------------------------------------------------------
remember.on('text', async ctx => {
    ctx.scene.session.state.msgText = ctx.message.text.replaceAll("'", '"').replaceAll("`", '"').trim()
    const d = ctx.scene.session.state.rmDay
    if(d == undefined){
        await ctx.reply('Нужен ответ на вопрос!')
        await ctx.scene.reenter()
    } else {
        const urDay = new UrDay(ctx)
        const nameDay = urDay.getNameDayWhenEmpty(d.getDay())
        ctx.reply(`Напоминание запланировано на ${nameDay} ${outDate(d)}: ${ctx.scene.session.state.msgText}`, queryYesNoMenu())
    }
})
//-------------------------------------------------------------
remember.action('queryYes2', async ctx => {
    ctx.answerCbQuery('Loading')
    const eC = new EventsClass(ctx)
    eC.addEvent(ctx.scene.session.state.rmDay, 'Доброе утро! :-) ' + ctx.scene.session.state.urName + '. ' + ctx.scene.session.state.msgText)
    ctx.scene.enter('SELECT_ACTION')
})
//-------------------------------------------------------------
remember.action('queryNo2', async ctx => {
    ctx.answerCbQuery('Loading')
    ctx.scene.session.state = {}
    ctx.scene.reenter()
})

export default remember