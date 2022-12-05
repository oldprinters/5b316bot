import moment from 'moment-timezone'

//-------------------------------------------
const getDateBD = (str = undefined) => {
    let d
    if(str != undefined){ 
        const dd = str.split('.')
        console.log("dd =", dd)
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
    return `${h > 0? `${h >9? h: '0'+ h}:`:''}${m > 9? m: '0' + m}`
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

export { compareTime, getDateBD, getPause, outTime, outTimeDate, sumTimes }