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
