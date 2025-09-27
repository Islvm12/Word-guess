let gameName = "Guess The Word";
let hintWord = "Hint";
let gameState = true;
let state;
document.title = gameName;
document.querySelector("h1").innerText = gameName;
document.querySelector("footer").innerText = `© ${new Date().getFullYear()} ${gameName} by Islam Muhammed`;

function celebrate(inputEl) {
    const rect = inputEl.getBoundingClientRect(); // position of the input on the screen
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
        particleCount: 50,
        spread: 20,
        origin: { x, y }
    });
}

function playSound(src) {
    const audio = new Audio(src);
    audio.play();
}

let dontPressCount = 0;

// Game Options
let numberOfTries = 6;
let wordLength = 6;
let currentTry = 1;
let hintsNumber = 1;
document.querySelector(".hint").innerHTML = `<span>${hintsNumber}</span> ${hintWord}`;

const redButton = document.querySelector(".red-button");
const guessButton = document.querySelector(".check");
const hintButton = document.querySelector(".hint");
const redCounter = document.querySelector('.red-counter');


//Words List
let wordToGuess = "";
const wordsArray = [
    "planet", "silver", "garden", "forest", "rocket", "butter", "stream", "yellow", "bridge", "castle",
    "magnet", "summer", "winter", "autumn", "spring", "hunter", "singer", "writer", "reader", "friend",
    "beauty", "animal", "pencil", "guitar", "violin", "orange", "little", "strong", "market", "doctor",
    "player", "pirate", "monkey", "kitten", "rabbit", "donkey", "letter", "window", "mirror", "flower",
    "candle", "beacon", "jungle", "branch", "ground", "island", "desert", "jacket", "tomato", "potato",
    "carrot", "pepper", "soccer", "tennis", "boxing", "rugged", "crater", "hockey", "basket", "travel",
    "flight", "ticket", "border", "driver", "sailor", "anchor", "engine", "button", "switch", "charge",
    "energy", "thrive", "bright", "cloudy", "stormy", "valley", "people", "family", "father", "mother",
    "sister", "cousin", "infant", "toddly", "school", "lesson", "mentor", "leader", "worker", "server",
    "client", "object", "method", "module", "system", "static", "random", "cipher", "coding", "script",
    "editor", "screen", "camera", "photos", "videos", "silent", "speech", "throat", "tongue", "cookie",
    "waffle", "cereal", "coffee", "juices", "smooth", "snacks", "breads", "sweets", "spices", "vision",
    "future", "memory", "record", "legend", "fairer", "magnet", "wizard", "dragon", "knight", "shield",
    "battle", "victor", "empire", "nation", "cities", "palace", "tunnel", "galaxy", "cosmos", "meteor",
    "comets", "nebula", "orbits", "spaces", "aliens", "zodiac", "saturn", "uranus", "jovian", "earthy",
    "impact", "effect", "origin", "fluent", "signal", "remark", "target", "fabric", "motion", "design",
    "fusion", "repair", "supply", "modern", "vector", "native", "socket", "layout", "marker", "puzzle",
    "branch", "rocket", "planet", "anchor", "school", "coding", "cipher", "random", "bright", "forest",
    "garden", "little", "silver", "strong", "static", "player", "animal", "reader", "hunter", "spring",
    "mirror"
];


let messageArea = document.querySelector(".message");
let redButtonMsgArea = document.querySelector('.dont-press span');
wordToGuess = wordsArray[Math.floor(Math.random() * wordsArray.length)].toLowerCase();

function updateButtonState() {
    let currentInputs = document.querySelectorAll(`.try-${currentTry} > div > input`);
    let allFilled = true;
    for (let input of currentInputs) {
        if (!input.value || input.value === "") {
            allFilled = false;
        }
        guessButton.disabled = !allFilled;
        guessButton.classList.toggle('disabled', !allFilled);
    }
}

function generateInputFields() {
    let inputContainer = document.querySelector(".input-fields");
    for (let i = 1; i <= numberOfTries; i++) {
        const tryDiv = document.createElement("div");
        tryDiv.classList.add(`try-${i}`);
        tryDiv.innerHTML = `<span>Try ${i}</span>`;

        if (i !== 1) tryDiv.classList.add('disabled-inputs');

        for (let j = 1; j <= wordLength; j++) {
            let inputField = document.createElement("input");
            let inputFieldBox = document.createElement("div");
            inputField.type = "text";
            inputField.autocomplete = "off";
            inputField.id = `try-${i}-char-${j}`;
            inputField.maxLength = 1;
            inputFieldBox.appendChild(inputField);
            inputFieldBox.classList.add("input-box");
            tryDiv.appendChild(inputFieldBox);
        }
        inputContainer.appendChild(tryDiv);
    }
    inputContainer.children[0].children[1].querySelector("input").focus();

    const disabledInputs = document.querySelectorAll('.disabled-inputs input');
    disabledInputs.forEach(input => input.disabled = true);

    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', function () {
            playSound("./src/newClick.MP3");

            if (this.value.length === 1) {
                let nextIndex = index + 1;

                // keep moving forward until we find an empty input
                while (
                    nextIndex < inputs.length &&
                    inputs[nextIndex].value !== ""
                ) {
                    nextIndex++;
                }

                // only move focus if we are still inside the same row
                const currentRow = Math.floor(index / wordLength);
                const nextRow = Math.floor(nextIndex / wordLength);

                if (nextIndex < inputs.length && currentRow === nextRow) {
                    inputs[nextIndex].focus();
                }
            }
        });

        input.addEventListener('keydown', function (event) {
            const currentIndex = Array.from(inputs).indexOf(event.target);
            if (event.key === "ArrowRight" && (currentIndex + 1) < inputs.length) {
                inputs[currentIndex + 1].focus();
            } else if (event.key === "ArrowLeft" && (currentIndex - 1) >= 0) {
                inputs[currentIndex - 1].focus();
            }
            if (event.key === "Backspace" && this.value.length === 0 && (currentIndex - 1) >= 0 && currentIndex % wordLength) {
                inputs[currentIndex - 1].focus();
                inputs[currentIndex - 1].value = "";
            } else if (event.key === "Backspace" && this.value) {
                inputs[currentIndex].value = "";
            }
        });
    });
};

guessButton.addEventListener('click', handleGuess);
hintButton.addEventListener('click', showHint);

function handleGuess() {
    const currentInputs = document.querySelectorAll(`.try-${currentTry} > div > input`);
    let playerWord = Array.from(document.querySelectorAll(`.try-${currentTry} > div > input`));
    let allTrue = playerWord.every((e, i) => e.value == wordToGuess[i]);
    for (let input of currentInputs) {
        if (!input.value || input.value.trim() === "") {
            messageArea.innerText = "Please fill all letters";
            const firstEmpty = Array.from(currentInputs).find(i => !i.value || i.value.trim() === "");
            firstEmpty && firstEmpty.focus();
            return;
        }
    }

    let correctLetter = false;
    let rightGuess = true;
    for (let i = 1; i <= wordLength; i++) {
        const inputField = document.querySelector(`#try-${currentTry}-char-${i}`);
        const letter = inputField.value.toLowerCase();
        const actualLetter = wordToGuess[i - 1];

        //game logic
        if (letter === actualLetter) {
            inputField.classList.add('in-place');
            if (currentTry === numberOfTries && !allTrue) {
            } else {
                celebrate(inputField);
                correctLetter = true;
            }
        } else if (wordToGuess.includes(letter)) {
            inputField.classList.add('not-in-place');
            rightGuess = false;
        } else {
            inputField.classList.add('wrong');
            rightGuess = false;
        }
    }

    if (rightGuess) {
        playSound("./src/youWon.mp3")
        messageArea.innerHTML = `You have guessed the word right <span>${wordToGuess}</span>`;
        let allTries = document.querySelectorAll('.input-fields > div > div > input');
        allTries.forEach((ele) => ele.disabled = true)

        guessButton.disabled = true;
        guessButton.classList.add('disabled');
        hintButton.classList.add('disabled');
        gameState = false;
        state = "won";
        return;
    } else {
        if (correctLetter && currentTry < numberOfTries) {
            playSound("./src/correctSound.MP3")

        }

        // disable the current try inputs
        let inputsInCurrentTry = document.querySelectorAll(`.try-${currentTry} > div > input`);
        inputsInCurrentTry.forEach((ele) => ele.disabled = true)

        // enable the next try inputs if there is any
        if (currentTry < numberOfTries) {
            currentTry++;
            const nextTryInputs = document.querySelectorAll(`.try-${currentTry} input`);
            nextTryInputs.forEach(input => input.disabled = false);
            document.querySelector(`.try-${currentTry}`).classList.remove('disabled-inputs');
            document.querySelector(`#try-${currentTry}-char-1`).focus();
            gameState = "Running"
        } else {
            playSound("./src/gameOver.mp3")
            messageArea.innerHTML = `<span class="game-over">Game Over</span> The word is ${wordToGuess}`;
            guessButton.disabled = true;
            guessButton.classList.add('disabled');
            hintButton.disabled = true;
            hintButton.classList.add('disabled');
            gameState = false;
            state = "lost";
        }

    }

};

function updateHint() {
    if (hintsNumber > 1 || !hintsNumber) {
        hintWord = "Hints";
    } else {
        hintWord = "Hint";
    }
    hintButton.disabled = false;
    hintButton.classList.remove('disabled');
    document.querySelector(".hint").innerHTML = `<span>${hintsNumber}</span> ${hintWord}`;
}

function showHint() {
    if (hintsNumber > 0) {
        let currentInputs = document.querySelectorAll(`.try-${currentTry} > div > input`);
        let emptyInputs = Array.from(currentInputs).filter(input => input.value === "");
        if (emptyInputs.length === 0) {
            messageArea.innerText = "All letters are already filled";
            return;
        } else {
            let randomIndex = Math.floor(Math.random() * emptyInputs.length);
            let chosenInput = emptyInputs[randomIndex];
            let inputPosition = Array.from(currentInputs).indexOf(chosenInput);
            chosenInput.value = wordToGuess[inputPosition];
            chosenInput.classList.add('in-place');
            chosenInput.disabled = true;
            hintsNumber--;
            updateHint();
            messageArea.innerText = "";
        }
    }
    if (hintsNumber === 0) {
        hintButton.disabled = true;
        hintButton.classList.add('disabled');
    }
}

function clickEffect(button) {
    button.addEventListener('mousedown', () => {
        playSound('./src/buttonClickDown.MP3');
        button.classList.add("clicked")
    });
    button.addEventListener('mouseup', () => {
        playSound('./src/buttonClickUp.MP3');
        button.classList.remove("clicked")
    });
}

// handling the red button
redButton.addEventListener('click', dontPress);
function dontPress() {
    let warning;
    if (dontPressCount === 0) {
        if (gameState) {
            hintsNumber++
            updateHint();
            dontPressCount++
            redButtonMsgArea.innerText = `You got one more hint`;
            warning = setTimeout(() => redButtonMsgArea.innerText = `Don't press this button again`, 2500)

        } else {
            redButtonMsgArea.innerText = `You have already ${state} the game`;
        }

    } else {
        clearTimeout(warning);
        redButtonMsgArea.innerText = `I told not to press the button!!!`;
        playSound("./src/countdown.MP3")
        let counter = 6;
        redButton.remove();
        redCounter.innerHTML = `${counter}`;
        let interval = setInterval(() => {
            counter--;
            redCounter.innerText = `${counter}`;
            if (counter === 0) {
                clearInterval(interval);
                redCounter.style.fontSize = '4px';
                redCounter.innerText = `⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡛⠉⢯⣒⢤⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡖⢡⡐⡄⢀⡀⠈⢙⢮⡳⡄⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠣⠀⠂⠀⠈⠀⠀⠈⣈⠷⢉⠃⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡰⠋⡐⡀⠀⠀⠀⠀⠀⣐⠼⢁⡞⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠣⢁⠐⠈⠆⣀⡈⠀⠲⢃⢠⠎⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡅⠂⠄⠂⠈⠐⢠⠓⢢⠱⣨⠃⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⠤⣤⢤⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠗⠀⠀⠀⠀⠂⠈⠀⠈⠄⣼⠁⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣾⡟⣬⠛⣭⢫⡍⣶⢳⣦⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠂⠀⠀⠀⠀⢢⠀⠀⠀⠀⣾⠃⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⡓⠤⠁⠎⠱⡈⡜⢥⢻⣹⢻⠷⡶⣶⡶⢶⣶⣦⣤⡀⣴⠟⠀⠀⠀⠀⠀⠀⠀⠐⠠⢩⠏⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣼⡧⠙⢢⠁⡈⠀⠀⠈⠀⠁⠋⠄⢊⠑⠄⠘⡀⢎⡝⣿⡟⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⠏⢀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣾⡿⢤⡁⢂⠡⠀⠀⠀⠀⠀⠀⡈⠁⢁⠊⠴⠓⠁⡜⣾⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⢏⠄⠁⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣴⣿⢟⡽⣂⠖⡄⢂⢀⣴⠼⡞⡿⣛⡝⠛⠛⠾⣦⣤⣾⣽⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠂⡟⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢠⣾⣏⠳⢎⣖⠹⣎⡜⣧⡿⠡⢎⠱⠑⠨⠈⠁⠀⠀⠈⠉⣻⡏⠐⡀⠀⠀⠀⠀⠀⠀⠀⠀⢐⣺⢁⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⡗⡮⣙⠦⡸⡙⣼⡿⢋⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡟⠠⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡏⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣇⡳⡵⣊⠕⣩⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡾⠁⠁⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⣲⠁⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣿⣟⣡⢦⣽⡟⠐⠁⠀⢀⠠⠀⠀⠀⠀⠀⠀⠀⠀⢠⡇⠘⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⢸⠃⣀⣁⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⡿⠏⡉⣤⣿⠡⢈⠤⢁⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⣞⢡⠀⢀⠀⠀⠀⠀⠀⠀⠀⣴⢋⣿⠾⠃⡒⠘⠳⣶⣄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢠⣞⣵⠶⣿⣿⢁⡞⠤⠒⠠⠁⠂⠀⠀⠀⠀⠀⠀⠀⢰⡏⢆⠂⠄⠀⠀⠀⠀⠀⠀⠩⢄⣿⠋⠁⠀⡀⠁⠁⠡⡘⣿⠀⠀⠀⠀⠀⠀
⠀⣰⣿⡟⢡⣾⢿⣌⠳⡘⠤⠉⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⡾⡑⠌⡐⠈⠄⠀⠂⢁⠐⢌⢂⣿⢃⠉⠀⠀⡠⢈⢠⡱⢆⢽⠁⠀⠀⠀⠀⠀
⢀⣿⡟⢡⣿⡟⢮⢌⢣⠐⠄⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢏⠱⠈⠄⠡⠀⠌⡐⢀⠋⢤⣫⠇⠂⠀⠀⠀⣡⡂⠥⠱⣈⡟⠀⠀⠀⠀⠀⠀
⢸⣿⣇⣳⡯⡝⢮⡘⢄⠃⠌⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⠏⡌⠢⠁⠌⠠⢁⠂⠔⡈⠜⣲⠏⠀⠀⠀⠀⠠⠁⢀⢀⠂⣵⡷⠤⢤⡤⣀⠀⠀
⢸⣿⣟⡶⡹⣍⠦⡑⡈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠤⣹⠣⡘⠠⠁⠌⠀⡁⢂⠌⡠⢉⣼⠇⠀⠀⠀⠀⠀⠂⢉⠀⡠⠘⣴⠏⠈⠀⠈⠺⢵⡆
⢸⣿⣿⢶⡹⢆⠳⠄⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⠠⠁⠄⡁⠌⠀⠐⠄⠊⠤⡁⢧⡾⠁⠀⠀⠀⠀⠀⠀⢌⠐⠠⢹⡏⠀⠀⡀⠄⡑⢠⡇
⠸⣿⣿⣏⡳⢍⡚⢀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⢀⠂⣁⠂⠀⠀⠀⠌⡐⢉⠐⡌⢺⡇⠀⠀⠀⠀⠀⠀⠀⠘⠊⢰⡟⠀⠀⠀⠀⢂⠐⢯⡜
⠀⢻⣿⣯⣗⡪⢐⠂⠄⡀⠀⠀⢀⠀⠄⡀⠠⠐⠠⡈⠄⠌⡐⠀⠐⠠⠈⠄⢂⠜⣹⠄⠀⠐⠀⠀⣀⠁⢂⠐⢢⡿⠀⠀⠀⠀⡀⠌⡈⠵⡇
⠀⢸⣿⣿⣿⣷⡠⢌⡐⢀⠁⠄⠂⠌⡀⠀⠀⠄⠡⢐⠨⠐⠀⡐⠈⠄⠡⢈⠆⡹⢜⡀⠂⠀⠀⡐⠠⠈⢃⠀⣾⠀⠀⠀⠀⠀⠠⢀⠓⡸⡇
⠀⠈⣿⣿⣿⣿⣿⣶⣌⣦⡘⡬⣑⢢⠐⡀⠂⠌⡠⠁⠂⠁⠄⠄⠁⠌⡐⢂⠬⡑⢆⠀⠠⢀⠂⠡⢀⠂⠌⣸⠧⠀⠀⠀⠠⢀⠁⢢⠘⣼⠁
⠀⠀⢿⣿⣿⣿⣿⣿⣿⡼⣧⢧⣣⠜⣄⠣⡘⠤⡠⠀⠀⠘⡀⠀⠄⣀⢃⡘⢤⠛⠄⠘⠠⢄⠃⠤⠀⠄⡀⣿⠀⠀⠀⠠⠀⠀⡘⠄⣻⢻⠀
⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣯⣿⣳⢿⣤⡓⡜⡐⠀⠀⡄⢃⠄⠠⡀⢄⠢⢜⢢⡉⡐⢈⠐⡈⡘⠤⢉⡐⢡⠏⡐⠠⠁⠂⡀⠡⢐⢨⢴⠏⠀
⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣷⣯⣟⣿⣽⣳⣍⢶⣱⣌⠂⠌⢁⠰⣈⠲⣍⠢⡐⠁⠀⠀⠐⠀⢀⠂⢄⠣⡘⠠⢁⠂⡐⠠⢁⢢⢎⡿⠀⠀
⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣾⣿⣶⣮⣶⣼⢳⣎⡱⢌⠢⡁⠄⣁⠀⠂⢌⠂⢆⠁⠂⠄⡂⠥⢑⡈⢲⡾⠃⠀⠀
⠀⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣿⣾⣵⣯⣶⣝⡲⢌⡘⢡⠂⢍⠠⠌⡐⠠⠘⡄⢣⢼⡿⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠉⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣽⣶⣭⢦⣉⠦⡘⢄⠢⣑⢣⡜⣱⠞⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣯⣷⣻⢯⣟⣿⣿⣷⣟⣾⣵⣮⣵⣺⣦⠿⠃⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠿⠿⠿⠿⠿⠿⠿⠿⠛⠋⠙⠛⠛⠛⠻⠿⠿⠿⣿⣿⣿⣿⡿⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀`
                redButtonMsgArea.innerText = `Go back to the game`;
            }
        }, 1000);
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        guessButton.classList.add("clicked");
        guessButton.click();
        playSound('./src/buttonClickDown.MP3');
        setTimeout(() => {
            guessButton.classList.remove("clicked");
            playSound('./src/buttonClickUp.MP3');

        }, 150);
    }
});

clickEffect(guessButton);
clickEffect(hintButton);
clickEffect(redButton);

window.onload = function () {
    generateInputFields();
};