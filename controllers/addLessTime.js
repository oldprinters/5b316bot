/*
CREATE TABLE `ivanych_bot`.`addLessTime` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `oi_id` INT NULL,
  `time_s` TIME NOT NULL,
  `time_e` TIME NOT NULL,
  `active` TINYINT NULL DEFAULT 1,
  PRIMARY KEY (`id`));
*/
//addLessTime.js
import { call_q } from '../config/query.js'
import { getDnTime } from '../utils.js'

class AddLessTime {
  //------------------
  validat(str){
    let arr = str.split(',')
    let arrALT = arr.map( el => getDnTime(el.trim()))
    let obj = {}
    return arrALT
  }
  //--------------------
  async insertALT(el) {
    const sql = `INSERT INTO ivanych_bot.addLessTime (alt_id, oi_id, time_s, time_e) VALUES (${el.alt_id}, ${el.oi_id}, '${el.time_s}', '${el.time_e}');`
    return await call_q(sql, 'insertALT')
  }
  //--------------------
  async addListLess(alt_id, arrALT) {
    for await (let el of arrALT){
      try {
        el.alt_id = alt_id
        this.insertALT(el)
      } catch (err) {
        throw err
      }
    }
    return true
  }
}

export default AddLessTime