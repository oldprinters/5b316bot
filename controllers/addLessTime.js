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
}

export default AddLessTime