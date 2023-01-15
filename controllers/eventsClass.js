import { call_q } from '../config/query.js'
import axios from 'axios'
import { getDateTimeBD } from '../utils.js'
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
    constructor(ctx) {
        if(ctx){
            this.user_id = ctx.from.id
            this.class_id = ctx.session.class_id | 0
        }
    }
    //------------------------------------
    async searchEvents(class_id){}
    //------------------------------------
    async addEvent(dateTime, str){
        str = str.replaceAll("'", '"').trim()
        if(str == '')str = 'Вы просили Вам напомнить, так вот - уже пора.'
        const sql = `
            INSERT INTO ivanych_bot.events_class (class_id, client_id, cronTab, dataTime, text, cycle) 
            VALUES (${this.class_id}, '${this.user_id}', '', '${getDateTimeBD(dateTime)}', '${str}',0);
        `
        return await call_q(sql, 'addEvent')
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
    async listForUser(){
        const sql = `
            SELECT id, dataTime dateTime, ec.text
            FROM ivanych_bot.events_class ec
            WHERE ec.active > 0
            AND client_id = ${this.user_id}
            ORDER BY dataTime ASC;
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
//        console.log("@@@@ sendTlgMessage url =", url)
//        return await axios.get(url)
    }
    //---------------------------------------
    async updateActive(id, active){
        const sql = `
            UPDATE ivanych_bot.events_class SET active = ${active} WHERE (id = ${id});
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
                    this.updateActive(msg.id, msg.active - 1)
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