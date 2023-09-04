import { call_q } from '../config/query.js'
import axios from 'axios'
import { getDateTimeBD, outTimeDate } from '../utils.js'
import {Telegraf} from "telegraf"
//eventsClass.js класс работает с событиями (каникулы, экскурсии и т.п.)
//каждое событие имеет дату и время начала и окончания. Дата окончания включена в событие.
//событие может быть привязано к чему-либо, как-то название урока, доб занятие, времени
//уроки и занятия подразумеваются ближайшие, иначе дата
//напоминалки для класса
/*
*/

class EventsClass {
    class
    user_id
    arrEvents = []
    sending = false
    //-------------------------------------
    constructor(ctx) {
        if(ctx){
            this.user_id = ctx.from.id
            this.class_id = ctx.session.class_id || 0
        }
    }
    //------------------------------------
    async searchEvents(class_id){}
    //------------------------------------ день недели, число, месяц
    async addEvent(dateTime, str, cronTab = ''){
        str = str.replaceAll("'", '"').trim()
        if(str == '')str = 'Вы просили Вам напомнить, так вот - уже пора.'
        const sql = `
            INSERT INTO ivanych_bot.events_class (class_id, client_id, cronTab, dataTime, text, cycle) 
            VALUES (${this.class_id}, '${this.user_id}', '${cronTab}', '${getDateTimeBD(dateTime)}', '${str}', ${cronTab.length > 0});
        `
        return await call_q(sql, 'addEvent')
    }
    //------------------------------------
    async delRemById(id){
        const sql = `
            UPDATE ivanych_bot.events_class SET cronTab = '', active = 0 WHERE (id = ${id});
        `
        return (await call_q(sql, 'addEvent')).affectedRows
    }
    //--------------------------------------
    async getNotesById(id){
        const sql = `
            SELECT * FROM ivanych_bot.events_class
            WHERE id = ${id};
        `
        return await call_q(sql, 'getNotesById')
    }
    //---------------------------------------- 
    async getForDayNed(d){
        const ds = new Date(d.getTime())
        ds.setHours(0, 0)
        const de = new Date(d.getTime())
        de.setHours(23, 59)
        const sql = `
            SELECT id, dataTime dateTime, ec.text
            FROM ivanych_bot.events_class ec
            WHERE ec.active > 0
            AND client_id = ${this.user_id}
            AND dataTime > '${getDateTimeBD(ds)}'
            AND dataTime < '${getDateTimeBD(de)}'
            ORDER BY dataTime ASC;
        `
        return await call_q(sql, 'getForDayNed')
    }
    //----------------------------------------
    async getForDayUser(){
        const de = new Date()
        de.setHours(23, 59)
        const sql = `
            SELECT id, dataTime dateTime, ec.text
            FROM ivanych_bot.events_class ec
            WHERE ec.active > 0
            AND client_id = ${this.user_id}
            AND dataTime > NOW()
            AND dataTime < '${getDateTimeBD(de)}'
            ORDER BY dataTime ASC;
        `
        return await call_q(sql, 'getForDayUser')
    }
    //--------------------------------------
    async getNotesByTime(){
        const sql = `
            SELECT * FROM ivanych_bot.events_class
            WHERE dataTime <= NOW()
            AND active > 0;
        `
        return await call_q(sql, 'getNotesByTime')
    }
    //----------------------------------------
    async listForDayUser(){
        const arr = await this.getForDayUser()
        let list = arr.length > 0? '\n<b>Не забудьте:</b>\n': ''
        arr.forEach(el => {
            const d = new Date(el.dateTime)
            list += `${outTimeDate(d)} ${el.text}\n`
        })
        return list
    }
    //----------------------------------------
    async listForDayNed(dn){
        const dt = new Date()
        const tDn = dt.getDay()
        dt.setDate(dt.getDate() + ((dn - tDn) < 0? dn-tDn+7:dn-tDn))
        const arr = await this.getForDayNed(dt)
        let list = arr.length > 0? '\n<b>Не забудьте в этот день:</b>\n': ''
        arr.forEach(el => {
            const d = new Date(el.dateTime)
            list += `${outTimeDate(d)} ${el.text}\n`
        })
        return list
    }
    //----------------------------------------
    async listForUser(){
        const sql = `
            SELECT id, dataTime dateTime, ec.text, cycle
            FROM ivanych_bot.events_class ec
            WHERE ec.active > 0
            AND client_id = ${this.user_id}
            ORDER BY cycle, dataTime ASC;
        `
        return await call_q(sql, 'listForUser')
    }
    //----------------------------------------
    async listForDel(){
        const sql = `
            SELECT id, dataTime dateTime, ec.text, cycle, cronTab
            FROM ivanych_bot.events_class ec
            WHERE ec.active > 0
            AND client_id = ${this.user_id}
            ORDER BY cycle, dataTime ASC;
        `
        return await call_q(sql, 'listForUser')
    }
    //----------------------------------------
    async sendTlgMessage(msg){
        const url = `https://api.telegram.org/bot${process.env.KEY}/sendMessage`
        return await axios.get(url, { params: {
            'chat_id': msg.client_id, 
            'text': '<b><u>Внимание!</u></b>\n' + msg.text,
            parse_mode : 'HTML',
            reply_markup : JSON.stringify({
                inline_keyboard : [
                    [
                        {
                            text: 'Принято',
                            callback_data: `answerAccepted${msg.id}`
                        }
                    ]
                ]
            })}
        })
    }
    //--------------------------------------- пересчитываем следующую остановку
    async setNewPeriod(msg){
        if(msg.cronTab.length > 0){
            const dd = new Date(msg.dataTime)
            const dt = new Date()
            if(dt > dd) {
                const arTab = msg.cronTab.split(' ')
                if(arTab[0] != '*'){
                    const sdt = parseInt(arTab[0]) - dt.getDay()
                    dd.setDate(dd.getDate() + (sdt > 0? sdt: 7 - (sdt)))
                }
                if(arTab[1] != '*')
                    dd.setMonth(dd.getMonth() + 1)
                if(arTab[2] != '*')
                    dd.setFullYear(dd.getFullYear() + 1)
                await this.updateDateTime(msg.id, dd)
            } 
        }
    }
    //---------------------------------------
    async updateActive(id, active){
        const sql = `
            UPDATE ivanych_bot.events_class SET active = ${active} WHERE (id = ${id});
        `
        return await call_q(sql, 'updateActive')
    }
    //---------------------------------------
    async updateDateTime(id, dt){
        const sql = `
            UPDATE ivanych_bot.events_class SET dataTime = '${getDateTimeBD(dt)}', active = 30 WHERE (id = ${id});
        `
        return await call_q(sql, 'updateActive')
    }
    //---------------------------------------
    async sendMsg() {
        this.sending = true
        while(this.arrEvents.length > 0){
            const msg = this.arrEvents.pop()
            if(msg.userORclass == 'user'){
                if(msg.active > 0){
                    await this.updateActive(msg.id, msg.active - 1)
                    if(msg.active == 1 && msg.cycle)
                        await this.setNewPeriod(msg)
                    if(msg.active%5 == 0)
                        await this.sendTlgMessage(msg)
                }
            } else {
                console.log("sendMsg class msg =", msg)
            }
        }
        this.sending = false
    }
    //---------------------------------------
    async getNotes(){
        this.arrEvents = this.arrEvents.concat(await this.getNotesByTime())
        if(!this.sending)
            this.sendMsg()
    }
}

export default EventsClass