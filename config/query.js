import {pool} from './mariadb.js'

const query = async (sql) => {
    let conn
    try {
        conn = await pool.getConnection()
        const rows = await conn.query(sql)
        return rows
    } catch (err) {
        throw err
    } finally {
        if(conn)
            conn.end()
    }
}
//++++++++++++++++++++++++++++++++
const call_q = async (sql, message = '') => {
    try {
        let res = await query(sql)
        return res
    }
    catch (err) {
        console.log(`call_q() ${message}: `, sql)
        throw err
    }
}

export { query, call_q }