import {pool} from './mariadb.js'

const query = async (sql, params = []) => {
    let conn
    try {
        conn = await pool.getConnection()
        const rows = await conn.query(sql, params)
        return rows
    } catch (err) {
        throw err
    } finally {
        if(conn) conn.end()
    }
}
//++++++++++++++++++++++++++++++++
const call_q = async (sql, message = '', params = []) => {
    try {
        let res = await query(sql, params)
        return res
    }
    catch (err) {
        console.error(`call_q() ${message}: `, sql)
        throw err
    }
}

export { query, call_q }