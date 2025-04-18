// ==============================================
// == Логика игры (отделена от UI) ==
// ==============================================

const gameLogic = (function() {
    const totalQuestions = 10;
    let currentQuestion = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let currentProblem = null;

    // Генерирует случайное число в диапазоне [min, max]
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Генерирует пример на сложение или вычитание
    function generateProblem() {
        const operator = Math.random() < 0.5 ? '+' : '-';
        let num1, num2, answer;

        if (operator === '+') {
            // Для сложения генерируем num1 от 10 до 89
            num1 = getRandomInt(10, 89);
            // Генерируем num2 так, чтобы сумма не превышала 99
            num2 = getRandomInt(10, 99 - num1);
            answer = num1 + num2;
        } else { // operator === '-'
            // Для вычитания генерируем num1 от 20 до 99
            num1 = getRandomInt(20, 99);
            // Генерируем num2 так, чтобы num1 >= num2 и результат был >= 10
            num2 = getRandomInt(10, num1 - 10);
             answer = num1 - num2;
        }

        // Дополнительная проверка, если вдруг числа сгенерировались не так
         if (operator === '+' && (num1 + num2 > 99 || num1 < 10 || num2 < 10)) {
             console.warn("Regenerating + problem due to constraint violation", {num1, num2, result: num1 + num2});
             return generateProblem(); // Рекурсивный вызов, если не подходит
         }
         if (operator === '-' && (num1 - num2 < 0 || num1 < 10 || num2 < 10)) {
              console.warn("Regenerating - problem due to constraint violation", {num1, num2, result: num1 - num2});
              return generateProblem(); // Рекурсивный вызов, если не подходит
         }


        currentProblem = { num1, num2, operator, answer };
        return currentProblem;
    }

    // Проверяет ответ пользователя
    function checkAnswer(userAnswer) {
        if (currentProblem === null) {
            console.error("Нет текущего примера для проверки!");
            return false;
        }
        // Преобразуем ввод пользователя в число
        const answerNum = parseInt(userAnswer, 10);
        // Проверяем, является ли ввод числом и совпадает ли с правильным ответом
        return !isNaN(answerNum) && answerNum === currentProblem.answer;
    }

    // Обрабатывает результат ответа
    function processAnswer(isCorrect) {
        if (isCorrect) {
            correctAnswers++;
        } else {
            incorrectAnswers++;
        }
        currentQuestion++;
    }

    // Определяет сообщение о результате игры
    function getFeedbackMessage() {
        let message = `Игра завершена! Ваш результат: ${correctAnswers} правильных, ${incorrectAnswers} неправильных.`;
        if (correctAnswers === totalQuestions) {
            message += " Супермолодец!";
        } else if (correctAnswers >= 8) {
            message += " Молодец!";
        } else if (correctAnswers >= 6) {
            message += " Надо стремиться!";
        } else {
            message += " Печальчка :(";
        }
        return message;
    }

    // Сбрасывает состояние игры для новой игры
    function resetGame() {
        currentQuestion = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        currentProblem = null;
    }

    // Возвращает текущее состояние игры
    function getGameState() {
        return {
            currentQuestion,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            currentProblem
        };
    }

    // Возвращаем только функции, которые будут использоваться UI
    return {
        startGame: resetGame, // startGame логически просто сбрасывает состояние
        generateProblem,
        checkAnswer,
        processAnswer,
        getFeedbackMessage,
        getGameState
    };
})();


// ==============================================
// == Работа с пользовательским интерфейсом (UI) ==
// ==============================================

const gameUI = (function() {
    // Получаем ссылки на DOM-элементы
    const statusDiv = document.getElementById('status');
    const problemDiv = document.getElementById('problem');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const correctScoreSpan = document.getElementById('correct-score');
    const incorrectScoreSpan = document.getElementById('incorrect-score');
    const feedbackDiv = document.getElementById('feedback');
    const restartButton = document.getElementById('restart-button');
    const inputAreaDiv = document.querySelector('.input-area'); // Контейнер для ввода и кнопки
    const scoreAreaDiv = document.querySelector('.score-area'); // Контейнер для счетов


    // Отображает текущий пример на странице
    function displayProblem(problem) {
        problemDiv.textContent = `${problem.num1} ${problem.operator} ${problem.num2} = ?`;
    }

    // Обновляет отображение счета
    function displayScore(correct, incorrect) {
        correctScoreSpan.textContent = correct;
        incorrectScoreSpan.textContent = incorrect;
    }

    // Обновляет отображение статуса (номер примера)
    function displayStatus(current, total) {
        statusDiv.textContent = `Решено: ${current} из ${total} примеров`;
    }

    // Отображает финальное сообщение и скрывает элементы игры
    function showFeedback(message) {
        feedbackDiv.textContent = message;
        feedbackDiv.style.display = 'block';

        // Скрываем элементы игры
        problemDiv.style.display = 'none';
        inputAreaDiv.style.display = 'none';
        scoreAreaDiv.style.display = 'none';

        // Показываем кнопку "Новая игра"
        restartButton.style.display = 'block';
    }

    // Скрывает финальное сообщение и показывает элементы игры
    function hideFeedback() {
        feedbackDiv.style.display = 'none';
        restartButton.style.display = 'none';

        // Показываем элементы игры
        problemDiv.style.display = 'block';
        inputAreaDiv.style.display = 'flex'; // Восстанавливаем исходный display
        scoreAreaDiv.style.display = 'block';
    }

    // Очищает поле ввода
    function clearInput() {
        answerInput.value = '';
    }

     // Фокусирует поле ввода (удобно для начала игры и после ответа)
    function focusInput() {
        answerInput.focus();
    }


    // Возвращаем функции, которые будут взаимодействовать с UI
    return {
        displayProblem,
        displayScore,
        displayStatus,
        showFeedback,
        hideFeedback,
        clearInput,
        focusInput,
        getAnswer: () => answerInput.value, // Функция для получения введенного ответа
        submitButton, // Возвращаем сам элемент кнопки для добавления слушателя событий
        restartButton // Возвращаем сам элемент кнопки перезапуска
    };
})();


// ==============================================
// == Координация логики и UI (главный цикл игры) ==
// ==============================================

// Функция для начала или перезапуска игры
function startGame() {
    gameLogic.startGame(); // Сброс состояния логики
    gameUI.hideFeedback(); // Скрываем сообщение о конце игры и кнопку рестарта
    nextProblem(); // Переходим к первому примеру
}

// Переходит к следующему примеру или завершает игру
function nextProblem() {
    const gameState = gameLogic.getGameState();

    if (gameState.currentQuestion < gameState.totalQuestions) {
        // Есть еще вопросы
        const problem = gameLogic.generateProblem(); // Генерируем новый пример
        gameUI.displayProblem(problem); // Отображаем его
        gameUI.displayStatus(gameState.currentQuestion, gameState.totalQuestions); // Обновляем статус
        gameUI.displayScore(gameState.correctAnswers, gameState.incorrectAnswers); // Обновляем счет
        gameUI.clearInput(); // Очищаем поле ввода
        gameUI.focusInput(); // Фокусируемся на поле ввода
    } else {
        // Вопросы закончились - завершаем игру
        endGame();
    }
}

// Завершает игру и показывает результаты
function endGame() {
    const gameState = gameLogic.getGameState();
    const feedbackMessage = gameLogic.getFeedbackMessage(); // Получаем сообщение из логики
    gameUI.showFeedback(feedbackMessage); // Отображаем финальное сообщение
    gameUI.displayStatus(gameState.currentQuestion, gameState.totalQuestions); // Обновляем статус в конце
    gameUI.displayScore(gameState.correctAnswers, gameState.incorrectAnswers); // Показываем окончательный счет
}

// Обработчик нажатия кнопки "Готово!"
function handleSubmitClick() {
    const userAnswer = gameUI.getAnswer(); // Получаем ответ пользователя из UI
    const isCorrect = gameLogic.checkAnswer(userAnswer); // Проверяем ответ в логике

    gameLogic.processAnswer(isCorrect); // Обрабатываем результат ответа (обновляем счетчики в логике)

    nextProblem(); // Переходим к следующему шагу (следующий пример или конец игры)
}

// Обработчик нажатия клавиши Enter в поле ввода
function handleInputKeyPress(event) {
    // Проверяем, является ли нажатая клавиша Enter (код 13)
    if (event.key === 'Enter' || event.keyCode === 13) {
         // Предотвращаем стандартное поведение (например, отправку формы, если поле в форме)
        event.preventDefault();
        // Вызываем обработчик кнопки "Готово!"
        handleSubmitClick();
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем слушатель события клика на кнопку "Готово!"
    gameUI.submitButton.addEventListener('click', handleSubmitClick);

    // Добавляем слушатель события нажатия клавиши на поле ввода
    document.getElementById('answer-input').addEventListener('keypress', handleInputKeyPress);

     // Добавляем слушатель события клика на кнопку "Новая игра"
    gameUI.restartButton.addEventListener('click', startGame);

    // Начинаем первую игру
    startGame();
});