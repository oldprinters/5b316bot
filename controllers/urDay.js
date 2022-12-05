import { call_q } from "../config/query.js";
import BaseName from "./basename.js";
import { getDateBD } from '../utils.js'

class UrDay extends BaseName {
    dateEnd = '-05-31'
    constructor() {
        super('urday')
    }
    //------------------------
    getDateEnd(){
        const d = new Date()
        const m = d.getMonth()
        let y = d.getFullYear()
        y += (m > 8)
        return `${y}${this.dateEnd}`
    }
    //------------------------
    async delById(id) {
        const sql = `UPDATE ivanych_bot.urDay SET active = 0 WHERE (id = ${id});`
        return await call_q(sql)
    }
    //------------------------
    async getNumberOfLesson(class_id){
        const sql = `
            SELECT MAX(order_num) n
            FROM ivanych_bot.urTime
            WHERE class_id = ${class_id}
            AND active = 1
        `
        const res = (await call_q(sql))[0].n
        return res == undefined? res: res + 1
    }
    //------------------------
    getNameDay(n){
        switch(n){
            case 0: return 'Воскресенье'
            case 1: return 'Понедельник'
            case 2: return 'Вторник'
            case 3: return 'Среда'
            case 4: return 'Четверг'
            case 5: return 'Пятница'
            case 6: return 'Суббота'
        }
    }
    //------------------------
    getNameDayWhen(n){
        switch(n){
            case 0: return 'В воскресенье'
            case 1: return 'В понедельник'
            case 2: return 'Во вторник'
            case 3: return 'В среду'
            case 4: return 'В четверг'
            case 5: return 'В пятницу'
            case 6: return 'В субботу'
        }
    }
    //------------------------------------ запрос конкретного урока
    async getUrForDay(class_id, dayOfWeek, urNum){
        const sql=`
            SELECT ud.id, ud.dayOfWeek, dateStart, dateEnd, time_s, time_e, name
            FROM ivanych_bot.urDay ud
            LEFT JOIN urTime ut ON ut.id = ud.urTimeId
            LEFT JOIN basename bn ON bn.id = ud.name_id
            WHERE ud.class_id = ${class_id}
            AND dayOfWeek = ${dayOfWeek}
            AND ut.order_num = ${urNum}
            AND ud.active = 1
            AND ut.active = 1
            ORDER BY ud.id DESC
            ;
        `
        return await call_q(sql)
    }
    //------------------------------------ сегодняшнее расписание
    async getSheduleToday(class_id){
        const d = new Date()
        return await this.listSheduleForDay(class_id, d.getDay())
    }
    //------------------------
    async insertUrDayPermanent(class_id, dayOfWeek, urTimeId, name, dateStart, dateEnd){
        const name_id = await this.setName(name)
        if(dateStart == undefined)dateStart = getDateBD()
        if(dateEnd == undefined)dateEnd = this.getDateEnd()
        if(name_id){
            const sql=`INSERT INTO ivanych_bot.urDay (class_id, dayOfWeek, urTimeId, name_id, dateStart, dateEnd) ` +
            `VALUES (${class_id}, ${dayOfWeek}, ${urTimeId}, ${name_id}, '${dateStart}', '${dateEnd}');`
            return await call_q(sql)
        } else {
            console.log("Error write BaseName. insertUrDay")
        }
    }
    //------------------------
    async insertUrDayTemporary(class_id, dayOfWeek, urTimeId, name, dateStart, dateEnd){
        const name_id = await this.setName(name)
        if(name_id){
            const sql=`INSERT INTO ivanych_bot.urDay (class_id, dayOfWeek, urTimeId, name_id, dateStart, dateEnd) ` +
            `VALUES (${class_id}, ${dayOfWeek}, ${urTimeId}, ${name_id}, ');`
            return await call_q(sql)
        } else {
            console.log("Error write BaseName. insertUrDay")
        }
    }
    //------------------------------------ 
    async listSheduleForDay(class_id, dayOfWeek){
        const sql=`
            SELECT ut.order_num, dateStart, dateEnd, time_s, time_e, name
            FROM ivanych_bot.urDay ud
            LEFT JOIN urTime ut ON ut.id = ud.urTimeId
            LEFT JOIN basename bn ON bn.id = ud.name_id
            WHERE ud.class_id = ${class_id}
            AND dayOfWeek = ${dayOfWeek}
            AND ud.active = 1
            AND ut.active = 1
            AND dateStart <= CURDATE()
            AND dateEnd >= CURDATE()
            ORDER BY ud.id ASC
            ;
        `
        const arr = await call_q(sql)
        return this.searchLastChange(arr)
    }
    //------------------------------------
    searchLastChange(arr){
        let myMap = new Map()
        for ( let el of arr){
            myMap.set(el.order_num, el)
        }
        //console.log("###@@ myMap =", myMap)
        return myMap
    }
}

export default UrDay