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
const call_q = async (sql) => {
    try {
        let res = await query(sql)
        return res
    }
    catch (err) {
        console.error("call_q():", sql)
        throw err
    }
}

export { query, call_q }