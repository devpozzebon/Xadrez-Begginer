//Mapeamento das peças do xadrez
const PEÇAS = {
    //brancas
    'P': '♙', //Peão
    'C': '♘', //Cavalo
    'B': '♗', //Bispo
    'T': '♖', //Torre
    'D': '♕', //Dama
    'R': '♔', //Rei
    //pretas
    'p': '♟', //Peão
    'c': '♞', //Cavalo
    'b': '♝', //Bispo
    't': '♜', //Torre
    'd': '♛', //Dama
    'r': '♚'  //Rei
};

//Direção de movimento no array
const DIRECAO ={
    BRANCA: -1, //Peças brancas se movem 'para cima' no array(ex: 6 para 5)
    PRETA: 1 //Peças pretas se movem 'para baixo' no array(ex: 1 para 2)
};

//linhas iniciais
const LINHA_INICIAL = {
    BRANCA: 6,
    PRETA: 1
};

//Configuração do tabuleiro no HTML
let tabuleiroEstado = [
    ['t', 'c', 'b', 'd', 'r', 'b', 'c', 't'], // 0
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // 1
    ['.', '.', '.', '.', '.', '.', '.', '.'], // 2
    ['.', '.', '.', '.', '.', '.', '.', '.'], // 3
    ['.', '.', '.', '.', '.', '.', '.', '.'], // 4
    ['.', '.', '.', '.', '.', '.', '.', '.'], // 5
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // 6
    ['T', 'C', 'B', 'D', 'R', 'B', 'C', 'T']  // 7
];

const tabuleiroElemento = document.getElementById('tabuleiro');
let casaSelecionada = null; // Armazena a casa { linha, coluna, peca } selecionada

//Função auxiliar para marcar uma casa como movimento válido
function marcarCasaComoValida(linha, coluna) {
    // Verifica se as coordenadas estão dentro do tabuleiro
    if (linha >= 0 && linha < 8 && coluna >= 0 && coluna < 8) {
        // Busca o elemento da casa no DOM
        const casa = document.querySelector(`[data-linha="${linha}"][data-coluna="${coluna}"]`);
        if (casa) {
            casa.classList.add('possivel-movimento');
        }
    }
}

// ------------------------------------------------------------------
// Função para mover a peça no array e re-renderizar o tabuleiro
// ------------------------------------------------------------------
function moverPeca(linhaDestino, colunaDestino) {
    if (!casaSelecionada) return;

    const linhaOrigem = casaSelecionada.linha;
    const colunaOrigem = casaSelecionada.coluna;
    const peca = casaSelecionada.peca;

    // 1. Atualiza o array de estado: move a peça para o destino
    tabuleiroEstado[linhaDestino][colunaDestino] = peca;
    
    // 2. Atualiza o array de estado: esvazia a casa de origem
    tabuleiroEstado[linhaOrigem][colunaOrigem] = '.';

    // 3. Limpa a seleção e renderiza o novo tabuleiro
    casaSelecionada = null;
    renderizarTabuleiro(); 
    
    document.getElementById('mensagem-jogo').textContent = `Peça movida com sucesso!`;
}


//Função para renderizar o tabuleiro
function renderizarTabuleiro() {
    tabuleiroElemento.innerHTML = ''; // Limpa o tabuleiro antes de renderizar
    for (let linha = 0; linha < 8; linha++) {
        for (let coluna = 0; coluna < 8; coluna++) {
            // Cria a casa do tabuleiro
            const casa = document.createElement('div');
            casa.classList.add('casa');

            // Define a cor da casa
            if ((linha + coluna) % 2 === 0) {
                casa.classList.add('clara');
            } else {
                casa.classList.add('escura');
            }

            //Adiciona coordenadas para uso futuro
            casa.dataset.linha = linha;
            casa.dataset.coluna = coluna;

            //coloca a peça na casa, se houver
            const peça = tabuleiroEstado[linha][coluna];

            if (peça !== '.') { 
                casa.innerHTML = PEÇAS[peça]; 

                //estilo da cor das peças
                if (peça === peça.toUpperCase()) { 
                    casa.style.color = 'white'; //peças brancas
                } else {
                    casa.style.color = 'black'; //peças pretas
                }
            }

            //Adiciona a casa ao tabuleiro
            tabuleiroElemento.appendChild(casa);

            //Adiciona evento de clique para mostrar movimentos
            casa.addEventListener('click', aoClicarNaCasa);
        }
    }
}

//Inicializa o tabuleiro
renderizarTabuleiro();

function aoClicarNaCasa(event) {
    const casaClicada = event.currentTarget;
    const linha = parseInt(casaClicada.dataset.linha);
    const coluna = parseInt(casaClicada.dataset.coluna);
    const peca = tabuleiroEstado[linha][coluna];

    // --- CENÁRIO 1: Mover uma peça JÁ selecionada ---
    if (casaSelecionada) {
        // Verifica se a casa clicada é um movimento válido (está destacada)
        if (casaClicada.classList.contains('possivel-movimento')) {
            moverPeca(linha, coluna);
            return; // Movimento executado, sai da função
        }
    }
    // ------------------------------------------------

    // Limpa seleções e dicas anteriores
    document.querySelectorAll('.selecionada, .possivel-movimento').forEach(el => {
        el.classList.remove('selecionada', 'possivel-movimento');
    });
    casaSelecionada = null;

    // Se a casa clicada contém uma peça: Seleciona a peça
    if (peca !== '.') {
        casaClicada.classList.add('selecionada');
        casaSelecionada = { linha, coluna, peca };

        // Chama Função de calculos dos movimentos permitidos para a peça
        mostrarMovimentosValidos(linha, coluna, peca);
    }
}

// ----------------------------------------------------
// Função principal para calcular e mostrar movimentos válidos
// ----------------------------------------------------
function mostrarMovimentosValidos(linha, coluna, peca) {
    const isBranca = peca === peca.toUpperCase();
    const direcao = isBranca ? DIRECAO.BRANCA : DIRECAO.PRETA;
    const linhaInicial = isBranca ? LINHA_INICIAL.BRANCA : LINHA_INICIAL.PRETA;

    // Função auxiliar para verificar se a peça na posição (l, c) é inimiga
    function isInimigo(l, c) {
        const pecaAlvo = tabuleiroEstado[l][c];
        if (pecaAlvo === '.') return false; // Casa vazia
        const isAlvoBranca = pecaAlvo === pecaAlvo.toUpperCase();
        return isBranca !== isAlvoBranca; // Retorna true se forem de cores diferentes
    }

    // Função auxiliar para verificar se a casa é segura (vazia ou inimiga)
    function isCasaSegura(l, c) {
        if (l < 0 || l >= 8 || c < 0 || c >= 8) return false;
        const pecaAlvo = tabuleiroEstado[l][c];
        return pecaAlvo === '.' || isInimigo(l, c);
    }

    // CORRIGIDO: Função genérica para peças que se movem em linha reta (Torre, Bispo, Dama)
    function verificarCaminho(direcoes) {
        direcoes.forEach(([dLinha, dColuna]) => {
            // CORRIGIDO: O loop agora usa 'i' e a lógica de verificação está dentro.
            for (let i = 1; i < 8; i++) {
                const novaLinha = linha + dLinha * i;
                const novaColuna = coluna + dColuna * i;

                // 1. Verifica se saiu do tabuleiro
                if (novaLinha < 0 || novaLinha >= 8 || novaColuna < 0 || novaColuna >= 8) {
                    break; // Sai do loop (para de procurar nesta direção)
                }

                const pecaAlvo = tabuleiroEstado[novaLinha][novaColuna];

                if (pecaAlvo === '.') {
                    // 2. Casa vazia: Movimento válido, continua na mesma direção
                    marcarCasaComoValida(novaLinha, novaColuna);
                } else if (isInimigo(novaLinha, novaColuna)) {
                    // 3. Peça inimiga: Captura válida e para o movimento nesta direção
                    marcarCasaComoValida(novaLinha, novaColuna);
                    break; 
                } else {
                    // 4. Peça amiga: Bloqueia o movimento
                    break; 
                }
            }
        });
    }

    // Remove qualquer destaque de movimento para limpar a tela
    document.querySelectorAll('.possivel-movimento').forEach(el => {
        el.classList.remove('possivel-movimento');
    });

    const pecaBase = peca.toLowerCase();
    let mensagem = `Peça '${PEÇAS[peca]}' selecionada. Clique em uma casa destacada para mover.`;

    // ----------------------------------------------------
    // Lógica de movimento para Peão (P e p) - Avanço
    // ----------------------------------------------------
    if (pecaBase === 'p') {
        // 1. MOVIMENTO DE UMA CASA PARA FRENTE
        const novaLinha1 = linha + direcao;
        if (novaLinha1 >= 0 && novaLinha1 < 8 && tabuleiroEstado[novaLinha1][coluna] === '.') {
            marcarCasaComoValida(novaLinha1, coluna);

            if (linha === linhaInicial) {
                // 2. MOVIMENTO DE DUAS CASAS (PRIMEIRO MOVIMENTO)
                const novaLinha2 = linha + 2 * direcao;
                if (tabuleiroEstado[novaLinha2][coluna] === '.') {
                    marcarCasaComoValida(novaLinha2, coluna);
                }
            }
        }

        // Captura diagonal (esquerda e direita)
        [-1, 1].forEach(colOffset => {
            const linhaCaptura = linha + direcao;
            const colunaCaptura = coluna + colOffset;

            if (linhaCaptura >= 0 && linhaCaptura < 8 && colunaCaptura >= 0 && colunaCaptura < 8) {
                if (isInimigo(linhaCaptura, colunaCaptura)) {
                    marcarCasaComoValida(linhaCaptura, colunaCaptura);
                }
            }
        });
    }
    
    // Lógica de movimento para a torre (T e t)
    else if (pecaBase === 't') {
        // Torre se move em linha reta (horizontal e vertical)
        const direcoesTorre = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        verificarCaminho(direcoesTorre);
    }

    // ----------------------------------------------------
    // Lógica de movimento para o Bispo (B e b)
    else if (pecaBase === 'b') {
        // Bispo se move em diagonais
        const direcoesBispo = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        verificarCaminho(direcoesBispo);
    }

    // ----------------------------------------------------
    // Lógica de movimento para a Dama (D e d)
    else if (pecaBase === 'd') {
        // Combinação de Torre e Bispo
        const direcoesDama = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Torre
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Bispo
        ];
        verificarCaminho(direcoesDama);
    }

    // ----------------------------------------------------
    //Lógica de movimento do cavalo (C e c)
    else if (pecaBase === 'c') {
        const movimentosL = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2], [1, 2],
            [2, -1], [2, 1]
        ];

        movimentosL.forEach(([dLinha, dColuna]) => {
            const novaLinha = linha + dLinha;
            const novaColuna = coluna + dColuna;

            // O Cavalo Salta
            if (isCasaSegura(novaLinha, novaColuna)) {
                marcarCasaComoValida(novaLinha, novaColuna);
            }
        });
    }

    // ----------------------------------------------------
    // Lógica de movimento para o Rei (R e r)
    else if (pecaBase === 'r') {
        const movimentos1Casa = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        movimentos1Casa.forEach(([dLinha, dColuna]) => {
            const novaLinha = linha + dLinha;
            const novaColuna = coluna + dColuna;

            if (isCasaSegura(novaLinha, novaColuna)) {
                marcarCasaComoValida(novaLinha, novaColuna);
            }
        });
    }

    // Adiciona mensagem de instrução para o jogador (uso consistente da variável 'mensagem')
    document.getElementById('mensagem-jogo').textContent = mensagem;
}