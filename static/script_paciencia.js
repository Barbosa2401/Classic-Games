const suits = ['h', 'd', 'c', 's']; 
const valMap = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
const symbols = { 'h': '♥', 'd': '♦', 'c': '♣', 's': '♠' };

let deck = [];
let draggedCard = null;
let sourcePile = null;

// 1. Criação e Embaralhamento
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let val in valMap) {
            deck.push({ 
                suit, val, 
                color: (suit === 'h' || suit === 'd') ? 'red' : 'black',
                faceUp: false 
            });
        }
    }
    deck.sort(() => Math.random() - 0.5);
}

// 2. CRIAÇÃO DO ELEMENTO HTML (Ajustado para guardar dados persistentes)
function createCardElement(cardData) {
    const div = document.createElement('div');
    // Adicionamos a classe 'back' se ela estiver virada para baixo
    div.className = `card ${cardData.faceUp ? '' : 'back'} ${cardData.color}`;
    
    // IMPORTANTE: Toda carta agora nasce com seus dados guardados no dataset,
    // mesmo que esteja virada para baixo (para o JS saber quem ela é depois).
    div.dataset.val = cardData.val;
    div.dataset.suit = cardData.suit;
    div.dataset.color = cardData.color;
    
    // Se estiver virada para cima, mostramos o visual e permitimos arrastar
    if (cardData.faceUp) {
        div.draggable = true;
        div.innerHTML = `<span>${cardData.val}</span><span>${symbols[cardData.suit]}</span>`;
        div.addEventListener('dragstart', handleDragStart);
    }
    return div;
}

// 3. DISTRIBUIÇÃO INICIAL (Garante que o Tableau receba as cartas aleatórias)
function setupTableau() {
    const tableau = document.getElementById('tableau');
    tableau.innerHTML = ''; 
    
    for (let i = 0; i < 7; i++) {
        const column = document.createElement('div');
        column.className = 'pile tableau-column';
        column.id = `col-${i}`;
        
        for (let j = 0; j <= i; j++) {
            const cardData = deck.pop();
            if (j === i) cardData.faceUp = true; 
            const cardDiv = createCardElement(cardData);
            cardDiv.style.top = `${j * 25}px`;
            column.appendChild(cardDiv);
        }
        tableau.appendChild(column);
    }
}

function setupStock() {
    const stockEl = document.getElementById('deck');
    const wasteEl = document.getElementById('waste');
    
    stockEl.onclick = () => {
        if (deck.length > 0) {
            // Saca uma carta do monte para o descarte
            const cardData = deck.pop();
            cardData.faceUp = true;
            const cardDiv = createCardElement(cardData);
            wasteEl.appendChild(cardDiv);
        } else {
            // LÓGICA DE RECICLAGEM:
            const wasteCards = wasteEl.querySelectorAll('.card');
            
            if (wasteCards.length === 0) {
                alert("Não há mais cartas disponíveis no sistema.");
                return;
            }

            // Transfere do visual (waste) de volta para o dado (deck)
            wasteCards.forEach(cardDiv => {
                deck.push({
                    val: cardDiv.dataset.val,
                    suit: cardDiv.dataset.suit,
                    color: cardDiv.dataset.color,
                    faceUp: false
                });
                cardDiv.remove(); // Remove do HTML do descarte
            });

            // Inverte o array para manter a ordem original de saída (opcional)
            deck.reverse();
            
            alert("Reciclando baralho...");
        }
    };
}

// 4. LÓGICA DE ARRASTAR E SOLTAR (Drag and Drop)
function handleDragStart(e) {
    draggedCard = e.target;
    sourcePile = e.target.parentElement;
    e.dataTransfer.setData('text/plain', ''); 
}

function setupEvents() {
    const piles = document.querySelectorAll('.pile');
    piles.forEach(pile => {
        pile.addEventListener('dragover', e => e.preventDefault());
        pile.addEventListener('drop', handleDrop);
    });
}

function handleDrop(e) {
    e.preventDefault();
    const targetPile = e.target.closest('.pile');
    
    if (targetPile && isValidMove(draggedCard, targetPile)) {
        targetPile.appendChild(draggedCard);
        
        if (targetPile.classList.contains('tableau-column')) {
            const cardsInPile = targetPile.querySelectorAll('.card').length;
            draggedCard.style.top = `${(cardsInPile - 1) * 25}px`;
        } else {
            draggedCard.style.top = '0px'; 
        }

        // --- SOLUÇÃO REAL PARA VIRAR A CARTA (Adeus ao '?') ---
        if (sourcePile.classList.contains('tableau-column') && sourcePile.lastElementChild) {
            const top = sourcePile.lastElementChild;
            if (top.classList.contains('back')) {
                // Remove a face de trás
                top.classList.remove('back');
                top.draggable = true;
                
                // Agora pegamos os dados reais que guardamos nela escondidos (no dataset)!
                const val = top.dataset.val;
                const suit = top.dataset.suit;
                
                // E geramos o visual dela. Sem '?'!
                top.innerHTML = `<span>${val}</span><span>${symbols[suit]}</span>`;
                top.addEventListener('dragstart', handleDragStart);
            }
        }
    }
}

// 5. VALIDAÇÃO DE REGRAS
function isValidMove(card, targetPile) {
    const topCard = targetPile.lastElementChild;
    const cardVal = valMap[card.dataset.val];

    // Regra: Coluna Vazia aceita apenas Rei (K)
    if (targetPile.classList.contains('tableau-column') && !topCard) {
        return card.dataset.val === 'K';
    }

    // Regra: Fundação (Topo) aceita mesmo naipe e ordem crescente
    if (targetPile.classList.contains('foundation')) {
        const targetSuit = targetPile.dataset.suit;
        if (card.dataset.suit !== targetSuit) return false;
        if (!topCard) return card.dataset.val === 'A';
        return cardVal === valMap[topCard.dataset.val] + 1;
    }

    // Regra: Coluna com cartas (Cor oposta e valor menor)
    if (targetPile.classList.contains('tableau-column')) {
        const topVal = valMap[topCard.dataset.val];
        const cardColor = card.dataset.color;
        const topColor = topCard.dataset.color;
        return (cardColor !== topColor && cardVal === topVal - 1);
    }
    return false;
}

// 6. INICIALIZAÇÃO COMPLETA
function init() {
    createDeck();
    setupTableau(); // Renderiza as colunas
    setupStock();   // Prepara o monte
    setupEvents();  // Habilita o drag and drop
}

init();