import { call_q } from '../config/query.js'
import BaseName from './basename.js'
//eventsClass.js класс работает с событиями (каникулы, экскурсии и т.п.)
//каждое событие имеет двту и время начала и окончания. Дата окончания включена в событие.
//событие может быть привязано к чему-либо, как-то название урока, доб занятие, времени
//уроки и занятия подразумеваются ближайшие, иначе дата

class EventsClass extends BaseName {
    class
    constructor() {
        super('events_class')
        // this.class = class
    }
    //------------------------------------
    async searchEvents( class_id)
}

export default EventsClass