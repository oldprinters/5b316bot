
import { query, call_q } from '../configs/query.js'
/*
CREATE TABLE `ppk_node`.`basename` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `active` TINYINT NULL DEFAULT 1,
  PRIMARY KEY (`id`));
*/
/*
TODO
добавить поле с числом использования.
Улдалять запись, если не используется
*/
class BaseName {
  constructor( class_name, id = 0, str = '', active){
    this.active = active || 1
    this.id = id
    this.str = str
    this.class_name = class_name.trim()
  }
  //*********************************** */
  insert(str, callback){
    this.str = str
    query("INSERT INTO `basename` SET `name` = '" + str.trim() + "', `class_name` = '" + this.class_name + "';", res=>{
      if(res.affectedRows > 0){
        this.id = res.insertId
        // console.log("insert ", this.id)
        callback(this)
      } else {
        console.error("Error insert")
      }
    })
  }
  //-------------------------------------------
  async getListByClass(){
    try{
        const sql = `SELECT * FROM audit.basename WHERE class_name = '${this.class_name}'`
        return await call_q(sql)
    } catch(err){
      console.log("ERROR!!! basename.js getListByClass:", err)
      throw err
    }
  }
  //*********************************** */
  async insert_str(str){
    if(str.length > 0){
        const searchRegExp = /'/g
        const sql = `INSERT INTO basename SET name = '${str.replace(searchRegExp ,'"').trim()}', class_name = '${this.class_name.trim()}';`
        const res = await query(sql)
        return res.insertId
    } else {
      return 0
    }
  }
  //*********************************** */
  async update(callback){
    const sql = `UPDATE basename SET name = '${this.str}', active = ${this.active} WHERE id = ${this.id}`
    return await call_q(sql)
  }
  //*********************************** */
  async update_name(item){
    try{
        const sql = `UPDATE basename SET name = '${item.name}' WHERE id = ${item.name_id}`
        return await call_q(sql)
    } catch(err){
      console.log("ERROR!!! basename.js update_name:", err)
      throw err
    }
  }
//***************************************************** */
  async search(str){
    try {
      const searchRegExp = /'/g
      const sql = ` SELECT id, name 
                    FROM basename 
                    WHERE name = '${str.replace(searchRegExp ,'"')}' 
                     AND class_name = '${this.class_name}';`
      let rows = await call_q(sql)
      // console.log("search rows =", rows)
      if(rows[0] == undefined)
        return 0 //rows[0] = {id : 0}  //TODO проверить: разные возвращаемые значения
      else 
        return rows[0].id
    } catch (err) {
      console.error("ERROR basename search catch", err)
      throw err
    }
  }
  //************************************************** */
  async readById(id){
    const sql = `SELECT * FROM basename WHERE id = ${id}`
    let rows = await call_q(sql)
    // console.log("basename readById id =", id, rows)
    // this.str = rows[0].name
    // this.id = rows[0].id
    // this.active = rows[0].active
    // this.class_name = rows[0].class_name
    // console.log("basename readById", this.str)
    return rows[0]
  }
  //************************************** */
  getName(){ 
    return this.str
  }
  //************************************************* TODO дописать учет числа испрользуемых записей
  async add_used(id){
    let res = await query(`SELECT active FROM basename WHERE id = ${id};`)
    const count = res[0].active++
    res = await query(`UPDATE basename SET active=${res[0].active} WHERE id = ${id};`)
    return count
  }
  //************************************************* */
  async setName(name){
    // console.log("basename setName name =", name)
    if(name.length > 0){
      this.str = name
      let id = await this.search(this.str)
      if(id == 0){
        try {
          id = await this.insert_str(this.str)
          this.id = id
          return id
        } catch(err) {
          console.log("basename/setName catch: ", err)
          throw `basename/setName catch: ${err}`
        }
      } else {
        return id
      }
    } else {
      return 0
    }
  }
  //************************************************** */
  getId(){
    return this.id
  }
  //********************************************************** */
  async getList(){
    const sql = `SELECT * FROM basename WHERE active > 0 AND class_name = '${this.class_name}' ORDER BY ${name}`
    let rows = await call_q(sql)
    return rows
  }
}
//*********************************** */
export {BaseName}
