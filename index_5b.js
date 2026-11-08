import {Telegraf, Markup, Scenes, session} from "telegraf"
import backup from "./config/backup.js"
import dotenv from 'dotenv'
import additionalLesson from './scenes/additionalLessons.js'
import catalogAppend from "./scenes/catalogAppend.js"
import catalogList from "./scenes/catalogList.js"
import createClass from './scenes/createClass.js'
import createSchedule from './scenes/createSchedule.js'
import durationLesson from './scenes/durationLesson.js'
import EventsClass from './controllers/eventsClass.js'
import freeWords from './scenes/rememberWords.js'
import games from './scenes/games.js'
import selectClass from './scenes/selectClass.js'
import selectAction from './scenes/selectAction.js'
import setTimesUr from './scenes/setTimesUr.js'
import setSheduleDay from './scenes/setSheduleDay.js'
import inpSheduleForDay from './scenes/inpSheduleForDay.js'
import sendQueryAdmin from './scenes/queryMessage.js'
import processRequests from './scenes/processRequests.js'
import remember from './scenes/remember.js'
import delRems from './scenes/delRems.js'
import shultz from './scenes/games/shultz.js'
import viewShedule from './scenes/viewShedule.js'
import firstStep from './scenes/firstStep.js'

import * as cron from 'node-cron'
import { getNotesTime } from './utils.js'

dotenv.config()

const stage = new Scenes.Stage([additionalLesson, catalogAppend, catalogList, createClass, createSchedule, delRems, durationLesson, firstStep, freeWords, games, inpSheduleForDay, processRequests, remember,
    selectClass, selectAction, sendQueryAdmin, setTimesUr, setSheduleDay, shultz, viewShedule])

const bot = new Telegraf(process.env.KEY);
bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
    await ctx.replyWithHTML('Для понимания логики работы бота пользуйтесь подсказками\n<b>Меню -> Вызов справки</b> или /help.')
    await ctx.scene.enter('FIRST_STEP')
});

bot.hears(/^(rem|Rem|напоминалки|Напоминалки)$/, ctx => {
    return ctx.scene.enter('FREE_WORDS')
})
//---------------------------------------------
// Подтверждение полученного напоминания.
bot.action(/^answerAccepted\d{1,12}$/, async ctx => {
    try {
        // Сначала убираем индикатор ожидания на кнопке.
        // Просроченный callback не должен мешать обработке самого события.
        try {
            await ctx.answerCbQuery();
        } catch (error) {
            const description = error.response?.description ?? '';

            const isExpiredCallback =
                error.response?.error_code === 400 &&
                /query is too old|query ID is invalid/i.test(description);

            if (!isExpiredCallback) {
                // Остальные ошибки передаём во внешний catch.
                throw error;
            }

            console.warn('answerAccepted: callback уже недействителен', {
                updateId: ctx.update.update_id,
                callbackId: ctx.callbackQuery?.id,
                callbackData: ctx.callbackQuery?.data,
                receivedAt: new Date().toISOString()
            });
        }

        // Обрабатываем событие даже при просроченном подтверждении кнопки.
        const eC = new EventsClass(ctx);
        const ec_id = ctx.match[0].slice(14);
        const msg = (await eC.getNotesById(ec_id))[0];

        if (!msg) {
            await ctx.reply('Событие не найдено');
            return;
        }

        if (msg.cronTab.length === 0) {
            await eC.updateActive(ec_id, 0);
        } else {
            await eC.setNewPeriod(msg);
        }

        await ctx.replyWithHTML(
            '<i>Готов к выполнению новых заданий! Обращайтесь.</i>'
        );
    } catch (error) {
        console.error('Ошибка при обработке answerAccepted:', error);
    }
});
//---------------------------------------------------
bot.on('text', async (ctx) => {
    await ctx.replyWithHTML(`<b>Перезапустите бот нажав /start</b>`);
});

// Общая блокировка минутной рассылки в этом процессе.
// Если отправка затянулась, следующий тик пропускаем,
// а не запускаем вторую рассылку поверх первой.
let notesJobRunning = false;
let notesJobStartedAt = null;

cron.schedule('* * * * *', async () => {
    if (notesJobRunning) {
        console.warn('getNotesTime: пропускаем пересекающийся запуск', {
            runningForSeconds: Math.round(
                (Date.now() - notesJobStartedAt) / 1000
            )
        });
        return;
    }

    // Ставим блокировку до первого await.
    notesJobRunning = true;
    notesJobStartedAt = Date.now();

    try {
        // Должны дождаться всей цепочки вплоть до sendMsg().
        await getNotesTime();
    } catch (error) {
        console.error('getNotesTime error:', error);
    } finally {
        // Снимаем блокировку и после успеха, и после ошибки.
        notesJobRunning = false;
        notesJobStartedAt = null;
    }
});

cron.schedule('25 2 * * *', async () => {
    try {
        await backup()
    } catch (e) {
        console.error('backup error:', e)
    }
})

//---------------------------------------------
// Запускаем приём обновлений Telegram.
// При polling Promise от launch() работает до его остановки,
// поэтому .then() не используем как сообщение об успешном старте.
console.log('Запускаем ivanych_bot...')

bot.launch().catch(err => {
    // Не выводим весь объект ошибки:
    // в сетевых настройках запроса может находиться токен бота.
    console.error('Ошибка запуска или остановка polling:', {
        name: err?.name,
        code: err?.code || err?.cause?.code,
        telegramCode: err?.response?.error_code,
        message: err?.message
    })

    // Cron может удерживать процесс живым даже без polling.
    // Завершаем процесс, чтобы PM2 запустил бота заново.
    process.exit(1)
})
