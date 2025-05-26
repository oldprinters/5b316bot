import {Telegraf, Markup, Scenes, session} from "telegraf"
import EventsClass from "../controllers/eventsClass.js"
import { buttonsRems } from '../keyboards/keyboards.js'

const delRems = new Scenes.BaseScene('DEL_REMS')
//----------------------------------------------
delRems.help( ctx => {
    ctx.reply('Знак (C) отмечает повторяющееся напоминание. Удаляется полностью.')
})
//----------------------------------------------
delRems.enter(async ctx => {
    const eC = new EventsClass(ctx)
    console.log('remember.on res =', ctx.session.arrRems)
    await ctx.reply('Для удаления напоминалки нажмите на кнопку. Действие необратимо.', buttonsRems(ctx.session.arrRems))
})
//----------------------------------------------
delRems.action(/^(delRem_)\d+/, async ctx => {
    ctx.answerCbQuery()
    const id = parseInt(ctx.match[0].slice(7))
    const eC = new EventsClass(ctx)
    if(await eC.delRemById(id))
        ctx.scene.enter('REMEMBER')
    else
        ctx.reply('Ошибка удаления.')
})
//----------------------------------------------
delRems.on('text', ctx => {
    ctx.reply('Я Вас тоже люблю!')
    ctx.scene.enter('SELECT_ACTION')
})
// delRems.

export default delRems