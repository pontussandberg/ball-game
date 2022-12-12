let game_canvas = document.getElementById('canvas1');
let start_btn = document.getElementById('start');
let reset_btn = document.getElementById('reset');
let getSquare_btn = document.getElementById('square');
let heading = document.getElementById('heading');
let endMsg_div = document.getElementById('end-message');
let menu_div = document.getElementById('menu');
let mapNr_div = document.getElementById('map-nr');
let mapNext_div = document.getElementById('change-map');

game_canvas.height = 600;
game_canvas.width = 800;


class Avatar {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.xVel = 0;
        this.yVel = 0;

    }
    draw() {
        ctx.strokeStyle = '#00F108';
        ctx.fillStyle = '#00F108';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.fill();
    }
}

class Square {
    constructor(startX, startY, width, height, color, xVel, yVel) {
        this.x = startX;
        this.y = startY;
        this.width = width;
        this.height = height;
        this.xVel = xVel || 0;
        this.yVel = yVel || 0;
        this.color = color;

    }
    draw() {
        if (!this.color) {
            ctx.fillStyle = 'red';
        }
        else {
            ctx.fillStyle = this.color;
        }
        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}








class Game {
    constructor() {
        this.gameRAF;
        this.isRunning = false;
        this.avatar;
        this.gameKeys = [];
        this.avatarVel = 0.5;
        this.avatarMaxVel = 4;
        this.wallThickness = 20;
        this.squares = [];
        this.walls = [];
        this.movingSquares = [];
        this.map = 1;
    }

    start() {


        if (!this.isRunning) {
            this.reset();
            endMsg_div.innerHTML = '';

            this.isRunning = true;

            if (this.map === 1) {
                this.buildMap1();
            }
            if (this.map === 2) {
                this.buildMap2();
            }
            if (this.map === 3) {
                this.buildMap3();
            }

            mapNr_div.innerHTML = `Level: ${this.map} / 3`;
            start_btn.style.visibility = "visible";

            this.gameLoop();
        }

    }

    startInterval() {
        if (!isRunning) {
            this.gameInterval = setInterval(() => {
                requestAnimationFrame(this.gameLoop)
            }, 150);
        }
    }

    gameLoop = () => {
        ctx.clearRect(0, 0, game_canvas.width, game_canvas.height)

        this.drawMap();

        this.whatKey();
        this.breaker();
        this.updateAvatarPos();

        this.collisionWalls();
        this.collisionSquare();
        this.collisionCanvas();

        this.gameRAF = requestAnimationFrame(this.gameLoop);
    }

    updateAvatarPos() {
        if (this.avatar) {
            this.avatar.x += this.avatar.xVel;
            this.avatar.y += this.avatar.yVel;
            this.avatar.draw();
        }
    }

    whatKey() {
        if ((this.gameKeys[38] || this.gameKeys[87]) && this.avatar.yVel > - this.avatarMaxVel) {
            this.avatar.yVel -= this.avatarVel;
        }
        if ((this.gameKeys[40] || this.gameKeys[83]) && this.avatar.yVel < this.avatarMaxVel) {
            this.avatar.yVel += this.avatarVel;
        }
        if ((this.gameKeys[39] || this.gameKeys[68]) && this.avatar.xVel < this.avatarMaxVel) {
            this.avatar.xVel += this.avatarVel;
        }
        if ((this.gameKeys[37] || this.gameKeys[65]) && this.avatar.xVel > - this.avatarMaxVel) {
            this.avatar.xVel -= this.avatarVel;
        }
    }

    breaker() {
        if (this.avatar) {
            if (this.avatar.yVel > 0) {
                this.avatar.yVel -= this.avatar.yVel / 10;
            }
            if (this.avatar.yVel < 0) {
                this.avatar.yVel += -this.avatar.yVel / 10;
            }

            if (this.avatar.xVel < 0) {
                this.avatar.xVel += -this.avatar.xVel / 10;
            }
            if (this.avatar.xVel > 0) {
                this.avatar.xVel -= this.avatar.xVel / 10;
            }
        }
    }

    collisionCanvas() {
        if (this.avatar) {
            if ((this.avatar.y - this.avatar.radius) <= 1) {
                this.avatar.y = this.avatar.radius + 1;
            }
            if ((this.avatar.y + this.avatar.radius) >= game_canvas.height - 1) {
                this.avatar.y = game_canvas.height - this.avatar.radius - 1;
            }

            if ((this.avatar.x - this.avatar.radius) <= 1) {
                this.avatar.x = this.avatar.radius + 1;
            }
            if ((this.avatar.x + this.avatar.radius) >= game_canvas.width - 1) {
                this.avatar.x = game_canvas.width - this.avatar.radius - 1;
            }
        }
    }

    collisionSquare() {
        for (let i = 0; i < this.squares.length; i++) {
            let x = false;
            let y = false;

            if ((this.squares[i].x + this.squares[i].width) > (this.avatar.x - this.avatar.radius) && (this.squares[i].x < this.avatar.x + this.avatar.radius)) {
                x = true;
            }

            if ((this.squares[i].y + this.squares[i].height) > (this.avatar.y - this.avatar.radius) && (this.squares[i].y < this.avatar.y + this.avatar.radius)) {
                y = true;
            }

            if (x && y) {
                this.win();
                this.reset();
            }
        }
    }

    collisionWalls() {
        for (let i = 0; i < this.walls.length; i++) {
            let x = false;
            let y = false;

            if ((this.walls[i].x + this.walls[i].width) > (this.avatar.x - this.avatar.radius) && (this.walls[i].x < this.avatar.x + this.avatar.radius)) {
                x = true;
            }
            if ((this.walls[i].y + this.walls[i].height) > (this.avatar.y - this.avatar.radius) && (this.walls[i].y < this.avatar.y + this.avatar.radius)) {
                y = true;
            }

            if (x && y) {
                this.lose();
                this.reset();
            }
        }

        for (let i = 0; i < this.movingSquares.length; i++) {
            let xMoving = false;
            let yMoving = false;

            if ((this.movingSquares[i].y + this.movingSquares[i].height) > (this.avatar.y - this.avatar.radius) && (this.movingSquares[i].y < this.avatar.y + this.avatar.radius)) {
                yMoving = true;
            }
            if ((this.movingSquares[i].x + this.movingSquares[i].width) > (this.avatar.x - this.avatar.radius) && (this.movingSquares[i].x < this.avatar.x + this.avatar.radius)) {
                xMoving = true
            }

            if (xMoving && yMoving) {
                lose();
                reset();
            }
        }
    }

    drawMap() {
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i].draw();
        }
        for (let i = 0; i < this.squares.length; i++) {
            this.squares[i].draw();
        }
        for (let i = 0; i < this.movingSquares.length; i++) {

            if (this.movingSquares[i].x <= 0 || this.movingSquares[i].x >= 780) {
                this.movingSquares[i].xVel = (-this.movingSquares[i].xVel);
            }
            if (this.movingSquares[i].y <= 0 || this.movingSquares[i].y >= 560) {
                this.movingSquares[i].yVel = (-this.movingSquares[i].yVel);
            }
            this.movingSquares[i].y += this.movingSquares[i].yVel;
            this.movingSquares[i].x += this.movingSquares[i].xVel;
            this.movingSquares[i].draw();
        }
    }


    win() {
        if (this.map < 3) {
            start_btn.style.visibility = "hidden";
            endMsg_div.innerHTML = 'Level complete!';
        }
        else if (this.map = 3)
            endMsg_div.innerHTML = 'You finished the game! </br>';

    }

    lose() {
        endMsg_div.innerHTML = 'Game Over!';
    }

    reset() {
        cancelAnimationFrame(this.gameRAF);
        this.isRunning = false;
        this.avatar = null;
        this.gameKeys = [];
        this.squares = [];
        this.walls = [];
        this.movingSquares = [];
    }



    getRandInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }


    buildMap1() {
        this.avatar = new Avatar(400, 300, 15);

        this.squares.push(new Square(335, 400, 130, 50, '#00F108'));

        this.movingSquares.push(new Square(10, 15, 50, 20, '#f48024', 10, 0));

        this.walls.push(new Square(200, 350, 600, this.wallThickness));
        this.walls.push(new Square(200, 150, this.wallThickness, 200));
        this.walls.push(new Square(200, 150, 400, this.wallThickness));
        this.walls.push(new Square(600, 150, this.wallThickness, 160));
        this.walls.push(new Square(0, 350, 150, this.wallThickness));
        this.walls.push(new Square(300, 50, this.wallThickness, 110));
        this.walls.push(new Square(100, 430, 150, 100));
        this.walls.push(new Square(230, 350, this.wallThickness, 100))
        this.walls.push(new Square(230, 510, 500, this.wallThickness))


    }

    buildMap2() {
        this.avatar = new Avatar(20, 20, 15);

        this.squares.push(new Square(750, 410, 50, 130, '#00F108'));

        this.movingSquares.push(new Square(10, 350, 50, 20, '#f48024', 10, 0));
        this.movingSquares.push(new Square(780, 200, 50, 20, '#f48024', 10, 0));

        this.walls.push(new Square(60, 0, this.wallThickness, 540));
        this.walls.push(new Square(60, 540, 290, this.wallThickness));
        this.walls.push(new Square(350, 100, this.wallThickness, 460));
        this.walls.push(new Square(420, 160, this.wallThickness, 440));
        this.walls.push(new Square(360, 100, 320, this.wallThickness));
        this.walls.push(new Square(420, 160, 200, this.wallThickness));
        this.walls.push(new Square(680, 100, this.wallThickness, 200));
        this.walls.push(new Square(620, 160, this.wallThickness, 80));
        this.walls.push(new Square(590, 300, 110, this.wallThickness));
        this.walls.push(new Square(520, 240, 120, this.wallThickness));
        this.walls.push(new Square(590, 300, this.wallThickness, 90));
        this.walls.push(new Square(520, 240, this.wallThickness, 320));
        this.walls.push(new Square(590, 390, 250, this.wallThickness));
        this.walls.push(new Square(520, 540, 300, this.wallThickness));

    }

    buildMap3() {
        this.avatar = new Avatar(780, 20, 15);
        this.squares.push(new Square(40, 550, 130, 50, '#00F108'));

        this.movingSquares.push(new Square(250, 350, 20, 50, '#f48024', 10, 0));

        this.movingSquares.push(new Square(50, 150, 50, 20, '#f48024', 7, 0));
        this.movingSquares.push(new Square(450, 350, 20, 50, '#f48024', 0, 12));
        this.movingSquares.push(new Square(30, 30, 20, 20, '#f48024', 2, 2));

        this.walls.push(new Square(0, 300, 330, this.wallThickness));
        this.walls.push(new Square(490, 300, 330, this.wallThickness));
        this.walls.push(new Square(700, 0, this.wallThickness, 250));
        this.walls.push(new Square(600, 50, this.wallThickness, 250));
        this.walls.push(new Square(200, 50, 400, this.wallThickness));
        this.walls.push(new Square(200, 50, this.wallThickness, 180));
        this.walls.push(new Square(200, 420, this.wallThickness, 180));
        this.walls.push(new Square(310, 320, this.wallThickness, 180));
        this.walls.push(new Square(310, 500, 300, this.wallThickness));
        this.walls.push(new Square(600, 300, this.wallThickness, 140));
    }
}

// Game initializer
let ctx = game_canvas.getContext('2d');
let game = new Game();
game.buildMap1();
game.drawMap();




// Handelers
mapNext_div.addEventListener('click', () => {
    if (game.map < 3) {
        game.map++;
    }
    else {
        game.map = 1;
    }
    game.reset();
    game.start();
});

start_btn.addEventListener('click', () => {
    game.start();
});

reset_btn.addEventListener('click', () => {
    game.reset();
    game.start();
});

window.addEventListener("keydown", function (e) {
    e.preventDefault();
    game.gameKeys[e.keyCode] = true;
});

window.addEventListener("keyup", function (e) {
    game.gameKeys[e.keyCode] = false;
});



