//keyboards.js
import { Markup } from "telegraf";
import { outDateTime } from "../utils.js";

//------------------------------------------
const queryDelCancelMenu = () => {
    return Markup.inlineKeyboard([
        Markup.button.callback("Удалить", "queryDel"),
        Markup.button.callback("Отказаться", "queryCancel")
    ])
}
//------------------------------------------
const queryYesNoMenu = () => {
    return Markup.inlineKeyboard([
        Markup.button.callback("Да", "queryYes2"),
        Markup.button.callback("Нет", "queryNo2")
    ])
}
//------------------------------------------
const queryYesNoCancelMenu = () => {
    return Markup.inlineKeyboard([
        [
         Markup.button.callback("Да", "queryYes3"),
         Markup.button.callback("Нет", "queryNo3")
        ],
        [Markup.button.callback("Отказаться", "queryCancel")]
    ])
}
//------------------------------------------
const createNewClassMenu = () => {
    return Markup.inlineKeyboard([
        Markup.button.callback("Добавить новый класс", "createNewClass")
    ])
}
//------------------------------------------
const createAdditionalMenu = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback("Добавить кружок", "createAdditional")],
        [Markup.button.callback("Удалить кружок", "deleteAdditional")],
    ])
}
//-------------------------------------------
const selectAddLessonMenu = (listLess) => {
    const ar = listLess.map((el, i) => [Markup.button.callback(el.name, `idDelLess_${el.id}`)])
    return Markup.inlineKeyboard(
        ar
    )
}
//------------------------------------------
const selectRoleMenu = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback("Ученик", "studentRole"),
        Markup.button.callback("Родитель", "parentRole")],
        [Markup.button.callback("Преподаватель", "teacherRole"),
        Markup.button.callback("Классный руководитель", "c_teacherRole")]
    ])
}
//------------------------------------------
const selectDay = () => {
    return Markup.inlineKeyboard([
        [Markup.button.callback("Воскресенье", "sundayDay")],
        [Markup.button.callback("Понедельник", "mondayDay")],
        [Markup.button.callback("Вторник", "tuesdayDay")],
        [Markup.button.callback("Среда", "wednesdayDay")],
        [Markup.button.callback("Четверг", "thursdayDay")],
        [Markup.button.callback("Пятница", "fridayDay")],
        [Markup.button.callback("Суббота", "saturdayDay")],
    ])
}
//-------------------------------------------
const buttonsRems = (arRems) => {
    let ar = []
    arRems.forEach( el => {
        ar.push([Markup.button.callback(`${el.cycle?'(C)  ':''}${outDateTime(el.dateTime)} ${el.text}`, `delRem_${el.id}`)])
    })
    return Markup.inlineKeyboard(ar)
}
//-------------------------------------------
const selectClassMenu = (listClass) => {
    let ar = []
    if(listClass != undefined)
        ar = listClass.map((el, i) => Markup.button.callback(el.name, `iClass_${i}`))
    // ar.push(Markup.button.callback("Добавить новый класс", "createNewClass"))
    return Markup.inlineKeyboard([
        ar,
       [Markup.button.callback("Добавить новый класс", "createNewClass")]
    ])
}
//-------------------------------------------
const selectShedActionMenu = (nLesson, nClass, isAdmin, isRequest = false) => {
    let arrAction = [
        [Markup.button.callback("Просмотр расписания уроков", "viewSheduleDay")], 
//        [Markup.button.callback("Добавить класс", "appendClass")]
    ]
    if(isAdmin && false)
        arrAction.push([Markup.button.callback("Установка времени начала уроков", "setTimesUr")])
    if(nLesson){
        if(isAdmin && false)
            arrAction.push([Markup.button.callback("Редактирование расписания уроков", "setSheduleDay")])
    }
    if(nClass > 1){
        arrAction.push([Markup.button.callback("О классе", "getClassInfo")])
        arrAction.push([Markup.button.callback("Выбрать класс", "selectClass")])
    }
    if(isRequest)
        arrAction.push([Markup.button.callback("Посмотреть запросы", "viewRequests")])

    return Markup.inlineKeyboard(arrAction)
}
//------------------------------------------------
const selectActionAdminMenu = () => {
    let arrAction = [
        [Markup.button.callback("Установка времени начала уроков", "setTimesUr")],
        [Markup.button.callback("Редактирование расписания уроков", "setSheduleDay")],
        [Markup.button.callback("Добавить класс", "appendClass")],
        [Markup.button.callback("Дополнительные занятия", "additionalLessons")],
    ]
    return Markup.inlineKeyboard(arrAction)
}
//------------------------------------------------
const selectActionUserMenu = () => {
    let arrAction = [
        [Markup.button.callback("Добавить класс", "appendClass")],
        [Markup.button.callback("Дополнительные занятия", "additionalLessons")],
    ]
    return Markup.inlineKeyboard(arrAction)
}
//------------------------------------------------
const selectLesson = (listLess) => {
    const ar = listLess.map(el => [Markup.button.callback(el.name, `iSelectedLess_${el.name_id}`)])
    return Markup.inlineKeyboard(
        ar
    )
}
//------------------------------------------------
const selectRemember = (class_id) => {
    let arrAction = [
        [Markup.button.callback("Удаление напоминалок", "delRems")],
        [Markup.button.callback("Привязка к дате и времени", "freeWords")],
    ]
    if(class_id){
        arrAction.push([Markup.button.callback("Привязка к уроку", "nextLesson")])
    }
    return Markup.inlineKeyboard(arrAction)
}
//----------------------------------------------------- GAMES
const selectGame = (arrGame) => {
    const ar = arrGame.map(el => [Markup.button.callback(el.name, el.sAct)])
    return Markup.inlineKeyboard(
        ar
    )
}
//------------------------------------------------------
const shultzEndGame = (str) => {
    return Markup.inlineKeyboard([
        [Markup.button.callback(str, "gameOver")],
        [Markup.button.callback("Стоп", "gameStop")],
    ])
}

export { buttonsRems, createAdditionalMenu, createNewClassMenu, queryDelCancelMenu, queryYesNoMenu, queryYesNoCancelMenu, selectActionAdminMenu, selectActionUserMenu,
    selectAddLessonMenu, selectLesson, selectRemember, selectRoleMenu, selectClassMenu, selectDay, selectGame, selectShedActionMenu, shultzEndGame }