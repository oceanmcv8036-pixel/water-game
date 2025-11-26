 let attempts = 0;
        
        function checkLuck() {
            attempts++;
            const randomNumber = Math.floor(Math.random() * 1000) + 1;
            const slidingImage = document.getElementById('slidingImage');
            const slidingImage2 = document.getElementById('slidingImage2');
            const message = document.getElementById('message');
            const numberElement = document.getElementById('number');
            const resultElement = document.getElementById('result');
            
            // Reset animation
            slidingImage.classList.remove('slide-animation');
            void slidingImage.offsetWidth; // Trigger reflow to restart animation
            
            if (randomNumber <= 777) { // Using 777 as our lucky number
                message.textContent = "🎉 Congratulations! You got the 1 in 1000 chance! 🎉";
                numberElement.textContent = `Your number was ${randomNumber} (attempt #${attempts})`;
                resultElement.classList.add('lucky');
                resultElement.classList.remove('unlucky');
                
                // Trigger the sliding animation
                setTimeout(() => {
                    const random=Math.floor(Math.random() * 1000)+1;
                    if(random<=500){
                        slidingImage.classList.add('slide-animation');
                    } else{
                        slidingImage2.classList.add('slide-animation');
                    }

                }, 500);
            } else {
                message.textContent = "Not this time! Try again when the page refreshes.";
                numberElement.textContent = `Your number was ${randomNumber} (attempt #${attempts})`;
                resultElement.classList.add('unlucky');
                resultElement.classList.remove('lucky');
            }
            
            // Reset countdown
            resetCountdown();
        }
        
        function resetCountdown() {
            let seconds = 10;
            const countdownElement = document.getElementById('countdown');
            
            const countdown = setInterval(() => {
                countdownElement.textContent = seconds;
                seconds--;
                
                if (seconds < 0) {
                    clearInterval(countdown);
                    location.reload();
                }
            }, 1000);
        }
        
        // Check luck when page loads
        window.onload = function() {
            checkLuck();
        };