//keyboards.js
import { Markup } from "telegraf";

//------------------------------------------
const createNewClassMenu = () => {
    return Markup.inlineKeyboard([
        Markup.button.callback("Добавить новый класс", "createNewClass")
    ])
}

export { createNewClassMenu }