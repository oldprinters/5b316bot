import { call_q } from '../config/query.js'
import BaseName from '../controllers/basename.js';
import * as fs from 'fs/promises';
import { outDateTime } from '../utils.js'

class Folder extends BaseName {
    constructor(ctx, id = 0, parentId = -1) {
      super('catalogList')
      this.user_id = ctx.from.id
      this.name = ''
      this.name_id = 0
      this.parentId = parentId
      this.id = id; // Корневой каталог не имеет идентификатора
    }

    //------------------------------------------
    async addFolder(name, parentId){
      const name_id = await this.setName(name)
      const sql = `INSERT INTO folders (user_id, name_id, parentId) VALUES ('${this.user_id}', ${name_id}, ${parentId})`;
      const res = await call_q(sql, 'constructor')
      this.id = res.insertId;
      return this.id
    }
    //------------------------------------------
    async addString(str, id) {
      // Добавляем новую запись для строки в таблицу strings
      if(str.length > 4094)
        str = str.slice(0, str.slice(0, 4094).lastIndexOf(' '))
      const sql = `INSERT INTO strings (folderId, value) VALUES (${id}, '${str}')`;
      return await call_q(sql, 'addString')
    }
    //--------------------------------------------
    getParentId(){return this.parentId}
    //--------------------------------------------
    async getStringsByParentId(parentId){
      const sql = `SELECT * FROM strings WHERE folderId = ${parentId} ORDER BY id ASC`
      return await call_q(sql, 'getById')
    }
    //--------------------------------------------
    async deleteFile(fileName) {
      try {
        await fs.access(fileName);
        await fs.unlink(fileName);
      } catch (err) {
      }
    }
    //--------------------------------------------
    async getFile(ctx, id){
      this.parentId = id
      const res = (await this.getParentName())[0]
      const fName = `./tmpFiles/${ctx.from.id}_${res.name}.csv`
      const arrData = await this.getStringsByParentId(id)
      const csv = arrData.map(row => `${outDateTime(row.created_at)};${row.value}`).join('\n')
      await this.deleteFile(fName)
      try {
        await fs.writeFile(fName, csv)
        const file = await fs.readFile(fName)
        await ctx.replyWithDocument({ source: file, filename: fName }, { caption: 'Отчет сохранен в файле csv. Его можно открыть в экселе или текстовом редакторе.' })
      } catch (err){
        throw err;
      }
    }
    //--------------------------------------------
    async getParentName(){
      if(this.parentId > 0){
        const sql = `
          SELECT f.id, b.name
          FROM ivanych_bot.folders f
          LEFT JOIN basename b ON b.id = f.name_id
          WHERE f.id = ${this.parentId};
        `
        return await call_q(sql, 'getParentName')
      } else {
        return ''
      }
    }
    //--------------------------------------------
    async getById(id) {
      if(id){
        let sql = `
          SELECT f.*, b.name
          FROM ivanych_bot.folders f
          LEFT JOIN basename b ON b.id = f.name_id
          WHERE user_id = ${this.user_id}
          AND f.id = ${id}
          AND f.active = 1;
        `
        const res = (await call_q(sql, 'getById'))[0]
        if(res){
          this.id = id
          this.parentId = res.parentId
          this.name = res.name
        }
      }
    }
    //--------------------------------------------
    async delByParentId(id) {
      const sql = `UPDATE ivanych_bot.folders SET active = '0' WHERE (id = ${id});`
      return await call_q(sql, 'delByParentId')
    }
    //--------------------------------------------
    async getFoldByParentId(id){
      let sql = `
        SELECT f.id, b.name, f.parentId
        FROM ivanych_bot.folders f
        LEFT JOIN basename b ON b.id = f.name_id
        WHERE user_id = ${this.user_id}
        AND f.id = ${id}
        AND f.active = 1;
      `
      return await call_q(sql, 'getFoldByParentId')
    }
    //--------------------------------------------
    async getPath(id){
      let arrPath = []
      if(id > 0){
        while(1){
          const res = (await this.getFoldByParentId(id))[0]
          arrPath.unshift(res.name)
          id = res.parentId
          if(res.parentId == -1)
            break
        }
      }
      return arrPath
    }
    //--------------------------------------------
    async getByParentId(id = 0) {
      const parentId = id > 0? id: this.parentId
      let sql = `
        SELECT f.id, b.name, f.parentId
        FROM ivanych_bot.folders f
        LEFT JOIN basename b ON b.id = f.name_id
        WHERE user_id = ${this.user_id}
        AND parentId = ${parentId}
        AND f.active = 1;
      `
      const folders = await call_q(sql, 'getById')
      // Выбираем строки из базы данных, принадлежащие к данному каталогу
      sql = `SELECT * FROM strings WHERE folderId = ${parentId} ORDER BY id DESC LIMIT 5`
      const strings = await call_q(sql, 'getById')
      return {folders: folders, strings: strings}
    }
  }
  
  export default Folder