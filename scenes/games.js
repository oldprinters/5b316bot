import {Scenes, session} from "telegraf"
//import Users from '../controllers/users.js'
import { queryYesNoMenu, selectGame } from '../keyboards/keyboards.js'

const games = new Scenes.BaseScene('GAMES')
const arrGame = [
    {name: 'Найди цифры', sAct: 'shultz'},
]
//--------------------------------------
games.enter(async ctx => {
    await ctx.reply('Выберите игру', selectGame(arrGame))
})
//--------------------------------------
games.start( ctx => ctx.scene.enter('FIRST_STEP'))
//--------------------------------------
games.help(async ctx => {
    await ctx.replyWithHTML('<b><u>Развивалки</u></b>\n Описание игры в игре.')
})
//--------------------------------------
games.action('shultz', ctx => {
    ctx.answerCbQuery()
    ctx.scene.enter('SHULTZ')
})

export default games