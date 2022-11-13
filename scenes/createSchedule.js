import {Telegraf, Markup, Scenes, session} from "telegraf"
import Users from '../controllers/users.js'
import MyClass from '../controllers/classes.js'
import {selectShedActionMenu} from '../keyboards/keyboards.js'

const createSchedule = new Scenes.BaseScene('CREATE_SCHEDULE')
createSchedule.enter(async ctx => {
    if(ctx.session.listClass == undefined){
        const myClass = new MyClass(ctx)
        await myClass.init()
        ctx.session.classList = await myClass.searchClasses()
    }
    ctx.reply('Давайте введем настройки расписания занятий.', selectShedActionMenu())
//    console.log("ctx.session.classList = ", ctx.session.classList)
})
createSchedule.start( ctx => { ctx.scene.leave()})

createSchedule.action('setTimesUrMenu', async ctx => {
    ctx.scene.enter('SET_TIMES_UR')
})

export default createSchedule