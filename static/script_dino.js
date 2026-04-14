const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0; // Recupera o recorde salvo
let gameSpeed = 6;
let isGameOver = false;
let gameStarted = false; // O jogo começa parado
let obstacleTimer = 0; 

const dino = {
    x: 50,
    y: 150,
    width: 44,
    height: 44,
    dy: 0,
    jumpForce: 12,
    gravity: 0.6,
    grounded: false
};

const obstacles = [];

function drawDino() {
    ctx.fillStyle = "#535353";
    ctx.fillRect(dino.x, dino.y + 15, 30, 20); 
    ctx.fillRect(dino.x + 20, dino.y, 20, 15); 
    ctx.fillRect(dino.x + 35, dino.y + 5, 10, 10); 
    ctx.fillRect(dino.x - 5, dino.y + 15, 10, 10); 
    ctx.fillRect(dino.x + 5, dino.y + 35, 6, 8); 
    ctx.fillRect(dino.x + 20, dino.y + 35, 6, 8); 
}

function drawCactus(obs) {
    ctx.fillStyle = "#535353";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.fillRect(obs.x - 6, obs.y + 10, 6, 15);
    ctx.fillRect(obs.x + obs.width, obs.y + 5, 6, 15);
}

function drawBird(obs) {
    ctx.fillStyle = "#535353";
    ctx.fillRect(obs.x, obs.y, obs.width, 15);
    ctx.fillRect(obs.x + 5, obs.y - 10, 10, 10);
    ctx.fillRect(obs.x + 15, obs.y + 15, 10, 10);
    ctx.fillRect(obs.x - 5, obs.y + 5, 5, 5);
}

function spawnObstacle() {
    const type = Math.random();
    if (type > 0.3) {
        let height = Math.random() * (50 - 30) + 30;
        obstacles.push({ type: 'cactus', x: canvas.width, y: canvas.height - height, width: 15, height: height });
    } else {
        let birdY = Math.random() > 0.5 ? 100 : 140; 
        obstacles.push({ type: 'bird', x: canvas.width, y: birdY, width: 30, height: 15 });
    }
}

function update() {
    if (!gameStarted || isGameOver) return; // Só atualiza se o jogo começou

    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y + dino.height > canvas.height) {
        dino.y = canvas.height - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    }

    obstacleTimer++;
    if (obstacleTimer > 50) { 
        if (Math.random() < 0.04) {
            spawnObstacle();
            obstacleTimer = 0;
        }
    }

    obstacles.forEach((obs, index) => {
        obs.x -= gameSpeed;

        if (dino.x < obs.x + obs.width &&
            dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height &&
            dino.y + dino.height > obs.y) {
            
            isGameOver = true;
            
            // Salva o High Score se o score atual for maior
            if (score > highScore) {
                highScore = Math.floor(score);
                localStorage.setItem('dinoHighScore', highScore);
            }
            
            alert("GAME OVER! Score: " + Math.floor(score));
            location.reload();
        }

        if (obs.x + obs.width < 0) obstacles.splice(index, 1);
    });

    score += 0.1;
    gameSpeed += 0.001;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = "#535353";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();

    drawDino();

    if (!gameStarted) {
        ctx.fillStyle = "#535353";
        ctx.font = "24px Courier New";
        ctx.textAlign = "center";
        ctx.fillText("PRESSIONE ESPAÇO PARA COMEÇAR", canvas.width / 2, canvas.height / 2);
    } else {
        obstacles.forEach(obs => {
            if (obs.type === 'cactus') drawCactus(obs);
            else drawBird(obs);
        });
    }

    // Placar e Recorde
    ctx.fillStyle = "#535353";
    ctx.font = "18px Courier New";
    ctx.textAlign = "left";
    ctx.fillText("HI: " + String(highScore).padStart(5, '0') + "  SCORE: " + String(Math.floor(score)).padStart(5, '0'), 550, 30);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (!gameStarted) {
            gameStarted = true; // Inicia o movimento
        }
        if (dino.grounded) {
            dino.dy = -dino.jumpForce;
            dino.grounded = false;
        }
    }
});

loop();