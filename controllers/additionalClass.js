import { call_q } from '../config/query.js'
import BaseName from './basename.js'
import ClassOi from './classOi.js'
//AdditionalClass.js класс работает с дополнительными занятиями
/*
CREATE TABLE `ivanych_bot`.`additionalLessons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tlgUserId` INT UNSIGNED NOT NULL,
  `name_id` VARCHAR(45) NULL,
  `oi_id` INT UNSIGNED NOT NULL,
  `time_s` TIME NOT NULL,
  `time_e` TIME NOT NULL,
  `note` TINYTEXT NULL,
  `active` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`));
*/
class AdditionalClass extends BaseName {
    id
    tlg_user_id
    oper_interval   //периодичность
    time_s
    time_e
    constructor(ctx) {
        super('additional_class')
        this.tlg_user_id = ctx.from.id
    }
    //------------------------------------
    async addLesson(item){
        const name_id = await this.setName(item.name)

        const sql = `
            INSERT INTO ivanych_bot.additionalLessons (tlgUserId, name_id, oi_id, note) 
            VALUES (${this.tlg_user_id}, ${name_id}, ${item.oi_id}, '${item.note}');
        `
        return await call_q(sql, 'addLesson')
    }
    //------------------------------------
    async getListForDay(nDay){
        let list = ''
        const res = await this.getListLessonsTDay(nDay)
        if(res[0] != undefined)
            res.forEach(el => {
                list += `<b>${el.bn_name}</b> ${el.time_s.slice(0, 5)} - ${el.time_e.slice(0, 5)}\n`
                if(el.note != '')list += `    <i>${el.note}</i>\n`
            })
        return list
    }
    //------------------------------------
    async getListLessonsTDay(nDay){
        const sql = `
            SELECT a.id, bn.name bn_name, a.note, oi.name oi_name, atl.time_s, atl.time_e
            FROM ivanych_bot.additionalLessons a
            LEFT JOIN basename bn ON bn.id = a.name_id
            LEFT JOIN oper_interval oi ON a.oi_id = oi.id
            LEFT JOIN addLessTime atl ON atl.atl_id = a.id
            WHERE tlgUserId = ${this.tlg_user_id}
            AND atl.nDay = ${nDay}
            AND a.active = 1
            ORDER BY bn.name
        `
        return await call_q(sql, 'getListLessonsTDay')
    }
    //------------------------------------
    async getListLessons(){
        const sql = `
            SELECT a.id, bn.name bn_name, a.note, oi.name oi_name
            FROM ivanych_bot.additionalLessons a
            LEFT JOIN basename bn ON bn.id = a.name_id
            LEFT JOIN oper_interval oi ON a.oi_id = oi.id
            WHERE tlgUserId = ${this.tlg_user_id}
            AND a.active = 1
            ORDER BY bn.name
        `
        return await call_q(sql, 'getListLessons')
    }
    //------------------------------------
    async delLessonById(id){
        const sql = `UPDATE ivanych_bot.additionalLessons SET active = 0 WHERE (id = ${id});`
        return await call_q(sql, 'delLessonById')
    }
    //------------------------------------
    async getListLessonsName(){
        const sql = `
            SELECT a.id, bn.name
            FROM ivanych_bot.additionalLessons a
            LEFT JOIN basename bn ON bn.id = a.name_id
            WHERE tlgUserId = ${this.tlg_user_id}
            AND a.active = 1
            ORDER BY bn.name
        `
        return await call_q(sql, 'getListLessonsName')
    }
    //-------------------------------
    async saerchByName(name){
        const sql = `SELECT * FROM ivanych_bot.additionalLessons WHERE name LIKE '${name}';`
        return await call_q(sql, 'saerchByName')
    }
    //------------------------------------
    async getLessons(nDay = -1){

    }
}

export default AdditionalClass