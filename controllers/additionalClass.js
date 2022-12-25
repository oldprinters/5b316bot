import { call_q } from '../config/query.js'
import BaseName from './basename.js'
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
            INSERT INTO ivanych_bot.additionalLessons (tlgUserId, oi_id, name_id, note) 
            VALUES (${this.tlg_user_id}, ${name_id}, ${item.oi_id}, '${item.note}');
        `
        return await call_q(sql, 'addLesson')
    }
    //------------------------------------
    async getListLessons(){
        const sql = `
            SELECT a.id, bn.name bn_name, a.note
            FROM ivanych_bot.additionalLessons a
            LEFT JOIN basename bn ON bn.id = a.name_id
            WHERE tlgUserId = ${this.tlg_user_id}
            AND a.active = 1
            ORDER BY bn.name
        `
        return await call_q(sql, 'getListLessons')
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