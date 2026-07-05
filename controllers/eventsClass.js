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
        const [dd, mm] = textdate.split('.');
        const year = new Date().getFullYear();
        const baseDate = new Date(year, Number(mm) - 1, Number(dd));

        const start = new Date(baseDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(baseDate);
        end.setHours(23, 59, 59, 999);

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
    // Берём только те события, у которых подошёл dataTime
    // и нет отложенного retry (next_try_at IS NULL или уже прошло)
    async getNotesByTime(){
        const sql = `
            SELECT * FROM ivanych_bot.events_class
            WHERE dataTime <= NOW()
              AND active > 0
              AND (next_try_at IS NULL OR next_try_at <= NOW());
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    //----------------------------------------
    isNetworkError(err) {
        return !err.response &&
            ['EAI_AGAIN', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNABORTED'].includes(err.code)
    }
    //----------------------------------------
    // Обновляем технический статус доставки, не трогая бизнес-поля active/cycle/dataTime
    async setSendStatus(id, status, lastError = null, nextTryAt = null) {
        const nextTryVal = nextTryAt ? `'${getDateTimeBD(nextTryAt)}'` : 'NULL'
        const lastErrVal = lastError
            ? `'${String(lastError).replace(/'/g, '"').substring(0, 255)}'`
            : 'NULL'
        const sql = `
            UPDATE ivanych_bot.events_class
            SET send_status   = '${status}',
                send_attempts = send_attempts + 1,
                last_error    = ${lastErrVal},
                next_try_at   = ${nextTryVal}
            WHERE id = ${id};
        `
        return call_q(sql, 'setSendStatus')
    }
    //----------------------------------------
    // Сбрасываем технические поля после успешной отправки циклического события
    // (чтобы на следующий год начать с чистого листа)
    async resetSendAttempts(id) {
        const sql = `
            UPDATE ivanych_bot.events_class
            SET send_status   = 'pending',
                send_attempts = 0,
                last_error    = NULL,
                next_try_at   = NULL
            WHERE id = ${id};
        `
        return call_q(sql, 'resetSendAttempts')
    }
    //----------------------------------------
    async sendTlgMessage(msg, maxNetworkRetries = 3) {
        const url = `https://api.telegram.org/bot${process.env.KEY}/sendMessage`
        const payload = {
            chat_id:      String(msg.client_id),
            text:         '<b><u>Внимание!</u></b>\n' + this.escapeHtml(msg.text),
            parse_mode:   'HTML',
            reply_markup: JSON.stringify({
                inline_keyboard: [[{
                    text:          'Принято',
                    callback_data: `answerAccepted${msg.id}`
                }]]
            })
        }

        for (let attempt = 1; attempt <= maxNetworkRetries; attempt++) {
            try {
                const response = await axios.post(url, payload, { timeout: 10000 })
                return { ok: true, status: 'sent', data: response.data }

            } catch (err) {
                const httpStatus  = err.response?.status || null
                const data        = err.response?.data || {}
                const description = data.description || err.message || 'Unknown error'
                const retryAfter  = Number(data.parameters?.retry_after || 0)

                // --- 403: постоянные ошибки на стороне пользователя ---
                if (httpStatus === 403) {
                    if (description.includes('bot was blocked by the user')) {
                        return { ok: false, status: 'blocked', description }
                    }
                    if (description.includes('user is deactivated')) {
                        return { ok: false, status: 'deactivated', description }
                    }
                    // kicked, no rights, can't initiate conversation
                    return { ok: false, status: 'forbidden', description }
                }

                // --- 400: невалидный chat_id ---
                if (httpStatus === 400 && (
                    description.includes('chat not found') ||
                    description.includes('user not found') ||
                    description.includes('PEER_ID_INVALID')
                )) {
                    return { ok: false, status: 'chat_invalid', description }
                }

                // --- 400: битый текст/разметка ---
                if (httpStatus === 400 && (
                    description.includes("can't parse entities") ||
                    description.includes('message text is empty') ||
                    description.includes('TEXT_INVALID')
                )) {
                    return { ok: false, status: 'bad_payload', description }
                }

                // --- 401: сломан токен --- всё сломано, нет смысла ретраить
                if (httpStatus === 401) {
                    return { ok: false, status: 'fatal', description }
                }

                // --- 429: rate limit --- ждём retry_after из ответа Telegram
                if (httpStatus === 429) {
                    const delay = retryAfter > 0 ? retryAfter * 1000 : attempt * 5000
                    if (attempt < maxNetworkRetries) {
                        console.warn(`429 TooManyRequests chat=${msg.client_id}, ждём ${delay}мс`)
                        await this.sleep(delay)
                        continue
                    }
                    const nextTry = new Date(Date.now() + (retryAfter > 0 ? retryAfter * 1000 : 60000))
                    return { ok: false, status: 'retry', description, nextTryAt: nextTry }
                }

                // --- 5xx: ошибки на стороне Telegram --- ретраим с паузой
                if (httpStatus >= 500) {
                    if (attempt < maxNetworkRetries) {
                        await this.sleep(attempt * 3000)
                        continue
                    }
                    const nextTry = new Date(Date.now() + 5 * 60 * 1000)
                    return { ok: false, status: 'retry', description, nextTryAt: nextTry }
                }

                // --- Сетевые ошибки DNS/TCP (EAI_AGAIN, ECONNRESET и т.п.) ---
                if (this.isNetworkError(err)) {
                    if (attempt < maxNetworkRetries) {
                        console.warn(`Сетевая ошибка ${err.code} (попытка ${attempt}/${maxNetworkRetries})`)
                        await this.sleep(attempt * 3000)
                        continue
                    }
                    const nextTry = new Date(Date.now() + 5 * 60 * 1000)
                    return { ok: false, status: 'retry', description: err.code, nextTryAt: nextTry }
                }

                // --- Всё остальное --- логируем, не роняем процесс
                console.error('Необработанная ошибка Telegram:', { httpStatus, description, id: msg.id })
                return { ok: false, status: 'error', description }
            }
        }

        return { ok: false, status: 'retry', description: 'Retries exhausted' }
    }
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
        try {
            while (this.arrEvents.length > 0) {
                const msg = this.arrEvents.pop()

                if (msg.userORclass !== 'user') {
                    console.log('sendMsg class msg =', msg)
                    continue
                }

                if (!(msg.active > 0)) continue

                // Уменьшаем счётчик в любом случае
                await this.updateActive(msg.id, msg.active - 1)

                // Для цикличных событий: пересчитываем период при последнем тике
                if (msg.active === 1 && msg.cycle) {
                    await this.setNewPeriod(msg)
                    await this.resetSendAttempts(msg.id)
                    continue
                }

                // Отправляем только на контрольных точках: 30, 25, 20, 15, 10, 5
                if (msg.active % 5 !== 0) continue

                let result
                try {
                    result = await this.sendTlgMessage(msg)
                } catch (err) {
                    // Совсем неожиданная ошибка — не роняем цикл
                    console.error('Критическая ошибка sendTlgMessage:', err)
                    result = { ok: false, status: 'fatal', description: err.message }
                }

                switch (result.status) {
                    case 'sent':
                        await this.setSendStatus(msg.id, 'sent')
                        break

                    case 'retry':
                        // Временная ошибка: откатываем active назад, чтобы не потерять попытку
                        // (уже уменьшили выше — восстанавливаем)
                        await this.updateActive(msg.id, msg.active)
                        console.warn(`Откладываем msg.id=${msg.id} до ${result.nextTryAt}, причина: ${result.description}`)
                        await this.setSendStatus(msg.id, 'retry', result.description, result.nextTryAt || null)
                        break

                    case 'blocked':
                    case 'deactivated':
                        console.warn(`${result.status}: очищаем события для client_id=${msg.client_id}`)
                        await this.setSendStatus(msg.id, result.status, result.description)
                        try {
                            await this.clearAllEvents(msg.client_id)
                            if (result.status === 'deactivated')
                                await this.deactivateUserById(msg.client_id)
                        } catch (dbErr) {
                            console.error('Ошибка очистки после blocked/deactivated:', dbErr)
                        }
                        break

                    case 'forbidden':
                    case 'chat_invalid':
                        // Постоянная ошибка конкретного чата — деактивируем только это событие
                        console.warn(`${result.status} chat=${msg.client_id}: ${result.description}`)
                        await this.setSendStatus(msg.id, result.status, result.description)
                        await this.updateActive(msg.id, 0)
                        break

                    case 'bad_payload':
                        // Битый текст — деактивируем событие, не трогаем пользователя
                        console.error(`bad_payload msg.id=${msg.id}: ${result.description}`)
                        await this.setSendStatus(msg.id, 'bad_payload', result.description)
                        await this.updateActive(msg.id, 0)
                        break

                    case 'fatal':
                        // Сломан токен или внутренняя ошибка — логируем, ничего не трогаем
                        console.error(`FATAL msg.id=${msg.id}: ${result.description}`)
                        await this.setSendStatus(msg.id, 'error', result.description)
                        break

                    default:
                        console.error(`Неизвестный статус msg.id=${msg.id}:`, result)
                        await this.setSendStatus(msg.id, 'error', result.description)
                }
            }
        } catch (err) {
            console.error('Критическая ошибка в sendMsg:', err)
        } finally {
            this.sending = false
        }
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
