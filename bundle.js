(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const Enemy = require('./enemy');
const PowerUp = require('./powerup');
const BulletPool = require('./bullet_pool');
const Hud = require('./hud.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game;
var input;
var camera;
var bullets;
var missiles;
var player;
var enemies;
var powerups;
var level;
var score;
var health;
var hud;
var backgrounds;
var foregrounds;
var overgrounds;
var gameOver = false;
var gameWon = false;
var transitionState = false;
var enemyBullets;
var enemyTimer;
var powerupTimer;
var spawnedEnemy;
var spawnedPowerup;

/**
  * @function initialize
  * Creates all the game objects on beginning and on restart of game
  */
function initialize() {
  game = new Game(canvas, update, render);
  hud = new Hud();
  camera = new Camera(canvas);
  bullets = new BulletPool(10);
  missiles = [];
  player = new Player(bullets, missiles);
  enemies = [];
  powerups = [];

  score = 0;
  health = 5;
  level = 0;

  input = {
    up: false,
    down: false,
    left: false,
    right: false
  }

  // Ground
  backgrounds = [
    new Image(),
    new Image(),
    new Image()
  ];
  backgrounds[0].src = "assets/level1.png";
  backgrounds[1].src = "assets/level2.png";
  backgrounds[2].src = "assets/level3.png";

  // Clouds
  foregrounds = [
    new Image(),
    new Image(),
    new Image()
  ];
  foregrounds[0].src = "assets/cloud1.png";
  foregrounds[1].src = "assets/cloud2.png";
  foregrounds[2].src = "assets/cloud3.png";

  // Dark Clouds
  overgrounds = [
    new Image(),
    new Image(),
    new Image()
  ];
  overgrounds[0].src = "assets/dark_cloud1.png";
  overgrounds[1].src = "assets/dark_cloud2.png";
  overgrounds[2].src = "assets/dark_cloud3.png";

  enemyBullets = [];

  enemyTimer = 3000;
  powerupTimer = 5000;

  spawnedEnemy = false;
}
initialize();

/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
  }

  switch (event.keyCode) {
    case 13:
      if (gameOver || gameWon) {
        gameOver = false;
        gameWon = false;
        initialize();
      }
      break;
    case 80:
      if (game.paused) {
        game.pause(false);
      } else game.pause(true);
      break;
    case 32:
      event.preventDefault();
      player.fireBullet({x: 0, y: -player.position.y});
      break;
    // DEBUG
    case 8: // BACKSPACE
      break;
  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  if (!gameOver && !gameWon) {
    setTimeout(function() {
      game.loop(timestamp);
    }, 1000/16);
  }
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {

  if (gameOver || gameWon) return;

  if (spawnedEnemy == false) {
    setTimeout(function() {
      console.log("spawning enemy");
      var eBullets = new BulletPool(10);
      enemyBullets.push(eBullets);
      enemies.push(new Enemy(eBullets, player.position));
      spawnedEnemy = false;
    }, enemyTimer);
    spawnedEnemy = true;
  }

  // If player reaches end of map level, advance game
  if (player.position.y < 2) {
    level++;
    score += health * 1000;
    if (level == 3) {
      gameWon = true;
      return;
    }
    player.position.y = 5400;
    game.pause(true);
    transitionState = true;
  }

  // update the player
  player.update(elapsedTime, input);

  // update the camera
  camera.update(player.position);

  enemies.forEach(function(enemy) {
    enemy.update();
    enemy.fireBullet();
  });

  // Update bullets
  bullets.update(elapsedTime, function(bullet){
    if(!camera.onScreen(bullet)) return true;
    return false;
  });
  enemyBullets.forEach(function(eBullets) {
    eBullets.update(elapsedTime, function(bullet){
      if(!camera.onScreen(bullet)) return true;
      return false;
    });
  });


  // Update missiles
  var markedForRemoval = [];
  missiles.forEach(function(missile, i){
    missile.update(elapsedTime);
    if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
      markedForRemoval.unshift(i);
  });
  // Remove missiles that have gone off-screen
  markedForRemoval.forEach(function(index){
    missiles.splice(index, 1);
  });

  if (health == 0) {
    gameOver = true;
  }
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {

  renderBackgrounds(elapsedTime, ctx);

  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);

  renderHud(ctx);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    // Render the bullets
    bullets.render(elapsedTime, ctx);
    enemyBullets.forEach(function(eBullets) {
      eBullets.render(elapsedTime, ctx);
    });

    // Render the missiles
    missiles.forEach(function(missile) {
      missile.render(elapsedTime, ctx);
    });

    // Render the player
    player.render(elapsedTime, ctx);

    enemies.forEach(function(enemy) {
      enemy.render(ctx);
    });
}

/**
  * @function renderBackgrounds
  * Renders the parallax scrolling backgrounds.
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderBackgrounds(elapsedTime, ctx) {

  if (level < 3) {
    // The background scrolls at 50% of the foreground speed
    ctx.save();
    ctx.translate(0, -camera.y * 0.5);
    ctx.drawImage(backgrounds[level], 0, 0);
    ctx.restore();

    // The foreground scrolls in sync with the camera
    ctx.save();
    ctx.translate(0, -camera.y);
    ctx.drawImage(foregrounds[level], 0, 0);
    ctx.restore();

    // The overground scrolls in sync with the camera
    ctx.save();
    ctx.translate(0, -camera.y * 1.5);
    ctx.drawImage(overgrounds[level], 0, 0);
    ctx.restore();
  }
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  hud.displayGUI(ctx, player.position);
}

/**
  * @function renderHud
  * Renders the Hud
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderHud(ctx) {
  hud.displayHud(ctx);
  hud.displayScore(ctx, score);
  hud.displayLevel(ctx, level);
  hud.displayHealth(ctx, health);

  if (game.paused) {
    hud.displayPaused(ctx);
  }

  if (transitionState) {
    hud.displayLevelTransition(ctx, canvas, score, health, level);
    setTimeout(function() {
      game.pause(false);
      transitionState = false;
    }, 5000);
  }

  if (gameOver) {
    hud.displayGameOver(ctx, canvas, score);
  }

  if (gameWon) {
    hud.displayGameWon(ctx, canvas, score);
  }
}

},{"./bullet_pool":2,"./camera":3,"./enemy":4,"./game":5,"./hud.js":6,"./player":7,"./powerup":8,"./vector":9}],2:[function(require,module,exports){
"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x;
    this.pool[4*this.end+1] = position.y;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of bullets by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "lightpurple";
  for(var i = 0; i < this.end; i++) {
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.arc(this.pool[4*i], this.pool[4*i+1], 2, 0, 2*Math.PI);
  }
  ctx.fill();
  ctx.restore();
}

},{}],3:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');

/**
 * @module Camera
 * A class representing a simple camera
 */
module.exports = exports = Camera;

/**
 * @constructor Camera
 * Creates a camera
 * @param {Rect} screen the bounds of the screen
 */
function Camera(screen) {
  this.x = 0;
  this.y = 0;
  this.width = screen.width;
  this.height = screen.height;
}

/**
 * @function update
 * Updates the camera based on the supplied target
 * @param {Vector} target what the camera is looking at
 */
Camera.prototype.update = function(target) {
  if (target.y <= 5400 && target.y >= 600) {
    this.y = target.y - 600;
  }
}

/**
 * @function onscreen
 * Determines if an object is within the camera's gaze
 * @param {Vector} target a point in the world
 * @return true if target is on-screen, false if not
 */
Camera.prototype.onScreen = function(target) {
  return (
     target.x > this.x &&
     target.x < this.x + this.width &&
     target.y > this.y &&
     target.y < this.y + this.height
   );
}

/**
 * @function toScreenCoordinates
 * Translates world coordinates into screen coordinates
 * @param {Vector} worldCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toScreenCoordinates = function(worldCoordinates) {
  return Vector.subtract(worldCoordinates, this);
}

/**
 * @function toWorldCoordinates
 * Translates screen coordinates into world coordinates
 * @param {Vector} screenCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toWorldCoordinates = function(screenCoordinates) {
  return Vector.add(screenCoordinates, this);
}

},{"./vector":9}],4:[function(require,module,exports){
"use strict";

const Vector = require('./vector');

module.exports = exports = Enemy;

function Enemy(bullets, position) {
  this.bullets = bullets;
  this.velocity = {x: 0, y: 2};
  var generateX = generateRandomNumber(756, 30);
  this.position = {x: generateX, y: (position.y - 850)};

  // this.enemyType = generateRandomNumber(5, 1);
  this.enemyType = 1;

  this.img = new Image();

  switch (this.enemyType) {
    case 1:
      this.img.src = 'assets/enemy1.png';
      break;
    case 2:
      this.img.src = 'assets/enemy2.png';
      break;
    case 3:
      this.img.src = 'assets/enemy3.png';
      break;
    case 4:
      this.img.src = 'assets/enemy4.png';
      break;
    case 5:
      this.img.src = 'assets/enemy5.png';
      break;
  }

  this.firedBullet = false;
}

Enemy.prototype.update = function() {
  this.position.y += this.velocity.y;
}

Enemy.prototype.render = function(ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, -24, -24, 48, 48);
  ctx.restore();
}

Enemy.prototype.fireBullet = function() {
  var self = this;
  if (this.firedBullet == false) {
    setTimeout(function() {
      switch(self.enemyType) {
        case 1:
          // console.log();
          var position = Vector.add(self.position, {x: 0, y: 50});
          var velocity = Vector.scale(Vector.normalize({x: 0, y: self.position.y}), 4);
          self.bullets.add(position, velocity);
          self.firedBullet = false;
          break;
      }
      this.firedBullet = true;
    }, 50);
  }

}

/**
  * @function generateRandomNumber
  * Generates a random number between the given min and max
  */
function generateRandomNumber(max, min) {
  return Math.floor(Math.random() * (max - min)) + min;
}

},{"./vector":9}],5:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],6:[function(require,module,exports){
"use strict;"

/**
  * @module exports the Hud class
  */
module.exports = exports = Hud;

/**
  * @constructor Hud
  * Creates a new hud object
  */
function Hud() {}

Hud.prototype.displayHud = function(ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 760, 1024, 30);
}

/**
  * @function displayScore
  * Displays the current score bottom left of canvas
  */
Hud.prototype.displayScore = function(ctx, score) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "green";
  var scoreText = "Score: " + score;
  ctx.fillText(scoreText, 480, 780);
}

/**
  * @function displayHealth
  * Displays the health bottom middle of canvas
  */
Hud.prototype.displayHealth = function(ctx, health) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "red";
  var healthText = "Health: ";
  ctx.fillText(healthText, 10, 780);
  ctx.fillRect(70, 768, (health * 35), 12);
}

/**
  * @function displayLevel
  * Displays the level number bottom right of canvas
  */
Hud.prototype.displayLevel = function(ctx, level) {
  ctx.font = "bold 16px Arial";
  ctx.fillStyle = "white";
  var levelText = "Level: " + (level + 1);
  ctx.fillText(levelText, 950, 780);
}

/**
  * @function displayGUI
  * Displays the player's coordinates on screen
  */
Hud.prototype.displayGUI = function(ctx, position) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 55, 40);
  ctx.font = "bold 12px Arial";
  ctx.fillStyle = "orange";
  var coordinatesX = "X: " + Math.ceil(position.x);
  var coordinatesY = "Y: " + Math.ceil(position.y);
  ctx.fillText(coordinatesX, 5, 15);
  ctx.fillText(coordinatesY, 5, 30);
}

/**
  * @function displayPaused
  * Displays pause message middle of screen
  */
Hud.prototype.displayPaused = function(ctx) {
  ctx.font = "bold 32px Arial";
  ctx.fillStyle = "blue";
  ctx.fillText("PAUSED", 460, 400);
}

/**
  * @function displayGameOver
  * When game is over, message is displayed over canvas with high score
  */
Hud.prototype.displayGameOver = function(ctx, canvas, score) {
  ctx.fillStyle = "#798187";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 48px Helvetica";
  ctx.fillStyle = "black";

  var gameOverText = "Game Over!";
  var scoreText = "Score: " + score;
  var gameOverHelp = "Press 'Enter' to restart";

  ctx.fillText(gameOverText, 380, 370);
  ctx.fillText(scoreText, 15, 760);
  ctx.font = "bold 32px Helvetica";
  ctx.fillText(gameOverHelp, 340, 410);
}

/**
  * @function displayLevelTransition
  * When level advances, display results from previous level
  */
Hud.prototype.displayLevelTransition = function (ctx, canvas, score, health, level) {
  ctx.fillStyle = "purple";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var nextLevelText = "Next Level";
  var scoreText = "Current Score: " + score;
  var healthText = "Health: ";
  for (var i = 0; i < health; i++) {
    healthText += " <3";
  }
  var levelText = "Level Completed: " + (level + 1);

  ctx.font = "bold 48px Helvetica";
  ctx.fillStyle = "white";
  ctx.fillText(nextLevelText, 400, 410);
  ctx.font = "bold 32px Helvetica";
  ctx.fillText("RESULTS", 10, 640)
  ctx.fillText(levelText, 10, 680);
  ctx.fillText(healthText, 10, 720);
  ctx.fillText(scoreText, 10, 760);
}

/**
  * @function displayGameWon
  * Displays to the player that game is won
  */
Hud.prototype.displayGameWon = function(ctx, canvas, score) {
  ctx.fillStyle = "#2ECC71";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "bold 48px Helvetica";
  ctx.fillStyle = "white";

  var winText = "You Win!";
  var scoreText = "Score: " + score;
  var winTextHelp = "Press 'Enter' to restart";

  ctx.fillText(winText, 410, 370);
  ctx.fillText(scoreText, 15, 760);
  ctx.font = "bold 32px Helvetica";
  ctx.fillText(winTextHelp, 340, 410);
}

},{}],7:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
// const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles) {
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.position = {x: 525, y: 5400};
  this.velocity = {x: 0, y: 0};
  this.img = new Image()
  // Obtained from http://opengameart.org/content/fighter-ship-elite
  this.img.src = 'assets/attackship.png';
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {

  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = 0;
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 1024) this.position.x = 1024;
  if(this.position.y > 5500) this.position.y = 5500;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, -24, -24, 48, 48);
  ctx.restore();
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x: 0, y: 25});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}

},{"./vector":9}],8:[function(require,module,exports){
"use strict";

module.exports = exports = PowerUp;

function PowerUp() {

  this.position = {x: 0, y: 0};

  // this.powerUpType = generateRandomNumber(5, 1);
  this.powerUpType = 1;
  this.img = new Image();

  switch (this.powerUpType) {
    case 1:
      this.img.src = 'assets/powerup1.png';
      break;
    case 2:
      this.img.src = 'assets/powerup2.png';
      break;
    case 3:
      this.img.src = 'assets/powerup3.png';
      break;
    case 4:
      this.img.src = 'assets/powerup4.png';
      break;
    case 5:
      this.img.src = 'assets/powerup5.png';
      break;
  }

  this.pickedUp = false;
}

PowerUp.prototype.update = function(pickedUp) {
  if (pickedUp) {
    
  }
}

PowerUp.prototype.render = function(ctx) {
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, -16, -16, 32, 32);
  ctx.restore();
}

/**
  * @function generateRandomNumber
  * Generates a random number between the given min and max
  */
function generateRandomNumber(max, min) {
  return Math.floor(Math.random() * (max - min)) + min;
}

},{}],9:[function(require,module,exports){
"use strict";

/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  add: add,
  subtract: subtract,
  scale: scale,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}


/**
 * @function rotate
 * Scales a vector
 * @param {Vector} a - the vector to scale
 * @param {float} scale - the scalar to multiply the vector by
 * @returns a new vector representing the scaled original
 */
function scale(a, scale) {
 return {x: a.x * scale, y: a.y * scale};
}

/**
 * @function add
 * Computes the sum of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed sum
*/
function add(a, b) {
 return {x: a.x + b.x, y: a.y + b.y};
}

/**
 * @function subtract
 * Computes the difference of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed difference
 */
function subtract(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

},{}]},{},[1]);
