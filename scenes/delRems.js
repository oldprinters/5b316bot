import {Telegraf, Markup, Scenes, session} from "telegraf"
import EventsClass from "../controllers/eventsClass.js"
import { buttonsRems } from '../keyboards/keyboards.js'

const delRems = new Scenes.BaseScene('DEL_REMS')
//----------------------------------------------
delRems.enter(async ctx => {
    const eC = new EventsClass(ctx)
    const arRems = await eC.listForUser()
    if(arRems.length > 0)
        await ctx.reply('Для удаления напоминалки нажмине на кнопку. Действие необратимо.', buttonsRems(arRems))
    else {
        await ctx.reply('Напоминалок нет.')
        ctx.scene.enter('SELECT_ACTION')
    }
    // console.log(arRems)
})
//----------------------------------------------
delRems.action(/^(delRem_)\d+/, async ctx => {
    ctx.answerCbQuery()
    const id = parseInt(ctx.match[0].slice(7))
    const eC = new EventsClass(ctx)
    if(await eC.delRemById(id))
        ctx.scene.reenter()
    else
        ctx.reply('Ошибка удаления.')
})
// delRems.

export default delRems