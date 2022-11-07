import { call_q } from '../config/query.js'

class Users {
    #id         //DB
    #tlg_user   //{}
    #active
    #isAdmin    //администратор бота
    #classes = []
    //---------------------------------------
    constructor(ctx) {
        if(typeof ctx === 'object' && !Array.isArray(ctx) !== null){
            this.#tlg_user = ctx.from
            // this.appendUser()
        } else {
            throw 'id пользователя telegram не определен.'
        }
    }
    //---------------------------------------
    async appendUser () {
        const user = await this.readUserTlg()
        if(user == undefined){
            const sql = `INSERT INTO ivanych_bot.users (tlg_id) VALUES ('${tlg_id}');`
            this.#id = (await query(sql)).insertId
            this.#isAdmin = false
            this.#active = 1
        } else {
            console.log("### user =", user)
            this.#id = user.id
            this.#isAdmin = user.isAdmin
            this.#active = user.active
        }
        return this.#id
    }
    //---------------------------------------
    getNewClass(){
        return {class_id: 0, role: 'user', active: 1, name_id: 0, name: ''}
    }
    //---------------------------------------
    async getClassList(){
        const sql = `
            SELECT c.id class_id, uc.role, uc.active, bn.name 
            FROM ivanych_bot.user_class uc
            LEFT JOIN classes c ON c.id = uc.class_id
            LEFT JOIN basename bn ON c.name_id = bn.id
            WHERE user_id = ${this.#id};
        `
        this.#classes = await call_q(sql)
        return this.#classes?.length
    }
    //---------------------------------------
    async readUserTlg() {
        if(this.#tlg_user?.id){
            const sql = `
                SELECT * 
                FROM ivanych_bot.users 
                WHERE tlg_id = ${this.#tlg_user.id};
            `
            const user = (await call_q(sql))[0]
            if(user != undefined) {
                this.#id = user.id
                this.#isAdmin = user.isAdmin
                this.#active = user.active
            }
            return user
        } else {
            throw 'Не определен пользователь'
        }
    }
    //----------------------------------------
}

export default Users