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
    async saveNewTimes(class_id, ar, duration){
        for(let i in ar){
            try {
                await this.#saveEl(class_id, i, ar[i], sumTimes(ar[i], duration))
            } catch(err) {
                console.log("ERROR catch err:", err)
                throw err
            }
        }
    }
}

export default UrTime
