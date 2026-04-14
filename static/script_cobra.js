const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const pontuacaoElemento = document.getElementById("pontuacao");

const box = 20; // Tamanho do quadrado
let pontos = 0;
let direcao = "RIGHT";
let jogoAtivo = true;

// Inicializa a cobra no meio
let snake = [
    { x: 9 * box, y: 10 * box },
    { x: 8 * box, y: 10 * box }
];

let comida = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
};

// Captura as teclas
document.addEventListener("keydown", mudarDirecao);

function mudarDirecao(event) {
    if (event.keyCode == 37 && direcao != "RIGHT") direcao = "LEFT";
    else if (event.keyCode == 38 && direcao != "DOWN") direcao = "UP";
    else if (event.keyCode == 39 && direcao != "LEFT") direcao = "RIGHT";
    else if (event.keyCode == 40 && direcao != "UP") direcao = "DOWN";
}

function desenhar() {
    if (!jogoAtivo) return;

    // Limpa o fundo
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a cobra
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#00ff41" : "#008f11";
        ctx.strokeStyle = "black";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    // Desenha a comida
    ctx.fillStyle = "red";
    ctx.fillRect(comida.x, comida.y, box, box);

    // Posição da cabeça
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direcao == "LEFT") snakeX -= box;
    if (direcao == "UP") snakeY -= box;
    if (direcao == "RIGHT") snakeX += box;
    if (direcao == "DOWN") snakeY += box;

    // Lógica de comer a maçã
    if (snakeX == comida.x && snakeY == comida.y) {
        pontos++;
        pontuacaoElemento.innerText = pontos;
        comida = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
    } else {
        snake.pop(); // Remove a cauda
    }

    let novaCabeca = { x: snakeX, y: snakeY };

    // Game Over: Bater na parede ou em si mesma
    if (snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || colisao(novaCabeca, snake)) {
        clearInterval(gameLoop);
        jogoAtivo = false;
        alert("CONEXÃO PERDIDA! Pontuação: " + pontos);
        
        // FUTURO: Aqui você chamará o fetch para salvar os 'pontos' no seu banco SQL
    }

    snake.unshift(novaCabeca);
}

function colisao(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

let gameLoop = setInterval(desenhar, 100);