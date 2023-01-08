import AdditionalClass from './controllers/additionalClass.js'
import MyClass from './controllers/classes.js'
import EventsClass from './controllers/eventsClass.js'
import UrDay from "./controllers/urDay.js"

//-------------------------------------------
const helpForSearch = () => {
    return 'Введите название урока (можно частично) и программа покажет когда на неделе проходят занятия.\n\n'+
    'Для просмотра расписания конкретного дня наберите: «в понедельник», «во вторник» и т.д.\n\n'+
    'Можно запросить расписаие «завтра» или «послезавтра».'
}
//-------------------------------------------
const outSearchResult = async (ctx, el, class_id) => {
    const myClass = new MyClass(ctx)
    const urDay = new UrDay(ctx)
    const res = await myClass.getUrByNameId(el.name_id, class_id)
    let strOut = `   <b><u>${res[0].name}</u></b>\n\n`

    for(let item of res){
        strOut += `${urDay.getNameDay(item.dayOfWeek)}, ${item.order_num + 1} ур. <i>(${item.time_s.slice(0,5)} - ${item.time_e.slice(0,5)})</i>\n`
    }
    await ctx.replyWithHTML(strOut)
}
//-------------------------------------------
const selectDay = (str) => {
    str = str.trim()
    let nDay = -1
    if(/^пон\S*/.test(str)){
        nDay = 1
    } else if(/^втор\S*/.test(str)){
        nDay = 2
    } else if(/^сред\S*/.test(str)){
        nDay = 3
    } else if(/^четв\S*/.test(str)){
        nDay = 4
    } else if(/^пятн\S*/.test(str)){
        nDay = 5
    } else if(/^суб\S*/.test(str)){
        nDay = 6
    } else if(/^вос\S*/.test(str)){
        nDay = 0
    } 
    return nDay
//    const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, i)
}
//-------------------------------------------
const getNDayByWord = (str) => {
    const d = new Date()
    let tDay = d.getDay()
    
    if(str.indexOf('после') >= 0){
        tDay += 2
    } else {
        tDay += 1
    }
    if(tDay > 6)
        tDay -= 7
    return tDay
}
//-------------------------------------------
const outSelectedDay = async (ctx, nDay) => {
    const aC = new AdditionalClass(ctx)
    if(nDay > 6)
        nDay -= 7
    const urDay = new UrDay(ctx)
    const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, nDay)    
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    let list = await outShedule(listForDay, nLessons)
    list += await aC.getListForDay(nDay)//d.getDay())
    await ctx.replyWithHTML(`<b><u>${urDay.getNameDay(nDay)}</u></b>\n\n${list}`)
}
//-------------------------------------------
const getDnTime = (str) => {
    str = str.trim()
    const seachDn = /^(понед|вторн|сред|четв|пятн|суб|воскр)/
    let obj = undefined //{dn: undefined, time_s: undefined, time_e: undefined}
    if(seachDn.test(str.toLowerCase())){
        const arTime = str.match(/\d{1,2}:\d{2}/g)
        if(arTime != null){
            const dayName = str.slice(0, str.indexOf(' '))
            obj = {
                dn: selectDay(dayName), 
                name: dayName,
                time_s: arTime[0], 
                time_e: arTime[1]
            }
        } else {
            throw 'Проверьте значение времени. Формат: чч:мм чч:мм.'
        }
    } else {
        throw 'Не разобрал день недели, проверьте, пожалуйста.'
    }
    return obj
}
//-------------------------------------------
const searchByLessonName = async (ctx) => {
    const myClass = new MyClass(ctx)
    const urDay = new UrDay(ctx)
    await myClass.init()
    const seachDn = /^(Во|во|В|в)\s(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)$/
    const seachSdv = /^(завтра|послезавтра|Завтра|Послезавтра)$/
    if(seachDn.test(ctx.message.text.trim())){
        const sdv = ctx.message.text.indexOf(' ')
        const nDay = selectDay(ctx.message.text.slice(sdv + 1).trim())
        const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, nDay)    
        const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
        await ctx.replyWithHTML(`<b><u>${urDay.getNameDay(nDay)}</u></b>`)
        const list = await outShedule(listForDay, nLessons)
        await ctx.replyWithHTML(list)
    } else if(seachSdv.test(ctx.message.text.trim())){
        const nDay = getNDayByWord(ctx.message.text)
        await outSelectedDay(ctx, nDay)
    } else {
        const resNames = await myClass.searchLessonByName(ctx)
        const class_id = ctx.session.class_id
        if(resNames.length == 0){
            ctx.reply(`Урок, в название которого входит "${ctx.message.text}", не найден.`)
        } else if(resNames.length == 1){
            await outSearchResult(ctx, resNames[0], class_id)
        } else {
            for(let el of resNames){
                await outSearchResult(ctx, el, class_id)
            }
        }
    }
}
//-------------------------------------------
const outShedule = async (listForDay, nLessons, today = false) => {
    let list = ''
    let lN = false
    for(let j = nLessons - 1; j >= 0; j--){
        const el = await listForDay.get(j)
        const star = (el != undefined) && today && inLesson(el.time_s, el.time_e)
        if(el == undefined){
            if(lN)
                list = (j + 1) + ')\n' + list
        } else {
            lN = true
            list = (el.order_num + 1) + `) ${star?'<b>':'<i>'}` + el.time_s.slice(0,5) + '-' + el.time_e.slice(0,5) + `  ${star?'':'</i>'}` + el.name + `${star? ' ***</b>': ''}\n` + list
        }
    }
    if(list.length == 0)
        list = 'Нет данных об уроках.'
    return list
}
//-------------------------------------------
const getRoleName = (code) => {
    switch(code){
        case 'parent': return 'Родитель'
        case 'student': return 'Ученик'
        case 'teacher': return 'Преподаватель'
        case 'c_teacher': return 'Классный руководитель'
    }
}
//-------------------------------------------
const getSheduleToday = async (ctx) => {
    const urDay = new UrDay()
    const d = new Date()
    const aC = new AdditionalClass(ctx)
    const arr = await urDay.getSheduleToday(ctx.session.classList[ctx.session.i].class_id)
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    let list = ''
    if(nLessons != null && arr.size > 0)
        list = await outShedule(arr, nLessons, true)
    list += await aC.getListForDay(d.getDay())
    return list
}
//-------------------------------------------
const getDateBD = (str = undefined) => {
    let d
    if(str != undefined){ 
        const dd = str.split('.')
        d = new Date(parseInt(dd[2]), parseInt(dd[1]) - 1, parseInt(dd[0]))
    } else d = new Date()
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}
//-------------------------------------------
const getDateTimeBD = (d = undefined) => {
    if(d == undefined){ 
        d = new Date()
    }
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:00`
}
//-------------------------------------------
const compareTime = (t1, t2, dt = 45) => {
    const tt1 = new Date(`2011-05-20 ${t1}`)
    const tt2 = new Date(`2011-05-20 ${t2}`)
    return (tt2 - tt1)/60000 > dt
}
//-------------------------------------------
const getPause = (t1, t2, dt) => {
    const tt1 = new Date(`2011-05-20 ${t1}`)
    const tt2 = new Date(`2011-05-20 ${t2}`)
    const t = (tt2 - tt1) / 60000 - tuMin(dt)
    return t
}
//-------------------------------------------
const outTime = (t) => {
    t = Math.abs(t)
    let h = 0
    let m = t
    if(t > 59){
        h = Math.trunc(t / 60)
        m = t % 60
    }
    return `${h > 0? `${h >9? h: '0'+ h}`:'00'}:${m > 9? m: '0' + m}`
}
//-------------------------------------------
const outTimeDate = (d) => {
    let tt = d.getHours()
	let mm = d.getMinutes()
	return (tt > 9?'':'0') + tt + ':' + (mm > 9?'':'0') + mm
}
//-------------------------------------------
const outDate = (dd, r = '.') => {
    let m = dd.getMonth() + 1
	let d = dd.getDate()
	return (d > 9?'':'0') + d + r + (m > 9?'':'0') + m + r + dd.getFullYear()
}
//-------------------------------------------
const outDateTime = (dd) => {
    console.log("dd=", dd)
    return outDate(dd) + ' ' + outTimeDate(dd)
}
//-------------------------------------------
const tuMin = (t) => {
    const arT = t.split(':')
    return arT[0]*60 + parseInt(arT[1])
}
//-------------------------------------------
const sumTimes = (t1, dt) => {
    return outTime(tuMin(t1) + tuMin(dt))
}
//-------------------------------------------
const setTime = (t) => {
    const tt = new Date()
    tt.setHours(0)
    tt.setMinutes(tuMin(t))
    return tt
}
//-------------------------------------------
const inLesson = (ts, te) => {
    const dt = new Date()
    const ds = setTime(ts)
    const de = setTime(te)
return (ds <= dt && dt < de) 
}
//-------------------------------------------
const setCommands = async (ctx) => {
    await ctx.setMyCommands([
        {command: 'start', description: 'Перезапуск'}, 
        {command: 'help', description: 'Вызов справки'}, 
        {command: 'settings', description: 'Настройки'},
        {command: 'remember', description: 'Напоминалки'},
    ])
}
//--------------------------------------------
const getNotesTime = async () => {
    const eC = new EventsClass()
    await eC.getNotes()
}

export { compareTime, getDateBD, getDateTimeBD, getDnTime, getNotesTime, getPause, getRoleName, getSheduleToday, helpForSearch, inLesson, 
    outDate, outDateTime, outSelectedDay, outShedule, outTime, outTimeDate, searchByLessonName, setCommands, sumTimes }