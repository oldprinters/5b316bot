# 5b316bot
Бот написан для родителей детей учащихся в школе. 
Что может этот бот:
- запомнить расписание одного или нескольких классов (если в семье несколько детей);
- по команде Start выдавать расписание текущего дня (а после 15:00 так же выдавать расписание следующего дня);
- текущий урок выделяется в списке уроков;
- к расписанию класса могут подключаться другие пользователи (члены семьи и родители одноклассников):
- администратор может вносить постоянные и временные изменения в расписание (болезнь учителя и т.д.);
- пользователь имеет одну из следующих ролей: ученик, родитель, учитель, классный руководитель. Роли будут использоваться при рассылке сообщений, пока этот функционал не реализован.

<h3><i>Настоятельно рекомендую каждое обращение начинать с перезапуска. Меню -> Start или /start</i></h3>
Это связано с тем, что бот находится в разработкеи желательно постоянно обновлять код.
<h2>Дополнительные занятия</h2>
<p>Каждый пользователь может добавить в свое расписание список дополнительных занятий. Этот список будет отображаться только у него.
Для создания записи, следует: /start -> /settings -> Дополнительные занятия -> Добавить кружок.</p>
Далее ответить на вопросы.
Удалить можно там же.

По команде /help будет выведена подсказка.

<h2>Напоминалки</h2>

Бот позволяет ставить различные напоминания. 
<p>Напоминания могут быть привязаны к урокам данного класса. В этом случае сообщение о событии придет в день ближайшего урока, за 1 ч 30 мин до начала первого урока. </p>
<p>Напоминание "Словами" может быть установлено на определенную дату и определенное время. (31.12.2023 23:00 поздравить друзей.)</p>
<p>Ниже сообщения выводится кнопка "Принято". Нажатие на эту кнопку отключает повторные сообщения. В противном случае бот пришлет ещё 5 сообщений с интервалом 5 мин.</p>
