// Pong Game Implementation
class PongGame {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('pongScore');
        this.startBtn = document.getElementById('pongStartBtn');
        
        this.canvas.width = 400;
        this.canvas.height = 300;
        
        this.paddle = {
            x: 10,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            speed: 5
        };
        
        this.aiPaddle = {
            x: this.canvas.width - 20,
            y: this.canvas.height / 2 - 40,
            width: 10,
            height: 80,
            speed: 3
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            speedX: 3,
            speedY: 3
        };
        
        this.score = {player: 0, ai: 0};
        this.gameRunning = false;
        this.keys = {};
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            // Prevent page scrolling with arrow keys
            if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            // Prevent page scrolling with arrow keys
            if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
                e.preventDefault();
            }
        });
        
        // Touch controls for mobile
        const touchControls = document.querySelectorAll('#pongTouchControls .touch-btn');
        touchControls.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                if (direction === 'up') this.keys['ArrowUp'] = true;
                if (direction === 'down') this.keys['ArrowDown'] = true;
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                if (direction === 'up') this.keys['ArrowUp'] = false;
                if (direction === 'down') this.keys['ArrowDown'] = false;
            });
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                if (direction === 'up') this.keys['ArrowUp'] = true;
                if (direction === 'down') this.keys['ArrowDown'] = true;
                setTimeout(() => {
                    this.keys['ArrowUp'] = false;
                    this.keys['ArrowDown'] = false;
                }, 100);
            });
        });
    }
    
    startGame() {
        this.resetBall();
        this.score = {player: 0, ai: 0};
        this.gameRunning = true;
        this.startBtn.disabled = true;
        this.updateScore();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Player paddle movement - only when game is running
        if (this.gameRunning) {
            if (this.keys['ArrowUp'] && this.paddle.y > 0) {
                this.paddle.y -= this.paddle.speed;
            }
            if (this.keys['ArrowDown'] && this.paddle.y < this.canvas.height - this.paddle.height) {
                this.paddle.y += this.paddle.speed;
            }
        }
        
        // AI paddle movement - made much worse for better gameplay
        const aiCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
        const ballCenter = this.ball.y;
        
        // Increased reaction delay and error rate to make AI much easier to beat
        const reactionDelay = 25; // bigger pixels of "dead zone"
        const shouldMakeError = Math.random() < 0.25; // 25% chance to make mistake
        const shouldBeSlower = Math.random() < 0.3; // 30% chance to move slower
        
        if (!shouldMakeError) {
            const currentSpeed = shouldBeSlower ? this.aiPaddle.speed * 0.5 : this.aiPaddle.speed;
            if (aiCenter < ballCenter - reactionDelay) {
                this.aiPaddle.y += currentSpeed;
            } else if (aiCenter > ballCenter + reactionDelay) {
                this.aiPaddle.y -= currentSpeed;
            }
        } else {
            // Sometimes move in wrong direction (mistake)
            if (Math.random() < 0.5) {
                this.aiPaddle.y += this.aiPaddle.speed * 0.3;
            } else {
                this.aiPaddle.y -= this.aiPaddle.speed * 0.3;
            }
        }
        
        // Constrain AI paddle
        if (this.aiPaddle.y < 0) this.aiPaddle.y = 0;
        if (this.aiPaddle.y > this.canvas.height - this.aiPaddle.height) {
            this.aiPaddle.y = this.canvas.height - this.aiPaddle.height;
        }
        
        // Ball movement
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Ball collision with top/bottom walls
        if (this.ball.y <= this.ball.radius || this.ball.y >= this.canvas.height - this.ball.radius) {
            this.ball.speedY = -this.ball.speedY;
        }
        
        // Ball collision with paddles
        if (this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.y >= this.paddle.y &&
            this.ball.y <= this.paddle.y + this.paddle.height &&
            this.ball.speedX < 0) {
            this.ball.speedX = -this.ball.speedX;
            this.ball.speedX *= 1.05; // Increase speed slightly
        }
        
        if (this.ball.x >= this.aiPaddle.x &&
            this.ball.y >= this.aiPaddle.y &&
            this.ball.y <= this.aiPaddle.y + this.aiPaddle.height &&
            this.ball.speedX > 0) {
            this.ball.speedX = -this.ball.speedX;
            this.ball.speedX *= 1.05; // Increase speed slightly
        }
        
        // Scoring
        if (this.ball.x < 0) {
            this.score.ai++;
            this.updateScore();
            this.pauseForScore('Computer scoort!');
        } else if (this.ball.x > this.canvas.width) {
            this.score.player++;
            this.updateScore();
            this.pauseForScore('Jij scoort!');
        }
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        // Ball always starts towards computer (right side)
        this.ball.speedX = 3;
        this.ball.speedY = (Math.random() - 0.5) * 4;
    }
    
    pauseForScore(message) {
        this.gameRunning = false;
        
        // Show score message
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Spel gaat door in 2 seconden...', this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        // Resume game after 2 seconds
        setTimeout(() => {
            this.resetBall();
            
            // Check for win condition
            if (this.score.ai >= 5) {
                this.endGame('Computer wint!');
                return;
            }
            if (this.score.player >= 5) {
                this.endGame('Jij wint!');
                return;
            }
            
            this.gameRunning = true;
            this.gameLoop();
        }, 2000);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.fillRect(this.aiPaddle.x, this.aiPaddle.y, this.aiPaddle.width, this.aiPaddle.height);
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw scores
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score.player, this.canvas.width / 4, 40);
        this.ctx.fillText(this.score.ai, 3 * this.canvas.width / 4, 40);
        
        // Draw controls hint
        if (!this.gameRunning) {
            this.ctx.font = '12px Arial';
            this.ctx.fillText('Use ↑↓ arrows to move', this.canvas.width / 2, this.canvas.height - 20);
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = `Jij: ${this.score.player} - Computer: ${this.score.ai}`;
    }
    
    endGame(message) {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Eindstand: ${this.score.player} - ${this.score.ai}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
}

// Initialize Pong game when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pongCanvas')) {
        new PongGame();
    }
});
