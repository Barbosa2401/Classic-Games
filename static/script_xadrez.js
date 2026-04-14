var board = null;
var game = new Chess(); // Cria uma nova instância de lógica de xadrez
var $status = $('#status');
var $turno = $('#turno');

function onDragStart (source, piece, position, orientation) {
    // Não permite mover se o jogo acabou
    if (game.game_over()) return false;

    // Só permite mover a peça da cor do turno atual
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

var modoXadrez = 'pvp';

// Captura a mudança no select
$('#modo-xadrez').on('change', function() {
    modoXadrez = $(this).val();
    resetarJogo();
});

function onDrop (source, target) {
    // Jogada do Humano
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    if (move === null) return 'snapback';

    atualizarStatus();

    // SE for modo Robô e for a vez das Pretas (b)
    if (modoXadrez === 'pve' && game.turn() === 'b' && !game.game_over()) {
        // Dá um tempinho de 500ms para o robô "pensar"
        window.setTimeout(fazerJogadaDoRobo, 500);
    }
}

function fazerJogadaDoRobo() {
    var jogadasPossiveis = game.moves();

    // Se não houver jogadas, o jogo acabou
    if (jogadasPossiveis.length === 0) return;

    // ESTRATÉGIA DO ROBÔ:
    // Por enquanto, ele escolhe uma jogada aleatória
    var indiceAleatorio = Math.floor(Math.random() * jogadasPossiveis.length);
    game.move(jogadasPossiveis[indiceAleatorio]);

    // Atualiza o visual do tabuleiro e o status
    board.position(game.fen());
    atualizarStatus();
}

function resetarJogo() {
    game.reset();
    board.start();
    atualizarStatus();
}

// Atualiza a posição no tabuleiro após animações (ex: captura)
function onSnapEnd () {
    board.position(game.fen());
}

function atualizarStatus () {
    var status = '';
    var vez = (game.turn() === 'w') ? 'Brancas' : 'Pretas';

    if (game.in_checkmate()) {
        status = 'XEQUE-MATE! ' + vez + ' perderam.';
    } else if (game.in_draw()) {
        status = 'EMPATE!';
    } else {
        status = 'Em jogo';
        if (game.in_check()) {
            status += ' (XEQUE!)';
        }
    }

    $status.html(status);
    $turno.html(vez);
}

var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};

board = Chessboard('myBoard', config);
atualizarStatus();

// Botão de Reset
$('#resetBtn').on('click', function() {
    game.reset();
    board.start();
    atualizarStatus();
});