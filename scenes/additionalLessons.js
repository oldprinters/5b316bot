import {Telegraf, Markup, Scenes, session} from "telegraf"
import AdditionalClass from '../controllers/additionalClass.js'
import AddLessTime from '../controllers/addLessTime.js'
import ClassOi from '../controllers/classOi.js'
import {selectAddLessonMenu, createAdditionalMenu, queryYesNoMenu} from '../keyboards/keyboards.js'

const additionalLessons = new Scenes.BaseScene('ADDITIONAL_LESSONS')
//-----------------------------
additionalLessons.enter(async ctx => {
    const aC = new AdditionalClass(ctx)
    const aLlist = await aC.getListLessons()
    if(aLlist.length == 0){
        await ctx.reply('Отсутствуют зарегистрированные дополнительные занятия.')
    } else {
        let list = ''
        for(let el of aLlist){
            list += `<b><u>${el.bn_name}</u></b>\n${el.oi_name}\n`
            if(el.note.length > 0)
                list += `<i>${el.note}</i>\n`
        }
        await ctx.replyWithHTML(`Зарегистрированные дополнительные занятия:\n${list}`)
    }
    await ctx.reply('Для добавления нового занятия ответьте на вопросы:', createAdditionalMenu())
})
//-----------------------------
additionalLessons.help( ctx => {
    ctx.replyWithHTML('<b><u>HELP</u></b>\nДни недели пишем по русски, полностью.')
})
//------------------------------------------------------
additionalLessons.start( ctx => {ctx.scene.enter('SELECT_ACTION')})
//-------------------------------------------------
additionalLessons.command('settings', async ctx => { 
    await ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------------------
additionalLessons.action(/^idDelLess_\d{1,1000000}$/, async ctx => {
    ctx.answerCbQuery()
    const id = parseInt(ctx.match[0].slice(10))
    const aC = new AdditionalClass(ctx)
    const res = await aC.delLessonById(id)
    await ctx.reply('Кружок удален из списка.')
    await ctx.scene.enter('SELECT_ACTION')
})
//------------------------------------------------------
additionalLessons.action('createAdditional', ctx => {
    ctx.answerCbQuery()
        ctx.reply('Введите название занятия:')
})
//------------------------------------------------------
additionalLessons.action('deleteAdditional', async ctx => {
    ctx.answerCbQuery()
    const aC = new AdditionalClass(ctx)
    const res = await aC.getListLessonsName()
    if(res[0] != undefined)
        ctx.replyWithHTML('<b>Удаление дополнительного занятия</b>\nДанное действие нельзя будет отменить.', selectAddLessonMenu(res))
    else {
        await ctx.replyWithHTML('Зарегистрированных кружков пока нет.')
        return await ctx.scene.enter('SELECT_ACTION')
    }
})
//-------------------------------------------------------
additionalLessons.on('text', async ctx => {
    if(ctx.scene.session.state.name == undefined){
        ctx.scene.session.state.name = ctx.message.text.trim().replaceAll("'", '"')
        ctx.reply('Введите, через запятую, дни недели, время начала и окончания занятий\n Пример: вторник 19:10 20:30, четверг 20:10 21:30 и т.д.')
    } else if(ctx.scene.session.state.arALT == undefined){
        const str = ctx.message.text.trim().replaceAll("'", '"').toLowerCase()
        const classOi = new ClassOi()
        const alt = new AddLessTime()
        try {
            const arALT = alt.validat(str)
            ctx.scene.session.state.arALT = arALT
        } catch(err){
            return ctx.replyWithHTML(`<b>Ошибка</b>: ${err}`)
        }
        const res = await classOi.getOiName(str)
        if(res != undefined){
            ctx.scene.session.state.oi_id = res.id
            ctx.scene.session.state.oi_name = res.name
        } else {
            return ctx.reply('Ошибка сохранения данных.')
        }
        ctx.reply('Введите примечание, адрес и т.д., либо дефис для пропуска.')
    } else if(ctx.scene.session.state.note == undefined){
        const st = ctx.scene.session.state
        st.note = ctx.message.text.trim().replaceAll("'", '"')
        if(st.note == '-')st.note = ''
        let list = `<b><u>${st.name}</u></b>\n`
        st.arALT.forEach(el => {list +=`${el.name} ${el.time_s} - ${el.time_e}\n`})
        if(st.note != '')list +=`\nВажно: <i>${st.note}</i>`
        ctx.replyWithHTML(`Всё правильно?\n${list}\nЗаписываем?`, queryYesNoMenu())
    }
    
})
//-----------------------------------------
additionalLessons.action('queryYes2', async ctx => {
    ctx.answerCbQuery()
    const st = ctx.scene.session.state
    const aC = new AdditionalClass(ctx)
    const res = await aC.addLesson(st)
    if(res.affectedRows > 0){
        const alt = new AddLessTime()
        try {
            await alt.addListLess(res.insertId, st.arALT)
            ctx.reply('Данные сохранены.')
        } catch(err){
            ctx.reply(`ERROR ${err}`)
        }
    }
        
    await ctx.scene.enter('SELECT_ACTION')
})
//-----------------------------------------
additionalLessons.action('queryNo2', async ctx => {
    await ctx.answerCbQuery()
    await ctx.reply('Не сохраняем.')
    await ctx.scene.enter('SELECT_ACTION')
})

export default additionalLessons