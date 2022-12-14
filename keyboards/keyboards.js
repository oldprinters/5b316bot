//keyboards.js
import { Markup } from "telegraf";

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
const selectClassMenu = (listClass) => {
//    console.log("selectClassMenu listClass =", listClass)
    const ar = listClass.map((el, i) => Markup.button.callback(el.name, `iClass_${i}`))
    return Markup.inlineKeyboard([
        ar
    ])
}
//-------------------------------------------
const selectShedActionMenu = (nLesson, nClass, isAdmin, isRequest = false) => {
    let arrAction = [
        [Markup.button.callback("Просмотр расписания уроков", "viewSheduleDay")], 
        [Markup.button.callback("Добавить класс", "appendClass")]
    ]
    if(isAdmin)
        arrAction.push([Markup.button.callback("Установка времени начала уроков", "setTimesUr")])
    if(nLesson){
        if(isAdmin)
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

export { createNewClassMenu, queryDelCancelMenu, queryYesNoMenu, queryYesNoCancelMenu, 
    selectRoleMenu, selectClassMenu, selectDay, selectShedActionMenu }