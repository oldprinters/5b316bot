//classes.js
import { call_q } from '../config/query.js'
import BaseName from './basename.js'
import Users from './users.js';
import { outTime } from '../utils.js'
//import

class MyClass extends BaseName {
    id
    user
    name_id
    uc_id
    //************************************** */
    constructor(ctx){
        super('classes')
        this.user = new Users(ctx)
    }
    //-------------------------------------------
    async init(){
        await this.user.init()
//        console.log("@@# MyClass this", this)
    }
    //-------------------------------------------
    async deleteUserClass (user_id, class_id){
        const sql = `
        UPDATE ivanych_bot.user_class 
        SET active = 0 
        WHERE user_id = ${user_id}
        AND class_id = ${class_id};
        `
        return await call_q(sql)
    }
    //-------------------------------------------
    async getAdmin(class_id){
        const sql = `
            SELECT u.id user_id, tlg_id, uc.role 
            FROM ivanych_bot.user_class uc
            LEFT JOIN users u ON u.id = uc.user_id
            WHERE uc.class_id = 12
            AND uc.isAdmin = 1
            AND uc.active = 1
            AND u.active = 1
            ;
        `
            return await call_q(sql)
        }
    //-------------------------------------------
    async getClassName(class_id){
        const sql = `
            SELECT name
            FROM ivanych_bot.classes c
            LEFT JOIN basename bn ON bn.id = c.name_id
            WHERE c.id = ${class_id}
            ;
        `
        return (await call_q(sql))[0]
    }
    //-----------------------------------------
    async getClassById(class_id){
        const sql = `
            SELECT * 
            FROM ivanych_bot.classes
            WHERE id = ${class_id};
        `
        return (await call_q(sql))[0]
    }
    //------------------------------------------- перечень уроков класса
    async getLessonsList(class_id){
        const sql = `
            SELECT u.name_id, bn.name
            FROM ivanych_bot.urDay u
            LEFT JOIN basename bn ON bn.id = u.name_id
            WHERE class_id = ${class_id}
            GROUP BY name_id
            ORDER BY bn.name
        `
        return await call_q(sql)
    }
    //-------------------------------------------
    async searchClasses(user_id = 0){
        if(!user_id)
            user_id = this.user.getUserId()
        const sql = `
            SELECT c.id class_id, uc.role, uc.active, bn.name, c.duration, uc.isAdmin
            FROM ivanych_bot.user_class uc
            LEFT JOIN classes c ON c.id = uc.class_id
            LEFT JOIN basename bn ON c.name_id = bn.id
            WHERE user_id = ${user_id}
            AND uc.active = 1;
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
    async appendClass(name, duration){
        try {
            const name_id = await this.setName(name)
            if(name_id){
                const sql = `INSERT INTO ivanych_bot.classes (name_id, duration) VALUES (${name_id}, '${outTime(duration)}');`
                this.id = (await call_q(sql)).insertId
                return this.id
            } else {
                throw 'Ошибка сохранения имени'
            }
        } catch(err){
            console.log("ERROR CATCH!!! classes.js appendClass err:", err)
        }        
    }
    //----------------------------------------------
    async saveClassUserRole(class_id, role, isAdmin = 0){
        const sql = `
            INSERT INTO ivanych_bot.user_class (user_id, class_id, role, isAdmin) VALUES (${this.user.getUserId()}, ${class_id}, '${role}', ${isAdmin});
        `
        this.cu_id = (await call_q(sql)).insertId
        return this.cu_id
    }
    //----------------------------------------------
    async saveClassUserRoleExt(user_id, class_id, role, isAdmin = 0){
        const sql = `
            INSERT INTO ivanych_bot.user_class (user_id, class_id, role, isAdmin) VALUES (${user_id}, ${class_id}, '${role}', ${isAdmin});
        `
        this.cu_id = (await call_q(sql)).insertId
        return this.cu_id
    }
    //-----------------------------------------------
    async searchLessonByName(ctx){
        const str = ctx.message.text.trim().replaceAll('\'', '"')
        const sql = `
            SELECT COUNT(ud.id), bn.name, ud.name_id
            FROM ivanych_bot.urDay ud
            LEFT JOIN basename bn ON bn.id = ud.name_id
            WHERE class_id = ${ctx.session.class_id}
            AND bn.name LIKE '%${str}%'
            AND ud.active = 1
            GROUP by ud.name_id
            ;
        `
        return await call_q(sql, 'searchLessonByName')
    }
    //------------------------------------------------
    async getUrByNameId(name_id, class_id){
        const sql = `
        SELECT ud.id, bn.name, ut.time_s, ut.time_e, ud.dayOfWeek, ud.dateStart, ud.dateEnd, ut.order_num
        FROM ivanych_bot.urDay ud
        LEFT JOIN basename bn ON bn.id = ud.name_id
        LEFT JOIN urTime ut ON ut.id = ud.urTimeId
        WHERE ud.class_id = ${class_id}
        AND ud.name_id = ${name_id}
        AND ud.dateStart < CURRENT_DATE()
        AND ud.dateEnd > CURRENT_DATE()
        AND ud.active = 1
        AND ut.active = 1
        ;`
        return await call_q(sql, 'getUrById')
    }
}

export default MyClass