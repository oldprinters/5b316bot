import {Telegraf, Markup, Scenes, session} from "telegraf"
import MyClass from '../controllers/classes.js'
import { setCommands } from '../utils.js'

const firstStep = new Scenes.BaseScene('FIRST_STEP')
//--------------------------------------
firstStep.enter(async ctx => {
    const myClass = new MyClass(ctx)
    await myClass.init()
    const classList = await myClass.searchClasses()
    ctx.session.parentId = -1
    if(classList.length == 0){
        ctx.session.i = -1  //класс отсутствует
        ctx.scene.enter('SELECT_ACTION')
    } else {
        ctx.session.classList = classList
        if(classList.length > 1){
            ctx.scene.enter('SELECT_CLASS')
        } else {
            ctx.session.i = 0   //index текущего класса в массиве
            ctx.session.class_id = classList[0].class_id
            ctx.session.isAdmin = classList[0].isAdmin
            setCommands(ctx)
            ctx.scene.enter('SELECT_ACTION')
        }
    }
})

export default firstStep