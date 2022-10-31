import {query} from '../config/query.js'

//---------------------------------------
const appendUser = async (id) => {
    const sql = `SELECT * FROM ivanych_bot.users WHERE tlg_id = '${id}'; `
    // console.log("### sql =", sql)
    let user_id
    const user = (await query(sql))[0]
    if(user == undefined){
        const sql = `INSERT INTO ivanych_bot.users (tlg_id) VALUES ('${id}');`
        user_id = (await query(sql)).insertId
        return {user_id: user_id}
    } else {
        console.log("### user =", user)
        return user.id
    }

//    console.log("### user_id =", user_id)
}

export { appendUser }