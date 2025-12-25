const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const shootSound = document.getElementById('shootSound');
const explosionSound = document.getElementById('explosionSound');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const LIVES_START = 3;
let score = 0;
let lives = LIVES_START;
let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    angle: -Math.PI / 2, // Facing up
    rotation: 0,
    thrusting: false,
    vel: { // velocity
        x: 0,
        y: 0
    },
    shielded: false
};

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle + Math.PI / 2);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -player.radius); // Nose
    ctx.lineTo(player.radius, player.radius); // Bottom left
    ctx.lineTo(-player.radius, player.radius); // Bottom right
    ctx.closePath();
    ctx.stroke();

    // Draw shield
    if (player.shielded) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw thruster
    if (player.thrusting) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(0, player.radius);
        ctx.lineTo(5, player.radius + 10);
        ctx.lineTo(-5, player.radius + 10);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

const BULLET_SPEED = 5;
const bullets = [];
const powerUps = [];

function createPowerUp(x, y) {
    powerUps.push({
        x,
        y,
        radius: 5,
        type: 'shield'
    });
}

function shoot() {
    shootSound.currentTime = 0;
    shootSound.play();
    bullets.push({
        x: player.x + Math.cos(player.angle) * player.radius,
        y: player.y + Math.sin(player.angle) * player.radius,
        vel: {
            x: Math.cos(player.angle) * BULLET_SPEED,
            y: Math.sin(player.angle) * BULLET_SPEED
        },
        radius: 2
    });
}

const keys = {
    up: false,
    left: false,
    right: false,
    space: false
};

document.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'Space':
            if (!keys.space) {
                shoot();
            }
            keys.space = true;
            break;
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowUp':
            keys.up = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'Enter':
            if (gameOver) {
                restartGame();
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'Space':
            keys.space = false;
            break;
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowUp':
            keys.up = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
    }
});

const TURN_SPEED = 0.1;
const THRUST_ACCELERATION = 0.1;
const FRICTION = 0.01;

function update() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '24px Arial';
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Handle rotation
    if (keys.left) {
        player.angle -= TURN_SPEED;
    }
    if (keys.right) {
        player.angle += TURN_SPEED;
    }

    // Handle thrust
    player.thrusting = keys.up;
    if (player.thrusting) {
        player.vel.x += Math.cos(player.angle) * THRUST_ACCELERATION;
        player.vel.y += Math.sin(player.angle) * THRUST_ACCELERATION;
    }

    // Apply friction
    player.vel.x *= (1 - FRICTION);
    player.vel.y *= (1 - FRICTION);

    // Update position
    player.x += player.vel.x;
    player.y += player.vel.y;

    // Screen wrapping
    if (player.x < 0 - player.radius) {
        player.x = canvas.width + player.radius;
    } else if (player.x > canvas.width + player.radius) {
        player.x = 0 - player.radius;
    }
    if (player.y < 0 - player.radius) {
        player.y = canvas.height + player.radius;
    } else if (player.y > canvas.height + player.radius) {
        player.y = 0 - player.radius;
    }

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw and update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.vel.x;
        bullet.y += bullet.vel.y;

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        if (isOffscreen(bullet)) {
            bullets.splice(i, 1);
        }
    }

    // Draw and update asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x += asteroid.vel.x;
        asteroid.y += asteroid.vel.y;

        // Screen wrapping
        if (asteroid.x < 0 - asteroid.radius) {
            asteroid.x = canvas.width + asteroid.radius;
        } else if (asteroid.x > canvas.width + asteroid.radius) {
            asteroid.x = 0 - asteroid.radius;
        }
        if (asteroid.y < 0 - asteroid.radius) {
            asteroid.y = canvas.height + asteroid.radius;
        } else if (asteroid.y > canvas.height + asteroid.radius) {
            asteroid.y = 0 - asteroid.radius;
        }

        drawAsteroid(asteroid);
    }

    drawPlayer();

    requestAnimationFrame(update);

    checkCollisions();

    drawPowerUps();
    drawUI();
}

function drawPowerUps() {
    for (const powerUp of powerUps) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawUI() {
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 30);
    ctx.fillText(`High Score: ${highScore}`, canvas.width / 2 - 100, 30);
}

function checkCollisions() {
    // Player and asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        if (distance(player, asteroid) < player.radius + asteroid.radius) {
            if (player.shielded) {
                player.shielded = false;
                asteroids.splice(i, 1);
            } else {
                lives--;
                resetGame();
            }
        }
    }

    // Player and power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        if (distance(player, powerUp) < player.radius + powerUp.radius) {
            if (powerUp.type === 'shield') {
                player.shielded = true;
            }
            powerUps.splice(i, 1);
        }
    }

    // Bullets and asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (distance(asteroid, bullet) < asteroid.radius + bullet.radius) {
                if (asteroid.radius === ASTEROID_SIZE_LARGE) {
                    asteroids.push(newAsteroid(asteroid.x, asteroid.y, ASTEROID_SIZE_MEDIUM));
                    asteroids.push(newAsteroid(asteroid.x, asteroid.y, ASTEROID_SIZE_MEDIUM));
                    if (Math.random() < 0.2) { // 20% chance to drop a power-up
                        createPowerUp(asteroid.x, asteroid.y);
                    }
                    score += SCORE_LARGE;
                } else if (asteroid.radius === ASTEROID_SIZE_MEDIUM) {
                    asteroids.push(newAsteroid(asteroid.x, asteroid.y, ASTEROID_SIZE_SMALL));
                    asteroids.push(newAsteroid(asteroid.x, asteroid.y, ASTEROID_SIZE_SMALL));
                    score += SCORE_MEDIUM;
                } else {
                    score += SCORE_SMALL;
                }
                explosionSound.currentTime = 0;
                explosionSound.play();
                asteroids.splice(i, 1);
                bullets.splice(j, 1);
                break;
            }
        }
    }
}

function distance(obj1, obj2) {
    return Math.sqrt((obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2);
}

function drawAsteroid(asteroid) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
        asteroid.x + asteroid.radius * asteroid.offsets[0] * Math.cos(asteroid.angle),
        asteroid.y + asteroid.radius * asteroid.offsets[0] * Math.sin(asteroid.angle)
    );
    for (let j = 1; j < asteroid.vert; j++) {
        ctx.lineTo(
            asteroid.x + asteroid.radius * asteroid.offsets[j] * Math.cos(asteroid.angle + j * Math.PI * 2 / asteroid.vert),
            asteroid.y + asteroid.radius * asteroid.offsets[j] * Math.sin(asteroid.angle + j * Math.PI * 2 / asteroid.vert)
        );
    }
    ctx.closePath();
    ctx.stroke();
}

function isOffscreen(obj) {
    return obj.x + obj.radius < 0 ||
           obj.x - obj.radius > canvas.width ||
           obj.y + obj.radius < 0 ||
           obj.y - obj.radius > canvas.height;
}

const ASTEROID_NUM = 5;
const ASTEROID_SPEED = 1;
const ASTEROID_SIZE_LARGE = 30;
const ASTEROID_SIZE_MEDIUM = 20;
const ASTEROID_SIZE_SMALL = 10;
const SCORE_LARGE = 20;
const SCORE_MEDIUM = 50;
const SCORE_SMALL = 100;
const ASTEROID_VERT = 10;
const ASTEROID_JAG = 0.5;

const asteroids = [];

function createAsteroids() {
    for (let i = 0; i < ASTEROID_NUM; i++) {
        const x = Math.random() < 0.5 ? 0 - ASTEROID_SIZE_LARGE : canvas.width + ASTEROID_SIZE_LARGE;
        const y = Math.random() * canvas.height;
        asteroids.push(newAsteroid(x, y, ASTEROID_SIZE_LARGE));
    }
}

function newAsteroid(x, y, radius) {
    const angle = Math.random() * Math.PI * 2;
    const vel = {
        x: Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1),
        y: Math.random() * ASTEROID_SPEED * (Math.random() < 0.5 ? 1 : -1)
    };

    const vert = Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2);
    const offsets = [];
    for (let i = 0; i < vert; i++) {
        offsets.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
    }

    return { x, y, radius, vel, angle, vert, offsets };
}

createAsteroids();
update();

function resetGame() {
    if (lives <= 0) {
        gameOver = true;
        return;
    }

    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.vel.x = 0;
    player.vel.y = 0;
    asteroids.length = 0;
    createAsteroids();
}

function restartGame() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    score = 0;
    lives = LIVES_START;
    gameOver = false;
    resetGame();
}
