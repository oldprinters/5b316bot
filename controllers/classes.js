//classes.js
import { call_q } from '../config/query.js'
import BaseName from './basename.js'
import Users from './users.js';
//import

class MyClass extends BaseName {
    user
    name_id
    //************************************** */
    constructor(ctx){
        super('classes')
        this.user = new Users(ctx)
    }
    //-------------------------------------------
    async init(){
        await this.user.init()
    }
    //-------------------------------------------
    async searchClasses(){
        const sql = `
            SELECT c.id class_id, uc.role, uc.active, bn.name 
            FROM ivanych_bot.user_class uc
            LEFT JOIN classes c ON c.id = uc.class_id
            LEFT JOIN basename bn ON c.name_id = bn.id
            WHERE user_id = ${this.user.getUserId()};
        `
        return await call_q(sql)
    }
    //--------------------------------------------
    async searchClassesByName(str){
        const sql = `
            SELECT c.id, c.name_id, bn.name
            FROM ivanych_bot.classes c
            LEFT JOIN basename bn ON bn.id = c.name_id
            WHERE bn.name = '${str}'
        `
        return (await call_q(sql))[0]
    }
    //---------------------------------------------
    async appendClass(name){
        try {
            const name_id = await this.setName(name)
            if(name_id){
                const sql = `INSERT INTO ivanych_bot.classes (name_id) VALUES (${name_id});`
                this.name_id = (await call_q(sql)).insertId
                return this.name_id
            } else {
                throw 'Ошибка сохранения имени'
            }
        } catch(err){
            console.log("ERROR CATCH!!! classes.js appendClass err:", err)
        }        
    }
}

export default MyClass