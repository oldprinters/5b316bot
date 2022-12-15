//import moment from 'moment-timezone'

import UrDay from "./controllers/urDay.js"

//-------------------------------------------
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
    const arr = await urDay.getSheduleToday(ctx.session.classList[ctx.session.i].class_id)
    const nLessons = await urDay.getNumberOfLesson(ctx.session.class_id)
    let list = ''
    if(nLessons != null && arr.size > 0)
        list = outShedule(arr, nLessons, true)
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
    if(ctx.session.isAdmin == '1'){
        await ctx.setMyCommands([
            {command: 'start', description: 'Перезапуск'}, 
            {command: 'help', description: 'Вызов справки'}, 
            {command: 'settings', description: 'Настройки'},
        ])
    } else 
        await ctx.setMyCommands([
            {command: 'start', description: 'Перезапуск'}, 
            {command: 'help', description: 'Вызов справки'}, 
    ])
}

export { compareTime, getDateBD, getPause, getRoleName, getSheduleToday, inLesson, outShedule, outTime, outTimeDate, setCommands, sumTimes }