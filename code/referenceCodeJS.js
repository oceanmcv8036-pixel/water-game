        document.addEventListener('DOMContentLoaded', function() {
            const rainContainer = document.getElementById('rain-container');
            let rainInterval;
            let rainIntensity = 100; // Default to medium rain
            
            // Create raindrops
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
            
            // Start rain with specified intensity
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
            
            // Stop rain
            function stopRain() {
                clearInterval(rainInterval);
                rainContainer.innerHTML = '';
            }
            
            // Event listeners for buttons
            document.getElementById('light-rain').addEventListener('click', () => startRain(30));
            document.getElementById('medium-rain').addEventListener('click', () => startRain(100));
            document.getElementById('heavy-rain').addEventListener('click', () => startRain(300));
            document.getElementById('stop-rain').addEventListener('click', stopRain);
            
            // Start with medium rain
            startRain(rainIntensity);
        });