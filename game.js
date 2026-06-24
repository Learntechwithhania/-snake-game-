/* ============================================
   NEON SNAKE GAME - MAIN GAME LOGIC
   ============================================ */

// ============================================
// AUDIO MANAGER
// ============================================
class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sounds = {};
        this.initSounds();
    }

    initSounds() {
        // Create audio context for generating sounds
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Sound configurations
        this.soundConfigs = {
            eat: { frequency: 440, duration: 0.1, type: 'sine' },
            golden: { frequency: 880, duration: 0.2, type: 'sine' },
            poison: { frequency: 200, duration: 0.3, type: 'sawtooth' },
            powerup: { frequency: 600, duration: 0.3, type: 'triangle' },
            gameOver: { frequency: 150, duration: 0.5, type: 'sawtooth' },
            move: { frequency: 100, duration: 0.02, type: 'sine' },
            click: { frequency: 300, duration: 0.05, type: 'sine' }
        };
    }

    playSound(name) {
        if (!this.soundEnabled || !this.audioContext) return;

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const config = this.soundConfigs[name];
        if (!config) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = config.frequency;
        oscillator.type = config.type;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration);

        // Special effects for certain sounds
        if (name === 'golden') {
            // Add a second harmonic for golden food
            setTimeout(() => {
                if (!this.soundEnabled) return;
                const osc2 = this.audioContext.createOscillator();
                const gain2 = this.audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(this.audioContext.destination);
                osc2.frequency.value = 660;
                osc2.type = 'sine';
                gain2.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
                osc2.start(this.audioContext.currentTime);
                osc2.stop(this.audioContext.currentTime + 0.15);
            }, 100);
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        return this.musicEnabled;
    }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
    }

    createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                decay: 0.02 + Math.random() * 0.02,
                size: 3 + Math.random() * 5,
                color: color
            });
        }
    }

    createTrail(x, y, color) {
        this.particles.push({
            x: x,
            y: y,
            vx: 0,
            vy: 0,
            life: 0.5,
            decay: 0.05,
            size: 4,
            color: color,
            isTrail: true
        });
    }

    update() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (!p.isTrail) {
                p.vy += 0.2; // gravity
            }
            return p.life > 0;
        });
    }

    draw() {
        this.particles.forEach(p => {
            this.ctx.save();
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
}

// ============================================
// MAIN GAME CLASS
// ============================================
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game settings
        this.gridSize = 20;
        this.settings = {
            theme: 'neon',
            skin: 'default',
            soundEnabled: true,
            musicEnabled: true,
            wallMode: 'die', // 'die' or 'wrap'
            difficulty: 'normal'
        };

        // Speed settings based on difficulty (slower for kids)
        this.speedSettings = {
            easy: 400,      // Very slow for beginners
            normal: 300,    // Comfortable for kids
            hard: 220       // Moderate challenge
        };

        // Initialize systems
        this.audioManager = new AudioManager();
        this.particleSystem = null; // Will be initialized after canvas resize

        // Game state
        this.gameState = 'menu'; // menu, playing, paused, gameover
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.foodEaten = 0;
        this.startTime = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.lastEatTime = 0;
        this.comboTimeout = 2000; // 2 seconds to maintain combo

        // Lives system
        this.lives = 3;
        this.maxLives = 3;
        this.isInvulnerable = false;
        this.invulnerabilityEndTime = 0;

        // Snake
        this.snake = [];
        this.direction = 'right';
        this.nextDirection = 'right';

        // Food & Power-ups
        this.food = null;
        this.specialFood = null;
        this.powerUp = null;
        this.activePowerUp = null;
        this.powerUpEndTime = 0;

        // Colors based on skin
        this.skinColors = {
            default: { head: '#00ffaa', body: '#00cc88', glow: 'rgba(0, 255, 170, 0.5)' },
            fire: { head: '#ff6600', body: '#ff3300', glow: 'rgba(255, 102, 0, 0.5)' },
            ice: { head: '#00ccff', body: '#0099cc', glow: 'rgba(0, 204, 255, 0.5)' },
            rainbow: { head: '#ff0000', body: '#ff0000', glow: 'rgba(255, 255, 255, 0.5)', rainbow: true }
        };

        // Encouraging messages for kids
        this.encouragingMessages = {
            foodEat: ['Great job! 🎉', 'Awesome! 🌟', 'You\'re doing amazing! 👏', 'Keep going! 💪', 'Fantastic! ✨'],
            lostLife: ['Don\'t worry, try again! 💙', 'You can do it! 💪', 'Keep practicing! 🌟', 'Almost there! 👍'],
            milestone: ['You\'re a star! ⭐', 'Incredible! 🎊', 'You\'re on fire! 🔥', 'Amazing skills! 🏆']
        };

        // Animation
        this.animationFrame = null;
        this.lastUpdateTime = 0;
        this.accumulator = 0;

        // Initialize
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.loadSettings();
        this.updateHighScoreDisplay();
        this.bindEvents();
        this.particleSystem = new ParticleSystem(this.canvas, this.ctx);

        // Start menu animation loop
        this.menuLoop();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const maxWidth = Math.min(window.innerWidth - 40, 500);
        const maxHeight = window.innerHeight - 300;

        // Calculate size based on grid
        const size = Math.min(maxWidth, maxHeight);
        const gridCount = Math.floor(size / this.gridSize);
        const canvasSize = gridCount * this.gridSize;

        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
        this.cols = gridCount;
        this.rows = gridCount;
    }

    loadSettings() {
        const saved = localStorage.getItem('snakeSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.applySettings();
        }
    }

    saveSettings() {
        localStorage.setItem('snakeSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        // Apply theme
        document.body.className = `theme-${this.settings.theme}`;

        // Update UI toggles
        document.getElementById('soundToggle').checked = this.settings.soundEnabled;
        document.getElementById('musicToggle').checked = this.settings.musicEnabled;

        // Update audio manager
        this.audioManager.soundEnabled = this.settings.soundEnabled;
        this.audioManager.musicEnabled = this.settings.musicEnabled;

        // Update button active states
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.skin === this.settings.skin);
        });
        document.querySelectorAll('.wall-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.wall === this.settings.wallMode);
        });
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === this.settings.difficulty);
        });
    }

    bindEvents() {
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.particleSystem) {
                this.particleSystem.canvas = this.canvas;
                this.particleSystem.ctx = this.ctx;
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Button events
        document.getElementById('playBtn').addEventListener('click', () => this.startGame());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showScreen('settingsScreen'));
        document.getElementById('howToPlayBtn').addEventListener('click', () => this.showScreen('howToPlayScreen'));
        document.getElementById('settingsBackBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('howToPlayBackBtn').addEventListener('click', () => this.showScreen('startScreen'));
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        document.getElementById('resumeBtn').addEventListener('click', () => this.resumeGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('quitBtn').addEventListener('click', () => this.quitToMenu());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareScore());
        document.getElementById('menuBtn').addEventListener('click', () => this.quitToMenu());

        // Settings events
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.theme = btn.dataset.theme;
                this.applySettings();
                this.saveSettings();
                this.audioManager.playSound('click');
            });
        });

        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.skin = btn.dataset.skin;
                this.applySettings();
                this.saveSettings();
                this.audioManager.playSound('click');
            });
        });

        document.querySelectorAll('.wall-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.wallMode = btn.dataset.wall;
                this.applySettings();
                this.saveSettings();
                this.audioManager.playSound('click');
            });
        });

        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.difficulty = btn.dataset.diff;
                this.applySettings();
                this.saveSettings();
                this.audioManager.playSound('click');
            });
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.settings.soundEnabled = e.target.checked;
            this.audioManager.soundEnabled = e.target.checked;
            this.saveSettings();
        });

        document.getElementById('musicToggle').addEventListener('change', (e) => {
            this.settings.musicEnabled = e.target.checked;
            this.audioManager.musicEnabled = e.target.checked;
            this.saveSettings();
        });

        // Mobile controls
        document.querySelectorAll('.mobile-btn').forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.setDirection(btn.dataset.dir);
                this.audioManager.playSound('click');
            });
            btn.addEventListener('click', () => {
                this.setDirection(btn.dataset.dir);
                this.audioManager.playSound('click');
            });
        });

        // Touch swipe controls
        this.setupTouchControls();
    }

    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 30;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
                this.setDirection(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > minSwipeDistance) {
                this.setDirection(dy > 0 ? 'down' : 'up');
            }
        }, { passive: true });
    }

    handleKeyDown(e) {
        // Prevent default for arrow keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        if (this.gameState === 'playing') {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.setDirection('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.setDirection('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.setDirection('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.setDirection('right');
                    break;
                case ' ':
                    this.togglePause();
                    break;
                case 'Escape':
                    this.togglePause();
                    break;
            }
        } else if (this.gameState === 'paused') {
            if (e.key === ' ' || e.key === 'Escape') {
                this.resumeGame();
            }
        } else if (this.gameState === 'menu') {
            if (e.key === 'Enter' || e.key === ' ') {
                this.startGame();
            }
        } else if (this.gameState === 'gameover') {
            if (e.key === 'Enter' || e.key === ' ') {
                this.restartGame();
            }
        }
    }

    setDirection(dir) {
        if (this.gameState !== 'playing') return;

        const opposites = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };

        // Prevent reversing direction
        if (dir !== opposites[this.direction]) {
            this.nextDirection = dir;
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.audioManager.playSound('click');
    }

    updateHighScoreDisplay() {
        document.getElementById('menuHighScore').textContent = this.highScore;
        document.getElementById('highScore').textContent = this.highScore;
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.foodEaten = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.startTime = Date.now();
        this.lastEatTime = 0;
        this.activePowerUp = null;
        this.powerUpEndTime = 0;
        this.lives = this.maxLives;
        this.isInvulnerable = false;
        this.invulnerabilityEndTime = 0;

        // Initialize snake in center
        const centerX = Math.floor(this.cols / 2);
        const centerY = Math.floor(this.rows / 2);
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];

        this.direction = 'right';
        this.nextDirection = 'right';

        // Spawn first food
        this.spawnFood();

        // Update UI
        document.getElementById('currentScore').textContent = '0';
        this.updateLivesDisplay();
        this.showScreen('gameScreen');

        // Cancel menu loop and start game loop
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.lastUpdateTime = performance.now();
        this.accumulator = 0;
        this.gameLoop();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pauseScreen');
            document.getElementById('gameScreen').classList.add('active');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseScreen').classList.remove('active');
            this.lastUpdateTime = performance.now();
            this.gameLoop();
        }
    }

    restartGame() {
        this.startGame();
    }

    quitToMenu() {
        this.gameState = 'menu';
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.showScreen('startScreen');
        this.menuLoop();
    }

    toggleMute() {
        const muted = !this.settings.soundEnabled;
        this.settings.soundEnabled = !muted;
        this.audioManager.soundEnabled = !muted;
        document.getElementById('muteBtn').textContent = muted ? '🔇' : '🔊';
        this.saveSettings();
    }

    spawnFood() {
        this.food = this.getRandomEmptyPosition();
        this.food.type = 'normal';

        // Chance to spawn special food
        if (Math.random() < 0.1 && !this.specialFood) {
            this.specialFood = this.getRandomEmptyPosition();
            this.specialFood.type = Math.random() < 0.7 ? 'golden' : 'poison';
            // Special food disappears after some time
            setTimeout(() => {
                this.specialFood = null;
            }, 5000);
        }

        // Chance to spawn power-up
        if (Math.random() < 0.05 && !this.powerUp && this.foodEaten > 5) {
            this.powerUp = this.getRandomEmptyPosition();
            const powerTypes = ['speed', 'shield', 'double'];
            this.powerUp.type = powerTypes[Math.floor(Math.random() * powerTypes.length)];
            setTimeout(() => {
                this.powerUp = null;
            }, 7000);
        }
    }

    getRandomEmptyPosition() {
        let pos;
        let attempts = 0;
        do {
            pos = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
            attempts++;
        } while (this.isPositionOccupied(pos) && attempts < 100);
        return pos;
    }

    isPositionOccupied(pos) {
        // Check snake
        for (const segment of this.snake) {
            if (segment.x === pos.x && segment.y === pos.y) return true;
        }
        // Check food
        if (this.food && this.food.x === pos.x && this.food.y === pos.y) return true;
        if (this.specialFood && this.specialFood.x === pos.x && this.specialFood.y === pos.y) return true;
        if (this.powerUp && this.powerUp.x === pos.x && this.powerUp.y === pos.y) return true;
        return false;
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check invulnerability status
        if (this.isInvulnerable && Date.now() > this.invulnerabilityEndTime) {
            this.isInvulnerable = false;
        }

        // Handle wall collision based on mode
        if (this.settings.wallMode === 'wrap') {
            if (head.x < 0) head.x = this.cols - 1;
            if (head.x >= this.cols) head.x = 0;
            if (head.y < 0) head.y = this.rows - 1;
            if (head.y >= this.rows) head.y = 0;
        } else {
            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
                if (!this.isInvulnerable) {
                    this.loseLife();
                }
                return;
            }
        }

        // Check self collision (skip if shield active or invulnerable)
        if (this.activePowerUp !== 'shield' && !this.isInvulnerable) {
            for (let i = 0; i < this.snake.length; i++) {
                if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                    this.loseLife();
                    return;
                }
            }
        }

        // Add new head
        this.snake.unshift(head);

        // Check food collision
        let ate = false;

        // Normal food
        if (this.food && head.x === this.food.x && head.y === this.food.y) {
            let points = 10;
            if (this.activePowerUp === 'double') points *= 2;

            // Combo system
            const now = Date.now();
            if (now - this.lastEatTime < this.comboTimeout) {
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                points *= (1 + this.combo * 0.5);
                this.showCombo();
            } else {
                this.combo = 1;
            }
            this.lastEatTime = now;

            this.score += Math.floor(points);
            this.foodEaten++;
            ate = true;
            this.audioManager.playSound('eat');
            this.createFoodParticles(head.x, head.y, '#ff4444');
            this.spawnFood();

            // Show encouraging message every 5 foods
            if (this.foodEaten % 5 === 0) {
                this.showEncouragingMessage('milestone');
            } else if (Math.random() < 0.3) {
                // 30% chance to show regular encouragement
                this.showEncouragingMessage('foodEat');
            }
        }

        // Special food
        if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
            if (this.specialFood.type === 'golden') {
                let points = 50;
                if (this.activePowerUp === 'double') points *= 2;
                this.score += points;
                this.audioManager.playSound('golden');
                this.createFoodParticles(head.x, head.y, '#ffdd00');
            } else if (this.specialFood.type === 'poison') {
                this.score = Math.max(0, this.score - 20);
                // Shrink snake
                if (this.snake.length > 3) {
                    this.snake.pop();
                    this.snake.pop();
                }
                this.audioManager.playSound('poison');
                this.createFoodParticles(head.x, head.y, '#aa00ff');
                this.shakeScreen();
            }
            this.specialFood = null;
            ate = true;
        }

        // Power-up
        if (this.powerUp && head.x === this.powerUp.x && head.y === this.powerUp.y) {
            this.activePowerUp = this.powerUp.type;
            this.powerUpEndTime = Date.now() + 5000; // 5 second duration
            this.audioManager.playSound('powerup');
            this.createFoodParticles(head.x, head.y, '#00ff00');
            this.showPowerUpIndicator();
            this.powerUp = null;
            ate = true;
        }

        // Remove tail if didn't eat
        if (!ate) {
            this.snake.pop();
        }

        // Update score display
        document.getElementById('currentScore').textContent = this.score;

        // Check power-up expiry
        if (this.activePowerUp && Date.now() > this.powerUpEndTime) {
            this.activePowerUp = null;
            this.hidePowerUpIndicator();
        }

        // Update particles
        this.particleSystem.update();
    }

    createFoodParticles(gridX, gridY, color) {
        const x = gridX * this.gridSize + this.gridSize / 2;
        const y = gridY * this.gridSize + this.gridSize / 2;
        this.particleSystem.createParticles(x, y, color, 15);
    }

    showCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        comboDisplay.querySelector('.combo-value').textContent = `x${this.combo}`;
        comboDisplay.classList.add('show');
        setTimeout(() => {
            comboDisplay.classList.remove('show');
        }, 500);
    }

    showPowerUpIndicator() {
        const indicator = document.getElementById('powerupIndicator');
        const icons = { speed: '⚡', shield: '🛡', double: '2️⃣' };
        indicator.querySelector('.powerup-icon').textContent = icons[this.activePowerUp];
        indicator.classList.add('active');
        this.updatePowerUpTimer();
    }

    updatePowerUpTimer() {
        if (!this.activePowerUp) return;
        const remaining = Math.max(0, Math.ceil((this.powerUpEndTime - Date.now()) / 1000));
        document.getElementById('powerupIndicator').querySelector('.powerup-timer').textContent = `${remaining}s`;
        if (remaining > 0) {
            setTimeout(() => this.updatePowerUpTimer(), 100);
        }
    }

    hidePowerUpIndicator() {
        document.getElementById('powerupIndicator').classList.remove('active');
    }

    shakeScreen() {
        const container = document.querySelector('.game-container');
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 300);
    }

    updateLivesDisplay() {
        const hearts = '❤️'.repeat(this.lives) + '🤍'.repeat(this.maxLives - this.lives);
        document.getElementById('livesDisplay').textContent = hearts;
    }

    showEncouragingMessage(type) {
        const messages = this.encouragingMessages[type];
        if (!messages || messages.length === 0) return;

        const message = messages[Math.floor(Math.random() * messages.length)];
        const messageDisplay = document.getElementById('messageDisplay');
        const messageText = messageDisplay.querySelector('.message-text');

        messageText.textContent = message;
        messageDisplay.classList.add('show');

        setTimeout(() => {
            messageDisplay.classList.remove('show');
        }, 1500);
    }

    loseLife() {
        this.lives--;
        this.updateLivesDisplay();
        this.audioManager.playSound('poison');
        this.shakeScreen();

        if (this.lives > 0) {
            // Still have lives, show encouraging message and make invulnerable
            this.showEncouragingMessage('lostLife');
            this.isInvulnerable = true;
            this.invulnerabilityEndTime = Date.now() + 1500; // 1.5 seconds invulnerability

            // Reset snake to center but keep score
            const centerX = Math.floor(this.cols / 2);
            const centerY = Math.floor(this.rows / 2);
            this.snake = [
                { x: centerX, y: centerY },
                { x: centerX - 1, y: centerY },
                { x: centerX - 2, y: centerY }
            ];
            this.direction = 'right';
            this.nextDirection = 'right';

            // Particle effect
            this.createFoodParticles(centerX, centerY, '#ff0044');
        } else {
            // No more lives, game over
            this.gameOver();
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.getBackgroundGradient();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines (subtle)
        this.drawGrid();

        // Draw food
        this.drawFood();

        // Draw special food
        if (this.specialFood) {
            this.drawSpecialFood(this.specialFood);
        }

        // Draw power-up
        if (this.powerUp) {
            this.drawPowerUp(this.powerUp);
        }

        // Draw snake
        this.drawSnake();

        // Draw particles
        this.particleSystem.draw();
    }

    getBackgroundGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#141428');
        gradient.addColorStop(1, '#0a0a1a');
        return gradient;
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        const skin = this.skinColors[this.settings.skin];

        // Apply invulnerability blinking effect
        if (this.isInvulnerable && Math.floor(Date.now() / 150) % 2 === 0) {
            return; // Skip drawing to create blink effect
        }

        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize - 2;

            let color;
            if (skin.rainbow) {
                const hue = (Date.now() / 10 + index * 20) % 360;
                color = `hsl(${hue}, 100%, 50%)`;
            } else {
                color = index === 0 ? skin.head : skin.body;
            }

            this.ctx.save();

            // Glow effect
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = skin.glow;

            // Draw segment
            this.ctx.fillStyle = color;
            this.ctx.beginPath();

            if (index === 0) {
                // Head - slightly larger and rounded
                this.ctx.roundRect(x + 1, y + 1, size, size, 6);

                // Draw eyes
                this.ctx.fill();
                this.ctx.shadowBlur = 0;

                // Eye positions based on direction
                let eyeOffsets = this.getEyePositions();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(x + eyeOffsets.eye1.x, y + eyeOffsets.eye1.y, 3, 0, Math.PI * 2);
                this.ctx.arc(x + eyeOffsets.eye2.x, y + eyeOffsets.eye2.y, 3, 0, Math.PI * 2);
                this.ctx.fill();

                // Pupils
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(x + eyeOffsets.eye1.x + eyeOffsets.pupilOffset.x, y + eyeOffsets.eye1.y + eyeOffsets.pupilOffset.y, 1.5, 0, Math.PI * 2);
                this.ctx.arc(x + eyeOffsets.eye2.x + eyeOffsets.pupilOffset.x, y + eyeOffsets.eye2.y + eyeOffsets.pupilOffset.y, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Body segments with slight size variation
                const bodySize = size - (index * 0.1);
                const offset = (size - bodySize) / 2;
                this.ctx.roundRect(x + 1 + offset, y + 1 + offset, Math.max(bodySize, size * 0.7), Math.max(bodySize, size * 0.7), 4);
                this.ctx.fill();
            }

            this.ctx.restore();

            // Add trail particle for moving snake
            if (index === this.snake.length - 1 && this.gameState === 'playing') {
                this.particleSystem.createTrail(
                    x + this.gridSize / 2,
                    y + this.gridSize / 2,
                    skin.rainbow ? `hsl(${(Date.now() / 10) % 360}, 100%, 50%)` : skin.body
                );
            }
        });

        // Shield effect
        if (this.activePowerUp === 'shield') {
            const head = this.snake[0];
            this.ctx.save();
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(
                head.x * this.gridSize + this.gridSize / 2,
                head.y * this.gridSize + this.gridSize / 2,
                this.gridSize * 0.8,
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
            this.ctx.restore();
        }
    }

    getEyePositions() {
        const center = this.gridSize / 2;
        const eyeDistance = 4;
        const eyeForward = 4;

        switch (this.direction) {
            case 'right':
                return {
                    eye1: { x: center + eyeForward, y: center - eyeDistance },
                    eye2: { x: center + eyeForward, y: center + eyeDistance },
                    pupilOffset: { x: 1, y: 0 }
                };
            case 'left':
                return {
                    eye1: { x: center - eyeForward, y: center - eyeDistance },
                    eye2: { x: center - eyeForward, y: center + eyeDistance },
                    pupilOffset: { x: -1, y: 0 }
                };
            case 'up':
                return {
                    eye1: { x: center - eyeDistance, y: center - eyeForward },
                    eye2: { x: center + eyeDistance, y: center - eyeForward },
                    pupilOffset: { x: 0, y: -1 }
                };
            case 'down':
                return {
                    eye1: { x: center - eyeDistance, y: center + eyeForward },
                    eye2: { x: center + eyeDistance, y: center + eyeForward },
                    pupilOffset: { x: 0, y: 1 }
                };
        }
    }

    drawFood() {
        if (!this.food) return;

        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 3;

        // Pulsing animation
        const pulse = Math.sin(Date.now() / 200) * 2;

        this.ctx.save();
        this.ctx.shadowBlur = 20 + pulse;
        this.ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';

        // Draw apple shape
        this.ctx.fillStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + 2, radius + pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Stem
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#44aa44';
        this.ctx.fillRect(centerX - 1, centerY - radius - 3, 2, 5);

        // Leaf
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 4, centerY - radius - 2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Shine
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(centerX - 3, centerY - 2, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawSpecialFood(food) {
        const x = food.x * this.gridSize;
        const y = food.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;

        const pulse = Math.sin(Date.now() / 150) * 3;
        const rotation = Date.now() / 500;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(rotation);

        if (food.type === 'golden') {
            // Golden star
            this.ctx.shadowBlur = 25 + pulse;
            this.ctx.shadowColor = 'rgba(255, 221, 0, 0.9)';
            this.ctx.fillStyle = '#ffdd00';

            this.drawStar(0, 0, 5, radius + pulse, radius / 2);
            this.ctx.fill();

            // Inner glow
            this.ctx.fillStyle = '#ffffff';
            this.ctx.globalAlpha = 0.5;
            this.drawStar(0, 0, 5, radius / 2, radius / 4);
            this.ctx.fill();
        } else if (food.type === 'poison') {
            // Poison skull
            this.ctx.shadowBlur = 20 + pulse;
            this.ctx.shadowColor = 'rgba(170, 0, 255, 0.8)';
            this.ctx.fillStyle = '#aa00ff';

            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
            this.ctx.fill();

            // Skull face
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(-3, -2, 3, 0, Math.PI * 2);
            this.ctx.arc(3, -2, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Mouth
            this.ctx.fillRect(-4, 4, 8, 2);
        }

        this.ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;

        this.ctx.beginPath();
        this.ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            this.ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.ctx.lineTo(x, y);
            rot += step;
        }

        this.ctx.lineTo(cx, cy - outerRadius);
        this.ctx.closePath();
    }

    drawPowerUp(powerUp) {
        const x = powerUp.x * this.gridSize;
        const y = powerUp.y * this.gridSize;
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        const radius = this.gridSize / 2 - 2;

        const pulse = Math.sin(Date.now() / 100) * 2;
        const float = Math.sin(Date.now() / 300) * 3;

        this.ctx.save();
        this.ctx.translate(centerX, centerY + float);

        const colors = {
            speed: { main: '#ffaa00', glow: 'rgba(255, 170, 0, 0.8)' },
            shield: { main: '#00ffff', glow: 'rgba(0, 255, 255, 0.8)' },
            double: { main: '#ff00ff', glow: 'rgba(255, 0, 255, 0.8)' }
        };

        const color = colors[powerUp.type];

        this.ctx.shadowBlur = 25 + pulse;
        this.ctx.shadowColor = color.glow;
        this.ctx.fillStyle = color.main;

        // Outer ring
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner circle
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Icon
        this.ctx.globalAlpha = 1;
        this.ctx.fillStyle = '#000000';
        this.ctx.font = `${radius}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const icons = { speed: '⚡', shield: '🛡', double: '2' };
        this.ctx.fillText(icons[powerUp.type], 0, 0);

        this.ctx.restore();
    }

    gameOver() {
        this.gameState = 'gameover';
        this.audioManager.playSound('gameOver');
        this.shakeScreen();

        // Check high score
        const isNewHighScore = this.score > this.highScore;
        if (isNewHighScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScoreDisplay();
        }

        // Calculate time played
        const timePlayed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timePlayed / 60);
        const seconds = timePlayed % 60;

        // Update game over screen
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('foodEaten').textContent = this.foodEaten;
        document.getElementById('timePlayed').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('maxCombo').textContent = `x${this.maxCombo}`;

        const newHighScoreEl = document.getElementById('newHighScore');
        newHighScoreEl.classList.toggle('show', isNewHighScore);

        // Show game over screen with delay
        setTimeout(() => {
            this.showScreen('gameOverScreen');
            document.getElementById('gameScreen').classList.add('active');
        }, 500);
    }

    shareScore() {
        const text = `🐍 I scored ${this.score} points in Neon Snake! Can you beat my score? Play now!`;

        if (navigator.share) {
            navigator.share({
                title: 'Neon Snake Score',
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Score copied to clipboard!');
            }).catch(() => {
                alert(text);
            });
        }
    }

    menuLoop() {
        if (this.gameState !== 'menu') return;

        // Simple animation for menu background
        this.animationFrame = requestAnimationFrame(() => this.menuLoop());
    }

    gameLoop(currentTime = performance.now()) {
        if (this.gameState !== 'playing') return;

        this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));

        const deltaTime = currentTime - this.lastUpdateTime;
        this.lastUpdateTime = currentTime;

        // Get current speed with progressive difficulty
        let speed = this.speedSettings[this.settings.difficulty];

        // Progressive speed increase: snake gets slightly faster as it grows
        // But cap it so it doesn't become too fast for kids
        const snakeLength = this.snake.length;
        const speedReduction = Math.min(snakeLength - 3, 30) * 2; // Max 60ms speed increase
        speed = Math.max(speed - speedReduction, speed * 0.7); // Don't go faster than 30% of base speed

        if (this.activePowerUp === 'speed') {
            speed *= 0.6; // 40% faster
        }

        this.accumulator += deltaTime;

        // Fixed time step for game logic
        while (this.accumulator >= speed) {
            this.update();
            this.accumulator -= speed;
        }

        // Always draw
        this.draw();
    }
}

// ============================================
// INITIALIZE GAME
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Polyfill for roundRect if needed
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (w < 2 * r) r = w / 2;
            if (h < 2 * r) r = h / 2;
            this.beginPath();
            this.moveTo(x + r, y);
            this.arcTo(x + w, y, x + w, y + h, r);
            this.arcTo(x + w, y + h, x, y + h, r);
            this.arcTo(x, y + h, x, y, r);
            this.arcTo(x, y, x + w, y, r);
            this.closePath();
            return this;
        };
    }

    const game = new SnakeGame();
});
