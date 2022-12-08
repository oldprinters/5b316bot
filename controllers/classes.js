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
}

export default MyClass