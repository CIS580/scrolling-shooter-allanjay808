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
