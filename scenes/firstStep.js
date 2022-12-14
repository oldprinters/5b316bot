import {Telegraf, Markup, Scenes, session} from "telegraf"
import MyClass from '../controllers/classes.js'

const firstStep = new Scenes.BaseScene('FIRST_STEP')
//--------------------------------------
firstStep.enter(async ctx => {
    await ctx.setMyCommands([{'command': 'start', 'description': 'Перезапуск'}, {'command': 'help', 'description': 'Вызов справки'}])
    const myClass = new MyClass(ctx)
    await myClass.init()
    const classList = await myClass.searchClasses()
    if(classList.length == 0){
        ctx.scene.enter('CREATE_CLASS')
    } else {
        ctx.session.classList = classList
        if(classList.length > 1){
            ctx.scene.enter('SELECT_CLASS')
        } else {
            ctx.session.i = 0   //index текущего класса в массиве
            ctx.session.class_id = classList[0].class_id
            ctx.scene.enter('SELECT_ACTION')
        }
    }
})

export default firstStep