// =========================================================================
// PASSO 1: CONFIGURACAO DA CONEXAO COM O SUPABASE
// =========================================================================
// Antes de editar aqui, lembre-se de adicionar o script do Supabase via CDN
// dentro da tag <head> do arquivo index.html.

const supabaseUrl = 'https://rnnsvpuivklhztmalccm.supabase.co';
const supabaseKey = 'sb_publishable_-GJJFcWX0zmDepAbXESiMA_r84ZWr_n';

// Elementos da tela
const statusEl = document.getElementById('status-conexao');
const listaProdutosEl = document.getElementById('lista-produtos');
const formProdutoEl = document.getElementById('form-produto');
const mensagemFormEl = document.getElementById('mensagem-form');
const btnRecarregarEl = document.getElementById('btn-recarregar');

let supabaseClient = null;

function atualizarStatus(texto, tipo) {
    statusEl.textContent = texto;
    statusEl.className = 'status status-' + tipo;
}

// Verifica se o CDN foi importado no index.html e se as chaves foram preenchidas
function inicializarConexao() {
    if (typeof window.supabase === 'undefined') {
        atualizarStatus('Biblioteca do Supabase nao encontrada: adicione o CDN no <head> do index.html', 'aviso');
        return false;
    }

    if (
        supabaseUrl.includes('COLE_SUA_PROJECT_URL_AQUI') ||
        supabaseKey.includes('COLE_SUA_PUBLISHABLE_KEY_AQUI')
    ) {
        atualizarStatus('CDN carregado! Agora cole sua Project URL e Publishable key no script.js', 'aviso');
        return false;
    }

    // Usamos o nome "supabaseClient" para evitar conflito com o objeto global do CDN
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    return true;
}

// =========================================================================
// PASSO 2: BUSCAR ITENS DO CARDAPIO (EQUIVALE A: SELECT * FROM produto)
// =========================================================================
async function buscarProdutos() {
    if (!supabaseClient) return;

    listaProdutosEl.innerHTML = '<p class="vazio">Carregando cardapio do banco...</p>';

    const { data, error } = await supabaseClient
        .from('produto')
        .select('*')
        .order('id_produto', { ascending: false });

    if (error) {
        console.error('Erro ao buscar itens do cardapio:', error);
        atualizarStatus('Erro ao conectar: verifique o Console (F12)', 'erro');
        listaProdutosEl.innerHTML = '<p class="vazio">Nao foi possivel carregar o cardapio.</p>';
        return;
    }

    atualizarStatus('Conectado ao Supabase (' + data.length + ' itens no cardapio)', 'sucesso');
    renderizarProdutos(data);
}

// Desenha os cards do cardapio na tela HTML
function renderizarProdutos(produtos) {
    if (!produtos || produtos.length === 0) {
        listaProdutosEl.innerHTML = '<p class="vazio">A tabela produto esta vazia.</p>';
        return;
    }

    listaProdutosEl.innerHTML = '';

    produtos.forEach(function (item) {
        const precoFormatado = Number(item.preco).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const categoriaTexto = item.categoria || 'Geral';

        const card = document.createElement('div');
        card.className = 'item-produto';
        card.innerHTML =
            '<div class="item-topo">' +
                '<span class="categoria-badge">' + categoriaTexto + '</span>' +
                '<span class="id-badge">#' + item.id_produto + '</span>' +
            '</div>' +
            '<h3>' + item.nome + '</h3>' +
            '<div class="preco">' + precoFormatado + '</div>';

        listaProdutosEl.appendChild(card);
    });
}

// =========================================================================
// PASSO 3 (DESAFIO): CADASTRAR ITEM (EQUIVALE A: INSERT INTO produto)
// =========================================================================
async function cadastrarProduto(event) {
    event.preventDefault(); // Evita que a pagina recarregue ao enviar o formulario

    if (!supabaseClient) {
        mensagemFormEl.textContent = 'Configure o CDN e as chaves do Supabase antes de cadastrar.';
        return;
    }

    const nome = document.getElementById('nome-produto').value.trim();
    const categoria = document.getElementById('categoria-produto').value;
    const preco = parseFloat(document.getElementById('preco-produto').value);

    // ---------------------------------------------------------------------
    // DESAFIO DO ALUNO:
    // Substitua o aviso abaixo pelo comando .insert() do Supabase para
    // salvar { nome: nome, categoria: categoria, preco: preco } na tabela 'produto'.
    //
    // Dica:
      const { error } = await supabaseClient
        .from('produto')
        .insert([{ nome: nome, categoria: categoria, preco: preco }]);
    // ---------------------------------------------------------------------

    mensagemFormEl.textContent = 'Funcao de cadastro ainda nao implementada (complete o Desafio no script.js).';
    console.log('Dados capturados do formulario:', { nome: nome, categoria: categoria, preco: preco });

    /*
    // Apos implementar o insert, descomente o bloco abaixo para atualizar o cardapio:
    if (error) {
        console.error('Erro ao cadastrar item:', error);
        mensagemFormEl.textContent = 'Erro ao cadastrar item. Veja o Console (F12).';
        return;
    }

    mensagemFormEl.textContent = 'Item adicionado ao cardapio com sucesso!';
    formProdutoEl.reset();
    buscarProdutos();
    */
}

// Eventos da pagina
formProdutoEl.addEventListener('submit', cadastrarProduto);
btnRecarregarEl.addEventListener('click', buscarProdutos);

// Execucao inicial ao abrir o site
if (inicializarConexao()) {
    buscarProdutos();
}
