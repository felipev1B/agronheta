// Variáveis do jogo
let gameState = {
    population: 1000,
    food: 500,
    environment: 70,
    economy: 50,
    turn: 0
};

// Eventos do jogo
const events = [
    {
        title: "Expansão Urbana",
        description: "Os moradores da cidade querem expandir as áreas residenciais para acomodar o crescimento populacional. Isso exigirá converter terras agrícolas em áreas urbanas.",
        choices: [
            {
                text: "Aprovar a expansão (aumenta população, reduz alimentos)",
                effects: {
                    population: 200,
                    food: -100,
                    environment: -10
                }
            },
            {
                text: "Limitar a expansão (pequeno aumento populacional, mantém alimentos)",
                effects: {
                    population: 50,
                    economy: -10
                }
            },
            {
                text: "Investir em prédios mais altos (custo econômico, preserva terras agrícolas)",
                effects: {
                    economy: -20,
                    population: 100,
                    environment: 5
                }
            }
        ]
    },
    {
        title: "Uso de Pesticidas",
        description: "Agricultores querem usar pesticidas mais fortes para aumentar a produção de alimentos, mas ambientalistas alertam sobre os riscos.",
        choices: [
            {
                text: "Permitir pesticidas (aumenta alimentos, reduz meio ambiente)",
                effects: {
                    food: 150,
                    environment: -15
                }
            },
            {
                text: "Proibir pesticidas fortes (mantém meio ambiente, alimentos estáveis)",
                effects: {
                    economy: -10,
                    environment: 5
                }
            },
            {
                text: "Subsidiar agricultura orgânica (custo econômico, benefícios a longo prazo)",
                effects: {
                    economy: -30,
                    food: 50,
                    environment: 10
                }
            }
        ]
    },
    {
        title: "Transporte Público",
        description: "A cidade precisa melhorar seu sistema de transporte para reduzir congestionamentos e poluição.",
        choices: [
            {
                text: "Construir mais estradas (melhora economia a curto prazo, prejudica ambiente)",
                effects: {
                    economy: 15,
                    environment: -10
                }
            },
            {
                text: "Investir em metrô (alto custo inicial, benefícios a longo prazo)",
                effects: {
                    economy: -40,
                    population: 50,
                    environment: 15
                }
            },
            {
                text: "Promover bicicletas e pedestres (baixo custo, pequeno impacto)",
                effects: {
                    economy: -10,
                    environment: 5
                }
            }
        ]
    },
    {
        title: "Turismo Rural",
        description: "Sugerem promover o turismo em áreas rurais para diversificar a economia, mas há preocupações com impactos ambientais.",
        choices: [
            {
                text: "Promover agressivamente (aumenta economia, risco ambiental)",
                effects: {
                    economy: 30,
                    environment: -15,
                    food: -20
                }
            },
            {
                text: "Promover de forma sustentável (moderado benefício econômico)",
                effects: {
                    economy: 15,
                    environment: -5,
                    food: -5
                }
            },
            {
                text: "Rejeitar proposta (preserva ambiente e agricultura)",
                effects: {
                    economy: -10
                }
            }
        ]
    },
    {
        title: "Energia Renovável",
        description: "Há uma proposta para instalar painéis solares em terras agrícolas, gerando energia limpa mas reduzindo área cultivável.",
        choices: [
            {
                text: "Aprovar projeto grande (boa energia, reduz alimentos)",
                effects: {
                    environment: 20,
                    food: -80,
                    economy: 10
                }
            },
            {
                text: "Aprovar projeto pequeno (equilíbrio)",
                effects: {
                    environment: 10,
                    food: -30,
                    economy: 5
                }
            },
            {
                text: "Instalar em áreas urbanas (custo mais alto, preserva agricultura)",
                effects: {
                    environment: 15,
                    economy: -20
                }
            }
        ]
    }
];

// Elementos do DOM
const populationEl = document.getElementById('population');
const foodEl = document.getElementById('food');
const environmentEl = document.getElementById('environment');
const economyEl = document.getElementById('economy');
const eventTitleEl = document.getElementById('event-title');
const eventDescriptionEl = document.getElementById('event-description');
const choicesEl = document.getElementById('choices');
const sceneEl = document.getElementById('scene');

// Iniciar jogo
function startGame() {
    gameState = {
        population: 1000,
        food: 500,
        environment: 70,
        economy: 50,
        turn: 0
    };
    updateStats();
    nextEvent();
}

// Próximo evento
function nextEvent() {
    gameState.turn++;
    
    if (gameState.turn > 5) {
        endGame();
        return;
    }
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    showEvent(randomEvent);
}

// Mostrar evento
function showEvent(event) {
    eventTitleEl.textContent = event.title;
    eventDescriptionEl.textContent = event.description;
    
    choicesEl.innerHTML = '';
    event.choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = choice.text;
        button.onclick = () => makeChoice(choice.effects);
        choicesEl.appendChild(button);
    });
    
    // Atualizar cena visual
    updateScene();
}

// Fazer escolha
function makeChoice(effects) {
    for (const [key, value] of Object.entries(effects)) {
        gameState[key] += value;
        
        // Garantir que os valores não fiquem negativos ou acima de certos limites
        if (key === 'environment') gameState[key] = Math.max(0, Math.min(100, gameState[key]));
        if (key === 'food') gameState[key] = Math.max(0, gameState[key]);
    }
    
    updateStats();
    
    // Verificar condições de vitória/derrota
    if (gameState.population <= 0 || gameState.food <= 0 || gameState.environment <= 0 || gameState.economy <= -100) {
        endGame();
    } else {
        nextEvent();
    }
}

// Atualizar estatísticas
function updateStats() {
    populationEl.textContent = `População: ${gameState.population}`;
    foodEl.textContent = `Alimentos: ${gameState.food}`;
    environmentEl.textContent = `Meio Ambiente: ${gameState.environment}%`;
    economyEl.textContent = `Economia: ${gameState.economy}`;
}

// Atualizar cena visual
function updateScene() {
    // Calcula proporções baseado nos stats
    const cityRatio = 0.3 + (gameState.population / 5000) * 0.4;
    const countrysideRatio = 0.3 + (gameState.food / 1000) * 0.4;
    const environmentColor = `hsl(${gameState.environment * 1.2}, 70%, 50%)`;
    
    sceneEl.style.background = `
        linear-gradient(
            to right,
            ${environmentColor} ${countrysideRatio * 50}%,
            #90caf9 ${cityRatio * 50}%
        )
    `;
}

// Fim de jogo
function endGame() {
    let message = '';
    
    if (gameState.population <= 0) {
        message = 'Sua população desapareceu! A cidade entrou em colapso.';
    } else if (gameState.food <= 0) {
        message = 'Fome generalizada! A falta de alimentos causou o caos.';
    } else if (gameState.environment <= 0) {
        message = 'Desastre ecológico! O meio ambiente foi destruído.';
    } else if (gameState.economy <= -100) {
        message = 'Falência! A economia entrou em colapso.';
    } else if (gameState.turn > 5) {
        message = `Parabéns! Você equilibrou campo e cidade por ${gameState.turn} turnos. 
                   População: ${gameState.population}, 
                   Alimentos: ${gameState.food}, 
                   Meio Ambiente: ${gameState.environment}%, 
                   Economia: ${gameState.economy}`;
    }
    
    eventTitleEl.textContent = 'Fim do Jogo';
    eventDescriptionEl.textContent = message;
    choicesEl.innerHTML = '<button class="btn" onclick="startGame()">Jogar Novamente</button>';
}

// Inicialização
updateScene();