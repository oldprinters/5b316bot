//quewryAdmin.js
import { call_q } from '../config/query.js'
import Users from './users.js';
import { outTime } from '../utils.js'

class QueryAdmin {
    //************************************** */
    async getRepeatRequest(whoTlgId, toTlgId){
        const sql = `
            SELECT * 
            FROM ivanych_bot.queryAdmin qa
            WHERE whoTlgId = ${whoTlgId}
            AND toTlgId = ${toTlgId}
            AND qa.active = 1
            ;`
            return await call_q(sql)
        }
    //-------------------------------------------
    async insertQuery(whoTlgId, toTlgId, textQuery, class_id) {
        textQuery = textQuery.replaceAll("'", '"')
        const sql = `INSERT INTO ivanych_bot.queryAdmin (whoTlgId, toTlgId, class_id, textQuery) VALUES (${whoTlgId}, ${toTlgId}, ${class_id}, '${textQuery.trim()}');`
        return await call_q(sql)
    }
    //-------------------------------------------
    async getRequests(toTlgId, class_id){
        const sql = `
            SELECT * 
            FROM ivanych_bot.queryAdmin
            WHERE toTlgId = ${toTlgId}
            AND class_id = ${class_id}
            AND result = 0
            AND active = 1
            ;
        `
        return await call_q(sql)
    }
    //-------------------------------------------
    async setResult(id, res) {
        const sql = `
        UPDATE ivanych_bot.queryAdmin SET result = ${res} WHERE (id = ${id});
        `
        return await call_q(sql)
    }
}

export default QueryAdmin
