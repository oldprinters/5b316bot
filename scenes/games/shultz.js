import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
import Shultz from "../../controllers/shultz.js"
import { shultzEndGame } from '../../keyboards/keyboards.js'

const shultz = new Scenes.BaseScene('SHULTZ')
const helpText = '<b><u>Найди все цифры</u></b>\n Таблицы Шульте — это инструмент для тренировки периферического зрения, ' +
'концентрации внимания и параллельного восприятия информации. Развитие этих навыков помогает освоить технику скорочтения.\n' +
'В классическом виде таблица представляет собой квадратное поле 5х5 ячеек, в каждой из которых располагается число. ' +
'Задача — концентрируя взгляд в центральной точке, как можно быстрее найти все значения в нужной последовательности.'
//---------------------------------------------
const outTable5x5 = async (ctx, arr) => {
    let strOut = '<pre>\n'
    for(let i = 0; i < 25; i++){
        strOut += arr[i].toString() + (arr[i] <10? '     ': '    ')
        if((i+1)%5 == 0) strOut += '\n\n'
    }
    strOut += '\n</pre>\n'
    await ctx.replyWithHTML(strOut, shultzEndGame("найдены все цифры"))
}
//-------------------------------------------------
shultz.command('games', async ctx => {
    ctx.scene.enter('GAMES')
})
//---------------------------------------------
shultz.action("gameOver", async ctx => {
    ctx.answerCbQuery()
    const shultz = new Shultz(ctx)
    clearTimeout(ctx.scene.session.state.tOut)
    await shultz.endGame(ctx.scene.session.state.shultzId)
    const t = await shultz.getTime(ctx.scene.session.state.shultzId)
    await ctx.reply(`Ваш результат ${t} сек.`)
    ctx.scene.reenter()
})
//---------------------------------------------
shultz.action("gameStop", async ctx => {
    ctx.answerCbQuery()
    const shultz = new Shultz(ctx)
    clearTimeout(ctx.scene.session.state.tOut)
    const res = await shultz.delSet(ctx.scene.session.state.shultzId)
    if(res > 0)ctx.scene.enter('SELECT_ACTION')
})
//---------------------------------------------
shultz.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
//--------------------------------------
shultz.help(ctx => {
    ctx.replyWithHTML(helpText)
})
//---------------------------------------------
shultz.enter(async ctx => {
    ctx.reply('Время пошло!')
    const shultz = new Shultz(ctx)
    await shultz.getUserId()
    const count = await shultz.getCount()
    if(!count)
        ctx.replyWithHTML(helpText)
    const game_id = await shultz.newGame()
    ctx.scene.session.state.shultzId = game_id
    const arr = shultz.generateArray()
    await outTable5x5(ctx, arr)
    ctx.scene.session.state.tOut = setTimeout(async () => {
        if(ctx.scene.session.state.shultzId > 0){
            await shultz.delSet(game_id)
            await ctx.reply('Время вышло, игра сброшена. Результат не сохранен.')
        }
    }, 30000)
})

export default shultz
