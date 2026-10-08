
// ======================================================
// PARTE 1 – MANIPULAÇÃO E VALIDAÇÃO DE DADOS
// ======================================================

console.log("===== PARTE 1: VALIDAÇÃO DE PEDIDOS =====");

// Array de objetos com pedidos de exemplo
const pedidos = [
    { cliente: "Bia", valor: 120, status: "pago" },
    { cliente: "Carlos", valor: 80, status: "pendente" },
    { cliente: "Ana", valor: 50, status: "pago" },
    { cliente: "   ", valor: 100, status: "pago" },
    { cliente: "Pedro", valor: -20, status: "pago" },
    { cliente: "Mariana", valor: 75, status: "pago" }
];

// Validar cada pedido:
// - Cliente não pode estar vazio.
// - Valor precisa ser numérico, finito e maior que zero.
const pedidosValidos = pedidos.filter(function(pedido) {
    return (
        typeof pedido.cliente === "string" &&
        pedido.cliente.trim() !== "" &&
        typeof pedido.valor === "number" &&
        Number.isFinite(pedido.valor) &&
        pedido.valor > 0
    );
});

console.log("Pedidos válidos:", pedidosValidos);

// Filtrar apenas os pedidos pagos
const pedidosPagos = pedidosValidos.filter(function(pedido) {
    return pedido.status === "pago";
});

console.log("Pedidos pagos:", pedidosPagos);

// Calcular o total faturado
const totalFaturado = pedidosPagos.reduce(function(total, pedido) {
    return total + pedido.valor;
}, 0);

console.log("Total faturado: R$", totalFaturado.toFixed(2));

// Gerar textos no formato "Bia — R$ 120.00"
const textosPedidos = pedidosPagos.map(function(pedido) {
    return `${pedido.cliente.trim()} — R$ ${pedido.valor.toFixed(2)}`;
});

console.log("Resumo dos pedidos:", textosPedidos);

// Exibir os pedidos na página
const listaPedidos = document.querySelector("#lista-pedidos");
const elementoTotal = document.querySelector("#total-faturado");

textosPedidos.forEach(function(texto) {
    const item = document.createElement("li");
    item.textContent = texto;
    listaPedidos.append(item);
});

elementoTotal.textContent = `R$ ${totalFaturado.toFixed(2)}`;


// ======================================================
// PARTE 2 – BUSCADOR DE CEP (VIACEP)
// ======================================================

console.log("===== PARTE 2: BUSCADOR DE CEP =====");

const formularioCep = document.querySelector("#formulario-cep");
const inputCep = document.querySelector("#input-cep");
const botaoCep = document.querySelector("#botao-cep");
const statusCep = document.querySelector("#status-cep");
const detalhesCep = document.querySelector("#detalhes-cep");
const listaHistoricoCep = document.querySelector("#lista-historico-cep");

// Histórico de CEPs pesquisados
const historicoCep = [];

// Consultar o CEP
async function buscarCep(cep) {
    // Estado: carregando
    statusCep.textContent = "Buscando...";
    botaoCep.disabled = true;

    // Limpar o resultado anterior
    detalhesCep.replaceChildren();

    try {
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        // Tratar erros HTTP
        if (!resposta.ok) {
            throw new Error("Falha na conexão com o serviço de CEP.");
        }

        const dados = await resposta.json();

        // Estado: não encontrado
        if (dados.erro) {
            statusCep.textContent = "CEP não encontrado.";
            return;
        }

        // Estado: sucesso
        const campos = [
            { rotulo: "Rua", valor: dados.logradouro },
            { rotulo: "Bairro", valor: dados.bairro },
            { rotulo: "Cidade", valor: dados.localidade },
            { rotulo: "UF", valor: dados.uf }
        ];

        detalhesCep.replaceChildren();

        campos.forEach(function(campo) {
            const dt = document.createElement("dt");
            const dd = document.createElement("dd");

            dt.textContent = campo.rotulo;
            dd.textContent = campo.valor || "Não informado";

            detalhesCep.append(dt, dd);
        });

        // Limpar a mensagem de status
        statusCep.textContent = "";

        console.log("CEP encontrado:", dados);

        // Registrar o CEP no histórico
        historicoCep.unshift({
            cep: cep,
            cidade: dados.localidade || "Cidade não informada",
            uf: dados.uf || "--"
        });

        atualizarHistoricoCep();

    } catch (erro) {
        // Estado: erro de rede ou falha na requisição
        console.error("Erro ao buscar CEP:", erro);

        statusCep.textContent =
            "Falha na conexão. Verifique sua internet e tente novamente.";

    } finally {
        // Reativar o botão independentemente do resultado
        botaoCep.disabled = false;
    }
}


// Validar e enviar o formulário de CEP
formularioCep.addEventListener("submit", function(event) {
    event.preventDefault();

    // Remover espaços do início e do fim
    const cepDigitado = inputCep.value.trim();

    // Aceitar exatamente 8 dígitos
    const formatoValido = /^\d{8}$/.test(cepDigitado);

    if (!formatoValido) {
        statusCep.textContent =
            "CEP inválido. Digite exatamente 8 números.";

        detalhesCep.replaceChildren();
        return;
    }

    buscarCep(cepDigitado);
});


// Atualizar o histórico na página
function atualizarHistoricoCep() {
    listaHistoricoCep.replaceChildren();

    historicoCep.forEach(function(item) {
        const li = document.createElement("li");

        li.textContent =
            `${item.cep} — ${item.cidade}/${item.uf}`;

        listaHistoricoCep.append(li);
    });
}


// ======================================================
// PARTE 3 – MINI POKÉDEX (POKÉAPI)
// ======================================================

console.log("===== PARTE 3: MINI POKÉDEX =====");

const formularioPokemon = document.querySelector("#formulario-pokemon");
const inputPokemon = document.querySelector("#input-pokemon");
const botaoPokemon = document.querySelector("#botao-pokemon");
const statusPokemon = document.querySelector("#status-pokemon");
const resultadoPokemon = document.querySelector("#resultado-pokemon");
const nomePokemon = document.querySelector("#nome-pokemon");
const imagemPokemon = document.querySelector("#imagem-pokemon");
const tiposPokemon = document.querySelector("#tipos-pokemon");


// Limpar os dados do Pokémon anterior
function limparPokemon() {
    nomePokemon.textContent = "";

    imagemPokemon.removeAttribute("src");
    imagemPokemon.alt = "";

    tiposPokemon.replaceChildren();
}


// Consultar Pokémon na PokéAPI
async function buscarPokemon(nome) {
    // Estado: carregando
    statusPokemon.textContent = "Buscando Pokémon...";
    botaoPokemon.disabled = true;

    limparPokemon();

    try {
        const resposta = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(nome)}`
        );

        // O fetch não rejeita automaticamente em erros HTTP
        if (!resposta.ok) {
            if (resposta.status === 404) {
                throw new Error("POKEMON_NAO_ENCONTRADO");
            }

            throw new Error("FALHA_NA_CONEXAO");
        }

        const dados = await resposta.json();

        // Estado: sucesso
        nomePokemon.textContent =
            dados.name.charAt(0).toUpperCase() + dados.name.slice(1);

        // Imagem oficial do resultado da API
        if (dados.sprites.front_default) {
            imagemPokemon.src = dados.sprites.front_default;
            imagemPokemon.alt = `Imagem do Pokémon ${dados.name}`;
        } else {
            imagemPokemon.alt = "Imagem não disponível";
        }

        // Exibir os tipos do Pokémon
        dados.types.forEach(function(item) {
            const li = document.createElement("li");

            const tipo = item.type.name;
            li.textContent =
                tipo.charAt(0).toUpperCase() + tipo.slice(1);

            tiposPokemon.append(li);
        });

        statusPokemon.textContent = "";

        console.log("Pokémon encontrado:", dados);

    } catch (erro) {
        // Estado: erro ou Pokémon não encontrado
        console.error("Erro ao buscar Pokémon:", erro);

        limparPokemon();

        if (erro.message === "POKEMON_NAO_ENCONTRADO") {
            statusPokemon.textContent = "Pokémon não encontrado.";
        } else {
            statusPokemon.textContent =
                "Falha na conexão. Verifique sua internet e tente novamente.";
        }

    } finally {
        // Reativar o botão
        botaoPokemon.disabled = false;
    }
}


// Validar e enviar o formulário de Pokémon
formularioPokemon.addEventListener("submit", function(event) {
    event.preventDefault();

    const nomeDigitado = inputPokemon.value.trim().toLowerCase();

    if (nomeDigitado === "") {
        statusPokemon.textContent =
            "Digite o nome de um Pokémon.";

        limparPokemon();
        return;
    }

    buscarPokemon(nomeDigitado);
});
