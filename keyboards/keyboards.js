//keyboards.js
import { Markup } from "telegraf";

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
//-------------------------------------------
const selectClassMenu = (listClass) => {
    console.log("selectClassMenu listClass =", listClass)
    const ar = listClass.map((el, i) => Markup.button.callback(el.name, `iClass_${i}`))
    return Markup.inlineKeyboard([
        ar
    ])
}
//-------------------------------------------
const selectShedActionMenu = () => {
    return Markup.inlineKeyboard([
        Markup.button.callback("Время начала уроков", "createNewClass")
    ])

}

export { createNewClassMenu, selectRoleMenu, selectClassMenu, selectShedActionMenu }