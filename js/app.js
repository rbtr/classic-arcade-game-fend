// Dimensional constants to scale the movements in X and Y
const colSize = 101;
const rowSize = 83;
const rowOffset = -35;

var rowsToPx = function(rows) {
    return rowSize * rows;
};

var colsToPx = function(cols) {
    return colSize * cols;
};

/*
    Base Movable
 */

// / Parent base class for the Enemy and Player sprites to inherit
// (I refactored those child class according to DRY)
var Movable = function(sprite_image_path, col, row, bounds) {
    this.sprite = sprite_image_path;
    this.x = colsToPx(col);
    this.y = rowsToPx(row) + rowOffset;
    this.moving = undefined;
    this.movement = [];
    this.bounds = bounds;
};

// Draw the Movable sprite on the screen at its current position
Movable.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Move methods to handle moving the Movable sprite in X and Y
Movable.prototype.translateCols = function(cols) {
    this.translateX(colsToPx(cols));
};

Movable.prototype.translateRows = function(rows) {
    this.translateY(rowsToPx(rows));
};

Movable.prototype.translateX = function(xPx) {
    this.x += xPx;
};

Movable.prototype.translateY = function(yPx) {
    this.y += yPx;
};

Movable.prototype.queueMovement = function(movement) {
    if (this.movement.length > 0) {
        this.movement.pop();
    }

    if (this.bounds.isLegal(this, movement)) {
        this.movement.push(movement);
    }
};

// Update the Enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Movable.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.moving == undefined) {
        if (this.movement.length > 0) {
            this.moving = this.movement.shift();
        }
    }
    if (this.moving != undefined) {
        if (this.moving.sX == 0 && this.moving.sY == 0) {
            this.moving = undefined;
            return;
        }
        this.translateX(this.moving.dX(dt));
        this.translateY(this.moving.dY(dt));
    }
};

// This object takes an absolute speed (as a positive value) in X and Y and
// a total movement distance (as a positive value) in X and Y.
// It also takes a direction parameter which indicates the direction of movement
// since the speed and movement scalar are directionless.
// For the direction, +X is right, +Y is down
var Movement = function(sX, sY, directionX, directionY, x, y) {
    this.sX = sX;
    this.sY = sY;
    this.dirX = directionX > 0 ? 1 : -1;
    this.dirY = directionY > 0 ? 1 : -1;
    this.x = x;
    this.y = y;
};

Movement.prototype.d = function(dt, s, q, dir) {
    var d = s * dt;

    if (q != undefined) {
        if (d > q && q > 0) {
            d = q;
        }
    }

    return d;
};

Movement.prototype.dX = function(dt) {
    var dx = this.d(dt, this.sX, this.x);

    if (this.x != undefined) {
        if (this.x <= 0) {
            this.x = 0;
            this.sX = 0;
            dx = 0;
        } else {
            this.x -= dx;
        }
    }
    return this.dirX * dx;
};

Movement.prototype.dY = function(dt) {
    var dy = this.d(dt, this.sY, this.y);

    if (this.y != undefined) {
        if (this.y <= 0) {
            this.y = 0;
            this.sY = 0;
            dy = 0;
        } else {
            this.y -= dy;
        }
    }
    return this.dirY * dy;
};

// Defines a bounding rect out of which the sprite is not allowed to move.
var Bounds = function(lX, lY, uX, uY) {
    this.lX = lX - 1;
    this.lY = lY + rowOffset - 1;
    this.uX = uX + 1;
    this.uY = uY + rowOffset + 1;
};

Bounds.prototype.isLegal = function(movable, movement) {
    var legal = true;
    var dx = movement.x == undefined ? colSize : movement.x;
    var dy = movement.y == undefined ? rowSize : movement.y;

    if (movement.dirX > 0) {
        if (movable.x + dx > this.uX) {
            legal = false;
        }
    } else {
        if (movable.x - dx < this.lX) {
            legal = false;
        }
    }

    if (movement.dirY > 0) {
        if (movable.y + dy > this.uY) {
            legal = false;
        }
    } else {
        if (movable.y - dy < this.lY) {
            legal = false;
        }
    }
    return legal;
};


/*
    Enemy subclass
 */

// Enemies our player must avoid
var Enemy = function(x, y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    const sprite_path = "images/enemy-bug.png";
    Movable.call(this, sprite_path, x, y, new Bounds(colsToPx(-1), rowsToPx(-1), colsToPx(6), rowsToPx(7)));
};

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.spawnNew = function() {
    var enemy = new Enemy(-1, Math.floor((Math.random() * 3)) + 1);
    var sX = colsToPx(Math.floor(Math.random() * 6) / 2 + 1);
    enemy.queueMovement(new Movement(sX, 0, 1, 0));
    return enemy;
};

/*
    Player subclass
 */

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function (x, y) {
    const sprite_path = "images/char-boy.png";
    Movable.call(this, sprite_path, x, y, new Bounds(0, rowsToPx(1), colsToPx(4), rowsToPx(5)));
};

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

Player.prototype.handleInput = function (keyCode) {
    switch (keyCode) {
        case "left":
            this.queueMovement(new Movement(colsToPx(2), 0, -1, 0, colsToPx(1), 0));
            break;
        case "right":
            this.queueMovement(new Movement(colsToPx(2), 0, 1, 0, colsToPx(1), 0));
            break;
        case "up":
            this.queueMovement(new Movement(0, rowsToPx(2), 0, -1, 0, rowsToPx(1)));
            break;
        case "down":
            this.queueMovement(new Movement(0, rowsToPx(2), 0, 1, 0, rowsToPx(1)));
            break;
    }
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player(2, 5);
var allEnemies = [
    Enemy.prototype.spawnNew(),
    Enemy.prototype.spawnNew(),
    Enemy.prototype.spawnNew()
];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener("keyup", function(e) {
    var allowedKeys = {
        37: "left",
        38: "up",
        39: "right",
        40: "down"
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
