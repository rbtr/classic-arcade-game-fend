// A parent Sprite object
// This object is the base for both the enemy and the player sprites
// It has an x and y coordinate and a sprite image field
var Sprite = function(spriteImg) {
    this.x = 0;
    this.y = 0;
    this.sprite = spriteImg;
};

// Return the current column of the sprite (from its X coordinate)
Sprite.prototype.col = function() {
    return pxToCols(this.x);
};

// Return the current row of the sprite (from its Y coordinate)
Sprite.prototype.row = function() {
    return pxToRows(this.y);
};

// Return the lower column boundary of the sprite
Sprite.prototype.minCol = function() {
    return pxToCols(this.xBounds[0]);
};

// Return the upper column boundary of the sprite
Sprite.prototype.maxCol = function() {
    return pxToCols(this.maxX());
};

// Return the upper pixel boundary of the sprite (supplements the maxCol method)
Sprite.prototype.maxX = function() {
    return this.xBounds[1];
};

// Return the lower row boundary of the sprite
Sprite.prototype.minRow = function() {
    return pxToRows(this.yBounds[0]);
};

// Return the upper row boundary of the sprite
Sprite.prototype.maxRow = function() {
    return pxToRows(this.yBounds[1]);
};

// Jumps the sprite to the x, y coordinates of the passed row and column
Sprite.prototype.moveTo = function(col, row) {
    this.x = colsToPx(col);
    this.y = rowsToPx(row) + rowOffset;
};

// Shifts the x coordinate of the sprite by the pixel equivalent of the passed column delta
Sprite.prototype.shiftCol = function(deltaC) {
    this.x += colsToPx(deltaC);
};

// Shifts the y coordinate of the sprite by the pixel equivalent of the passed row delta
Sprite.prototype.shiftRow = function(deltaR) {
    this.y += rowsToPx(deltaR);
};

// Fences in the sprite. It is up to the child sprite to obey the bounds set here.
// Bounds are set as min, max pair arrays of [colMin, colMax], [rowMin, rowMax]
Sprite.prototype.setBounds = function(colBounds, rowBounds) {
    if (colBounds != undefined) {
        this.xBounds = [colsToPx(colBounds[0]), colsToPx(colBounds[1])];
    }
    // It's not necessary to set a row boundary for the enemy child sprite, so this parameter is optional.
    if (rowBounds != undefined) {
        this.yBounds = [rowsToPx(rowBounds[0]), rowsToPx(rowBounds[1])];
    }
};

// Comparator method that checks whether this sprite is within a collision range of the passed otherSprite.
// A collision state is currently half the distance between blocks in either ordinate.
Sprite.prototype.hasCollided = function(otherSprite) {
    var xCollided = Math.abs(this.x - otherSprite.x) < colSize / 2;
    var yCollided = Math.abs(this.y - otherSprite.y) < rowSize / 2;
    return xCollided && yCollided;
};

// Draws this sprite
Sprite.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Enemies our player must avoid
var Enemy = function() {
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    const sprite_path = "images/enemy-bug.png";
    Sprite.call(this, sprite_path);
    this.setBounds([-1, 5]);
};

Enemy.prototype = Object.create(Sprite.prototype);
Enemy.prototype.constructor = Enemy;

// This respawn method initializes (or reinitializes) this sprite to some default condition
// In this case, it sets a new random location and random speed for the Enemy.
Enemy.prototype.respawn = function () {
    this.speed = colsToPx(Math.random() * 2 + 1); // Random speed between 1 and 3 cols/second
    this.moveTo(-1, Math.floor(Math.random() * 3) + 1);
};

// Updates the internal state of the Enemy
// The enemies are always moving, so multiplying the speed by the time delta gives us a constant
// movement regardless of the framerate of the player's game.
// This method always checks to see if the Enemy is out of its bounds, and respawns if it is.
Enemy.prototype.update = function(dt) {
    var delta_x = this.speed * dt;
    if (this.x + delta_x > this.maxX()) {
        this.respawn();
    } else {
        this.x += delta_x;
    }
};


//
//


// Player class
var Player = function () {
    const sprite_path = "images/char-boy.png";
    Sprite.call(this, sprite_path);
    this.setBounds([0, 4], [0, 4]);
};

Player.prototype = Object.create(Sprite.prototype);
Player.prototype.constructor = Player;

// This respawn method resets the player to their origin for another go!
Player.prototype.respawn = function() {
    this.moveTo(2, 5);
};

// Handles input to the game.
// Acceptable inputs are up, down, left, and right, and the sprite checks to see
// if it has room to move in that direction without going out of bounds then
// executes the movement.
// Finally, it also checks to see if the movement would be in to the water - a win -
// and resets the player instead of letting them get wet.
Player.prototype.handleInput = function (keyCode) {
    switch (keyCode) {
        case "left":
            if (this.col() > this.minCol()) {
                this.shiftCol(-1);
            }
            break;
        case "right":
            if (this.col() < this.maxCol()) {
                this.shiftCol(1);
            }
            break;
        case "up":
            console.log(this.row());
            console.log(this.minRow());
            console.log(this.row() > this.minRow());
            if (this.row() == 0) {
                this.respawn();
            } else {
                if (this.row() > this.minRow()) {
                    console.log("shifting");
                    this.shiftRow(-1);
                }
            }
            break;
        case "down":
            if (this.row() < this.maxRow()) {
                this.shiftRow(1);
            }
            break;
    }
};

// Updates the internal state of the player object.
// Checks to see if the player is in a collision state with any of the enemies and respawns
// the player - a loss - if they have collided.
Player.prototype.update = function () {
    var needsRespawn = false;
    allEnemies.forEach(function (enemy) {
        if (player.hasCollided(enemy)) {
            console.log("collided");
            needsRespawn = true;
        }
    });
    if (needsRespawn) {
        this.respawn();
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
allEnemies = [new Enemy(), new Enemy(), new Enemy()];
allEnemies.forEach(function (enemy) {
    enemy.respawn();
});

player = new Player();
player.respawn();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});