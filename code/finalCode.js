 document.addEventListener('DOMContentLoaded', function() {
            // Game variables
            const gameContainer = document.getElementById('game-container');
            const player = document.getElementById('player');
            const bucketWater = document.getElementById('bucket-water');
            const waterFill = document.getElementById('water-fill');
            const scoreElement = document.getElementById('score');
            const livesElement = document.getElementById('lives');
            const waterDisplayElement = document.getElementById('water-display');
            const timeElement = document.getElementById('time');
            const gameOverScreen = document.getElementById('game-over');
            const gameResultElement = document.getElementById('game-result');
            const finalScoreElement = document.getElementById('final-score');
            const finalWaterElement = document.getElementById('final-water');
            
            let score = 0;
            let lives = 5;
            let waterLevel = 0;
            let timeLeft = 90;
            let gameActive = false;
            let gameInterval;
            let raindropInterval;
            let timerInterval;
            let leakActive = false;
            let leakInterval;
            let gameStartTime = null;
            const MIN_TIME_BEFORE_LEAK = 10000; // 10 seconds
            let leakStartTime = null;
            const MIN_LEAK_DURATION = 3000; // 3 seconds
            const WATER_GOAL = 80;
            
            // Background rain variables
            const rainContainer = document.getElementById('rain-container');
            let rainInterval;
            let rainIntensity = 100;
            
            // Create background raindrops
            function createRaindrop() {
                const raindrop = document.createElement('div');
                raindrop.classList.add('raindrop');
                
                // Random properties for each raindrop
                const left = Math.random() * 100;
                const animationDuration = 0.5 + Math.random() * 1.5;
                const opacity = 0.3 + Math.random() * 0.7;
                const height = 10 + Math.random() * 20;
                const width = 1 + Math.random() * 2;
                
                // Apply random properties
                raindrop.style.left = `${left}vw`;
                raindrop.style.animationDuration = `${animationDuration}s`;
                raindrop.style.opacity = opacity;
                raindrop.style.height = `${height}px`;
                raindrop.style.width = `${width}px`;
                
                // Add to container
                rainContainer.appendChild(raindrop);
                
                // Remove raindrop after animation completes and create splash
                setTimeout(() => {
                    createSplash(left);
                    raindrop.remove();
                }, animationDuration * 1000);
            }
            
            // Create splash effect
            function createSplash(left) {
                const splash = document.createElement('div');
                splash.classList.add('splash');
                
                splash.style.left = `${left}vw`;
                splash.style.bottom = '0';
                splash.style.animationDuration = `${0.3 + Math.random() * 0.4}s`;
                
                rainContainer.appendChild(splash);
                
                // Remove splash after animation
                setTimeout(() => {
                    splash.remove();
                }, 1000);
            }
            
            // Start background rain with specified intensity
            function startRain(intensity) {
                // Clear any existing rain
                stopRain();
                
                // Set new intensity
                rainIntensity = intensity;
                
                // Create initial raindrops
                for (let i = 0; i < intensity; i++) {
                    setTimeout(() => createRaindrop(), Math.random() * 2000);
                }
                
                // Continue creating raindrops
                rainInterval = setInterval(() => {
                    createRaindrop();
                }, 1000 / intensity);
            }
            
            // Stop background rain
            function stopRain() {
                clearInterval(rainInterval);
                rainContainer.innerHTML = '';
            }
            
            // Game functions
            function startGame() {
                gameStartTime = Date.now();
                if (gameActive) return;
                
                resetGame();
                gameActive = true;
                
                // Start game intervals
                gameInterval = setInterval(updateGame, 16); // ~60fps
                raindropInterval = setInterval(createGameRaindrop, 1000); // Faster as level increases
                timerInterval = setInterval(updateTimer, 1000);
                
                // Start background rain
                startRain(100);
            }
            
            function pauseGame() {
                if (!gameActive) return;
                
                gameActive = false;
                clearInterval(gameInterval);
                clearInterval(raindropInterval);
                clearInterval(timerInterval);
                if (leakInterval) clearInterval(leakInterval);
                stopRain();
            }
            
            function resetGame() {
                score = 0;
                lives = 5;
                waterLevel = 0;
                timeLeft = 90;
                leakActive = false;
                
                scoreElement.textContent = score;
                livesElement.textContent = lives;
                waterDisplayElement.textContent = `${waterLevel}%`;
                timeElement.textContent = timeLeft;
                
                // Update water visuals
                updateWaterVisuals();
                
                // Clear any leaks
                const leaks = document.querySelectorAll('.leak');
                leaks.forEach(leak => leak.remove());
                
                // Clear game container
                const raindrops = document.querySelectorAll('.raindrop-game');
                raindrops.forEach(drop => drop.remove());
                
                // Hide game over screen
                gameOverScreen.style.display = 'none';
            }
            
            function updateGame() {
                // Check for collisions
                const playerRect = player.getBoundingClientRect();
                const raindrops = document.querySelectorAll('.raindrop-game');
                
                raindrops.forEach(drop => {
                    const dropRect = drop.getBoundingClientRect();
                    
                    // Check if raindrop is caught by player
                    if (
                        dropRect.bottom >= playerRect.top + 20 && // Offset to account for bucket handle
                        dropRect.right >= playerRect.left &&
                        dropRect.left <= playerRect.right
                    ) {
                        // Increase score and water level
                        score += 10;
                        waterLevel += 3;
                        if (waterLevel > 100) waterLevel = 100;
                        
                        scoreElement.textContent = score;
                        waterDisplayElement.textContent = `${waterLevel}%`;
                        updateWaterVisuals();
                        
                        // Create splash effect in bucket
                        createBucketSplash();
                        
                        // 15% chance to start a leak
                        if (Math.random() < 0.15 && !leakActive && canStartLeak()) {
                            startLeak();
                        }

                        // 5% chance to stop the leak
                        if (Math.random() < 0.05 && leakActive && canStopLeak()) {
                            stopLeak();
                        }
                        
                        // Check for victory
                        if (waterLevel >= WATER_GOAL) {
                            victory();
                        }
                        
                        // Remove raindrop
                        drop.remove();
                    }
                    
                    // Check if raindrop hit the ground
                    if (dropRect.bottom >= gameContainer.getBoundingClientRect().bottom) {
                        // Decrease lives
                        lives--;
                        livesElement.textContent = lives;
                        
                        // Remove raindrop
                        drop.remove();
                        
                        // Check for game over
                        if (lives <= 0) {
                            endGame();
                        }
                    }
                });
            }

            function canStartLeak() {
                if (!gameStartTime) return false;
                return Date.now() - gameStartTime >= MIN_TIME_BEFORE_LEAK;
            }

            function canStopLeak() {
                // Safety checks
                if (!leakStartTime || isNaN(leakStartTime)) {
                    return false;
                }
    
                const timeElapsed = Date.now() - leakStartTime;
                return timeElapsed >= MIN_LEAK_DURATION;
            }
            
            function startLeak() {
                if (leakActive){
                    return;
                } 

                leakActive = true;
                leakStartTime = Date.now();
    
                // Show leak duration timer
                const leakTimer = document.getElementById('leak-duration-timer');
                if (leakTimer) leakTimer.style.display = 'block';

                //Creates the width of the bucket
                const bucketWidth = player.offsetWidth;

                // Generate random position along the bottom (avoiding edges)
                const randomX = Math.random() * (bucketWidth - 20) + 10;

                 // Store the leak position RELATIVE TO THE PLAYER
                currentLeakPosition = { 
                    x: randomX, 
                    y: 5 // 5px from bottom of player
                };
                
                // Create leak visual indicator ON THE PLAYER
                const leak = document.createElement('div');
                leak.classList.add('leak');
                leak.style.position = 'absolute';
                leak.style.left = `${currentLeakPosition.x}px`;
                leak.style.bottom = `${currentLeakPosition.y}px`;
                player.appendChild(leak);
                
                // Start leak effect - reduce water by 2% every second
                leakInterval = setInterval(() => {
                    // Update visual timer
                    updateLeakDurationDisplay();
                    if (waterLevel > 0) {
                        waterLevel -= 2;
                        waterDisplayElement.textContent = `${waterLevel}%`;
                        updateWaterVisuals();
                        
                        // Create leak drop animation
                        createLeakDrop();

                        // Stop leak if bucket is empty and minumun time has passed
                        if (waterLevel <= 0 && canStopLeak) {
                            stopLeak();
                        }
                    } else if(canStopLeak){
                        stopLeak();
                    }
                }, 1000);
            }

            function updateLeakDurationDisplay() {
            if (!leakStartTime || !leakActive) return;
    
            const timePassed = Date.now() - leakStartTime;
            const timeLeft = Math.max(0, MIN_LEAK_DURATION - timePassed);
            const secondsLeft = Math.ceil(timeLeft / 1000);
    
            const timeLeftElement = document.getElementById('leak-time-left');
            if (timeLeftElement) {
                timeLeftElement.textContent = secondsLeft;
            }
            }       
            
            function stopLeak() {
                if(!canStopLeak()){
                    return; // Dont stop if minumun time hasnt passed
                }

                leakActive = false;
                clearInterval(leakInterval);
                leakStartTime = null;

                // Hide leak duration timer
                const leakTimer = document.getElementById('leak-duration-timer');
                if (leakTimer) leakTimer.style.display = 'none';
                
                // Remove leak visual
                const leak = document.querySelector('.leak');
                if (leak) leak.remove();
            }
            
            function createLeakDrop() {
                const leakDrop = document.createElement('div');
                leakDrop.classList.add('leak-drop');
    
                // Position RELATIVE TO THE PLAYER (same as leak)
                leakDrop.style.position = 'absolute';
                leakDrop.style.left = `${currentLeakPosition.x}px`;
                leakDrop.style.bottom = `${currentLeakPosition.y}px`;
    
                // Appending to the container
                player.appendChild(leakDrop);
    
                setTimeout(() => {
                    if (leakDrop.parentNode) {
                        leakDrop.remove();
                    }
                }, 1500);
            }
            
            function updateWaterVisuals() {
                // Update bucket water level
                bucketWater.style.height = `${waterLevel}%`;
                
                // Update water level indicator
                waterFill.style.height = `${waterLevel}%`;
            }
            
            function createBucketSplash() {
                // Create a small splash animation in the bucket
                const splash = document.createElement('div');
                splash.style.position = 'absolute';
                splash.style.width = '20px';
                splash.style.height = '10px';
                splash.style.borderRadius = '50%';
                splash.style.background = 'rgba(255, 255, 255, 0.6)';
                splash.style.bottom = `${waterLevel}%`;
                splash.style.left = '50%';
                splash.style.transform = 'translateX(-50%)';
                splash.style.animation = 'splash 0.5s ease-out forwards';
                
                bucketWater.appendChild(splash);
                
                // Remove splash after animation
                setTimeout(() => {
                    splash.remove();
                }, 500);
            }
            
            function createGameRaindrop() {
                if (!gameActive) return;
                
                const raindrop = document.createElement('div');
                raindrop.classList.add('raindrop-game');
                
                // Random horizontal position
                const left = Math.random() * (gameContainer.offsetWidth - 15);
                raindrop.style.left = `${left}px`;
                
                // Random speed
                const speed = 1 + Math.random() * 1.5;
                raindrop.style.animationDuration = `${speed}s`;
                
                gameContainer.appendChild(raindrop);
                
                // Remove raindrop after animation completes
                setTimeout(() => {
                    if (raindrop.parentNode) {
                        raindrop.remove();
                    }
                }, speed * 1000);
            }
            
            function updateTimer() {
                if (!gameActive) return;
                
                timeLeft--;
                timeElement.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    endGame();
                }
            }
            
            function victory() {
                gameActive = false;
                clearInterval(gameInterval);
                clearInterval(raindropInterval);
                clearInterval(timerInterval);
                if (leakInterval) clearInterval(leakInterval);
                
                // Show victory screen
                gameResultElement.textContent = "Victory!";
                gameResultElement.classList.add('victory');
                finalScoreElement.textContent = score;
                finalWaterElement.textContent = `${waterLevel}`;
                gameOverScreen.style.display = 'flex';
            }
            
            function endGame() {
                gameActive = false;
                clearInterval(gameInterval);
                clearInterval(raindropInterval);
                clearInterval(timerInterval);
                if (leakInterval) clearInterval(leakInterval);
                
                // Show game over screen
                gameResultElement.textContent = "Game Over!";
                gameResultElement.classList.remove('victory');
                finalScoreElement.textContent = score;
                finalWaterElement.textContent = `${waterLevel}`;
                gameOverScreen.style.display = 'flex';
            }
            
            // Player movement
            gameContainer.addEventListener('mousemove', (e) => {
                if (!gameActive) return;
                
                const containerRect = gameContainer.getBoundingClientRect();
                const playerWidth = player.offsetWidth;
                let newPosition = e.clientX - containerRect.left - (playerWidth / 2);
                
                // Keep player within bounds
                if (newPosition < 0) newPosition = 0;
                if (newPosition > containerRect.width - playerWidth) {
                    newPosition = containerRect.width - playerWidth;
                }
                
                player.style.left = `${newPosition}px`;
            });
            
            // Touch support for mobile devices
            gameContainer.addEventListener('touchmove', (e) => {
                if (!gameActive) return;
                
                e.preventDefault();
                const containerRect = gameContainer.getBoundingClientRect();
                const playerWidth = player.offsetWidth;
                let newPosition = e.touches[0].clientX - containerRect.left - (playerWidth / 2);
                
                // Keep player within bounds
                if (newPosition < 0) newPosition = 0;
                if (newPosition > containerRect.width - playerWidth) {
                    newPosition = containerRect.width - playerWidth;
                }
                
                player.style.left = `${newPosition}px`;
            });
            
            // Event listeners for buttons
            document.getElementById('start-button').addEventListener('click', startGame);
            document.getElementById('pause-button').addEventListener('click', pauseGame);
            document.getElementById('restart-button').addEventListener('click', startGame);
            document.getElementById('light-rain').addEventListener('click', () => startRain(50));
            document.getElementById('heavy-rain').addEventListener('click', () => startRain(200));
            
            // Start with background rain
            startRain(rainIntensity);
        });