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
