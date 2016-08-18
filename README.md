classic-arcade-game-fend
===============================
A simple frogger-style clone in JS.

## Setup
### Method 1 - Easy
* Go to https://rbtr.github.io/classic-arcade-game-fend/index.html
* Play the game!  

### Method 2 
* Download the repository here or clone using git 
* Unzip the repo zipfile
* Load index.html in your browser
* Play the game!

## How to play
* Controls are: 
    * Left arrow key - move left
    * Right arrow key - move right
    * Up arrow key - move up
    * Down arrow key - move down
* The game is won when you reach the water, and you will be respawned at the start.
* If you collide with a bug, you lose, and will be respawned at the start.

## About the code
One different thing that happens in my code is that I wrote some helper functions to map pixel coordinates to rows and columns.
You will see this as pxToRow/rowToPx and the col equivalent.
Wherever possible, the Sprite object only exposes public methods that deal in blocks instead of pixels which simplifies moving the Sprites around.
