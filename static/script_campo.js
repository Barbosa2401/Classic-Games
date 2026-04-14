const gridElement = document.getElementById('grid');
const rows = 10;
const cols = 10;
const minesCount = 10;
let board = [];

function init() {
    // 1. LIMPEZA TOTAL: Garante que o jogo anterior suma da tela e da memória
    gridElement.innerHTML = ''; 
    board = []; 

    // 2. CRIAÇÃO DA MATRIZ: Monta a grade 10x10
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            
            // Adicionamos os eventos de clique
            cellElement.onclick = () => revealCell(r, c);
            cellElement.oncontextmenu = (e) => {
                e.preventDefault();
                toggleFlag(r, c);
            };

            gridElement.appendChild(cellElement);

            // Objeto que representa cada quadrado no código
            board[r][c] = { 
                isMine: false, 
                revealed: false, 
                flagged: false, 
                count: 0, 
                element: cellElement 
            };
        }
    }

    // 3. PLANTAÇÃO DE MINAS: Sorteio aleatório
    let planted = 0;
    while (planted < minesCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (!board[r][c].isMine) {
            board[r][c].isMine = true;
            planted++;
        }
    }

    // 4. CÁLCULO DOS NÚMEROS: Varredura dos 8 vizinhos
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (board[r][c].isMine) continue;
            let minesAround = 0;

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr;
                    let nc = c + dc;
                    // Verifica se o vizinho está dentro dos limites do tabuleiro
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                        if (board[nr][nc].isMine) minesAround++;
                    }
                }
            }
            board[r][c].count = minesAround;
        }
    }
}

function revealCell(r, c) {
    const cell = board[r][c];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    cell.element.classList.add('revealed');

    // Se clicar na bomba, o jogo para
    if (cell.isMine) {
        cell.element.classList.add('mine');
        cell.element.innerText = '💣';
        setTimeout(() => {
            alert("GAME OVER! BOMBA DETONADA.");
            init(); // Reinicia automaticamente
        }, 100);
        return;
    }

    // Se tiver bomba perto, mostra o número
    if (cell.count > 0) {
        cell.element.innerText = cell.count;
        cell.element.style.color = getNumberColor(cell.count);
    } else {
        // Se for zero, abre os vizinhos (Recursividade)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                let nr = r + dr;
                let nc = c + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealCell(nr, nc);
                }
            }
        }
    }
}

function toggleFlag(r, c) {
    const cell = board[r][c];
    if (cell.revealed) return;
    cell.flagged = !cell.flagged;
    cell.element.classList.toggle('flag');
    cell.element.innerText = cell.flagged ? '🚩' : '';
}

// Cores clássicas para os números
function getNumberColor(num) {
    const colors = ["", "blue", "green", "red", "darkblue", "brown", "cyan", "black", "grey"];
    return colors[num] || "white";
}

// Inicia o sistema
init();