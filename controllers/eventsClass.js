import { call_q } from '../config/query.js'
import BaseName from './basename.js'
//eventsClass.js класс работает с событиями (каникулы, экскурсии и т.п.)
//каждое событие имеет дату и время начала и окончания. Дата окончания включена в событие.
//событие может быть привязано к чему-либо, как-то название урока, доб занятие, времени
//уроки и занятия подразумеваются ближайшие, иначе дата
//напоминалки для класса
/*
CREATE TABLE `events_class` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `class_id` int(10) unsigned NOT NULL,
  `client_id` int(10) unsigned NOT NULL,
  `roleList` varchar(15) NOT NULL DEFAULT '0,1' COMMENT '0',
  `cronTab` varchar(45) NOT NULL DEFAULT '* * * * *',
  `userORclass` enum('user','class') DEFAULT NULL,
  `cycle` tinyint(4) DEFAULT 0,
  `active` tinyint(4) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
*/

class EventsClass extends BaseName {
    class
    user_id
    constructor(ctx) {
        user_id = ctx.from.id
        super('events_class')
        // this.class = class
    }
    //------------------------------------
    async searchEvents( class_id){}
    //------------------------------------
    async addEvent(str){
        console.log("Добавить addEvent str =",str)
    }
}

export default EventsClass