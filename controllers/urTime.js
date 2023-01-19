import { call_q } from '../config/query.js'
import { sumTimes } from '../utils.js'

class UrTime {
    class_id
    constructor(class_id = 0){
        this.class_id = class_id
    }
    //---------------------------
    async delTimesForClass(class_id) {
        const sql = `
            UPDATE ivanych_bot.urTime SET active = 0 WHERE (class_id = ${class_id});
        `
        return await call_q(sql)
    }
    //---------------------------
    async getByOrder(class_id, order){
        const sql = `
            SELECT * 
            FROM ivanych_bot.urTime
            WHERE class_id = ${class_id}
            AND order_num = ${order}
            AND active = 1
            ;
        `
        return (await call_q(sql))[0]
    }
    //---------------------------
    async getListTimes(class_id) {
        const sql = `
            SELECT * 
            FROM ivanych_bot.urTime
            WHERE class_id = ${class_id}
                AND active = 1
        `
        return await call_q(sql)
    }
    //----------------------------
    async #saveEl (class_id, order_num, time_s, time_e){
        const sql = `
            INSERT INTO ivanych_bot.urTime (class_id, order_num, time_s, time_e) VALUES (${class_id}, ${order_num}, '${time_s}', '${time_e}');
        `
        return (await call_q(sql)).affectedRows
    }
    //----------------------------
    async #updateEl (id, time_s, time_e){
        const sql = `
            UPDATE ivanych_bot.urTime SET time_s = '${time_s}', time_e = '${time_e}' WHERE (id = ${id});
        `
        return (await call_q(sql)).affectedRows
    }
    //----------------------------
    async updateTime(class_id, i, time_s, duration){
        const res = await this.getByOrder(class_id, i)
        if(res != undefined){
            try {
                return await this.#updateEl(res.id, time_s, sumTimes(time_s, duration))
            } catch (err) {
                console.error("!!!CATCH updateTime", err)
            }
        }
        return res
    }
    //----------------------------
    async saveNewTimes(class_id, ar, duration){
        for(let i in ar){
            try {
                const res = await this.getByOrder(class_id, i)
                if(res == undefined)
                    await this.#saveEl(class_id, i, ar[i], sumTimes(ar[i], duration))
                else {
                    await this.#updateEl(res.id, ar[i], sumTimes(ar[i], duration))
                }
            } catch(err) {
                console.error("ERROR catch err:", err)
                throw err
            }
        }
    }
}

export default UrTime
