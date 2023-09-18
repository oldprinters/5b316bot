import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import Folder from "../b_tree/folder.js"
import { menuActionCL, queryYesNoMenu} from '../keyboards/keyboards.js'
import { outDateTime } from '../utils.js'
import backup from "../config/backup.js"

const catalogList = new Scenes.BaseScene('CATALOG_LIST')
//*************************************** */
const getListCat = async (ctx, id) => {
    ctx.session.parentId = id
    const folder = new Folder(ctx)
    // await folder.getById(id)
    return await folder.getByParentId(id)
}
//======================================
catalogList.command('backup', async () =>{
    await backup()
})
//-----------------------------
catalogList.enter(async ctx => {
    if(ctx.session.parentId == undefined)
        ctx.session.parentId = -1
    const res = await getListCat(ctx, ctx.session.parentId)
    if(res.folders.length)
        await outRes(ctx, res)
    else {
        if(ctx.session.parentId == -1)
            ctx.scene.enter('CATALOG_APPEND')
        else
            await ctx.replyWithHTML(`Введите данные`, menuActionCL(res.folders, false, ctx.session.parentId))
    }
})
//-----------------------------
catalogList.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\n'+
    'Система каталогов предназначена для систематизации различных бытовых данных:\n'+
    '<b>Для автолюбителей</b> - это возможность регулярного сохранения значения пробега при проведении ТО, замене важных узлов, замера расстояния и т.д.;\n'+
    '<b>Тем, кто заботится о здоровье</b> - сохранение результатов анализов, веса, роста и т.д.;\n'+
    '<i>Сад—огород</i> - вообще не паханное поле. :-);\n\n'+
    'Учитель или руководитель может сохранять заметки об учениках или подчиненных.\n\n'+
    'Система позволяет настроить <b>периодическое напоминание</b> о необходимости контроля данного события.\n\n'+
    'Нижний ряд кнопок позволяет:\n   « + » - добавить подкаталог,\n   « ^ » - подняться на уровень выше,\n'+
    '   « del » - удалить каталог,\n   « >> » - сохранить данных в файл.' )
})
//-------------------------------------
catalogList.action('break_up', ctx => {
    ctx.answerCbQuery()
    ctx.scene.enter('FIRST_STEP')
})

//-------------------------------------
catalogList.action('catalogAppend', ctx => {
    ctx.answerCbQuery()
    ctx.scene.enter('CATALOG_APPEND')
})
//-------------------------------------
catalogList.action('catalogDel', async ctx => {
    ctx.answerCbQuery()
    const folder = new Folder(ctx)//, ctx.session.id, ctx.session.parentId)
    await folder.getById(ctx.session.parentId)
    await folder.delByParentId(ctx.session.parentId)
    const res = await getListCat(ctx, folder.getParentId())
    await outRes(ctx, res)
})
//-------------------------------------
catalogList.action('catalogBack', async ctx => {
    ctx.answerCbQuery()
    const folder = new Folder(ctx, ctx.session.id, ctx.session.parentId)
    await folder.getById(ctx.session.parentId)
    const res = await getListCat(ctx, folder.getParentId())
    await outRes(ctx, res)
})
//-------------------------------------
catalogList.action('catalogFile', async ctx => {
    ctx.answerCbQuery()
    const folder = new Folder(ctx, ctx.session.id, ctx.session.parentId)
    try {
        await folder.getFile(ctx, ctx.session.parentId)
    } catch (err) {
        console.log("!!!CATCH catalogFile =>", err)
        ctx.reply('Обнаружена ошибка. Сообщите разработчику.')
    }

})
//---------------------------------------------
const outRes = async (ctx, res) => {
    const folder = new Folder(ctx)
    const arrPath = await folder.getPath(ctx.session.parentId)
    let outText = `<u>${arrPath.join(' — ')}</u>\n\n`
    if(res.strings.length){
        res.strings.forEach(el => {
            const dt = new Date(el.created_at)
            let str = el.value
            if(el.value.length > 96)
                str = el.value.slice(0, el.value.slice(0, 96).lastIndexOf(' ')) + (el.value.length > 96 ? '...': '')
            outText += `<b>${str}</b>  (${outDateTime(dt)})\n`
        })
        outText += '\n'
    }
    if(!res.folders.length){
        await ctx.replyWithHTML(`${outText}Введите данные`, menuActionCL(res.folders, res.strings.length > 0, ctx.session.parentId))
    } else {
        const t = ctx.session.parentId > 0? ' или введите данные:': ''
        await ctx.replyWithHTML(`${outText}Выберите каталог${t}`, menuActionCL(res.folders, res.strings.length > 0, ctx.session.parentId))
    }
}
//---------------------------------------------
catalogList.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
//------------------------------------------------
catalogList.action( /(cL_)\d/, async ctx => {
    ctx.answerCbQuery('Loading')
    const folder_id = ctx.match.input.slice(3)
    ctx.session.parentId = folder_id
    const res = await getListCat(ctx, folder_id)
    await outRes(ctx, res)
    // ctx.scene.enter('CATALOG_APPEND')
})
//-------------------------------------------------
catalogList.hears(/^\/[а-яА-ЯёЁйЙa-zA-Z0-9]+$/, ctx => ctx.scene.enter('SELECT_ACTION'))
//-------------------------------------------------
catalogList.hears(/^[а-яА-ЯёЁйЙa-zA-Z0-9_+-=<> ]+/, async ctx => {
    const str = ctx.match.input
    if(ctx.session.parentId > 0){
        const folder = new Folder(ctx)
        const res = await folder.addString(str, ctx.session.parentId)    
        if(res.insertId){
            const res = await getListCat(ctx, ctx.session.parentId)
            await outRes(ctx, res)
        }
    } else {
        await ctx.reply('Для создания каталога нажмите кнопку « + »')
    }
})

export default catalogList