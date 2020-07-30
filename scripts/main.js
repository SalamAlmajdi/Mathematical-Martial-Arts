const elements = {
    play : { //all the elements on the inital screen
        screen: document.getElementById("play-screen"),
        playButton: document.getElementById("play-playButton"),
        instructionButton: document.getElementById("play-instructionButton"),
        highscoreButton: document.getElementById("play-highscoreButton"),
    },
    login: {//all the elements on the login screen
        screen: document.getElementById("login-screen"),
        loginButton: document.getElementById("login-loginButton"),
        nameInput: document.getElementById("login-nameInput"),
        backButton: document.getElementById("login-backButton"),
    },
    game: {//all the elements on the maingame screen
        screen: document.getElementById("game-screen"),
        playerName: document.getElementById("game-playerName"),
        playerHealth: document.getElementById("game-playerHealth"),
        enemyName: document.getElementById("game-enemyName"),
        enemyHealth: document.getElementById("game-enemyHealth"),
        button1: document.getElementById("game-button1"),
        button2: document.getElementById("game-button2"),
        button3: document.getElementById("game-button3"),
        button4: document.getElementById("game-button4"),
        canvas: document.getElementById("game-canvas"), //the canvas is where the animation happens
        time: document.getElementById("game-time"),
        questionText: document.getElementById("game-questionText"),
        coins: document.getElementById("game-coins")
    },
    instructions: {//all the elements on the instruction screen
        screen: document.getElementById("instructions-screen"),
        backButton: document.getElementById("instructions-backButton")
    },
    highscores: {//all the elements on the highscore screen
        screen: document.getElementById("highscores-screen"),
        restartButton: document.getElementById("highscores-restartButton"),
        scores: document.getElementById("highscores-scores"),
    }
} // this list of elements is sort of like a simple to understand dictionary of all elements that appear on the screen

const screens = {
    playScreen: elements.play.screen,
    loginScreen: elements.login.screen, 
    gameScreen: elements.game.screen, 
    instructionsScreen: elements.instructions.screen, 
    highscoresScreen: elements.highscores.screen
}; // a list of screens within the game

class Question { // the question class which is used as a cookie cutter for the questions that appear in game
    constructor(questionText, answer, possibleAnswers, correctAnswerIndex, maxTime) {
      this.questionText = questionText;
      this.answer = answer;
      this.possibleAnswers = possibleAnswers;
      this.correctAnswerIndex = correctAnswerIndex;
      this.maxTime = maxTime;
    }
}
// initialising some variables
let difficulty = 1;
var tid;
let timeLeft;
let playerName;
let playerHealth;
let enemyName;
let damageToPlayer;
let enemyHealth;
let playerPos;
let enemyPos;
let hasMoved = false;
var ctx = elements.game.canvas.getContext("2d"); //context is used for drawing on the canvas
var shopImage = new Image();
var playerImage = new Image();
var enemyImage = new Image();
const enemyImagePath = 'assets/images/enemy';
let enemyImageChooser;
var gameMusic = document.createElement("audio");
let timeUpgradeLevel = 1;
let strengthLevel = 1;
let enemyWeakness = 1;
let coin = 0;
let isShop = false;
let played = false;

// this is when the site starts up, it plays music.
// this doesnt work in chrome, they decided to block this feature
window.onload = function() {
    gameMusic.src = "assets/sounds/startTheme.mp3"
    gameMusic.loop = true;
    gameMusic.play();
}

// setting up the buttons within the game
elements.play.playButton.addEventListener("click", function(){
    showLogin();
    gameMusic.play();
});
//
elements.play.instructionButton.addEventListener("click", function(){
    showInstructions();
    gameMusic.play();
});

elements.play.highscoreButton.addEventListener("click", function(){
    if (localStorage.getItem("highScoresList") === null) {
        alert("Hark! Ye art the first man to set foot in this land, there stand no records before us. \nShalt thou change this by thine hand?\nPress Play to get started.")
    } else {
        showHighscores(played);
    }
});

elements.login.loginButton.addEventListener("click", function(){
    if (elements.login.nameInput.value === "") {
        alert("Enter thine name, young warrior!");
    } else {
        if (elements.login.nameInput.value.includes(",") || elements.login.nameInput.value.includes(".")) {
            alert("Thine name cannot contain '.' or ','");
        } else {
            showGame();
            playerName = elements.login.nameInput.value;
        }  
    }  
});

elements.login.backButton.addEventListener("click", function(){
    showPlay();
});

elements.instructions.backButton.addEventListener("click", function(){
    showPlay();
});

elements.highscores.restartButton.addEventListener("click", function(){
    if (played) {
        window.location.reload();
    } else {
        showPlay();
    }
});

// the following functions load and remove the different screens within the game e.g instructions screen
function hideScreens() {
    Object.values(screens).forEach(screen => {
        screen.style.display = "none";
    });
}

function showScreen(screen) {
    hideScreens();
    screen.style.display = "block";
}

function showPlay() {
    showScreen(elements.play.screen);
}

function showLogin() {
    showScreen(elements.login.screen);
}

function showInstructions() {
    showScreen(elements.instructions.screen);
}

// draws the background of the battle which is grass and a blue sky
function drawBackground() { //drawing 2 rectangles, blue and green
    ctx.fillStyle = "deepskyblue";
    ctx.beginPath();
    ctx.rect(0, 0, elements.game.canvas.width, elements.game.canvas.height * (3 / 8));
    ctx.fill();
    ctx.fillStyle = "#5b8930";
    ctx.beginPath();
    ctx.rect(0, elements.game.canvas.height * (3 / 8), elements.game.canvas.width, elements.game.canvas.height * (5 / 8));
    ctx.fill();
}

function showGame() { //this function is responsible for displaying the main game screen
    gameMusic.src = "assets/sounds/gameTheme.mp3";
    gameMusic.play();
    enemyName = randomNameGen();
    playerHealth = 100;
    enemyHealth = 100;
    elements.game.playerName.innerText = "Thine Name: " + playerName; //updating on screen elements
    elements.game.playerHealth.innerText = "Thine Vitality: " + playerHealth;
    elements.game.enemyName.innerText = "Name of thine adversary: " + enemyName;
    elements.game.enemyHealth.innerText = "Vitality of thine adversary: " + enemyHealth;
    elements.game.coins.innerText = "Coin in thine coffers: " + coin;
    elements.game.canvas.width = window.screen.width / 4;
    elements.game.canvas.height = window.screen.height / 4;
    enemyPos = elements.game.canvas.width * (5 / 8);
    playerPos = elements.game.canvas.width / 8;
    drawBackground();
    enemyImageChooser = Math.floor(Math.random() * 6) + 1;
    playerImage.src = 'assets/images/player_1.png';
    enemyImage.src = enemyImagePath + enemyImageChooser + ".png";
    shopImage.src = 'assets/images/shop.png';
    playerImage.onload = () => {
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2) //initialising and placing images on canvas
    }
    enemyImage.onload = () => {
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2)
    }
    showScreen(elements.game.screen);
    newQuestion(); //creating the first question
}

// handling the answer buttons
function btn1Click() {
    if (isShop) {
        purchase(0);
    } else {
        handleInput(x, 0, false);
    }
}

function btn2Click() {
    if (isShop) {
        purchase(1);
    } else {
        handleInput(x, 1, false);
    }
}

function btn3Click() {
    if (isShop) {
        purchase(2);
    } else {
        handleInput(x, 2, false);
    }
}

function btn4Click() {
    if (isShop) {
        purchase(3);
    } else {
        handleInput(x, 3, false);
    }
}

// this function creates a new randomised question
function newQuestion() {
    chooseQuestion(difficulty);
    timeLeft = x.maxTime;
    tid = setTimeout(timer, 1000);
    setTimeout(updateUI, 500);
}

// this function displays the shop
function shop() {
    isShop = true;
    elements.game.playerName.innerText = "";
    elements.game.playerHealth.innerText = ""; //updating on screen elements
    elements.game.enemyName.innerText = "";
    elements.game.enemyHealth.innerText = "";
    elements.game.time.innerText = "";
    elements.game.coins.innerText = "Thine coin: " + coin;
    elements.game.button1.innerText = "Accelerate thine mind! Cost: " + timeUpgradeLevel; 
    elements.game.button2.innerText = "Increase thine strength! cost: " + strengthLevel;
    elements.game.button3.innerText = "Hinder thine enemies! cost: " + enemyWeakness;
    elements.game.button4.innerText = "Exit Shop";
    elements.game.questionText.innerText = "Welcome to the market, spend thine coin";
    ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
    drawBackground();
    ctx.drawImage(shopImage, (elements.game.canvas.width / 2) - (elements.game.canvas.height / 2), 0, elements.game.canvas.height, elements.game.canvas.height);
    elements.game.button1.disabled = false;
    elements.game.button2.disabled = false;
    elements.game.button3.disabled = false;
    elements.game.button4.disabled = false;
}

// this function handles the inputs to the shop
function purchase(choice) {
    if (choice === 0) {
        if (timeUpgradeLevel === 5) {
            alert("Hark! It is not possible for me to push thine mind beyond this.");
        } else {
            if (coin >= timeUpgradeLevel) {
                coin -= timeUpgradeLevel;
                timeUpgradeLevel += 1;
                elements.game.coins.innerText = coin;
                elements.game.button1.innerText = "Praise thine business";
                elements.game.button1.disabled = true; 
            } else {
                alert("Thine coin is too measly to acquire such a skill");
            }
        }
    } else if (choice === 1) {
        if (strengthLevel === 5) {
            alert("Hark! It is not possible for I to strengthen you beyond this.")
        } else {
            if (coin >= strengthLevel) {
                coin -= strengthLevel;
                strengthLevel += 1;
                elements.game.coins.innerText = coin;
                elements.game.button2.innerText = "Praise thine business";
                elements.game.button2.disabled = true; 
            } else {
                alert("Thine coin is too measly to acquire such a skill");
            }
        }
    } else if (choice === 2) {
        if (enemyWeakness === 5) {
            alert("Hark! The power of thine foes is no longer for me to decrease.");
        } else {
            if (coin >= enemyWeakness) {
                coin -= enemyWeakness;
                enemyWeakness += 1;
                elements.game.coins.innerText = coin;
                elements.game.button3.innerText = "Praise thine business";
                elements.game.button3.disabled = true; 
            } else {
                alert("Thine coin is too measly to acquire such a skill");
            }
        }   
    } else if (choice === 3) { // this runs when the exit button is pressed, essentially prepares for the next enemy
        isShop = false;
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        drawBackground();
        playerPos = elements.game.canvas.width / 8;
        enemyPos = elements.game.canvas.width * (5 / 8);
        enemyHealth = 100;
        enemyName = randomNameGen();
        enemyImageChooser = Math.floor(Math.random() * 7) + 1; //this section handles the post shop updates, this occurs when the player presses the exit shop button
        enemyImage.src = enemyImagePath + enemyImageChooser + ".png";
        if (strengthLevel > 1) {
            playerImage.src = 'assets/images/player_0.png';
        }
        difficulty += 1;
        playerHealth = playerHealth + Math.floor(playerHealth / 3);
        if (playerHealth > 100) {
            playerHealth = 100;
        }
        newQuestion();
    }
}

// decided which question is suitable for the current difficulty
// note that x is the question, as x represents the unknown
function chooseQuestion(difficulty) {
    if (difficulty === 1) {
        x = createAdditionQuestion(difficulty);
    } else if (difficulty === 2) {
        var rand = Math.floor(Math.random() * 2 + 1); //rand decided whether it should be an addition, subtraction or multiplication question that occurs next
        if (rand === 1) {
            x = createSubtractionQuestion(difficulty);
        } else {
            x = createAdditionQuestion(difficulty);
        }
    } else {
        var rand = Math.floor(Math.random() * 3 + 1);
        if (rand === 1) {
            x = createSubtractionQuestion(difficulty);
        } else if (rand === 2) {
            x = createAdditionQuestion(difficulty);
        } else {
            x = createMultiplicationQuestion(difficulty);
        }
    }
}

// these functions build the questions
function createAdditionQuestion(difficulty) {
    const maxNum = (10 ** difficulty);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " + " + String(num2);
    const answer = num1 + num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * (maxNum * 2));
        if (possibleAnswer !== answer && !possibleAnswers.includes(possibleAnswer)) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    let maxtime = (3 + (difficulty - 1) * 2);
    maxtime += (maxtime / 2) * (timeUpgradeLevel - 1);
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime); //returns an instance of the Question class with the randomly generated elements above
}

function createSubtractionQuestion(difficulty) {
    const maxNum = 10 ** (difficulty - 1);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " - " + String(num2);
    const answer = num1 - num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * ((maxNum + 1) - (-maxNum)) - maxNum);
        if (possibleAnswer != answer && possibleAnswers.includes(possibleAnswer) === false) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    let maxtime = 5 + (difficulty - 1) * 2;
    maxtime += (maxtime / 2) * (timeUpgradeLevel - 1);
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function createMultiplicationQuestion(difficulty) {
    const maxNum = 10 ** (difficulty - 2);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " X " + String(num2);
    const answer = num1 * num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * (maxNum ** 2));
        if (possibleAnswer != answer && possibleAnswers.includes(possibleAnswer) === false) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    let maxtime = 5 + (difficulty - 1) * 2;
    maxtime += (maxtime / 2) * (timeUpgradeLevel - 1);
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

// the countdown timer for each question.
// it calls the handle input function once time has run out
function timer() {
    if (timeLeft % 1 == 0) {
        elements.game.time.innerText = "Time remaining for thee: " + timeLeft;
    }
    if (timeLeft === 0) {
        handleInput(5, x, true);
    } else {
        timeLeft -= 0.5;
        tid = setTimeout(timer, 500);
    }
}
function abortTimer() {  
    clearTimeout(tid);
}

// this updates all the elements on the screen with the new data
function updateUI() {
    elements.game.playerName.innerText = "Thine Name: " + playerName;
    elements.game.playerHealth.innerText = "Thine Vitality: " + playerHealth;
    elements.game.enemyName.innerText = "Name of thine adversary: " + enemyName;
    elements.game.enemyHealth.innerText = "Vitality of thine adversary: " + enemyHealth;
    elements.game.coins.innerText = "Coin in thine coffers: " + coin;
    ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
    drawBackground();
    ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
    elements.game.button1.innerText = x.possibleAnswers[0];
    elements.game.button2.innerText = x.possibleAnswers[1];
    elements.game.button3.innerText = x.possibleAnswers[2];
    elements.game.button4.innerText = x.possibleAnswers[3];
    elements.game.questionText.innerText = x.questionText;
    elements.game.button1.disabled = false;
    elements.game.button2.disabled = false;
    elements.game.button3.disabled = false;
    elements.game.button4.disabled = false;
}

// this function takes in the inputs from the game and decided the amount of damage dealt to the player and enemies, it also decides which animations should occur
function handleInput(question, num, timeOut) {
    abortTimer();
    elements.game.button1.disabled = true;
    elements.game.button2.disabled = true;
    elements.game.button3.disabled = true;
    elements.game.button4.disabled = true;
    damageToPlayer = Math.floor(Math.random() * 21) + 5;
    damageToPlayer = damageToPlayer + (damageToPlayer * (difficulty / 3));
    damageToPlayer = damageToPlayer - Math.floor((damageToPlayer) * ((enemyWeakness - 1) / 6));
    if (! timeOut) {
        if (question.possibleAnswers[num] === question.answer) {
            playerPos = elements.game.canvas.width / 8;
            movePlayer();
            let damageToEnemy = Math.floor((20 - (20 / (timeLeft + 1.5))));
            damageToEnemy += (damageToEnemy / 2) * (strengthLevel - 1);
            enemyHealth -= Math.floor(damageToEnemy);
            damageToPlayer = (damageToPlayer) / 3;
        } else {
            moveEnemy();
        }
    } else {
        moveEnemy();
    }
    
}

// this produces really bad randomly generated names for the enemies
function randomNameGen() {
    const vowels = ["a", "e", "i", "o", "u"];
    const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"];
    let name = "";
    const nameLength = Math.floor(Math.random() * 15) + 1;
    let i = 0;
    while (i < nameLength) {
        const vowelNum =  Math.floor(Math.random() * vowels.length);
        const consonantNum =  Math.floor(Math.random() * consonants.length);
        name = name + consonants[consonantNum] + vowels[vowelNum];
        i += 1;
    }
    return name;
}

// this function moves the player accross the screen and back
function movePlayer() {
    if (playerPos >= elements.game.canvas.width * (5 / 8)) { // checking if the image has reached its bounds
        hasMoved = true;
    }
    if (hasMoved) {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        playerPos = playerPos - 8;
        drawBackground();
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    } else {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        playerPos = playerPos + 8;
        drawBackground();
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    }
    if (playerPos < elements.game.canvas.width / 8) {
        hasMoved = false;
        enemyPos = elements.game.canvas.width * (5 / 8);
        if (enemyHealth <= 0) {
            coin += 1;
            alert("Huzzah! Thou hast defeated the fearsome " + enemyName + ", gather thine senses, for another enemy approaches! \nThou vitality hast been partially restored.");
            if ((coin >= enemyWeakness) || (coin >= strengthLevel) || (coin >= timeUpgradeLevel)) {
                shop(); // running the shop once the player has enough coins
            } else {
                purchase(3); //or just moving on
            }
        } else { 
            moveEnemy();
        }
    } else {
        requestAnimationFrame(movePlayer);
    }
    
}

// same as before but it is the enemy instead
function moveEnemy() {
    if (enemyPos <= elements.game.canvas.width * (1 / 4)) {
        hasMoved = true;
    }
    if (hasMoved) {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        enemyPos = enemyPos + 8;
        drawBackground();
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
    } else {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        enemyPos = enemyPos - 8;
        drawBackground();
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, playerImage.width / 2, playerImage.height / 2);
    }
    if (enemyPos > elements.game.canvas.width * (5 / 8)) {
        hasMoved = false;
        playerHealth -= Math.floor(damageToPlayer);
        if (playerHealth > 0) {
            newQuestion();
        } else {
            played = true;
            playerHealth = 0;
            updateUI();
            gameMusic.pause();
            gameMusic.src = "assets/sounds/deathTheme.mp3"
            gameMusic.load();
            showHighscores(played);
        }
    } else {
        requestAnimationFrame(moveEnemy);
    }
    
}

// this reads the highscores from the browsers local storage (essentialy a highscores file saved within the browser)
// it is read as a string and is parsed into an array
// once the array is sorted using the sortHighscores function below, it is displayed
function showHighscores(played) {
    let scores;
    if ((localStorage.getItem("highScoresList") === null) && (played)) {
        localStorage.setItem("highScoresList", playerName + "." + difficulty + ","); //adding a new record into the highscores
        scores = localStorage.getItem("highScoresList");
    } else {
        scores = localStorage.getItem("highScoresList");
        if (played) {
            scores =  scores + playerName + "." + difficulty + ",";//adding a new record into the highscores
            localStorage.setItem("highScoresList", scores);
        }
    }
    scores = scores.split(","); //splitting the string into an array
    const sortedScores = sortHighscores(scores); // sorting the array
    elements.highscores.scores.innerText = sortedScores.toString().replace(/,/g, " Foe(s) \n").replace(/[.]/g, " Hast Encountered ") + " Foe(s)"; //displaying the scores
    gameMusic.play();
    showScreen(elements.highscores.screen);
}

// this is a hand written selection sort
function sortHighscores(highscores) {
    let len = highscores.length; //get the length of the array
    for (let i = 0; i < len; i++) {
        let max = i; //set i as the maximum
        for (let j = i + 1; j < len; j++) {
            if (Number(highscores[max].split(".")[1]) < Number(highscores[j].split(".")[1])) { //compare max and J and set J to max if necesary
                max = j;
            }
        }
        if (max !== i) { //switch elements if max is not I
            let tmp = highscores[i];
            highscores[i] = highscores[max]; 
            highscores[max] = tmp;
        }
    }
    if (len > 10) {
        highscores.length = 10; // setting a cutoff for the highscores, only displaying the top 10 
    }
    return highscores;
}

// these few lines get everything going
function main() {
    showPlay();
}
main(); //this is the first function to be called, it initialises the first screen