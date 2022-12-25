import { call_q } from '../config/query.js'
import UrDay from './urDay.js'

class ClassOi {
    name
    bStr
    listDays = ['воск', 'понед', 'втор', 'среда', 'четв', 'пятниц', 'суб']
    listNames = [ 'vsk', 'pn', 'vt', 'sr', 'cht', 'pt', 'sb']
    //------------------------------
    getObj(){
        return { vsk: false, pn: false, vt: false, sr: false, cht: false, pt: false, sb: false }
    }
    //------------------------------
    async insertOi(el){
        const sql = `INSERT INTO ivanych_bot.oper_interval (name, pn, vt, sr, cht, pt, sb, vsk)
            VALUES ('${el.name.trim()}', ${(el.pn == false ? 0 : 1)},
            ${(el.vt == false ? 0 : 1)}, ${(el.sr == false ? 0 : 1)}, ${(el.cht == false ? 0 : 1)},  
            ${(el.pt == false ? 0 : 1)}, ${(el.sb == false ? 0 : 1)}, ${(el.vsk == false ? 0 : 1)})`

        return await call_q(sql, 'insertOi')
    }
    //-------------------------------
    async saerchByName(name){
        const sql = `SELECT * FROM ivanych_bot.oper_interval WHERE name LIKE '${name}';`
        console.log("WWQQ sql =", sql)
        return await call_q(sql, 'saerchByName')
    }
    //-------------------------------
    async getOiName(str){
        str = str.trim().replaceAll("'", '"')
        let i = 0
        let el
        let obj = this.getObj()
        let name = ''
        const urDay = new UrDay()
        for(let el of this.listDays){
            if(str.indexOf(el) >= 0){
                obj[this.listNames[i]] = true
                name += urDay.getNameDay(i) + ', '
            }
            i++
        }
        name = name.slice(0, -2)
        if(name.length > 0){
            const res = await this.saerchByName(name)
            if(res[0] == undefined){
                let oi = {
                    name: name
                }
                el = Object.assign(oi, obj)
                const res = await this.insertOi(el)
                if(res.affectedRows == 0)
                    throw 'Ошибка записи OI.'
                el = oi
                el.id = res.insertId
            } else {
                el = res[0]
            }
        }
        return el
    }
    //-------------------------------
    async getOiById(id){
        const sql = `
            SELECT * FROM ivanych_bot.oper_interval WHERE id = ${id};
        `
        return await call_q(sql, 'getOiById')
    }
    //-------------------------------
    async getOiByDn(nDay){
        let w = ''
        switch (nDay){
            case 0: w = 'vsk';break
            case 1: w = 'pn';break
            case 2: w = 'vt';break
            case 3: w = 'sr';break
            case 4: w = 'cht';break
            case 5: w = 'pt';break
            case 6: w = 'sb';break
        }
        const sql = `SELECT id FROM ivanych_bot.oper_interval WHERE ${w} = 1;`
        return await call_q(sql, 'getOiByDn')
    }
}

export default ClassOi