let modoAtual = "pve"; 
let player1 = "Jogador 1";
let player2 = "Robô";

document.getElementById('btn-comecar').addEventListener('click', () => {
    modoAtual = document.getElementById('modo-jogo').value;
    player1 = document.getElementById('nome-jogador1').value || "Jogador 1";
    player2 = document.getElementById('nome-jogador2').value || (modoAtual === "pve" ? "Robô" : "Jogador 2");
    alert(`Modo: ${modoAtual} | ${player1} vs ${player2}`);
    resetGame(); // Chama a função de limpar o tabuleiro
});

const botaoConfirmar = document.getElementById('btn-comecar');

if (botaoConfirmar) {
    botaoConfirmar.addEventListener('click', () => {
        console.log("Botão Confirmar clicado!"); // Debug no F12
        
        // Pega os valores dos inputs
        modoAtual = document.getElementById('modo-jogo').value;
        player1 = document.getElementById('nome-jogador1').value || "Jogador 1";
        player2 = document.getElementById('nome-jogador2').value || (modoAtual === "pve" ? "Robô" : "Jogador 2");

        // Atualiza o placar visual
        document.getElementById('nome-usuario').innerText = player1;
        
        alert(`Jogo Iniciado: ${player1} vs ${player2}`);
        
        // Chama a função que limpa o tabuleiro para começar do zero
        resetGame(); 
    });
}

const boardElement = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');

let currentPlayer = "X";
let boardState = ["", "", "", "", "", "", "", "", ""];
let gameActive = true;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
];

function handleCellClick(e) {
    const clickedCell = e.target;
    const index = clickedCell.getAttribute('data-index');

    // 1. Só permite clicar se for a vez do X (Humano) e a célula estiver vazia
    if (boardState[index] !== "" || !gameActive || currentPlayer !== "X") return;

    // 2. Humano joga
    makeMove(index, "X");

    // 3. Se o jogo continuar e for modo Robô, chama o robô
    if (gameActive && modoAtual === "pve") {
        currentPlayer = "O"; // Muda para o Robô
        statusText.innerText = "Robô pensando...";
        setTimeout(robotMove, 500);
    } else if (gameActive) {
        // Se for contra outra pessoa (PvP), apenas alterna
        currentPlayer = "O";
        statusText.innerText = `Vez de ${player2} (O)`;
    }
}

function robotMove() {
    if (!gameActive) return;

    const emptyIndices = boardState.map((val, idx) => val === "" ? idx : null).filter(val => val !== null);
    
    if (emptyIndices.length > 0) {
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        
        // 4. Robô joga
        makeMove(randomIndex, "O");

        // 5. MUITO IMPORTANTE: Após o robô jogar, volta para o Humano (X)
        if (gameActive) {
            currentPlayer = "X";
            statusText.innerText = `Sua vez, ${player1}!`;
        }
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].innerText = player;
    checkResult(); // Verifica vitória/empate LOGO APÓS marcar
}

function checkResult() {
    let roundWon = false;
    let winningLine = null;

    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        let a = boardState[condition[0]];
        let b = boardState[condition[1]];
        let c = boardState[condition[2]];

        if (a === "" || b === "" || c === "") continue;

        if (a === b && b === c) {
            roundWon = true;
            winningLine = condition;
            break;
        }
    }

    if (roundWon) {
        statusText.innerText = `Jogador ${currentPlayer} Venceu!`;
        gameActive = false; // Isso impede novas jogadas
        
        // Opcional: Destacar as células vitoriosas
        winningLine.forEach(index => {
            cells[index].style.color = "#2ecc71"; // Cor verde para vitória
        });

        // Chamar o banco de dados
        salvarNoBanco(); 
        return; // SAI DA FUNÇÃO AQUI PARA NÃO DAR EMPATE
    }

    // Só verifica empate se ninguém ganhou
    if (!boardState.includes("")) {
        statusText.innerText = "Empate!";
        gameActive = false;
    }
}

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    cells.forEach(cell => {
        cell.innerText = "";
        cell.style.color = "white"; 
    });
    statusText.innerText = `Vez de ${player1} (X)`;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

document.getElementById('reset-btn').addEventListener('click', function() {
    console.log("Botão de reiniciar clicado!"); // Isso vai aparecer no F12 se funcionar
    resetGame();
});