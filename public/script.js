window.onload = function() {
    document.body.onselectstart = function() {
        return false;
    }
}
var clicked = function (evt) {
    startGame();
    canvas.removeEventListener('click', clicked, false);
}

var main = document.getElementById("main");
    main.addEventListener("click", clicked, false)


startGame = function(){
    // Initial setup
    var canvas = document.getElementById("canvas"),
        main = document.getElementById("main"),
        c = canvas.getContext("2d");
        main.style.display = "none";

    var innerWidth = 360,
        innerHeight = 600;
        canvas.width = innerWidth;
        canvas.height = innerHeight;    
        canvas.style.display = "block";
    function applyText(canvas, text) {
        const ctx = canvas.getContext('2d');
        let fontSize = 70;
        do {
            ctx.font = `${fontSize -= 1}px arial`;
        } while (ctx.measureText(text).width > canvas.width-20);
        return ctx.font;
    }

    // Variables
    var score = 0
        lastTime = 1000;

    // Keys event listeners
    var map = {
        32: false, // Space
        37: false, // Left
        39: false, // Right
    }

    addEventListener("keydown", function(event){
        if (event.keyCode in map) {
            map[event.keyCode] = true;
            if (map[37]) {
                player.x += -10;
            } 
            if (map[39]) {
                player.x += 10;
            }  
            if (map[32]) {
                event.currentTime = new Date().getTime();
                if (event.currentTime >= lastBulletTime + bulletCooldown) {
                    lastBulletTime = event.currentTime;
                    new createBullet();
                }
            }
        }
    })

    addEventListener("keyup", function(event){
        if (event.keyCode in map) {
            map[event.keyCode] = false;
        }
    })

    // Player setup
    var player = {},
        playerWidth = 78,
        playerHeight = 148,
        playerImg = new Image();
        playerImg.src = "assets/player.png";

    // Create player
    player = {
        width: playerWidth,
        height: playerHeight,
        x: innerWidth/2 - playerWidth/2,
        y: innerHeight - (playerHeight+10),
        health: 100,
        draw: function(){
            if (player.x <= 10) player.x = 10;
            if (player.x >= innerWidth-playerWidth+15) player.x = innerWidth-playerWidth+15;
            c.drawImage(playerImg, this.x, this.y, this.width, this.height);
        }
    }

    // Bullet variables
    var bulletArray = [],
        bulletIndex = 0,
        bulletWidth = 30,
        bulletHeight = 30,
        lastBulletTime = new Date().getTime(),
        bulletCooldown = 500,
        dy = 10,
        bulletImg = new Image();
        bulletImg.src = "assets/bullet.png";

    // Create bullet
    function bullet(x, y, dy, bulletImg, bulletWidth, bulletHeight) {
        this.x = x;
        this.y = y;
        this.dy = dy;
        this.img = bulletImg;
        this.width = bulletWidth;
        this.height = bulletHeight;
        bulletIndex ++;
        bulletArray[bulletIndex] = this;
        this.id = bulletIndex;

        this.update = function(){
            this.y -= this.dy;
            if (this.y+this.height <= 0) this.delete();
            this.draw();
        };
        this.delete = function(){
            delete bulletArray[this.id];
        };
        this.draw = function(){
            c.drawImage(this.img, this.x, this.y, this.width, this.height)
        };
    }

    // Create bullet function
    function createBullet() {
        var x = (player.x + playerWidth/2) - bulletWidth/2;
        var y = player.y-bulletHeight;
        new bullet(x, y, dy, bulletImg, bulletWidth, bulletHeight);
    }
    // Enemy variables
    var enemyArray = [],
        enemyIndex = 0,
        enemyWidth = 50,
        enemyHeight = 70,
        enemyTimer = 1000,
        enemyImg = new Image();
        enemyImg.src = 'assets/enemy.png';

    // Create enemy
    function enemy(x, y, dx, dy, enemyImg, enemyWidth, enemyHeight, rotation) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.img = enemyImg;
        this.width = enemyWidth;
        this.height = enemyHeight;
        this.rotation = rotation;
        enemyIndex ++;
        enemyArray[enemyIndex] = this;
        this.id = enemyIndex;

        if (this.rotation < 0.2) {
            this.dx = -this.dx;
        } else if (this.rotation < 0.7) {
            this.dx = -this.dx;
        } else {
            this.dx = 0;
        }
        
        this.update = function() {
            this.y += this.dy;
            this.x += this.dx;
            if (this.x + this.width >= innerWidth) {
                this.dx = -this.dx;
            } else if (this.x <= 0) {
                this.dx = Math.abs(this.dx);
            }
            if (this.y > innerHeight+this.height) this.delete();
            this.draw();
        }

        this.delete = function() {
            delete enemyArray[this.id];
        }
        this.draw = function() {
            c.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    // Create enemy function
    function createEnemy(){
        var x = Math.random() * (innerWidth - enemyWidth)
        var y = -enemyHeight;
        var dx = 3;
        var dy = 3;
        var rotation = Math.random();

        new enemy(x, y, dx, dy, enemyImg, enemyWidth, enemyHeight, rotation);
    }

    // Collision checker
    function collides(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    // Collisions handler
    function collisionsHandler() {
        enemyArray.forEach(function(enemy) {
            bulletArray.forEach(function(bullet) {
                if (collides(bullet, enemy)) {
                    bullet.delete();
                    enemy.delete();
                    score += 10;
                }
            })
            if (collides(enemy, player)) {
                enemy.delete();
                player.health -= 10;
            }
        })
    }
    // Animation loop
    function animate(currentTime){
        var animation = requestAnimationFrame(animate);
        c.clearRect(0, 0, canvas.width, canvas.height);
        c.clearRect(0, 0, canvas.width, canvas.height);
        // Score
        c.font = '18px arial';
        c.fillStyle = '#fff';
        c.fillText('Score: '+score, 10, 22);
        // Health
        c.font = '18px arial';
        c.fillStyle = '#fff';
        c.fillText('Health: '+player.health, innerWidth - 100, 22);
        // Player
        player.draw();
        // Enemy
        if (currentTime >= lastTime + enemyTimer){
            lastTime = currentTime;
            createEnemy();
        }
        // Enemy update position
        enemyArray.forEach(function(enemy){
            enemy.update();
        })
        // Bullet update position
        bulletArray.forEach(function(bullet){
            bullet.update();
        })
        // Collision
        collisionsHandler();
        // Health check
        if (player.health <= 0) {
            cancelAnimationFrame(animation);
            c.globalAlpha = 0.5;
            c.fillStyle = "red";
            c.fillRect(0, 0, canvas.width, canvas.height);
            c.fillStyle = "white";
            c.fillRect(0, canvas.height/2 - (canvas.height/5)/2, canvas.width, canvas.height/5);
            // Score
            c.font = applyText(canvas, 'Score: '+score);
            c.fillStyle = '#fff';
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText('Score: '+score, canvas.width/2, canvas.height/2);
            // Restart
            c.font = '70px arial';
            c.fillStyle = '#fff';
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillText('⟳', canvas.width/2, canvas.height - canvas.height/4);
            canvas.addEventListener('click', clicked, false);
        }
    }
    animate();
}
