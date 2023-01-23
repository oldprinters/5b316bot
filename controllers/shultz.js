import { call_q } from '../config/query.js'

class Shultz {
    #id         //DB
    #user_id
    #tlg_id
    //---------------------------------------
    constructor(ctx) {
        if(typeof ctx.from === 'object' && !Array.isArray(ctx.from) !== null){
            this.#tlg_id = ctx.from.id
        } else {
            throw 'id пользователя telegram не определен.'
        }
    }
    //----------------------------------------
    async delSet(id) {
        const sql = `
            DELETE FROM ivanych_bot.set_game WHERE id = ${id};
        `
        return (await call_q(sql)).affectedRows
    }
    //----------------------------------------
    async getCount() {
        const sql = `
            SELECT COUNT(id) count FROM ivanych_bot.set_game WHERE user_id = ${this.#user_id};
        `
        return (await call_q(sql))[0].count
    }
    //----------------------------------------
    async getTime(id){
        const sql = `
            SELECT (end - begin) dift FROM ivanych_bot.set_game where id = ${id};
        `
        return (await call_q(sql))[0].dift
    }
    //----------------------------------------
    async getUserId () {
        const sql = `
            SELECT * 
            FROM ivanych_bot.users
            WHERE tlg_id = ${this.#tlg_id}
            AND active = 1
            ;
        `
        this.#user_id = (await call_q(sql))[0].id
    }
    //----------------------------------------
    generateArray(){
        let set = new Set()
        while(set.size < 25){
            set.add(Math.floor(Math.random() * 25) + 1)
        }
        return Array.from(set)
    }
    //----------------------------------------
    async insertNew(){
        const sql = `
            INSERT INTO ivanych_bot.set_game (user_id) VALUES (${this.#user_id});
        `
        const res = await call_q(sql)
        return res.insertId
    }
    //----------------------------------------
    async newGame(){
        if(this.#user_id == undefined)this.getUserId()
        return (await this.insertNew())
    }
    //----------------------------------------
    async endGame(id){
        return await this.update(id)
    }
    //----------------------------------------
    async update(id){
        const sql = `
            UPDATE ivanych_bot.set_game SET end = now() WHERE (id = ${id});
        `
        return await call_q(sql)
    }
}

export default Shultz
