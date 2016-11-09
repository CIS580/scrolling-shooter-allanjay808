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
