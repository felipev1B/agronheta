// Variáveis do jogo
let score = 0;
let timeLeft = 60;
let alimentos = 0;
let materiais = 0;
let gameInterval;
let timerInterval;
let isMoving = false;
let currentPosition = 'campo'; // 'campo' ou 'cidade'
let obstacles = [];

// Elementos do DOM
const campoSection = document.getElementById('campo-section');
const cidadeSection = document.getElementById('cidade-section');
const playerVehicle = document.getElementById('player-vehicle');
const scoreDisplay = document.querySelector('#score span');
const timeDisplay = document.querySelector('#tempo span');
const alimentosDisplay = document.getElementById('alimentos');
const materiaisDisplay = document.getElementById('materiais');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeyPress);

// Funções do jogo
function startGame() {
    startScreen.classList.add('hidden');
    score = 0;
    timeLeft = 60;
    alimentos = 0;
    materiais = 0;
    currentPosition = 'campo';
    
    updateDisplays();
    spawnRecursos();
    spawnObstacles();
    
    timerInterval = setInterval(updateTimer, 1000);
    gameInterval = setInterval(updateGame, 50);
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    clearObstacles();
    startGame();
}

function updateGame() {
    moveObstacles();
    checkCollisions();
}

function updateTimer() {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    
    if (timeLeft <= 0) {
        endGame();
    }
}

function updateDisplays() {
    scoreDisplay.textContent = score;
    alimentosDisplay.textContent = `Alimentos: ${alimentos}`;
    materiaisDisplay.textContent = `Materiais: ${materiais}`;
}

function spawnRecursos() {
    // Limpa recursos existentes
    document.querySelectorAll('.recurso').forEach(el => el.remove());
    
    // Cria recursos no campo (alimentos)
    for (let i = 0; i < 5; i++) {
        const recurso = document.createElement('div');
        recurso.className = 'recurso';
        recurso.style.backgroundImage = Math.random() > 0.5 ? 'url("assets/vaca.png")' : 'url("assets/vegetal.png")';
        recurso.style.left = `${10 + Math.random() * 70}%`;
        recurso.style.top = `${20 + Math.random() * 60}%`;
        recurso.dataset.type = 'alimento';
        recurso.addEventListener('click', coletarRecurso);
        document.getElementById('campo-recursos').appendChild(recurso);
    }
    
    // Cria recursos na cidade (materiais)
    for (let i = 0; i < 5; i++) {
        const recurso = document.createElement('div');
        recurso.className = 'recurso';
        recurso.style.backgroundImage = 'url("assets/prédio.png")';
        recurso.style.left = `${10 + Math.random() * 70}%`;
        recurso.style.top = `${20 + Math.random() * 60}%`;
        recurso.dataset.type = 'material';
        recurso.addEventListener('click', coletarRecurso);
        document.getElementById('cidade-recursos').appendChild(recurso);
    }
}

function spawnObstacles() {
    clearObstacles();
    
    // Cria obstáculos na estrada
    for (let i = 0; i < 3; i++) {
        const obstaculo = document.createElement('div');
        obstaculo.className = 'obstaculo';
        obstaculo.style.left = `${30 + Math.random() * 40}%`;
        obstaculo.style.top = `${Math.random() * 100}%`;
        document.getElementById('transicao-section').appendChild(obstaculo);
        
        obstacles.push({
            element: obstaculo,
            speed: 1 + Math.random() * 2,
            direction: Math.random() > 0.5 ? 1 : -1
        });
    }
}

function clearObstacles() {
    obstacles = [];
    document.querySelectorAll('.obstaculo').forEach(el => el.remove());
}

function moveObstacles() {
    obstacles.forEach(obstacle => {
        const currentTop = parseFloat(obstacle.element.style.top);
        let newTop = currentTop + (obstacle.speed * obstacle.direction);
        
        if (newTop > 90 || newTop < 0) {
            obstacle.direction *= -1;
            newTop = currentTop + (obstacle.speed * obstacle.direction);
        }
        
        obstacle.element.style.top = `${newTop}%`;
    });
}

function checkCollisions() {
    if (isMoving) {
        const playerRect = playerVehicle.getBoundingClientRect();
        
        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.element.getBoundingClientRect();
            
            if (rectsOverlap(playerRect, obstacleRect)) {
                // Colisão detectada
                score = Math.max(0, score - 10);
                updateDisplays();
                
                // Efeito visual de colisão
                playerVehicle.style.transform = 'translateX(-50%) scale(1.2)';
                setTimeout(() => {
                    playerVehicle.style.transform = 'translateX(-50%) scale(1)';
                }, 300);
            }
        });
    }
}

function rectsOverlap(rect1, rect2) {
    return !(
        rect1.right < rect2.left || 
        rect1.left > rect2.right || 
        rect1.bottom < rect2.top || 
        rect1.top > rect2.bottom
    );
}

function coletarRecurso(e) {
    if (isMoving) return;
    
    const recurso = e.target;
    const tipo = recurso.dataset.type;
    
    if ((currentPosition === 'campo' && tipo === 'alimento') || 
        (currentPosition === 'cidade' && tipo === 'material')) {
        
        if (tipo === 'alimento') {
            alimentos++;
        } else {
            materiais++;
        }
        
        recurso.remove();
        updateDisplays();
    }
}

function transportarRecursos() {
    if (isMoving || (currentPosition === 'campo' && alimentos === 0) || 
        (currentPosition === 'cidade' && materiais === 0)) {
        return;
    }
    
    isMoving = true;
    
    // Animação de movimento
    playerVehicle.style.transition = 'left 2s linear';
    
    if (currentPosition === 'campo') {
        playerVehicle.style.left = '100%';
        currentPosition = 'cidade';
        score += alimentos * 5;
        alimentos = 0;
    } else {
        playerVehicle.style.left = '0%';
        currentPosition = 'campo';
        score += materiais * 5;
        materiais = 0;
    }
    
    setTimeout(() => {
        playerVehicle.style.transition = 'none';
        playerVehicle.style.left = '50%';
        isMoving = false;
        updateDisplays();
        spawnRecursos();
    }, 2000);
}

function handleKeyPress(e) {
    if (e.code === 'Space') {
        transportarRecursos();
    }
}

function endGame() {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}