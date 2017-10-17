$(()=> {

    let colors = [];
    let gameSquares = [];
    let firstSquare = null;
    let turnsCount = 0;
    let winMessageDiv = $("#win-message");
    let numberOfRandomColorPairs = 0;

    $("#reset-button").click(()=>{
        timer.stop();
        turnsCount = 0;
        setTurns();
        clearGame();
    });

    $('#difficulty').change(()=>{
        setupDifficulty();
        setupGame();
    });

    function multiplyNode(count, deep) {
        $("#game").empty();
        let gameSquareDiv = document.createElement('div');
        gameSquareDiv.setAttribute('class', 'game-square');
        let innerDiv = document.createElement('div');
        innerDiv.appendChild(document.createElement('div'));
        innerDiv.appendChild(document.createElement('div'));
        gameSquareDiv.appendChild(innerDiv);
        $("#game").append(gameSquareDiv);

        let node = document.querySelector('.game-square');
        for (let i = 0, copy; i < count - 1; i++) {
            copy = node.cloneNode(deep);
            node.parentNode.insertBefore(copy, node);
        }
    }


    for (let i = 0; i < 18; i++) {
        colors.push('square-' + i);
    }

    function GameSquare(el, color) {
        this.el = el;
        this.isOpen = false;
        this.isLocked = false;
        this.el.addEventListener("click", this, false);
        this.setColor(color);
    }

    GameSquare.prototype.handleEvent = function (e) {
        switch (e.type) {
            case "click":
                if (this.isOpen || this.isLocked) {
                    return;
                }
                this.isOpen = true;
                this.el.classList.add('flip');
                checkGame(this);

        }
    };

    GameSquare.prototype.reset = function () {
        this.isOpen = false;
        this.isLocked = false;
        this.el.classList.remove('flip');
    };

    GameSquare.prototype.lock = function () {
        this.isLocked = true;
        this.isOpen = true;
    };

    GameSquare.prototype.setColor = function (color) {
        this.el.children[0].children[1].classList.remove(this.color);
        this.color = color;
        this.el.children[0].children[1].classList.add(color);
    };

    function setupDifficulty() {
        let difficulty = $('#difficulty').find(":selected").text();

        if(difficulty === 'Normal'){
            numberOfRandomColorPairs = 8;
            multiplyNode(16, true);
            $("#game").css("width", "400px");
            $("#game").css("height", "400px");

        } else {
            numberOfRandomColorPairs = 18;
            multiplyNode(36, true);
            $("#game").css("width", "600px");
            $("#game").css("height", "600px");
        }

        $("#game").css("display", "flex");
        $("#controls").css("display", "block");

        timer.start();
    }

    function setupGame() {
        let array = document.getElementsByClassName("game-square");
        let randomColors = getSomeColors();             // Get an array of 8 random color pairs
        for (let i = 0; i < array.length; i++) {
            let index = random(randomColors.length);      // Get a random index
            let color = randomColors.splice(index, 1)[0]; // Get the color at that index
            // Use that color to initialize the GameSquare
            gameSquares.push(new GameSquare(array[i], color));
        }
    }

    function random(n) {
        return Math.floor(Math.random() * n);
    }

    function getSomeColors() {
        let colorsCopy = colors.slice();
        let randomColors = [];
        for (let i = 0; i < numberOfRandomColorPairs; i++) {
            let index = random(colorsCopy.length);
            randomColors.push(colorsCopy.splice(index, 1)[0]);
        }
        return randomColors.concat(randomColors.slice());
    }

    function checkGame(gameSquare) {
        turnsCount++;
        setTurns();
        if (firstSquare === null) {
            firstSquare = gameSquare;
            return
        }

        if (firstSquare.color === gameSquare.color) {
            firstSquare.lock();
            gameSquare.lock();
            if(checkIfGameEnd()){
                winMessageDiv.css('display', 'block');
                timer.stop();
            }
        } else {
            let a = firstSquare;
            let b = gameSquare;
            setTimeout(function () {
                a.reset();
                b.reset();
                firstSquare = null;
            }, 400);
        }

        firstSquare = null;
    }

    function setTurns() {
        $("#turns").text("Turns: " + turnsCount);
    }

    function checkIfGameEnd() {
        let isEnd = false;

        for(let i = 0; i < gameSquares.length; i++) {
            let square = gameSquares[i];
            if (square.isLocked === true && square.isOpen === true) {
                isEnd = true;
            }else if (square.isLocked === false || square.isOpen === false){
                isEnd = false;
                return isEnd;
            }
        }

        return isEnd;
    }

    function randomizeColors() {
        let randomColors = getSomeColors();
        gameSquares.forEach(function (gameSquare) {
            let color = randomColors.splice(random(randomColors.length), 1)[0];
            gameSquare.setColor(color);
        });
    }

    function clearGame() {
        gameSquares.forEach(function (gameSquare) {
            gameSquare.reset();
        });
        timer.start();
        setTimeout(function () {
            randomizeColors();
        }, 500);
        winMessageDiv.css('display', 'none');
    }

});