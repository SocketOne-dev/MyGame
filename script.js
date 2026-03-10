// ==========================================
// 1. ГЛОБАЛЬНОЕ СОСТОЯНИЕ ИГРЫ (STATE)
// ==========================================
// Эти переменные хранят текущие данные во время прохождения викторины.
let score = 0; // Текущее количество правильных ответов
let lives = 3; // Количество оставшихся попыток (сердечек)
let currentIndex = 0; // Индекс текущего вопроса в массиве (0 - первый вопрос)
let currentQuestions = []; // Массив вопросов для выбранного предмета (перемешанный)
let selectedClass = ''; // Строка: выбранный класс (например, "9 Класс")
let selectedSubject = ''; // Строка: выбранный предмет (например, "Математика")
let popka = 0;

// ==========================================
// 2. ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ ИЗ HTML (DOM ELEMENTS)
// ==========================================
// Объект screens хранит ссылки на все 5 главных экранов приложения.
// Это нужно для удобного переключения между ними.
const screens = {
  home: document.getElementById('screen-home'),
  subjects: document.getElementById('screen-subjects'),
  game: document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
  highscores: document.getElementById('screen-highscores')
};

// Контейнеры, в которые мы будем динамически добавлять кнопки и текст
const classesContainer = document.getElementById('classes-container'); // Для кнопок классов
const subjectsContainer = document.getElementById('subjects-container'); // Для кнопок предметов
const subjectsTitle = document.getElementById('subjects-title'); // Заголовок экрана предметов
const optionsContainer = document.getElementById('options-container'); // Для 4 вариантов ответа
const questionText = document.getElementById('question-text'); // Текст самого вопроса

// Элементы интерфейса (UI) для обновления информации
const scoreDisplay = document.getElementById('score-display'); // Счетчик очков в игре
const heartsDisplay = document.getElementById('hearts-display'); // Контейнер для сердечек
const finalScoreDisplay = document.getElementById('final-score'); // Итоговый счет на экране результатов
const resultTitle = document.getElementById('result-title'); // Заголовок результата (Победа/Поражение)
const resultMessage = document.getElementById('result-message'); // Текстовое сообщение результата
const recordScoreDisplay = document.getElementById('record-score'); // Отображение рекорда
const highscoresList = document.getElementById('highscores-list'); // Контейнер для списка всех рекордов

// Кнопки навигации
const btnHighscores = document.getElementById('btn-highscores');
const btnBackHome = document.getElementById('btn-back-home');
const btnQuit = document.getElementById('btn-quit'); // Крестик выхода из игры
const btnPlayAgain = document.getElementById('btn-play-again');
const btnHomeFromResult = document.getElementById('btn-home-from-result');
const btnBackFromScores = document.getElementById('btn-back-from-scores');

// ==========================================
// 3. СИСТЕМА МАРШРУТИЗАЦИИ (ROUTING)
// ==========================================
/**
 * Функция для переключения экранов (SPA логика).
 * @param {string} screenId - Ключ экрана из объекта screens (например, 'game' или 'home')
 */
function showScreen(screenId) {
  // Проходим по всем экранам и добавляем им класс 'hidden' (прячем их)
  Object.values(screens).forEach(screen => {
    screen.classList.add('hidden');
  });
  // Убираем класс 'hidden' только у того экрана, который запросили
  screens[screenId].classList.remove('hidden');
}

// ==========================================
// 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (UTILITIES)
// ==========================================
/**
 * Алгоритм Фишера-Йетса для случайного перемешивания массива.
 * Гарантирует, что вопросы и ответы не будут идти в одном и том же порядке.
 * @param {Array} array - Исходный массив
 * @returns {Array} - Новый перемешанный массив
 */
function shuffleArray(array) {
  const newArr = [...array]; // Создаем копию, чтобы не мутировать оригинальные данные
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Случайный индекс от 0 до i
    // Меняем элементы местами
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// ==========================================
// 5. ЛОГИКА ГЛАВНОГО МЕНЮ И ВЫБОРА
// ==========================================
/**
 * Инициализация главного экрана.
 * Динамически создает кнопки для каждого класса на основе данных из data.js.
 */
function initHome() {
  classesContainer.innerHTML = ''; // Очищаем контейнер от старых кнопок
  
  // Object.keys(quizData) возвращает массив ключей: ["9 Класс", "10 Класс", "11 Класс"]
  Object.keys(quizData).forEach(className => {
    const btn = document.createElement('button');
    btn.textContent = className;
    btn.className = 'btn-primary';
    // При клике на кнопку класса, переходим к выбору предмета для этого класса
    btn.onclick = () => showSubjects(className);
    classesContainer.appendChild(btn);
  });
}

/**
 * Отображение экрана выбора предметов для конкретного класса.
 * @param {string} className - Название выбранного класса
 */
function showSubjects(className) {
  selectedClass = className; // Сохраняем выбор в глобальное состояние
  subjectsTitle.textContent = `Предметы - ${className}`; // Обновляем заголовок
  subjectsContainer.innerHTML = '';
  
  // Получаем список предметов для выбранного класса (например, ["Математика", "История"])
  Object.keys(quizData[className]).forEach(subject => {
    const btn = document.createElement('button');
    btn.textContent = subject;
    btn.className = 'btn-primary';
    // При клике на предмет, запускаем игру
    btn.onclick = () => startGame(subject);
    subjectsContainer.appendChild(btn);
  });
  
  showScreen('subjects'); // Переключаем видимость экранов
}

// ==========================================
// 6. ИГРОВОЙ ПРОЦЕСС (CORE GAMEPLAY)
// ==========================================
/**
 * Запуск новой игры по выбранному предмету.
 * @param {string} subject - Название предмета
 */
function startGame(subject) {
  selectedSubject = subject;
  
  // Сброс игровой статистики к начальным значениям
  lives = 3;
  score = 0;
  currentIndex = 0;
  
  // Берем массив вопросов из базы данных и сразу его перемешиваем
  currentQuestions = shuffleArray(quizData[selectedClass][selectedSubject]);
  
  updateHeader(); // Обновляем UI (счет и жизни)
  renderQuestion(); // Отрисовываем первый вопрос
  showScreen('game'); // Показываем игровой экран
}

/**
 * Обновление верхней панели игры (счетчик очков и визуализация жизней).
 */
function updateHeader() {
  scoreDisplay.textContent = score;
  // Создаем массив длиной 'lives', заполняем его строкой '<span>❤️</span>' и склеиваем в один HTML-код
  heartsDisplay.innerHTML = Array(lives).fill('<span>❤️</span>').join('');
}

/**
 * Отрисовка текущего вопроса и вариантов ответа.
 */
function renderQuestion() {
  // Проверка на окончание игры: если вопросы кончились ИЛИ кончились жизни
  if (currentIndex >= currentQuestions.length || lives === 0) {
    endGame();
    return;
  }
  
  // Получаем объект текущего вопроса
  const currentQ = currentQuestions[currentIndex];
  questionText.textContent = currentQ.question; // Выводим текст вопроса
  
  optionsContainer.innerHTML = ''; // Очищаем старые кнопки ответов
  
  // Перемешиваем варианты ответов, чтобы правильный ответ всегда был на случайном месте
  const shuffledOptions = shuffleArray(currentQ.options);
  
  // Создаем кнопки для каждого варианта ответа
  shuffledOptions.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.className = 'option-btn';
    // Привязываем обработчик клика, передавая саму кнопку, выбранный текст и правильный ответ
    btn.onclick = (e) => handleAnswer(e.target, option, currentQ.correct_answer);
    optionsContainer.appendChild(btn);
  });
}

/**
 * Обработка выбора ответа пользователем.
 * @param {HTMLElement} btn - Нажатая HTML кнопка
 * @param {string} selected - Текст ответа, который выбрал пользователь
 * @param {string} correct - Текст правильного ответа из базы данных
 */
function handleAnswer(btn, selected, correct) {
  // 1. Блокируем все кнопки, чтобы предотвратить двойные клики во время анимации
  const allBtns = optionsContainer.querySelectorAll('button');
  allBtns.forEach(b => b.disabled = true);
  
  // 2. Проверяем правильность ответа
  if (selected === correct) {
    btn.classList.add('correct'); // Окрашиваем нажатую кнопку в зеленый
    score++; // Увеличиваем счет
  } else {
    btn.classList.add('wrong'); // Окрашиваем нажатую кнопку в красный
    lives--; // Отнимаем одну жизнь
    
    // Ищем кнопку с правильным ответом и подсвечиваем её зеленым, чтобы пользователь знал ошибку
    allBtns.forEach(b => {
      if (b.textContent === correct) {
        b.classList.add('correct');
      }
    });
  }
  
  updateHeader(); // Обновляем счет и сердечки на экране
  
  // 3. Задержка перед переходом к следующему вопросу (500 мс)
  // Это нужно, чтобы пользователь успел увидеть, правильно ли он ответил (цвета кнопок)
  setTimeout(() => {
    currentIndex++; // Переходим к следующему вопросу
    renderQuestion(); // Отрисовываем его
  }, 500);
}

// ==========================================
// 7. ЗАВЕРШЕНИЕ ИГРЫ И РЕКОРДЫ (LOCAL STORAGE)
// ==========================================
/**
 * Логика завершения игры: подсчет рекордов, формирование сообщения и показ экрана результатов.
 */
function endGame() {
  finalScoreDisplay.textContent = score; // Показываем итоговый счет
  
  // --- РАБОТА С ЛОКАЛЬНЫМ ХРАНИЛИЩЕМ (LOCAL STORAGE) ---
  // LocalStorage позволяет сохранять данные в браузере пользователя даже после закрытия вкладки.
  const key = "quiz_highscores";
  
  // Пытаемся получить старые рекорды. Если их нет (null), создаем пустой объект {}
  // JSON.parse нужен, так как localStorage хранит только строки.
  let highscores = JSON.parse(localStorage.getItem(key)) || {};
  
  // Формируем уникальный ключ для текущего предмета (например: "9 Класс - Математика")
  const subjectKey = `${selectedClass} - ${selectedSubject}`;
  
  // Достаем текущий рекорд по этому предмету (если его нет, считаем что он равен 0)
  let record = highscores[subjectKey] || 0;
  
  let isNewRecord = false; // Флаг для отслеживания нового рекорда
  
  // Если текущий счет строго больше старого рекорда
  if (score > record) {
    record = score; // Обновляем локальную переменную
    highscores[subjectKey] = score; // Обновляем значение в объекте рекордов
    // Сохраняем обновленный объект обратно в память браузера, превратив его в строку (JSON.stringify)
    localStorage.setItem(key, JSON.stringify(highscores));
    isNewRecord = true;
  }
  
  recordScoreDisplay.textContent = record; // Выводим рекорд на экран

  // --- ФОРМИРОВАНИЕ СООБЩЕНИЯ ---
  // Меняем текст заголовка и описания в зависимости от причины конца игры
  if (lives === 0) || (popka===1){
    // Игрок потратил все 3 жизни
    resultTitle.textContent = "Игра окончена 💔";
    resultMessage.textContent = "Жизни закончились. Не сдавайся, попробуй еще раз!";
  } else {
    // Игрок ответил на все вопросы в массиве, и жизни остались
    resultTitle.textContent = "Конец категории 🏁";
    resultMessage.textContent = "Эх, к сожалению, вопросы в этой категории закончились :/ Но ты можешь попробовать себя в других предметах ;)";
  }

  // Если установлен новый рекорд (и счет больше 0), добавляем поздравление к сообщению
  if (isNewRecord && score > 0) {
    resultMessage.textContent += " Кстати, ты установил новый рекорд! 🏆";
  }

  showScreen('result'); // Показываем экран результатов
}

/**
 * Чтение данных из LocalStorage и отрисовка таблицы рекордов.
 */
function showHighScores() {
  const key = "quiz_highscores";
  let highscores = JSON.parse(localStorage.getItem(key)) || {};
  
  highscoresList.innerHTML = ''; // Очищаем список перед отрисовкой
  
  // Если объект рекордов пустой (нет ключей)
  if (Object.keys(highscores).length === 0) {
    highscoresList.innerHTML = '<p style="text-align:center; color:#888;">Пока нет рекордов.</p>';
  } else {
    // Превращаем объект в массив пар [ключ, значение], сортируем по убыванию очков и отрисовываем
    Object.entries(highscores)
      .sort((a, b) => b[1] - a[1]) // Сортировка: от большего счета к меньшему
      .forEach(([subject, score]) => {
        const div = document.createElement('div');
        div.className = 'highscore-item';
        // Выводим название предмета слева и счет справа
        div.innerHTML = `<span>${subject}</span><span>${score}</span>`;
        highscoresList.appendChild(div);
      });
  }
  
  showScreen('highscores'); // Переключаем на экран рекордов
}

// ==========================================
// 8. ПРИВЯЗКА СОБЫТИЙ (EVENT LISTENERS)
// ==========================================
// Назначаем функции, которые будут выполняться при клике на статические кнопки интерфейса
btnHighscores.onclick = showHighScores;
btnBackHome.onclick = () => showScreen('home');
btnQuit.onclick = endGame; // Досрочное завершение игры приравнивается к проигрышу
if btnQuit.onclick:
  popka=popka+1
btnPlayAgain.onclick = () => startGame(selectedSubject); // Перезапуск того же предмета
btnHomeFromResult.onclick = () => showScreen('home');
btnBackFromScores.onclick = () => showScreen('home');

// ==========================================
// 9. СТАРТ ПРИЛОЖЕНИЯ
// ==========================================
// При первой загрузке скрипта инициализируем кнопки классов и показываем главный экран
initHome();
showScreen('home');
