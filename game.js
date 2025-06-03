document.addEventListener('DOMContentLoaded', () => {
            function createParticles() {
                const container = document.getElementById('particles');
                const particleCount = Math.floor(window.innerWidth / 10);
                
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.classList.add('particle');
                    
                    const size = Math.random() * 5 + 1;
                    const posX = Math.random() * 100;
                    const delay = Math.random() * 15;
                    const duration = 10 + Math.random() * 20;
                    
                    particle.style.width = `${size}px`;
                    particle.style.height = `${size}px`;
                    particle.style.left = `${posX}%`;
                    particle.style.bottom = `-10px`;
                    particle.style.animationDelay = `${delay}s`;
                    particle.style.animationDuration = `${duration}s`;
                    
                    container.appendChild(particle);
                }
            }
            
            createParticles();
            
            const gameContainer = document.getElementById('game-container');
            const scoreDisplay = document.getElementById('score');
            const levelDisplay = document.getElementById('level-display');
            const timerDisplay = document.getElementById('timer');
            const restartButton = document.getElementById('restart-button');
            const winModal = document.getElementById('win-modal');
            const completionTimeDisplay = document.getElementById('completion-time');
            const levelScoreDisplay = document.getElementById('level-score');
            const restartLevelBtn = document.getElementById('restart-level-btn');
            const nextLevelBtn = document.getElementById('next-level-btn');
            
            const backgroundMusic = document.getElementById('background-music');
            const flipSound = document.getElementById('flip-sound');
            const matchSound = document.getElementById('match-sound');
            const winSound = document.getElementById('win-sound');
            
            let cards = [];
            let flippedCards = [];
            let matchedPairs = 0;
            let canFlip = true;
            let currentLevel = 1;
            let timer;
            let timeLeft;
            let totalScore = 0;
            let gameStartTime;
            
            const levelConfig = {
                1: { gridSize: 3, timeLimit: 60, baseScore: 100 },   // 3x3
                2: { gridSize: 4, timeLimit: 90, baseScore: 200 },   // 4x4
                3: { gridSize: 5, timeLimit: 120, baseScore: 300 },  // 5x5
                4: { gridSize: 6, timeLimit: 150, baseScore: 400 },  // 6x6
                5: { gridSize: 7, timeLimit: 180, baseScore: 500 },  // 7x7
                6: { gridSize: 8, timeLimit: 210, baseScore: 600 },  // 8x8
                7: { gridSize: 9, timeLimit: 240, baseScore: 700 },  // 9x9
                8: { gridSize: 10, timeLimit: 270, baseScore: 800 }  // 10x10
            };
            
            function initGame() {
                clearInterval(timer);
                
                const config = levelConfig[currentLevel] || levelConfig[1];
                const gridSize = config.gridSize;
                const cardCount = gridSize * gridSize;
                const uniquePairs = Math.floor(cardCount / 2);
                
                cards = [];
                flippedCards = [];
                matchedPairs = 0;
                canFlip = true;
                gameContainer.innerHTML = '';
                
                gameContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
                gameContainer.style.width = `${gridSize * 95 + (gridSize - 1) * 12}px`;
                
                timeLeft = config.timeLimit;
                timerDisplay.textContent = timeLeft;
                timerDisplay.style.color = '#b3e0ff';
                timerDisplay.style.animation = 'none';
                
                levelDisplay.textContent = currentLevel;
                
                const numbers = [];
                for (let i = 1; i <= uniquePairs; i++) {
                    numbers.push(i);
                }
                const cardValues = [...numbers, ...numbers].slice(0, cardCount);
                
                const shuffledValues = [...cardValues].sort(() => Math.random() - 0.5);
                
                shuffledValues.forEach((value, index) => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.dataset.value = value;
                    card.dataset.index = index;
                    
                    card.addEventListener('click', flipCard);
                    gameContainer.appendChild(card);
                    cards.push(card);
                });
                
                gameStartTime = Date.now();
                startTimer();
                
                document.addEventListener('click', function firstClick() {
                    backgroundMusic.volume = 0.3;
                    backgroundMusic.play().catch(e => console.log("Music error:", e));
                    document.removeEventListener('click', firstClick);
                }, { once: true });
            }
            
            function startTimer() {
                clearInterval(timer);
                timer = setInterval(() => {
                    timeLeft--;
                    timerDisplay.textContent = timeLeft;
                    
                    if (timeLeft <= 10) {
                        timerDisplay.style.color = '#ff9af9';
                        timerDisplay.style.animation = 'pulse 0.5s infinite';
                    }
                    
                    if (timeLeft <= 0) {
                        clearInterval(timer);
                        gameOver();
                    }
                }, 1000);
            }
            
            function gameOver() {
                canFlip = false;
                alert(`TIME'S UP!\nYou didn't complete level ${currentLevel}.`);
                restartLevel();
            }
            
            function flipCard() {
                if (!canFlip || this.classList.contains('matched') || this.classList.contains('flipped')) return;
                
                flipSound.currentTime = 0;
                flipSound.play();
                
                this.classList.add('flipped');
                this.textContent = this.dataset.value;
                flippedCards.push(this);
                
                if (flippedCards.length === 2) {
                    canFlip = false;
                    checkForMatch();
                }
            }
            
            function checkForMatch() {
                const [card1, card2] = flippedCards;
                
                if (card1.dataset.value === card2.dataset.value) {
                    matchSound.currentTime = 0;
                    matchSound.play();
                    
                    setTimeout(() => {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        matchedPairs++;
                        
                        const pairsNeeded = cards.length / 2;
                        if (matchedPairs === pairsNeeded) {
                            levelComplete();
                        }
                        
                        flippedCards = [];
                        canFlip = true;
                    }, 300);
                } else {
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        card1.textContent = '';
                        card2.textContent = '';
                        flippedCards = [];
                        canFlip = true;
                    }, 1000);
                }
            }
            
            function levelComplete() {
                clearInterval(timer);
                
                const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
                const timeBonus = Math.max(0, timeLeft * 2); 
                const levelScore = levelConfig[currentLevel].baseScore + timeBonus;
                totalScore += levelScore;
                
                winSound.currentTime = 0;
                winSound.play();
                
                completionTimeDisplay.textContent = timeTaken;
                levelScoreDisplay.textContent = levelScore;
                scoreDisplay.textContent = totalScore;
                winModal.style.display = 'flex';
            }
            
            function nextLevel() {
                winModal.style.display = 'none';
                currentLevel++;
                
                if (currentLevel > 8) {
                    currentLevel = 1;
                    totalScore = 0;
                    alert('CONGRATULATIONS!\nYou completed all levels!\nStarting over...');
                }
                
                initGame();
            }
            
            function restartLevel() {
                winModal.style.display = 'none';
                initGame();
            }
            
            restartButton.addEventListener('click', restartLevel);
            restartLevelBtn.addEventListener('click', restartLevel);
            nextLevelBtn.addEventListener('click', nextLevel);
            
            initGame();
        });