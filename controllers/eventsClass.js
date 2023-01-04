import { call_q } from '../config/query.js'
import BaseName from './basename.js'
import { getDateTimeBD } from '../utils.js'
//eventsClass.js класс работает с событиями (каникулы, экскурсии и т.п.)
//каждое событие имеет дату и время начала и окончания. Дата окончания включена в событие.
//событие может быть привязано к чему-либо, как-то название урока, доб занятие, времени
//уроки и занятия подразумеваются ближайшие, иначе дата
//напоминалки для класса
/*
*/

class EventsClass extends BaseName {
    class
    user_id
    constructor(ctx) {
        super('events_class')
        this.user_id = ctx.from.id
        this.class_id = ctx.session.class_id
    }
    //------------------------------------
    async searchEvents( class_id){}
    //------------------------------------
    async addEvent(dateTime, str){
        console.log("Добавить addEvent str =",str)
        const sql = `
            INSERT INTO ivanych_bot.events_class (class_id, client_id, cronTab, dataTime, cycle) 
            VALUES (${this.class_id}, '${this.user_id}', '', '${getDateTimeBD(dateTime)}', 0);
        `
        return await call_q(sql, 'addEvent')
    }
}

export default EventsClass