// Simple Pac-Man Game Implementation
class PacManGame {
    constructor() {
        this.canvas = document.getElementById('pacmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('pacmanScore');
        this.startBtn = document.getElementById('pacmanStartBtn');
        
        this.canvas.width = 400;
        this.canvas.height = 420; // Extra height for authentic layout
        this.cellSize = 20;
        this.cols = this.canvas.width / this.cellSize;
        this.rows = 21; // 21 rows like original Pac-Man
        
        this.pacman = {x: 1, y: 1, direction: {x: 0, y: 0}};
        this.score = 0;
        this.gameRunning = false;
        
        // Audio setup
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
        
        this.createMaze();
        this.bindEvents();
        this.draw();
    }
    
    initAudio() {
        // Load authentic Pac-Man audio files
        this.audioFiles = {
            chomp: new Audio('sounds/03. PAC-MAN - Eating The Pac-dots.mp3'),
            chompCorner: new Audio('sounds/04. PAC-MAN - Turning The Corner While Eating The Pac-dots.mp3'),
            startMusic: new Audio('sounds/02. Start Music.mp3'),
            eatFruit: new Audio('sounds/11. PAC-MAN - Eating The Fruit.mp3'),
            ghostMove: new Audio('sounds/06. Ghost - Normal Move.mp3'),
            ghostSpurt: new Audio('sounds/07. Ghost - Spurt Move #1.mp3'),
            ghostReturn: new Audio('sounds/14. Ghost - Return to Home.mp3'),
            fail: new Audio('sounds/15. Fail.mp3'),
            extend: new Audio('sounds/05. Extend Sound.mp3'),
            credit: new Audio('sounds/01. Credit Sound.mp3')
        };
        
        // Set volume for all audio files
        Object.values(this.audioFiles).forEach(audio => {
            audio.volume = 0.5;
        });
        
        // Set background music to loop
        this.audioFiles.ghostMove.loop = true;
        this.audioFiles.ghostSpurt.loop = true;
        
        this.createSounds();
    }
    
    createSounds() {
        // Pac-Man chomp sound (authentic)
        this.sounds.chomp = () => {
            this.audioFiles.chomp.currentTime = 0;
            this.audioFiles.chomp.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Corner turn chomp
        this.sounds.chompCorner = () => {
            this.audioFiles.chompCorner.currentTime = 0;
            this.audioFiles.chompCorner.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Power pellet sound (using chomp for now, could be different)
        this.sounds.powerPellet = () => {
            this.audioFiles.chomp.currentTime = 0;
            this.audioFiles.chomp.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Fruit eating sound
        this.sounds.eatFruit = () => {
            this.audioFiles.eatFruit.currentTime = 0;
            this.audioFiles.eatFruit.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Ghost eaten sound (using extend sound)
        this.sounds.eatGhost = () => {
            this.audioFiles.extend.currentTime = 0;
            this.audioFiles.extend.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Death sound
        this.sounds.death = () => {
            this.stopAllSounds();
            this.audioFiles.fail.currentTime = 0;
            this.audioFiles.fail.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Start game music
        this.sounds.startMusic = () => {
            this.audioFiles.startMusic.currentTime = 0;
            this.audioFiles.startMusic.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Background siren (ghost normal movement)
        this.sounds.siren = () => {
            if (!this.audioFiles.ghostMove.paused) return;
            this.audioFiles.ghostMove.currentTime = 0;
            this.audioFiles.ghostMove.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Stop siren
        this.sounds.stopSiren = () => {
            this.audioFiles.ghostMove.pause();
            this.audioFiles.ghostMove.currentTime = 0;
        };
        
        // Vulnerable ghost sound (ghost spurt)
        this.sounds.vulnerableGhost = () => {
            this.audioFiles.ghostMove.pause();
            if (!this.audioFiles.ghostSpurt.paused) return;
            this.audioFiles.ghostSpurt.currentTime = 0;
            this.audioFiles.ghostSpurt.play().catch(e => console.log('Audio play failed:', e));
        };
        
        // Stop vulnerable sound
        this.sounds.stopVulnerable = () => {
            this.audioFiles.ghostSpurt.pause();
            this.audioFiles.ghostSpurt.currentTime = 0;
        };
        
        // Stop all sounds
        this.stopAllSounds = () => {
            Object.values(this.audioFiles).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }
    
    createMaze() {
        // Authentic Pac-Man maze layout (1 = wall, 0 = dot, 2 = empty, 3 = power pellet, 4 = ghost house)
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,3,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,3,1],
            [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1],
            [1,1,1,1,1,0,1,1,2,1,1,2,1,1,0,1,1,1,1,1],
            [2,2,2,2,1,0,1,2,2,2,2,2,2,1,0,1,2,2,2,2],
            [1,1,1,1,1,0,1,2,1,4,4,1,2,1,0,1,1,1,1,1],
            [2,2,2,2,2,0,2,2,1,4,4,1,2,2,0,2,2,2,2,2],
            [1,1,1,1,1,0,1,2,1,4,4,1,2,1,0,1,1,1,1,1],
            [2,2,2,2,1,0,1,2,1,1,1,1,2,1,0,1,2,2,2,2],
            [1,1,1,1,1,0,1,2,2,2,2,2,2,1,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,0,1,1,0,1,1,0,1,1,1,0,1],
            [1,3,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,3,1],
            [1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1,1,1],
            [1,0,0,0,0,0,1,0,0,1,1,0,0,1,0,0,0,0,0,1],
            [1,0,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        // Initialize ghosts in the ghost house (center area)
        this.ghosts = [
            {x: 9, y: 9, direction: {x: 1, y: 0}, color: 'red', mode: 'normal'},     // Blinky (red)
            {x: 10, y: 9, direction: {x: -1, y: 0}, color: 'pink', mode: 'normal'},   // Pinky (pink)
            {x: 9, y: 10, direction: {x: 0, y: -1}, color: 'cyan', mode: 'normal'},   // Inky (cyan)
            {x: 10, y: 10, direction: {x: 0, y: 1}, color: 'orange', mode: 'normal'}  // Clyde (orange)
        ];
        
        this.powerMode = false;
        this.powerModeTimer = 0;
        
        // Fruit system
        this.fruit = null;
        this.fruitSpawnTimer = 0;
        this.scorePopup = null;
        this.fruitTypes = [
            {name: 'Cherry', points: 100, color: '#ff0000', symbol: '🍒'},
            {name: 'Strawberry', points: 300, color: '#ff69b4', symbol: '🍓'},
            {name: 'Orange', points: 500, color: '#ffa500', symbol: '🍊'},
            {name: 'Apple', points: 700, color: '#ff0000', symbol: '🍎'},
            {name: 'Pineapple', points: 1000, color: '#ffff00', symbol: '🍍'},
            {name: 'Grapes', points: 2000, color: '#800080', symbol: '🍇'},
            {name: 'Galaxian', points: 3000, color: '#00ffff', symbol: '👾'},
            {name: 'Bell', points: 5000, color: '#ffd700', symbol: '🔔'}
        ];
        this.currentFruitLevel = 0;
        
        // Ghost scoring system (authentic Pac-Man)
        this.ghostsEatenInPowerMode = 0;
        
        this.totalDots = 0;
        this.totalPowerPellets = 0;
        for (let row of this.maze) {
            for (let cell of row) {
                if (cell === 0) this.totalDots++;
                if (cell === 3) this.totalPowerPellets++;
            }
        }
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch(e.code) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.pacman.direction = {x: 0, y: -1};
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.pacman.direction = {x: 0, y: 1};
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.pacman.direction = {x: -1, y: 0};
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.pacman.direction = {x: 1, y: 0};
                    break;
            }
        });
    }
    
    startGame() {
        this.pacman = {x: 1, y: 1, direction: {x: 0, y: 0}};
        this.score = 0;
        this.gameRunning = true;
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.fruitSpawnTimer = 0;
        this.fruit = null;
        this.scorePopup = null;
        this.currentFruitLevel = 0;
        this.ghostsEatenInPowerMode = 0;
        this.startBtn.disabled = true;
        this.createMaze();
        
        // Ensure all ghosts start in normal mode
        this.ghosts.forEach(ghost => {
            ghost.mode = 'normal';
        });
        
        // Stop all sounds and play start music
        this.stopAllSounds();
        this.sounds.startMusic();
        
        // Start background siren after start music finishes
        setTimeout(() => {
            if (this.gameRunning) {
                this.sounds.siren();
            }
        }, 2000);
        
        this.updateScore();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        setTimeout(() => this.gameLoop(), 200);
    }
    
    update() {
        // Spawn fruit more frequently (authentic Pac-Man timing)
        this.fruitSpawnTimer++;
        if (this.fruitSpawnTimer > 150 && !this.fruit && Math.random() < 0.02) { // Spawn fruit every ~30 seconds randomly
            this.spawnFruit();
        }
        
        // Remove fruit after less time (authentic timing)
        if (this.fruit && this.fruit.timer > 200) { // Fruit disappears after ~40 seconds
            this.fruit = null;
        }
        
        if (this.fruit) {
            this.fruit.timer++;
        }
        
        // Move Pac-Man
        let newX = this.pacman.x + this.pacman.direction.x;
        let newY = this.pacman.y + this.pacman.direction.y;
        
        // Handle tunnel (horizontal wraparound on rows 7 and 11)
        if (newY === 7 || newY === 11) {
            if (newX < 0) newX = this.cols - 1;
            if (newX >= this.cols) newX = 0;
        }
        
        // Check boundaries and walls (including ghost house)
        if (newX >= 0 && newX < this.cols && newY >= 0 && newY < this.rows) {
            if (this.maze[newY][newX] !== 1 && this.maze[newY][newX] !== 4) {
                this.pacman.x = newX;
                this.pacman.y = newY;
                
                // Eat dot
                if (this.maze[newY][newX] === 0) {
                    this.maze[newY][newX] = 2;
                    this.score += 10;
                    this.updateScore();
                    this.totalDots--;
                    
                    // Use corner sound occasionally for variety
                    if (Math.random() < 0.2) {
                        this.sounds.chompCorner();
                    } else {
                        this.sounds.chomp();
                    }
                    
                    if (this.totalDots === 0 && this.totalPowerPellets === 0) {
                        this.gameWin();
                    }
                }
                
                // Eat power pellet
                if (this.maze[newY][newX] === 3) {
                    this.maze[newY][newX] = 2;
                    this.score += 50;
                    this.updateScore();
                    this.totalPowerPellets--;
                    this.sounds.powerPellet();
                    this.activatePowerMode();
                    
                    if (this.totalDots === 0 && this.totalPowerPellets === 0) {
                        this.gameWin();
                    }
                }
                
                // Eat fruit
                if (this.fruit && this.fruit.x === newX && this.fruit.y === newY) {
                    this.score += this.fruit.points;
                    this.updateScore();
                    this.sounds.eatFruit();
                    
                    // Create score popup
                    this.scorePopup = {
                        x: this.fruit.x * this.cellSize + this.cellSize / 2,
                        y: this.fruit.y * this.cellSize + this.cellSize / 2,
                        text: this.fruit.points.toString(),
                        timer: 60 // 2 seconds at 30 FPS
                    };
                    
                    this.fruit = null;
                    this.fruitSpawnTimer = 0;
                    
                    // Level up fruit type for next spawn
                    if (this.currentFruitLevel < this.fruitTypes.length - 1) {
                        this.currentFruitLevel++;
                    }
                }
            }
        }
        
        // Move ghosts
        this.moveGhosts();
        
        // Update power mode
        if (this.powerMode) {
            this.powerModeTimer--;
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;
                // Stop vulnerable sound and restart siren
                this.sounds.stopVulnerable();
                this.sounds.siren();
                
                this.ghosts.forEach(ghost => {
                    if (ghost.mode === 'frightened') {
                        ghost.mode = 'normal';
                    }
                });
            }
        }
        
        // Check ghost collisions
        this.checkGhostCollisions();
    }
    
    spawnFruit() {
        // Original Pac-Man fruit spawns underneath the center box (not inside ghost house)
        const fruitPositions = [
            {x: 9, y: 11}, {x: 10, y: 11}, // Just below ghost house center
            {x: 8, y: 11}, {x: 11, y: 11}  // Alternative spots below ghost house
        ];
        
        const position = fruitPositions[Math.floor(Math.random() * fruitPositions.length)];
        const fruitType = this.fruitTypes[this.currentFruitLevel];
        
        this.fruit = {
            x: position.x,
            y: position.y,
            type: fruitType,
            points: fruitType.points,
            color: fruitType.color,
            symbol: fruitType.symbol,
            timer: 0
        };
    }
    
    moveGhosts() {
        this.ghosts.forEach(ghost => {
            // Simple AI: change direction when hitting walls or randomly
            if (Math.random() < 0.3 || this.isWallInDirection(ghost)) {
                this.changeGhostDirection(ghost);
            }
            
            let newX = ghost.x + ghost.direction.x;
            let newY = ghost.y + ghost.direction.y;
            
            // Handle tunnel for ghosts too
            if (newY === 7 || newY === 11) {
                if (newX < 0) newX = this.cols - 1;
                if (newX >= this.cols) newX = 0;
            }
            
            // Check if move is valid (ghosts can move through ghost house)
            if (newY >= 0 && newY < this.rows && newX >= 0 && newX < this.cols) {
                if (this.maze[newY][newX] !== 1) {
                    ghost.x = newX;
                    ghost.y = newY;
                } else {
                    this.changeGhostDirection(ghost);
                }
            } else {
                this.changeGhostDirection(ghost);
            }
        });
    }
    
    isWallInDirection(ghost) {
        const nextX = ghost.x + ghost.direction.x;
        const nextY = ghost.y + ghost.direction.y;
        
        if (nextY < 0 || nextY >= this.rows || nextX < 0 || nextX >= this.cols) {
            return true;
        }
        
        return this.maze[nextY][nextX] === 1;
    }
    
    changeGhostDirection(ghost) {
        const directions = [
            {x: 0, y: -1}, // up
            {x: 0, y: 1},  // down
            {x: -1, y: 0}, // left
            {x: 1, y: 0}   // right
        ];
        
        // Filter out directions that would hit walls
        const validDirections = directions.filter(dir => {
            const newX = ghost.x + dir.x;
            const newY = ghost.y + dir.y;
            
            if (newY < 0 || newY >= this.rows) return false;
            if (newX < 0 || newX >= this.cols) {
                // Allow tunnel movement
                return newY === 7 || newY === 11;
            }
            
            return this.maze[newY][newX] !== 1;
        });
        
        if (validDirections.length > 0) {
            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        }
    }
    
    activatePowerMode() {
        this.powerMode = true;
        this.powerModeTimer = 120; // ~24 seconds at 200ms per loop (authentic timing)
        this.ghostsEatenInPowerMode = 0; // Reset ghost eating counter
        
        // Stop siren and start vulnerable ghost sound
        this.sounds.stopSiren();
        this.sounds.vulnerableGhost();
        
        this.ghosts.forEach(ghost => {
            ghost.mode = 'frightened';
            // Reverse direction when frightened
            ghost.direction.x = -ghost.direction.x;
            ghost.direction.y = -ghost.direction.y;
        });
    }
    
    checkGhostCollisions() {
        this.ghosts.forEach((ghost, index) => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (this.powerMode && ghost.mode === 'frightened') {
                    // Authentic Pac-Man ghost scoring: 200, 400, 800, 1600
                    const ghostPoints = 200 * Math.pow(2, this.ghostsEatenInPowerMode);
                    this.score += ghostPoints;
                    this.updateScore();
                    this.ghostsEatenInPowerMode++;
                    
                    this.sounds.eatGhost(); // Play ghost eaten sound
                    
                    // Respawn ghost in center
                    ghost.x = 9 + (index % 2);
                    ghost.y = 9 + Math.floor(index / 2);
                    ghost.mode = 'normal';
                } else if (ghost.mode === 'normal') {
                    // Game over
                    this.gameOver();
                }
            }
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        
        // Stop all sounds and play death sound
        this.stopAllSounds();
        this.sounds.death();
        
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.maze[y][x];
                
                if (cell === 1) {
                    // Wall
                    this.ctx.fillStyle = '#00f';
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else if (cell === 0) {
                    // Dot
                    this.ctx.fillStyle = '#ff0';
                    const centerX = x * this.cellSize + this.cellSize / 2;
                    const centerY = y * this.cellSize + this.cellSize / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
                    this.ctx.fill();
                } else if (cell === 3) {
                    // Power pellet
                    this.ctx.fillStyle = '#ff0';
                    const centerX = x * this.cellSize + this.cellSize / 2;
                    const centerY = y * this.cellSize + this.cellSize / 2;
                    this.ctx.beginPath();
                    this.ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
                    this.ctx.fill();
                } else if (cell === 4) {
                    // Ghost house
                    this.ctx.fillStyle = '#333';
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }
        
        // Draw ghosts
        this.ghosts.forEach(ghost => {
            const centerX = ghost.x * this.cellSize + this.cellSize / 2;
            const centerY = ghost.y * this.cellSize + this.cellSize / 2;
            const radius = this.cellSize / 2 - 2;
            
            // Only draw ghosts as frightened if BOTH powerMode is active AND ghost is in frightened mode
            if (this.powerMode && ghost.mode === 'frightened') {
                // Frightened ghost (blue, flashing to white near end)
                this.ctx.fillStyle = this.powerModeTimer > 60 ? 'blue' : (Math.floor(Date.now() / 200) % 2 ? 'blue' : 'white');
            } else {
                // Normal ghost - use original color
                this.ctx.fillStyle = ghost.color;
            }
            
            // Ghost body (rounded top, flat bottom with wavy bottom)
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY - 2, radius, Math.PI, 0);
            this.ctx.lineTo(centerX + radius, centerY + radius - 2);
            
            // Wavy bottom
            for (let i = 0; i < 3; i++) {
                const waveX = centerX + radius - (i * radius * 2 / 3);
                const waveY = centerY + radius - 2 + (i % 2 === 0 ? -3 : 3);
                this.ctx.lineTo(waveX, waveY);
            }
            
            this.ctx.lineTo(centerX - radius, centerY + radius - 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Ghost eyes (different for frightened vs normal ghosts)
            if (this.powerMode && ghost.mode === 'frightened') {
                // Frightened ghost eyes (small white dots)
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(centerX - 3, centerY - 2, 1, 0, 2 * Math.PI);
                this.ctx.arc(centerX + 3, centerY - 2, 1, 0, 2 * Math.PI);
                this.ctx.fill();
            } else {
                // Normal ghost eyes (white circles with black pupils)
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(centerX - 4, centerY - 4, 3, 0, 2 * Math.PI);
                this.ctx.arc(centerX + 4, centerY - 4, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Black pupils
                this.ctx.fillStyle = 'black';
                this.ctx.beginPath();
                this.ctx.arc(centerX - 4, centerY - 4, 1, 0, 2 * Math.PI);
                this.ctx.arc(centerX + 4, centerY - 4, 1, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        });
        
        // Draw fruit if present
        if (this.fruit) {
            const centerX = this.fruit.x * this.cellSize + this.cellSize / 2;
            const centerY = this.fruit.y * this.cellSize + this.cellSize / 2;
            
            // Draw fruit symbol (emoji)
            this.ctx.font = `${this.cellSize - 4}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.fruit.symbol, centerX, centerY);
            
            // Draw points indicator
            this.ctx.fillStyle = this.fruit.color;
            this.ctx.font = '8px Arial';
            this.ctx.fillText(this.fruit.points, centerX, centerY + this.cellSize / 2 + 8);
        }
        
        // Draw Pac-Man
        this.ctx.fillStyle = '#ffff00';
        const centerX = this.pacman.x * this.cellSize + this.cellSize / 2;
        const centerY = this.pacman.y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 2 - 1;
        
        // Calculate mouth opening based on animation (mouth opens and closes)
        const mouthOpenAmount = 0.3 + 0.3 * Math.abs(Math.sin(Date.now() * 0.008));
        
        // Calculate mouth direction based on movement
        let startAngle, endAngle;
        
        if (this.pacman.direction.x === 1 && this.pacman.direction.y === 0) { // right
            startAngle = mouthOpenAmount;
            endAngle = 2 * Math.PI - mouthOpenAmount;
        } else if (this.pacman.direction.x === -1 && this.pacman.direction.y === 0) { // left
            startAngle = Math.PI + mouthOpenAmount;
            endAngle = Math.PI - mouthOpenAmount;
        } else if (this.pacman.direction.x === 0 && this.pacman.direction.y === -1) { // up
            startAngle = 1.5 * Math.PI + mouthOpenAmount;
            endAngle = 1.5 * Math.PI - mouthOpenAmount;
        } else if (this.pacman.direction.x === 0 && this.pacman.direction.y === 1) { // down
            startAngle = 0.5 * Math.PI + mouthOpenAmount;
            endAngle = 0.5 * Math.PI - mouthOpenAmount;
        } else { // default (right) when not moving
            startAngle = mouthOpenAmount;
            endAngle = 2 * Math.PI - mouthOpenAmount;
        }
        
        // Draw Pac-Man body
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw power mode indicator and score info
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        // Score display (top left)
        this.ctx.fillText(`SCORE: ${this.score}`, 10, 15);
        
        // Lives indicator (bottom left) - draw actual Pac-Man symbols
        this.ctx.textAlign = 'left';
        for (let i = 0; i < this.pacman.lives; i++) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(20 + i * 25, this.canvas.height - 15, 8, 0.2 * Math.PI, 1.8 * Math.PI);
            this.ctx.lineTo(20 + i * 25, this.canvas.height - 15);
            this.ctx.fill();
        }
        
        // Level indicator (bottom center)
        this.ctx.textAlign = 'center';
        const levelFruit = this.fruitTypes[Math.min(this.currentFruitLevel, this.fruitTypes.length - 1)];
        this.ctx.fillText(`LEVEL 1 ${levelFruit.symbol}`, this.canvas.width / 2, this.canvas.height - 5);
        
        // High score (top center)
        this.ctx.fillText('HIGH SCORE: 10000', this.canvas.width / 2, 15);
        
        if (this.powerMode) {
            this.ctx.fillStyle = this.powerModeTimer > 30 ? '#ffff00' : '#ff0000';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`POWER: ${Math.ceil(this.powerModeTimer / 5)}`, this.canvas.width - 10, 15);
        }
        
        // Draw score popup if exists
        if (this.scorePopup) {
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.scorePopup.text, this.scorePopup.x, this.scorePopup.y);
            
            this.scorePopup.timer--;
            if (this.scorePopup.timer <= 0) {
                this.scorePopup = null;
            }
        }
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    gameWin() {
        this.gameRunning = false;
        this.startBtn.disabled = false;
        
        // Stop all sounds
        this.stopAllSounds();
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 70);
    }
}

// Initialize Pac-Man game when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('pacmanCanvas')) {
        new PacManGame();
    }
});
