function createParticles() {
            const container = document.getElementById('particles');
            const particleCount = window.innerWidth / 10;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // Random properties
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
        
        document.addEventListener('DOMContentLoaded', () => {
            createParticles();
            
            const gameContainer = document.getElementById('game-container');
            const scoreDisplay = document.getElementById('score');
            const restartButton = document.getElementById('restart-button');
            const backgroundMusic = document.getElementById('background-music');
            
            let cards = [];
            let flippedCards = [];
            let matchedPairs = 0;
            let canFlip = true;
            
            const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
            const cardValues = [...numbers, ...numbers];
            
            function initGame() {
                cards = [];
                flippedCards = [];
                matchedPairs = 0;
                canFlip = true;
                gameContainer.innerHTML = '';
                scoreDisplay.textContent = '0';
                
                const shuffledValues = [...cardValues].sort(() => Math.random() - 0.5);
                
                shuffledValues.forEach((value, index) => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.dataset.value = value;
                    card.dataset.index = index;
                    card.textContent = value;
                    
                    card.addEventListener('click', flipCard);
                    gameContainer.appendChild(card);
                    cards.push(card);
                });
                
                document.addEventListener('click', function firstClick() {
                    backgroundMusic.volume = 0.3;
                    backgroundMusic.play().catch(e => console.log("Music error:", e));
                    document.removeEventListener('click', firstClick);
                }, { once: true });
            }
            
            function flipCard() {
                if (!canFlip || this.classList.contains('matched')) return;
                
                if (this.classList.contains('flipped')) {
                    this.classList.remove('flipped');
                    this.textContent = '';
                    if (flippedCards.includes(this)) {
                        flippedCards = flippedCards.filter(card => card !== this);
                    }
                    return;
                }
                
                if (flippedCards.length >= 2) return;
                
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
                    setTimeout(() => {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        matchedPairs++;
                        scoreDisplay.textContent = matchedPairs;
                        
                        if (matchedPairs === 8) {
                            setTimeout(() => {
                                alert('MEMORY SEQUENCE COMPLETE\nWELL DONE');
                            }, 300);
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
            
            restartButton.addEventListener('click', initGame);
            
            initGame();
        });