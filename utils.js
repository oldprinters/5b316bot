import AdditionalClass from './controllers/additionalClass.js'
import MyClass from './controllers/classes.js'
import EventsClass from './controllers/eventsClass.js'
import UrDay from "./controllers/urDay.js"

//-------------------------------------------
const adminStats = async () => {
    //sql = 
}
//-------------------------------------------
const helpForSearch = (ctx) => {
    let text = ''
    if(ctx.session.i >= 0)
        return '<b><u>Расписание</u></b>\nВведите название урока (можно частично) и программа покажет когда на неделе проходят занятия.\n\n'+
        'Для просмотра расписания конкретного дня наберите: «в понедельник», «во вторник» и т.д.\n\n'+
        'Можно запросить расписание «завтра» или «послезавтра».'
    else
        return 'Для работы с расписанием уроков нужно создать класс. Для этого последовательно выбирайте: Меню -> Настройки -> Добавить класс'
}
//-------------------------------------------
const outSearchResult = async (ctx, el, class_id) => {
    if(ctx.session.i >= 0){
        const myClass = new MyClass(ctx)
        const urDay = new UrDay(ctx)
        const res = await myClass.getUrByNameId(el.name_id, class_id)
        let strOut = '<i>Ничего не нашёл...</i>'
        if(res[0] != undefined){
            strOut = `   <b><u>${res[0].name}</u></b>\n\n`

            for(let item of res){
                strOut += `${urDay.getNameDay(item.dayOfWeek)}, ${item.order_num + 1} ур. <i>(${item.time_s.slice(0,5)} - ${item.time_e.slice(0,5)})</i>\n`
            }
        }
        await ctx.replyWithHTML(strOut)
    }
}
//------------------------------------
const getCronForDn = (str) => {
    const nDay = selectDay(str)
    if(nDay >= 0)
        return `${nDay} * *`
    return ''
}
//-------------------------------------------
const selectDay = (str) => {
    str = str.trim().toLowerCase()
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
}
//-------------------------------------------
const getNDayByWord = (str) => {
    const d = new Date()
    let tDay = d.getDay()
    
    if(str.indexOf('осле') >= 0){
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
    if(ctx.session.i >= 0){
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
}
//-------------------------------------------
const getDnTime = (str) => {
    str = str.trim()
    const seachDn = /^(понед|вторн|сред|четв|пятн|суб|воскр)+/
    let obj = undefined //{dn: undefined, time_s: undefined, time_e: undefined}
    if(seachDn.test(str.toLowerCase())){
        const arT = str.match(/\d{1,2}[:жЖ]\d{2}/g)
        const arTime = arT.map( el => el.replace(/[жЖ]/, ':'))
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
//--------------------------------------------------------------- day to rem
const dayToRem = async (ctx) => {
    const str = ctx.message.text.trim().toLowerCase()
    const res = getDnTime(str)
    if(res != undefined && res.dn >= 1){
        const d1 = ctx.message.text.search(/\d{1,2}[:жЖ]\d{1,2}/)

        const p1 = ctx.message.text.indexOf(' ', d1 + 3)
        const textE = ctx.message.text.slice(p1 + 1)
        const d = new Date()
        const nd = d.getDay()
        if(res.dn > nd){
            d.setDate(d.getDate() + res.dn - nd)
        } else {
            d.setDate(d.getDate() + (res.dn - nd + 7))
        }
        const arT = res.time_s.split(':')
        d.setHours(arT[0])
        d.setMinutes(arT[1])
        await outTextRem(ctx, d, textE)
        return true
    } else {
        //ctx.reply('Текст не распознан. После указания времени не забыли написать сообщение?')
        return false
    }
}
//--------------------------------------------------------------- dd.mm.yyyy hh:mm
const fullToRem = async (ctx) => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2).replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p2 + 1)
    const arD = dateE.split('.')
    const date = new Date(`${arD[2]}-${arD[1]}-${arD[0]} ${timeE}`)
    await outTextRem(ctx, date, textE)
}
//---------------------------------------------------- dd.mm hh:mm
const dmhmToRem = async (ctx) => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dateE = ctx.match[0].slice(0, p1)
    const timeE = ctx.match[0].slice(p1, p2).replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p2 + 1)
    const arD = dateE.split('.')
    const arT = timeE.split(':')
    const date = new Date()
    date.setMonth(arD[1] - 1, arD[0])
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const now = new Date()
    if(now > date)
        date.setFullYear(date.getFullYear() + 1)
    await outTextRem(ctx, date, textE)
}
//--------------------------------------------------------------- fullToRem, dmhmToRem, nHoursToRem, nHMtoRem, nMinutesToRem
const nHoursToRem = async (ctx) => {
    const p1 = ctx.match[0].indexOf(' ')
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const dt = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p2)
    const date = new Date()
    date.setHours(date.getHours() + parseInt(dt))
    await outTextRem(ctx, date, textE)
}
//---------------------------------------------------- dd.mm
const dmNnToRem = async (ctx) => {
    const p1 = ctx.match[0].indexOf(' ')
    const dateE = ctx.match[0].slice(0, p1)
    const textE = ctx.match[0].slice(p1 + 1)
    const arD = dateE.split('.')
    const date = new Date()
    date.setMonth(arD[1] - 1, arD[0])
    date.setHours(10)
    date.setMinutes(0)
    const now = new Date()
    if(now > date)
        date.setFullYear(date.getFullYear() + 1)
    await outTextRem(ctx, date, textE)
}
//----------------------------------------------
const nHMtoRem = async (ctx) => {
    const p1 = ctx.match[0].indexOf(' ')
    const timeE = ctx.match[0].slice(0, p1).replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p1 + 1)
    const arT = timeE.split(':')
    const date = new Date()
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const nDate = new Date()
    if(nDate > date){
        date.setDate(date.getDate() + 1)
    }
    await outTextRem(ctx, date, textE)
}
//----------------------------------------------
const nMinutesToRem = async (ctx) => {
    const p1 = ctx.match[0].indexOf(' ')
    const dt = ctx.match[0].slice(0, p1)
    const p2 = ctx.match[0].indexOf(' ', p1 + 1)
    const textE = p2 > 0? ctx.match[0].slice(p2): '';
    const date = new Date()
    date.setMinutes(date.getMinutes() + parseInt(dt))
    await outTextRem(ctx, date, textE)
}
//--------------------------------------------
const tomorrowRem = async (ctx) => {
    const d1 = ctx.match[0].search(/\d{1,2}[:жЖ]\d{1,2}/)
    const p1 = ctx.match[0].indexOf(' ', d1 + 3)
    const timeE = (ctx.match[0].match(/\d{1,2}[:жЖ]\d{1,2}/))[0].replace(/[жЖ]/, ':')
    const textE = ctx.match[0].slice(p1)
    const arT = timeE.split(':')
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    await outTextRem(ctx, date, textE)
}
//--------------------------------------------
const tomorrowRemT = async (ctx, sTime, d1 = 7) => {
    const textE = ctx.match[0].slice(d1)
    const arT = sTime.split(':')
    const date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    await outTextRem(ctx, date, textE)
}
//---------------------------------------------------------------
const remForDay = async (ctx, next) => { 
    let str = ctx.match[0]
    const p = str.search(/\d{1,2}[:жЖ]\d{1,2}/)
    const p1 = str.indexOf(' ', p + 3)
    const text = str.slice(p1 + 1).trim()
    const timeS = str.match(/\d{1,2}[:жЖ]\d{1,2}/)[0].replace(/[жЖ]/,':')
    str = str.match(/(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)/)[0]
    const dn = selectDay(str)
    if(dn >= 0){
        const cronTab = getCronForDn(str)
        const arDt = timeS.split(':')
        const dt = new Date()
        const tDn = dt.getDay()
        dt.setDate(dt.getDate() + ((dn - tDn) < 0? dn-tDn+7:dn-tDn))
        dt.setHours(arDt[0])
        dt.setMinutes(arDt[1])
        const eC = new EventsClass(ctx)
        try {
            if(eC.addEvent(dt, text, `${cronTab}`))
                ctx.reply(`Еженедельное напоминание. Ближайшее напоминание "${text}" запланировано на ${outDate(dt)} ${outTimeDate(dt)}.`)
            }catch (err){
                ctx.reply("Ошибка сохранения.")
                console.log("!!!Catch ", err)
        }
        return true
    } else {
        next()
    }
}
//-------------------------------------------
const everyMonth = async (ctx) => {
    const str = ctx.match[0].slice(7)
    const p1 = str.indexOf(' ')
    const p2 = str.indexOf(' ', p1 + 1)
    const text = str.slice(p2 + 1).trim()
    const d = parseInt(str.slice(0, p1))
    const t = str.slice(p1 + 1, p2).replace(/[жЖ]/, ':')
    const arT = t.split(':')
    const date = new Date()
    date.setDate(d)
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const nDate = new Date()
    date.setMonth(date.getMonth() + (nDate > date))
    const croneTab = `* ${parseInt(d)} *`
    await outTextRem(ctx, date, text, croneTab)
}
//-------------------------------------------
const everyYear = async (ctx) => {
    const str = ctx.match[0].slice(7)
    const p1 = str.indexOf(' ')
    const p2 = str.indexOf(' ', p1 + 1)
    const text = str.slice(p2 + 1).trim()
    const d = str.slice(0, p1)
    const t = str.slice(p1 + 1, p2).replace(/[жЖ]/, ':')
    const arT = t.split(':')
    const arD = d.split('.')
    const date = new Date()
    date.setMonth(arD[1] - 1, arD[0])
    date.setHours(arT[0])
    date.setMinutes(arT[1])
    const nDate = new Date()
    if(nDate > date){
        date.setFullYear(date.getFullYear() + 1)
    }
    const croneTab = `* ${parseInt(arD[0])} ${parseInt(arD[1])}`
    await outTextRem(ctx, date, text, croneTab)
}
//-------------------------------------------
const searchRem = async (ctx) => {
    const remTomorrow = /^(завтра|Завтра) (в )?\d{1,2}[:жЖ]\d{1,2}([ _.,а-яА-ЯйЙёЁa-zA-Z0-9+-=<>])*/
    if(remTomorrow.test(ctx.message.text.trim().toLowerCase())){
        const d1 = ctx.message.text.search(/\d{1,2}[:жЖ]\d{1,2}/)
        const p1 = ctx.message.text.indexOf(' ', d1 + 3)
        const timeE = (ctx.message.text.match(/\d{1,2}[:жЖ]\d{1,2}/))[0].replace(/[жЖ]/, ':')
        const textE = ctx.message.text.slice(p1)
        const arT = timeE.split(':')
        const date = new Date()
        date.setDate(date.getDate() + 1)
        date.setHours(arT[0])
        date.setMinutes(arT[1])
        await outTextRem(ctx, date, textE)
        return true
    } else {
        return false
    }
}
//------------------------
const getNameDayWhenEmpty = (n) => {
    switch(n){
        case 0: return 'воскресенье'
        case 1: return 'понедельник'
        case 2: return 'вторник'
        case 3: return 'среду'
        case 4: return 'четверг'
        case 5: return 'пятницу'
        case 6: return 'субботу'
    }
}
//-------------------------------------------
const searchByLessonName = async (ctx) => {
    if(ctx.session.i >= 0){
        const myClass = new MyClass(ctx)
        const urDay = new UrDay(ctx)
        await myClass.init()
        const seachDn = /^(Во|во|В|в)?\s?(понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)$/
        const seachSdv = /^(завтра|послезавтра|Завтра|Послезавтра)\s?$/

        if(seachDn.test(ctx.message.text.trim().toLowerCase())){
            const sdv = ctx.message.text.indexOf(' ')
            const nDay = selectDay(ctx.message.text.slice(sdv + 1).trim())
            if(nDay >= 0){
                const listForDay = await urDay.listSheduleForDay(ctx.session.class_id, nDay)    
                const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
                await ctx.replyWithHTML(`<b><u>${urDay.getNameDay(nDay)}</u></b>`)
                let list = await outShedule(listForDay, nLessons)
                const eC = new EventsClass(ctx)
                list += await eC.listForDayNed(nDay)
                await ctx.replyWithHTML(list)
                return true
            } else {
                await ctx.replyWithHTML('Не определил день недели.')
                return ctx.scene.reenter()
            }
        } else if(seachSdv.test(ctx.message.text.trim().toLowerCase())){
            const nDay = getNDayByWord(ctx.message.text)
            await outSelectedDay(ctx, nDay)
            return true
        } else {
            const resNames = await myClass.searchLessonByName(ctx)
            const class_id = ctx.session.class_id
            if(resNames.length == 0){
                if(!(await searchRem(ctx))){
    //                await ctx.reply(`Урок, в название которого входит "${ctx.message.text}", не найден.`)
                    return false
                }
            } else if(resNames.length == 1){
                await outSearchResult(ctx, resNames[0], class_id)
            } else {
                for(let el of resNames){
                    await outSearchResult(ctx, el, class_id)
                }
            }
            return true
        }
    }
    return false
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
        list = 'Нет данных об уроках.\n'
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
    if(ctx.session.i >= 0){
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
    } else {
        return 'Не выбран класс'
    }
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
    const dd = d.getDate()
    const m = d.getMonth() + 1
    const mn = d.getMinutes()
    const ch = d.getHours()
    return `${d.getFullYear()}-${m>9? m : '0' + m }-${dd>9?dd:'0'+dd} ${ch>9?ch:'0'+ch}:${mn>9?mn:'0'+mn}:00`
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
const outDateMonth = (dd, r = '.') => {
    let m = dd.getMonth() + 1
	let d = dd.getDate()
	return (d > 9?'':'0') + d + r + (m > 9?'':'0') + m
}
//-------------------------------------------
const outTextRem = async (ctx, date, textE, croneTab = '') => {
    const eC = new EventsClass(ctx)
    const textT = textE.length > 0? textE: "***"
    if(await eC.addEvent(date, textE, croneTab))
        ctx.reply(`Напоминание "${textT}" запланировано на ${outDate(date)} ${outTimeDate(date)}.`)
    else
        ctx.reply("Ошибка сохранения.")
}
//-------------------------------------------
const outDateTime = (dd) => {
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
//        {command: 'catalogs', description: 'Каталоги'},
        {command: 'settings', description: 'Настройки'},
        {command: 'games', description: 'Развивалки'},
        {command: 'remember', description: 'Напоминалки'},
    ])
}
//--------------------------------------------
const getNotesTime = async () => {
    const eC = new EventsClass()
    await eC.getNotes()
}

export { compareTime, getCronForDn, getDateBD, getDateTimeBD, getDnTime, getNameDayWhenEmpty, getNotesTime, getPause, getRoleName, getSheduleToday, helpForSearch, inLesson, 
    dayToRem, fullToRem, nHoursToRem, nMinutesToRem, nHMtoRem, dmhmToRem, dmNnToRem, tomorrowRem, tomorrowRemT, everyMonth, everyYear,
    outDate, outDateMonth, outDateTime, outSelectedDay, outShedule, outTextRem, outTime, outTimeDate, remForDay, searchByLessonName, selectDay, setCommands, sumTimes }