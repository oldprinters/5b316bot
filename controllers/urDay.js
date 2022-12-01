import { call_q } from "../config/query.js";
import BaseName from "./basename.js";

class UrDay extends BaseName {

    constructor() {
        super('urday')
    }
    //------------------------
    async insertUrDay(class_id, dayOfWeek, urTimeId, name){
        const name_id = await this.setName(name)
        if(name_id){
            const sql=`
                INSERT INTO ivanych_bot.urDay (class_id, dayOfWeek, urTimeId, name_id) VALUES (${class_id}, ${dayOfWeek}, ${urTimeId}, ${name_id});
            `
            return await call_q(sql)
        } else {
            console.log("Error write BaseName. insertUrDay")
        }
    }
}

export default UrDay