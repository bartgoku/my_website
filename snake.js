// Snake Game Implementation
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('snakeScore');
        this.startBtn = document.getElementById('snakeStartBtn');
        
        this.gridSize = 20;
        this.canvas.width = 400;
        this.canvas.height = 400;
        
        this.snake = [{x: 200, y: 200}];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = false;
        
        this.bindEvents();
        this.draw();
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.code) {
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.direction.y === 0) {
                        this.direction = {x: 0, y: -this.gridSize};
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.direction.y === 0) {
                        this.direction = {x: 0, y: this.gridSize};
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (this.direction.x === 0) {
                        this.direction = {x: -this.gridSize, y: 0};
                    }
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (this.direction.x === 0) {
                        this.direction = {x: this.gridSize, y: 0};
                    }
                    break;
            }
        });
        
        // Touch controls for mobile
        const touchControls = document.querySelectorAll('#snakeTouchControls .touch-btn');
        touchControls.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.gameRunning) return;
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleTouchDirection(direction);
            });
        });
    }
    
    handleTouchDirection(direction) {
        switch(direction) {
            case 'up':
                if (this.direction.y === 0) {
                    this.direction = {x: 0, y: -this.gridSize};
                }
                break;
            case 'down':
                if (this.direction.y === 0) {
                    this.direction = {x: 0, y: this.gridSize};
                }
                break;
            case 'left':
                if (this.direction.x === 0) {
                    this.direction = {x: -this.gridSize, y: 0};
                }
                break;
            case 'right':
                if (this.direction.x === 0) {
                    this.direction = {x: this.gridSize, y: 0};
                }
                break;
        }
    }
    
    startGame() {
        this.snake = [{x: 200, y: 200}];
        this.direction = {x: 0, y: 0};
        this.food = this.generateFood();
        this.score = 0;
        this.gameRunning = true;
        this.startBtn.disabled = true;
        this.updateScore();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => this.gameLoop(), 150);
    }
    
    update() {
        if (this.direction.x === 0 && this.direction.y === 0) return;
        
        const head = {x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y};
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.canvas.width || head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize,
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw snake
        this.ctx.fillStyle = '#0f0';
        this.snake.forEach(segment => {
            this.ctx.fillRect(segment.x, segment.y, this.gridSize - 2, this.gridSize - 2);
        });
        
        // Draw food
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize - 2, this.gridSize - 2);
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#000';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
}

// Initialize Snake game when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('snakeCanvas')) {
        new SnakeGame();
    }
});
