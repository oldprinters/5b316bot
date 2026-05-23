import { call_q } from '../config/query.js'
import axios from 'axios'
import { getDateTimeBD, outTimeDate } from '../utils.js'
import {Telegraf} from "telegraf"

//eventsClass.js класс работает с событиями (каникулы, экскурсии и т.п.)
//каждое событие имеет дату и время начала и окончания. Дата окончания включена в событие.
//событие может быть привязано к чему-либо, как-то название урока, доб занятие, времени
//уроки и занятия подразумеваются ближайшие, иначе дата
//напоминалки для класса

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
        // console.log('addEvent sql =', sql)
        return await call_q(sql, 'addEvent')
    }
    //------------------------------------
    async delRemById(id){
        const sql = `
            UPDATE ivanych_bot.events_class SET cronTab = '', active = 0 WHERE (id = ${id});
        `
        return (await call_q(sql, 'delRemById')).affectedRows
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
    async getForDayFuture(textdate){
        const [dd, mm] = textdate.split('.');   // ваша дата dd.mm
        const year = new Date().getFullYear(); // или свой год
        // Одна и та же календарная дата
        const baseDate = new Date(year, Number(mm) - 1, Number(dd));

        // Начало дня 00:00
        const start = new Date(baseDate);
        start.setHours(0, 0, 0, 0);
        // Конец дня 23:59
        const end = new Date(baseDate);
        end.setHours(23, 59, 59, 999); // или 23, 59, 59, 999 если нужны секунды и мс

        if(end < new Date()){
            start.setFullYear(new Date().getFullYear() + 1)
            end.setFullYear(new Date().getFullYear() + 1)
        }

        const sql = `
            SELECT id, dataTime dateTime, ec.text
            FROM ivanych_bot.events_class ec
            WHERE ec.active > 0
            AND client_id = ${this.user_id}
            AND dataTime > '${getDateTimeBD(start)}'
            AND dataTime < '${getDateTimeBD(end)}'
            ORDER BY dataTime ASC;
        `
        return await call_q(sql, 'getForDayUser')
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
        return await call_q(sql, 'listForDel')
    }
    //----------------------------------------
    async clearAllEvents(user_tlg_id){
        const sql = `
            UPDATE ivanych_bot.events_class SET active = 0, cycle = 0 WHERE client_id = ${user_tlg_id};
        `
        return await call_q(sql, 'clearAllEvents')
    }
   //---------------------------------------
    async deactivateUserById(tlg_id){
        const sql = `
            UPDATE ivanych_bot.users 
            SET active = 0
            WHERE tlg_id = ${tlg_id}
            ;
        `
        return await call_q(sql, 'deactivateById')
    }
    //----------------------------------------
    escapeHtml(text = '') {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    //----------------------------------------
    async sendTlgMessage(msg){
        const url = `https://api.telegram.org/bot${process.env.KEY}/sendMessage`

        const payload = {
            'chat_id': msg.client_id, 
            'text': '<b><u>Внимание!</u></b>\n' + this.escapeHtml(msg.text),
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

        try {
        const response = await axios.post(url, payload, {
                timeout: 10000
            });

            return {
                ok: true,
                status: 'sent',
                data: response.data
            };
        } catch (err) {
            const status = err.response?.status;
            const description = err.response?.data?.description || err.message || 'Unknown error';

            try {
                if (status === 403 && description.includes('bot was blocked by the user')) {
                    console.warn(`Пользователь ${msg.client_id} заблокировал бота. Сообщение не доставлено.`);
                    await this.clearAllEvents(msg.client_id);

                    return {
                        ok: false,
                        status: 'blocked',
                        description
                    };
                }

                if (status === 403 && description.includes('user is deactivated')) {
                    console.warn(`Пользователь ${msg.client_id} деактивирован. Сообщение не доставлено.`);
                    await this.clearAllEvents(msg.client_id);
                    await this.deactivateUserById(msg.client_id);

                    return {
                        ok: false,
                        status: 'deactivated',
                        description
                    };
                }
            } catch (dbErr) {
                console.error('Ошибка при обновлении БД после ошибки Telegram:', dbErr);
                throw dbErr;
            }

            console.error('Ошибка отправки в Telegram:', {
                status,
                description,
                chat_id: msg.client_id,
                msg_id: msg.id
            });

            throw err;
        }
    }
    // async sendTlgMessage(msg){
    //     const url = `https://api.telegram.org/bot${process.env.KEY}/sendMessage`
    //     return await axios.get(url, { params: {
    //         'chat_id': msg.client_id, 
    //         'text': '<b><u>Внимание!</u></b>\n' + msg.text,
    //         parse_mode : 'HTML',
    //         reply_markup : JSON.stringify({
    //             inline_keyboard : [
    //                 [
    //                     {
    //                         text: 'Принято',
    //                         callback_data: `answerAccepted${msg.id}`
    //                     }
    //                 ]
    //             ]
    //         })}
    //     })
    // }
    //--------------------------------------- пересчитываем следующую остановку
    async setNewPeriod(msg){
        if(msg.cronTab.length > 0){
            const dd = new Date(msg.dataTime)
            const dt = new Date()
            if(dt > dd) {
                const arTab = msg.cronTab.split(' ')
                if(arTab[0] != '*'){
                    let sdt = parseInt(arTab[0]) - dt.getDay()
                    if (sdt <= 0) sdt += 7;
                    dt.setDate(dt.getDate() + sdt);
                    let result = new Date(
                        dt.getFullYear(),
                        dt.getMonth(),
                        dt.getDate(),
                        // Время берем из dd
                        dd.getHours(),
                        dd.getMinutes(),
                        dd.getSeconds()
                    );
                    await this.updateDateTime(msg.id, result)
                } else {
                    if(arTab[1] != '*' && arTab[2] == '*'){
                        dd.setFullYear(dt.getFullYear())
                        dd.setMonth(dt.getMonth() + 1)
                    } else {
                        dd.setFullYear(dd.getFullYear() + (dt.getFullYear() - dd.getFullYear()) + 1)
                    }
                    await this.updateDateTime(msg.id, dd)
                }
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
    async searchByText(text){
        const sql = `SELECT id, dataTime dateTime, ec.text, cycle, cronTab
                     FROM ivanych_bot.events_class ec
                     WHERE text LIKE '%${text}%' 
						AND client_id = ${this.user_id}
                        AND active > 0
                    ORDER BY dataTime ASC
                    ;`
        return await call_q(sql, 'searchByText')
    }
    //---------------------------------------
    async getNotes(){
        this.arrEvents = this.arrEvents.concat(await this.getNotesByTime())
        if(!this.sending)
            this.sendMsg()
    }
}

export default EventsClass