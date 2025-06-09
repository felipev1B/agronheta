const gameContainer = document.getElementById('game-container');
const dirtRoad = document.getElementById('dirt-road');
const playerCar = document.getElementById('player-car');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let obstacles = [];
let gameInterval;
let obstacleInterval;
let isOnDirtRoad = true;

// Controles do teclado
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        e.preventDefault();
        toggleRoad();
    }
});

// Controles de toque para mobile
gameContainer.addEventListener('click', () => {
    if (isGameOver) return;
    toggleRoad();
});

function toggleRoad() {
    isOnDirtRoad = !isOnDirtRoad;
    
    if (isOnDirtRoad) {
        dirtRoad.style.height = '50%';
        gameContainer.style.backgroundPosition = '0 0';
    } else {
        dirtRoad.style.height = '100%';
        gameContainer.style.backgroundPosition = '0 100%';
    }
}

function createObstacle() {
    if (isGameOver) return;
    
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    
    // Posiciona o obstáculo aleatoriamente na estrada de terra ou asfalto
    const isObstacleOnDirt = Math.random() > 0.5;
    
    if (isObstacleOnDirt) {
        obstacle.style.left = 'calc(50% - 30px)';
        obstacle.style.backgroundColor = '#8B4513'; // Cor de terra
    } else {
        obstacle.style.left = 'calc(50% - 30px)';
        obstacle.style.backgroundColor = '#4682B4'; // Cor de cidade
    }
    
    obstacle.style.top = '-60px';
    gameContainer.appendChild(obstacle);
    obstacles.push({
        element: obstacle,
        isOnDirt: isObstacleOnDirt,
        y: -60
    });
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += gameSpeed;
        obstacle.element.style.top = obstacle.y + 'px';
        
        // Verifica colisão
        if (
            obstacle.y + 60 > window.innerHeight - 150 && 
            obstacle.y < window.innerHeight - 50 &&
            ((obstacle.isOnDirt && isOnDirtRoad) || (!obstacle.isOnDirt && !isOnDirtRoad))
        ) {
            gameOver();
        }
        
        // Remove obstáculos que saíram da tela
        if (obstacle.y > window.innerHeight) {
            gameContainer.removeChild(obstacle.element);
            obstacles.splice(index, 1);
            score++;
            scoreElement.textContent = `Pontuação: ${score}`;
            
            // Aumenta a dificuldade
            if (score % 5 === 0) {
                gameSpeed += 0.5;
            }
        }
    });
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    gameOverElement.style.display = 'block';
    restartBtn.style.display = 'block';
}

function startGame() {
    // Limpa obstáculos existentes
    obstacles.forEach(obstacle => {
        gameContainer.removeChild(obstacle.element);
    });
    obstacles = [];
    
    // Reseta variáveis do jogo
    score = 0;
    gameSpeed = 5;
    isGameOver = false;
    isOnDirtRoad = true;
    dirtRoad.style.height = '50%';
    gameContainer.style.backgroundPosition = '0 0';
    scoreElement.textContent = `Pontuação: ${score}`;
    gameOverElement.style.display = 'none';
    restartBtn.style.display = 'none';
    
    // Inicia os intervalos do jogo
    gameInterval = setInterval(updateObstacles, 20);
    obstacleInterval = setInterval(createObstacle, 2000);
}

restartBtn.addEventListener('click', startGame);

// Inicia o jogo
startGame();