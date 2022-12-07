import {Telegraf, Markup, Scenes, session} from "telegraf"
import QueryAdmin from '../controllers/queryAdmin.js'
import MyClass from "../controllers/classes.js"
import Users from '../controllers/users.js'
import { queryYesNoMenu, selectRoleMenu } from '../keyboards/keyboards.js'

const processRequests = new Scenes.BaseScene('PROCESS_REQUESTS')
//-----------------------------
processRequests.enter( async ctx => {
    const queryAdmin = new QueryAdmin()
    const arrReq = await queryAdmin.getRequests(ctx.from.id, ctx.session.class_id)
    ctx.scene.session.state.arrReq = arrReq
    let list = ''
    const myClass = new MyClass(ctx)
    let ar = []
    let i = 0
    if(arrReq.length == 0)
        return ctx.scene.enter('SELECT_ACTION')
    for(let el of arrReq){
        const member = (await ctx.telegram.getChatMember(arrReq[0].whoTlgId, arrReq[0].whoTlgId)).user
        el.className = (await myClass.getClassName(el.class_id)).name
        list = `От "${el.textQuery}" (${member.first_name}) в класс "${el.className}\n"`
        ar.push(Markup.button.callback(list, `iRequest_${i++}`))
    }
    ctx.reply(`Список запросов:\n`, Markup.inlineKeyboard(ar))
})
//-------------------------------------
processRequests.help( ctx => {
    ctx.reply('<b><u>HELP</u></b>\nВаше право решать давать доступ к боту или нет. Для родителей это удобноЁ но не более.')
})
//--------------------------------------
processRequests.action(/^iRequest_[0-9]{1,2}$/, async ctx => {
    ctx.answerCbQuery()
    const i = parseInt(ctx.match[0].slice(9))
    const el = ctx.scene.session.state.arrReq[i]
    ctx.scene.session.state.qA_id = el.id
    ctx.scene.session.state.el = el
    ctx.reply(`Добавить "${el.textQuery}" в "${el.className}?"`, queryYesNoMenu())
})
//------------------------------
processRequests.action('queryYes2', async ctx => {
    await ctx.answerCbQuery()
    await ctx.reply('Укажите роль:', selectRoleMenu())
})
//------------------------------
processRequests.action(/['studentRole', 'parentRole', 'teacherRole', 'c_teacherRole']/, async ctx => {
    await ctx.answerCbQuery()
    const role = ctx.callbackQuery.data.slice(0, -4)
    console.log("#@2334@! =", ctx.scene.session.state)
    const qA = new QueryAdmin()
    const users = new Users(ctx)
    const myClass = new MyClass(ctx)
    const user = await users.getUserByTlgId(ctx.scene.session.state.el.whoTlgId)
    await myClass.saveClassUserRoleExt(user.id, ctx.scene.session.state.el.class_id, role)
    await qA.setResult(ctx.scene.session.state.qA_id, 1)
    ctx.scene.reenter()
})
//------------------------------
processRequests.action('queryNo2', async ctx => {
    ctx.answerCbQuery()
    const qA = new QueryAdmin()
    await qA.setResult(ctx.scene.session.state.qA_id, -1)
    ctx.scene.reenter()
})

export default processRequests
