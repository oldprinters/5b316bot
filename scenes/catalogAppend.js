import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import EventsClass from "../controllers/eventsClass.js"
import Folder from "../b_tree/folder.js"
import { menuPeriod, queryYesNoMenu} from '../keyboards/keyboards.js'
import { getNameDayWhenEmpty, outDateMonth } from '../utils.js'

const catalogAppend = new Scenes.BaseScene('CATALOG_APPEND')
//-----------------------------
catalogAppend.enter(async ctx => {
    if(ctx.session.parentId == undefined)
        ctx.session.parentId = -1
    ctx.scene.session.state.mode = 'getFolder'
    const folder = new Folder(ctx)
    await folder.getById(ctx.scene.session.state.id)
    const folders = await folder.getByParentId(ctx.session.parentId)
    if(!folders.folders.length){
        await ctx.reply('Для продолжения работы с каталогом добавьте название нового раздела.')
    } else {
        const folderName = await folder.getParentName()
        await ctx.replyWithHTML(`<b>${folderName}</b> Введите название нового каталога:`)
    }
})
//-----------------------------
catalogAppend.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\nДля работы с каталогом добавьте название нового раздела.')
})
//---------------------------------------------
catalogAppend.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
//------------------------------------------------
catalogAppend.action( /(catalogList_)\d/, async ctx => {
    ctx.answerCbQuery('Loading')
    const folder_id = ctx.match[0].slice(12)
    ctx.scene.session.state.id = folder_id
    ctx.scene.session.state.parentId = folder_id
})
//-------------------------------------------------
catalogAppend.action( /^(period_)[N,M,Y]$/, async ctx => {
    ctx.answerCbQuery()
    const pr = ctx.match[0].slice(7)
    let text = ''
    const dt = new Date()
    let cronText = ''
    switch(pr){
        case 'N': text = `каждую неделю в ${getNameDayWhenEmpty(dt.getDay())}`
            cronText = `${dt.getDay()} * * `
            dt.setDate(dt.getDate() + 7)
            break
        case 'M': text = `каждый месяц ${dt.getDate()} числа`
            cronText = `* ${dt.getDate()} * `
            dt.setMonth(dt.getMonth() + 1)
            break
        case 'Y': text = `каждый год, ${outDateMonth(dt)},`
            cronText = `* ${dt.getDate()} ${dt.getMonth() + 1}`
            dt.setFullYear(dt.getFullYear() + 1)
            break
    }
    dt.setHours(10)
    dt.setMinutes(10)
    const eC = new EventsClass(ctx)
    await eC.addEvent(dt, ctx.scene.session.state.name, cronText)
    await ctx.reply(`Вы будете получать сообщение «${ctx.scene.session.state.name}» ${text} в 10:10.`)
    ctx.scene.enter('CATALOG_LIST')
})
//-------------------------------------------------
catalogAppend.command('catalog', ctx => ctx.scene.reenter())
//-------------------------------------------------
catalogAppend.action('queryYes2', async ctx => {
    ctx.answerCbQuery()
    ctx.reply('Выберите период напоминаний:', menuPeriod())
})
//-------------------------------------------------
catalogAppend.action('queryNo2', async ctx => {
    ctx.answerCbQuery()
    ctx.scene.enter('CATALOG_LIST')
})
//-------------------------------------------------
catalogAppend.hears(/^\/[а-яА-ЯёЁйЙa-zA-Z0-9]+$/, ctx => {
        ctx.scene.reenter()
})
//-------------------------------------------------
catalogAppend.hears(/^[а-яА-ЯёЁйЙa-zA-Z0-9_+-=<> ]+/, async ctx => {
    const str = ctx.match[0]
    const folder = new Folder(ctx)
    ctx.scene.session.state.name = str
    const res = await folder.addFolder(str, ctx.session.parentId)
    ctx.session.id = res
    ctx.session.parentId = res
//    ctx.scene.enter('CATALOG_LIST')
    await ctx.replyWithHTML('Добавить периодическое напоминание? (раз в неделю, в месяц или год)', queryYesNoMenu())
})

export default catalogAppend