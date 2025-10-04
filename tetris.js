// Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.linesElement = document.getElementById('lines');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.muteBtn = document.getElementById('muteBtn');
        
        this.blockSize = 30;
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.canvas.width = this.boardWidth * this.blockSize;
        this.canvas.height = this.boardHeight * this.blockSize;
        
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.musicMuted = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        // Audio elements
        this.bgMusic = null;
        this.initAudio();
        
        this.colors = [
            '#000000', // Empty
            '#FF0000', // I-piece (red)
            '#00FF00', // O-piece (green)
            '#0000FF', // T-piece (blue)
            '#FFFF00', // S-piece (yellow)
            '#FF00FF', // Z-piece (magenta)
            '#00FFFF', // J-piece (cyan)
            '#FFA500'  // L-piece (orange)
        ];
        
        this.pieces = [
            [
                [1,1,1,1]
            ],
            [
                [2,2],
                [2,2]
            ],
            [
                [0,3,0],
                [3,3,3]
            ],
            [
                [0,4,4],
                [4,4,0]
            ],
            [
                [5,5,0],
                [0,5,5]
            ],
            [
                [6,0,0],
                [6,6,6]
            ],
            [
                [0,0,7],
                [7,7,7]
            ]
        ];
        
        this.initGame();
    }
    
    initAudio() {
        // Create Tetris theme music using Web Audio API
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.createTetrisMusic();
    }
    
    createTetrisMusic() {
        // Tetris Theme A melody notes (simplified)
        this.tetrisNotes = [
            { note: 659.25, duration: 0.5 }, // E5
            { note: 493.88, duration: 0.25 }, // B4
            { note: 523.25, duration: 0.25 }, // C5
            { note: 587.33, duration: 0.5 }, // D5
            { note: 523.25, duration: 0.25 }, // C5
            { note: 493.88, duration: 0.25 }, // B4
            { note: 440.00, duration: 0.5 }, // A4
            { note: 440.00, duration: 0.25 }, // A4
            { note: 523.25, duration: 0.25 }, // C5
            { note: 659.25, duration: 0.5 }, // E5
            { note: 587.33, duration: 0.25 }, // D5
            { note: 523.25, duration: 0.25 }, // C5
            { note: 493.88, duration: 0.75 }, // B4
            { note: 523.25, duration: 0.25 }, // C5
            { note: 587.33, duration: 0.5 }, // D5
            { note: 659.25, duration: 0.5 }, // E5
            { note: 523.25, duration: 0.5 }, // C5
            { note: 440.00, duration: 0.5 }, // A4
            { note: 440.00, duration: 1.0 }   // A4
        ];
        this.currentNoteIndex = 0;
    }
    
    playTetrisMusic() {
        if (!this.audioContext || this.gamePaused || !this.gameRunning || this.musicMuted) return;
        
        const note = this.tetrisNotes[this.currentNoteIndex];
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(note.note, this.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + note.duration);
        
        this.currentNoteIndex = (this.currentNoteIndex + 1) % this.tetrisNotes.length;
        
        if (!this.musicMuted) {
            setTimeout(() => this.playTetrisMusic(), note.duration * 1000);
        }
    }
    
    initGame() {
        this.initBoard();
        this.bindEvents();
        this.draw();
    }
    
    initBoard() {
        this.board = Array(this.boardHeight).fill().map(() => Array(this.boardWidth).fill(0));
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.dropPiece();
                    break;
            }
        });
    }
    
    toggleMute() {
        this.musicMuted = !this.musicMuted;
        this.muteBtn.textContent = this.musicMuted ? 'Unmute Music' : 'Mute Music';
    }
    
    startGame() {
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.initBoard();
        this.nextPiece = this.createNewPiece();
        this.spawnPiece();
        this.updateUI();
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        
        // Start music
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.playTetrisMusic();
        
        this.gameLoop();
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        this.gamePaused = !this.gamePaused;
        this.pauseBtn.textContent = this.gamePaused ? 'Resume' : 'Pause';
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    gameLoop(time = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += deltaTime;
        
        if (this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = 0;
        }
        
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    createNewPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        return {
            shape: JSON.parse(JSON.stringify(this.pieces[pieceIndex])), // Deep copy
            x: 0,
            y: 0,
            type: pieceIndex + 1
        };
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.currentPiece.x = Math.floor(this.boardWidth / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        
        this.nextPiece = this.createNewPiece();
        
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }
    
    movePiece(dx, dy) {
        if (!this.currentPiece) return;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
        } else if (dy > 0) {
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.rotate(this.currentPiece.shape);
        const testPiece = {
            ...this.currentPiece,
            shape: rotated
        };
        
        // Try different positions for wall kicks
        const kicks = [
            { x: 0, y: 0 },   // Original position
            { x: -1, y: 0 },  // Move left
            { x: 1, y: 0 },   // Move right
            { x: 0, y: -1 },  // Move up
            { x: -1, y: -1 }, // Move left and up
            { x: 1, y: -1 }   // Move right and up
        ];
        
        for (const kick of kicks) {
            if (!this.checkCollision(testPiece, kick.x, kick.y)) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x += kick.x;
                this.currentPiece.y += kick.y;
                return;
            }
        }
    }
    
    rotate(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    dropPiece() {
        if (!this.currentPiece) return;
        
        while (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        }
        this.placePiece();
        this.clearLines();
        this.spawnPiece();
    }
    
    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= this.boardWidth || 
                        boardY >= this.boardHeight || 
                        (boardY >= 0 && this.board[boardY][boardX] !== 0)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    placePiece() {
        if (!this.currentPiece) return;
        
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x] !== 0) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.shape[y][x];
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++; // Check the same line again
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateUI();
        }
    }
    
    updateUI() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.linesElement.textContent = this.lines;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.drawBoard();
        
        // Draw current piece
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece);
        }
        
        // Draw grid
        this.drawGrid();
        
        // Draw next piece
        this.drawNextPiece();
    }
    
    drawNextPiece() {
        if (!this.nextPiece) return;
        
        const nextCanvas = document.getElementById('nextPiece');
        if (!nextCanvas) return;
        
        const nextCtx = nextCanvas.getContext('2d');
        nextCtx.fillStyle = '#000000';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
        
        const blockSize = 20;
        const offsetX = 10;
        const offsetY = 10;
        
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x] !== 0) {
                    nextCtx.fillStyle = this.colors[this.nextPiece.shape[y][x]];
                    nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
    
    drawBoard() {
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x] !== 0) {
                    this.ctx.fillStyle = this.colors[this.board[y][x]];
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }
    
    drawPiece(piece) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] !== 0) {
                    this.ctx.fillStyle = this.colors[piece.shape[y][x]];
                    this.ctx.fillRect(
                        (piece.x + x) * this.blockSize,
                        (piece.y + y) * this.blockSize,
                        this.blockSize,
                        this.blockSize
                    );
                }
            }
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.canvas.width, y * this.blockSize);
            this.ctx.stroke();
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
