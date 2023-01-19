import {Telegraf, Markup, Scenes, session} from "telegraf"
import { getRoleName } from '../utils.js'
import QueryAdmin from '../controllers/queryAdmin.js'

const sendQueryAdmin = new Scenes.BaseScene('SEND_QUERY_ADMIN')
//-----------------------------
sendQueryAdmin.enter( ctx => {
    ctx.reply(`Пишем письмо. \nАдминистратор: ${getRoleName(ctx.session.admin.role)}\nПредставтесь пожалуйста:`)
})
//------------------
sendQueryAdmin.start( ctx => { ctx.scene.enter('FIRST_STEP') })
//-----------------------------
sendQueryAdmin.on('text', async ctx => {
    const queryAdmin = new QueryAdmin()
    const qRes = (await queryAdmin.getRepeatRequest(ctx.from.id, ctx.session.admin.tlg_id))[0]
    if(qRes == undefined){ 
        const res = await queryAdmin.insertQuery(ctx.from.id, ctx.session.admin.tlg_id, ctx.message.text, ctx.session.admin.class_id)
        await ctx.telegram.sendMessage(ctx.session.admin.tlg_id, 
            `Заявка на вступление в группу "${ctx.session.className}" от ${ctx.message.from.first_name}, представился как "${ctx.message.text}". ${ctx.message.from.is_bot? 'Обратите внимание!!! Это бот.': ''}`)
        await ctx.reply('Заявка на подключение к классу отправлена. Ждите результата.')
    } else {
        if(qRes.result == 0)
            await ctx.reply('Ваш запрос рассматривается. Ждем ответа администратора. Отправка повторной заявки запрещена.')
        else if(qRes.result == -1)
            await ctx.reply('Администратор отказал Вам в регистрации.')
        else {
            await ctx.reply('Вы зарегистрированы.')
            await ctx.scene.enter('SELECT_ACTION')
        }
    }
})
//sendQueryAdmin.

export default sendQueryAdmin