/*
CREATE TABLE `ivanych_bot`.`addLessTime` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nDay` INT(11) NOT NULL,
  `time_s` TIME NOT NULL,
  `time_e` TIME NOT NULL,
  `active` TINYINT NULL DEFAULT 1,
  PRIMARY KEY (`id`));

  ALTER TABLE `ivanych_bot`.`addLessTime` 
CHANGE COLUMN `oi_id` `nday` INT(11) NOT NULL ;
*/
//addLessTime.js
import { call_q } from '../config/query.js'
import { getDnTime } from '../utils.js'

class AddLessTime {
  //------------------
  validat(str){
    let arr = str.split(',')
    let arrALT = arr.map( el => getDnTime(el.trim()))
    return arrALT
  }
  //--------------------
  async insertALT(el) {
    const sql = `INSERT INTO ivanych_bot.addLessTime (atl_id, nDay, time_s, time_e) VALUES (${el.atl_id}, ${el.dn}, '${el.time_s}', '${el.time_e}');`
    return await call_q(sql, 'insertALT')
  }
  //--------------------
  async addListLess(atl_id, arrALT) {
    for await (let el of arrALT){
      try {
        el.atl_id = atl_id
        this.insertALT(el)
      } catch (err) {
        throw err
      }
    }
    return true
  }
}

export default AddLessTime