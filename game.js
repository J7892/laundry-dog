/**
 * Laundry Dog - Side Scrolling Household Retriever Game
 * Core Game Engine
 * Features: Web Audio API Synth, Physics Engine, Procedural Canvas Graphics, Parallax Rooms
 */

// ==========================================================================
// 1. SOUND SYSTEM (WEB AUDIO API SYNTHESIZER)
// ==========================================================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.musicInterval = null;
    this.musicEnabled = true;
    this.tempo = 130;
    this.beatDuration = 60 / this.tempo;
    this.noteSequence = [
      'C3', 'E3', 'G3', 'C4', 'G3', 'E3',
      'F3', 'A3', 'C4', 'F4', 'C4', 'A3',
      'G3', 'B3', 'D4', 'G4', 'D4', 'B3',
      'C3', 'E3', 'G3', 'C4', 'G3', 'E3',
      'A3', 'C4', 'E4', 'A4', 'E4', 'C4',
      'D3', 'F#3', 'A3', 'D4', 'A3', 'F#3',
      'G3', 'B3', 'D4', 'G4', 'D4', 'B3',
      'G3', 'B3', 'D4', 'G4', 'F4', 'D4'
    ];
    this.noteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  getFreq(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = note.slice(0, -1);
    const octave = parseInt(note.slice(-1), 10);
    const semitones = notes.indexOf(name) + (octave - 4) * 12;
    return 440 * Math.pow(2, (semitones - 9) / 12);
  }

  playNote(freq, type = 'sine', duration = 0.2, volume = 0.1, delay = 0) {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const time = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gainNode.gain.setValueAtTime(volume, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  playJump() {
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(600, time + 0.15);
    
    gainNode.gain.setValueAtTime(0.08, time);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.15);
  }

  playDuck() {
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, time);
    osc.frequency.linearRampToValueAtTime(120, time + 0.08);
    
    gainNode.gain.setValueAtTime(0.08, time);
    gainNode.gain.linearRampToValueAtTime(0.0001, time + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.08);
  }

  playCollect() {
    // 3 quick notes ascending arpeggio
    this.playNote(523.25, 'sine', 0.08, 0.05, 0);      // C5
    this.playNote(659.25, 'sine', 0.08, 0.05, 0.04);   // E5
    this.playNote(783.99, 'sine', 0.12, 0.05, 0.08);   // G5
    this.playNote(1046.50, 'sine', 0.20, 0.07, 0.12);  // C6
  }

  playTreat() {
    // Longer high-pitch chime sweep arpeggio
    this.playNote(523.25, 'sine', 0.08, 0.05, 0);      // C5
    this.playNote(659.25, 'sine', 0.08, 0.05, 0.04);   // E5
    this.playNote(783.99, 'sine', 0.08, 0.05, 0.08);   // G5
    this.playNote(1046.50, 'sine', 0.08, 0.05, 0.12);  // C6
    this.playNote(1318.51, 'sine', 0.30, 0.08, 0.16);  // E6
  }

  playHurt() {
    this.init();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.linearRampToValueAtTime(30, time + 0.2);
    
    gainNode.gain.setValueAtTime(0.12, time);
    gainNode.gain.linearRampToValueAtTime(0.0001, time + 0.2);
    
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

  playDeposit() {
    // Bubble sound sweep
    this.playNote(300, 'sine', 0.1, 0.04, 0);
    this.playNote(500, 'sine', 0.08, 0.04, 0.04);
    this.playNote(700, 'sine', 0.08, 0.04, 0.08);
  }

  playVictory() {
    this.init();
    if (!this.ctx) return;
    // Elegant arpeggio chime (C major 9th/13th chord structure)
    const freqs = [261.63, 329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, idx) => {
      this.playNote(freq, 'sine', 0.45, 0.04, idx * 0.07);
    });
  }

  playGameOver() {
    this.init();
    if (!this.ctx) return;
    // Sad, descending buzz chord
    const time = this.ctx.currentTime;
    [150, 120, 95].forEach((baseFreq, idx) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, time);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.5, time + 0.8);
      
      gainNode.gain.setValueAtTime(0.05, time);
      gainNode.gain.linearRampToValueAtTime(0.0001, time + 0.8);
      
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.8);
    });
  }

  startMusic() {
    if (!this.musicEnabled) return;
    this.init();
    if (this.musicInterval) return;

    this.noteIndex = 0;
    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled) return;
      const note = this.noteSequence[this.noteIndex];
      const freq = this.getFreq(note);

      // Play bass arpeggio notes
      this.playNote(freq, 'triangle', 0.35, 0.025);

      // Melodic notes occasionally
      if (this.noteIndex % 2 === 0) {
        const melNote = this.noteSequence[(this.noteIndex + 4) % this.noteSequence.length];
        const melFreq = this.getFreq(melNote) * 2;
        this.playNote(melFreq, 'sine', 0.22, 0.015);
      }

      this.noteIndex = (this.noteIndex + 1) % this.noteSequence.length;
    }, this.beatDuration * 500); // eighth notes (at 130 bpm, beat is ~0.46s, 500ms is close enough)
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }
}

// ==========================================================================
// 2. LEVEL DATABASES & DESIGNS
// ==========================================================================
const LEVELS = [
  {
    name: "Living Room",
    width: 3200,
    background: "#fdf8f2", // Soft peach wall
    floorColor: "#854d0e", // Oak floorboards
    wallpaperPattern: "stripes-vertical",
    theme: "living-room",
    furniture: [
      { x: 250, y: 390, width: 90, height: 90, type: "solid", label: "bookcase" },
      { x: 500, y: 440, width: 180, height: 40, type: "semi-solid-under", label: "coffee-table" },
      { x: 800, y: 380, width: 220, height: 100, type: "semi-solid", label: "couch" },
      { x: 1120, y: 430, width: 60, height: 50, type: "semi-solid", label: "chair" },
      { x: 1270, y: 370, width: 70, height: 20, type: "semi-solid", label: "shelf-step" },
      { x: 1380, y: 260, width: 110, height: 220, type: "solid", label: "cupboard" },
      { x: 1600, y: 440, width: 200, height: 40, type: "semi-solid-under", label: "coffee-table-2" },
      { x: 1950, y: 370, width: 260, height: 110, type: "semi-solid", label: "big-sofa" },
      { x: 2350, y: 250, width: 180, height: 20, type: "semi-solid", label: "high-shelf" },
      { x: 2650, y: 400, width: 90, height: 80, type: "semi-solid", label: "armchair" }
    ],
    stairs: [],
    hazards: [
      { x: 730, vx: 1.5, type: "dust-bunny" },
      { x: 1500, vx: 1.2, type: "dust-bunny" },
      { x: 2300, vx: 1.8, type: "dust-bunny" }
    ],
    laundry: [
      { x: 295, y: 350, type: "sock" },       // on top of bookcase (y=390)
      { x: 590, y: 410, type: "sock" },       // under coffee table
      { x: 860, y: 340, type: "shirt" },      // on couch seat
      { x: 970, y: 340, type: "sock" },       // on couch cushion
      { x: 1150, y: 390, type: "pants" },     // on chair
      { x: 1435, y: 220, type: "shirt" },     // on cupboard (y=260)
      { x: 1700, y: 410, type: "sock" },      // under coffee table 2
      { x: 2080, y: 330, type: "pants" },     // on big sofa
      { x: 2440, y: 210, type: "shirt" },     // on high shelf
      { x: 2695, y: 360, type: "sock" }       // on armchair
    ],
    treats: [
      { x: 1000, y: 340 } // on couch (y=380)
    ]
  },
  {
    name: "Kitchen & Dining Room",
    width: 4200,
    background: "#ecfeff", // Mint wall
    floorColor: "#b45309", // Cherry floor
    wallpaperPattern: "checkered",
    theme: "kitchen",
    furniture: [
      { x: 200, y: 380, width: 160, height: 100, type: "solid", label: "sideboard" },
      { x: 450, y: 410, width: 60, height: 70, type: "semi-solid", label: "footstool" },
      { x: 580, y: 380, width: 340, height: 100, type: "semi-solid-under", label: "dining-table" },
      { x: 530, y: 330, width: 45, height: 150, type: "semi-solid", label: "chair-left" },
      { x: 940, y: 330, width: 45, height: 150, type: "semi-solid", label: "chair-right" },
      { x: 1010, y: 360, width: 60, height: 120, type: "semi-solid", label: "stool" },
      { x: 1110, y: 240, width: 130, height: 240, type: "solid", label: "pantry" },
      { x: 1400, y: 360, width: 240, height: 120, type: "solid", label: "kitchen-island" },
      { x: 1780, y: 360, width: 360, height: 120, type: "solid", label: "countertops" },
      { x: 1980, y: 250, width: 180, height: 20, type: "semi-solid", label: "counter-shelf" },
      { x: 2280, y: 140, width: 110, height: 340, type: "solid", label: "refrigerator" },
      { x: 2550, y: 430, width: 90, height: 50, type: "semi-solid-under", label: "dog-bowls" },
      { x: 2800, y: 370, width: 220, height: 110, type: "semi-solid", label: "couch" },
      { x: 3150, y: 220, width: 160, height: 20, type: "semi-solid", label: "kitchen-rack" },
      { x: 3500, y: 400, width: 100, height: 80, type: "semi-solid", label: "kitchen-cart" }
    ],
    stairs: [],
    hazards: [
      { x: 920, vx: 1.6, type: "dust-bunny" },
      { x: 1250, vx: 2.0, type: "dust-bunny" },
      { x: 1650, vx: 1.5, type: "dust-bunny" },
      { x: 2650, vx: 1.8, type: "dust-bunny" },
      { x: 3300, vx: 2.2, type: "dust-bunny" },
      { x: 1970, y: 165, type: "falling-toy", label: "mug", triggered: false, gravity: 0.4, vy: 0, initialY: 165 },
      { x: 3180, y: 185, type: "falling-toy", label: "pot", triggered: false, gravity: 0.4, vy: 0, initialY: 185 }
    ],
    laundry: [
      { x: 280, y: 340, type: "shirt" },       // adjusted for sideboard top y=380
      { x: 460, y: 370, type: "sock" },        // adjusted for footstool y=410
      { x: 750, y: 340, type: "pants" },       // on dining table
      { x: 750, y: 450, type: "sock" },       // under dining table
      { x: 960, y: 290, type: "sock" },
      { x: 1175, y: 200, type: "shirt" },     // on pantry
      { x: 1520, y: 320, type: "pants" },     // on kitchen island
      { x: 1860, y: 320, type: "shirt" },     // on countertops
      { x: 2070, y: 210, type: "sock" },      // on kitchen shelf
      { x: 2595, y: 390, type: "sock" },      // on dog bowl stand
      { x: 2910, y: 330, type: "pants" },     // on couch
      { x: 3230, y: 180, type: "shirt" },     // on kitchen rack
      { x: 3550, y: 360, type: "sock" }       // on kitchen cart
    ],
    treats: [
      { x: 1300, y: 320 } // on kitchen island
    ]
  },
  {
    name: "Hallway & Stairs",
    width: 5200,
    background: "#fff7ed", // Warm linen wall
    floorColor: "#7c2d12", // Mahogany floor
    wallpaperPattern: "stripes-horizontal",
    theme: "hallway",
    furniture: [
      { x: 200, y: 340, width: 130, height: 140, type: "solid", label: "wardrobe" },
      { x: 100, y: 410, width: 70, height: 70, type: "semi-solid", label: "footstool" },
      { x: 450, y: 420, width: 120, height: 60, type: "semi-solid", label: "bench" },
      { x: 700, y: 270, width: 150, height: 20, type: "semi-solid", label: "shelf-high" },
      
      // Mezzanine 1 Platform
      { x: 1200, y: 300, width: 1600, height: 20, type: "floor-mezzanine", label: "mezzanine-1" },
      { x: 1400, y: 240, width: 140, height: 60, type: "semi-solid", label: "sofa-m1" },
      { x: 1800, y: 200, width: 90, height: 100, type: "solid", label: "cupboard-m1" },
      { x: 2150, y: 260, width: 160, height: 40, type: "semi-solid-under", label: "table-m1" },

      // Mezzanine 2 Platform
      { x: 2400, y: 140, width: 1750, height: 20, type: "floor-mezzanine", label: "mezzanine-2" },
      { x: 2650, y: 80, width: 180, height: 60, type: "semi-solid", label: "bed-m2" },
      { x: 3100, y: 40, width: 110, height: 100, type: "solid", label: "cabinet-m2" },
      { x: 3550, y: 80, width: 160, height: 60, type: "semi-solid-under", label: "desk-m2" },

      // Hanging Chandeliers (act as platforms)
      { x: 980, y: 200, width: 90, height: 15, type: "semi-solid", label: "chandelier-1" },
      { x: 2280, y: 110, width: 90, height: 15, type: "semi-solid", label: "chandelier-2" },
      { x: 4220, y: 260, width: 100, height: 15, type: "semi-solid", label: "chandelier-3" },

      // Bottom Floor right side
      { x: 4600, y: 420, width: 90, height: 60, type: "semi-solid", label: "dog-crate" }
    ],
    stairs: [
      { startX: 900, startY: 480, endX: 1200, endY: 300, label: "stairs-1" },
      { startX: 2100, startY: 300, endX: 2400, endY: 140, label: "stairs-2" },
      { startX: 4050, startY: 140, endX: 4350, endY: 480, label: "stairs-3" }
    ],
    hazards: [
      { x: 600, vx: 2.0, type: "dust-bunny" },
      { x: 1350, vx: 1.5, type: "dust-bunny", floorY: 300 },   // patrols Mezzanine 1
      { x: 1950, vx: 1.8, type: "dust-bunny", floorY: 300 },
      { x: 2800, vx: 1.8, type: "dust-bunny", floorY: 140 },   // patrols Mezzanine 2
      { x: 3350, vx: 2.2, type: "dust-bunny", floorY: 140 },
      { x: 4550, vx: 1.6, type: "dust-bunny" },
      { x: 2950, y: 60, type: "falling-toy", label: "globe", triggered: false, gravity: 0.45, vy: 0, initialY: 60 },
      { x: 3750, y: 60, type: "falling-toy", label: "vase", triggered: false, gravity: 0.45, vy: 0, initialY: 60 }
    ],
    laundry: [
      { x: 265, y: 300, type: "shirt" },
      { x: 135, y: 370, type: "sock" },       // adjusted for footstool
      { x: 510, y: 380, type: "sock" },
      { x: 775, y: 230, type: "pants" },
      { x: 1025, y: 150, type: "sock" },      // on chandelier 1
      
      // Mezzanine 1 laundry
      { x: 1350, y: 260, type: "sock" },
      { x: 1470, y: 200, type: "shirt" },     // on sofa
      { x: 1845, y: 160, type: "pants" },     // on cupboard (adjusted top y=200)
      { x: 2230, y: 220, type: "sock" },      // on table
      { x: 2325, y: 60, type: "shirt" },      // on chandelier 2
      
      // Mezzanine 2 laundry
      { x: 2740, y: 40, type: "shirt" },      // on bed
      { x: 3155, y: 0, type: "pants" },       // on cabinet
      { x: 3630, y: 40, type: "sock" },       // on desk
      { x: 3950, y: 100, type: "sock" },
      { x: 4270, y: 210, type: "shirt" },     // on chandelier 3
      
      // Bottom floor right laundry
      { x: 4480, y: 440, type: "pants" },
      { x: 4645, y: 380, type: "sock" },      // on dog crate
      { x: 4850, y: 440, type: "shirt" }
    ],
    treats: [
      { x: 1700, y: 260 } // on mezzanine 1
    ]
  }
];

// ==========================================================================
// 3. MAIN GAME CONTROLLER CLASS
// ==========================================================================
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Core engine setups
    this.synth = new SoundSynth();
    this.gameState = 'START'; // START, PLAYING, PAUSED, VICTORY, GAMEOVER
    this.currentLevelIndex = 0;
    this.score = 0;
    this.levelScore = 0;
    
    // Setup Resolution (High DPI Retina Fix)
    this.setupCanvasDPR();
    window.addEventListener('resize', () => this.setupCanvasDPR());

    // Game Physics constants
    this.GRAVITY = 0.45;
    
    // Entity States
    this.player = {
      x: 80,
      y: 400,
      vx: 0,
      vy: 0,
      width: 60,
      height: 40,
      normalHeight: 40,
      duckHeight: 22,
      onGround: false,
      isDucking: false,
      facing: 'right', // 'left', 'right'
      animTime: 0,
      laundryCount: 0,
      energy: 3,
      maxEnergy: 3,
      invulnTime: 0, // flash when hurt
      powerupTimer: 0, // speed/jump boost timer
      isDepositing: false // auto-run state at washing machine
    };
    
    // Washing Machine (Goal)
    this.washingMachine = {
      x: 0, // set dynamic based on level width
      y: 360,
      width: 100,
      height: 120,
      doorAngle: 0,
      isSpinning: false,
      spinTimer: 0,
      depositIndex: 0,
      bubbles: []
    };

    // Arrays
    this.platforms = [];
    this.stairs = [];
    this.hazards = [];
    this.laundry = [];
    this.particles = [];
    
    // Keyboard inputs state
    this.keys = {};
    
    // UI elements references
    this.hud = document.getElementById('hud');
    this.startScreen = document.getElementById('screen-start');
    this.pauseScreen = document.getElementById('screen-pause');
    this.victoryScreen = document.getElementById('screen-victory');
    this.gameoverScreen = document.getElementById('screen-gameover');
    
    // Timer stats
    this.levelStartTime = 0;
    this.timeElapsedStr = "00:00";
    
    // Initialize Input listeners & UI bindings
    this.initInputs();
    this.initUI();
    
    // Start drawing loop (even at start menu, for active background rendering)
    this.lastTime = 0;
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  setupCanvasDPR() {
    const width = 960;
    const height = 540;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
    
    // Keep internal width / height variables for drawing
    this.gameWidth = width;
    this.gameHeight = height;
  }

  // Bind Keyboard controls
  initInputs() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling keys in browser
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true;

      // Single triggers
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  // Bind HTML buttons
  initUI() {
    // Level Select grid buttons
    const levelBtns = document.querySelectorAll('.btn-level');
    levelBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetBtn = e.currentTarget;
        levelBtns.forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        this.currentLevelIndex = parseInt(targetBtn.dataset.level, 10) - 1;
      });
    });

    // Play Game button
    document.getElementById('btn-play-game').addEventListener('click', () => {
      this.synth.init();
      this.startGame();
    });

    // Pause controls
    document.getElementById('btn-resume').addEventListener('click', () => this.resumeGame());
    document.getElementById('btn-restart-level').addEventListener('click', () => {
      this.resumeGame();
      this.loadLevel(this.currentLevelIndex);
    });
    document.getElementById('btn-quit').addEventListener('click', () => this.quitToMenu());

    // Victory controls
    document.getElementById('btn-next-level').addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex + 1);
    });
    document.getElementById('btn-replay-level').addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
    });

    // Game Over controls
    document.getElementById('btn-retry').addEventListener('click', () => {
      this.loadLevel(this.currentLevelIndex);
    });
    document.getElementById('btn-gameover-quit').addEventListener('click', () => this.quitToMenu());

    // Music toggles
    const toggleMusicBtns = document.querySelectorAll('.btn-toggle-music');
    toggleMusicBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const enabled = this.synth.toggleMusic();
        const statuses = document.querySelectorAll('.music-status');
        statuses.forEach(s => s.textContent = enabled ? "ON" : "OFF");
      });
    });
  }

  // Start a new game session
  startGame() {
    this.score = 0;
    this.loadLevel(this.currentLevelIndex);
  }

  // Load a level config
  loadLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    const levelData = this.getLevelData(levelIndex);
    this.levelData = levelData;
    
    // Verify level solvability guard
    const solvable = this.isLevelSolvable(levelIndex);
    if (!solvable) {
      console.warn(`[Level Solver Guard] Warning: Room ${levelIndex + 1} "${levelData.name}" might have unreachable paths! Verify furniture placement.`);
    } else {
      console.log(`[Level Solver Guard] Room ${levelIndex + 1} "${levelData.name}" verified solvable!`);
    }

    // Reset player position and state
    this.player.x = 80;
    this.player.y = 400;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.height = this.player.normalHeight;
    this.player.isDucking = false;
    this.player.onGround = false;
    this.player.laundryCount = 0;
    this.player.energy = this.player.maxEnergy;
    this.player.invulnTime = 0;
    this.player.powerupTimer = 0;
    this.player.isDepositing = false;

    // Reset Goal (Washing Machine) at end
    this.washingMachine.x = levelData.width - 200;
    this.washingMachine.isSpinning = false;
    this.washingMachine.spinTimer = 0;
    this.washingMachine.depositIndex = 0;
    
    // Copy furniture to platforms
    this.platforms = JSON.parse(JSON.stringify(levelData.furniture));
    this.stairs = JSON.parse(JSON.stringify(levelData.stairs || []));
    
    // Reset Hazards
    this.hazards = JSON.parse(JSON.stringify(levelData.hazards || []));
    
    // Reset Laundry
    this.laundry = JSON.parse(JSON.stringify(levelData.laundry));
    this.laundryTotal = this.laundry.length;
    
    // Reset Treats
    this.treats = JSON.parse(JSON.stringify(levelData.treats || []));
    
    // Reset other lists
    this.particles = [];
    this.levelScore = 0;
    this.levelStartTime = Date.now();

    // Setup UI Hud
    document.getElementById('hud-level-val').textContent = levelIndex + 1;
    document.getElementById('hud-score-val').textContent = this.score;
    this.updateLaundryHud();
    this.updateHeartsHud();
    
    // Hide screen overlays, show HUD
    this.hideScreens();
    this.hud.classList.remove('hidden');
    
    this.gameState = 'PLAYING';
    
    // Music setup
    this.synth.startMusic();
  }

  // Retrieve existing hand-crafted level or generate a verified solvable procedural level
  getLevelData(levelIndex) {
    if (LEVELS[levelIndex]) {
      return LEVELS[levelIndex];
    }
    
    let level = null;
    let attempts = 0;
    while (attempts < 40) {
      attempts++;
      level = this.generateProceduralLevel(levelIndex);
      
      // Temporarily store in LEVELS database so validator can inspect it
      LEVELS[levelIndex] = level;
      if (this.isLevelSolvable(levelIndex)) {
        console.log(`[Level Generator] Level ${levelIndex + 1} "${level.name}" verified solvable on attempt ${attempts}!`);
        return level;
      }
    }
    console.warn(`[Level Generator] Solvability verification failed after 40 attempts for Level ${levelIndex + 1}. Returning fallback layout.`);
    return level;
  }

  // Generates randomized level layouts using pre-defined modular structural chunks
  generateProceduralLevel(levelIndex) {
    const roomNames = [
      "Master Bedroom",
      "Guest Bedroom",
      "Cluttered Attic",
      "Study & Library",
      "Retro Game Room",
      "Basement Vault",
      "Backyard Patio"
    ];
    
    const roomThemes = [
      "bedroom",      // L4 (Index 3)
      "bedroom",      // L5 (Index 4)
      "attic",        // L6 (Index 5)
      "library",      // L7 (Index 6)
      "gameroom",     // L8 (Index 7)
      "basement",     // L9 (Index 8)
      "patio"         // L10 (Index 9)
    ];
    
    const name = roomNames[levelIndex - 3] || `Infinite Room ${levelIndex + 1}`;
    const theme = roomThemes[levelIndex - 3] || ['living-room', 'kitchen', 'hallway', 'bedroom', 'attic', 'library', 'gameroom', 'basement', 'patio'][levelIndex % 9];
    
    const width = 3000 + Math.min(10, levelIndex) * 350;
    
    // Stylized theme colors
    const background = `hsl(${Math.floor(Math.random() * 360)}, 35%, 96%)`;
    const floorColors = ['#854d0e', '#7c2d12', '#b45309', '#78350f', '#57534e'];
    const floorColor = floorColors[Math.floor(Math.random() * floorColors.length)];
    const patterns = ['stripes-vertical', 'checkered', 'stripes-horizontal'];
    const wallpaperPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    const furniture = [];
    const stairs = [];
    const hazards = [];
    const laundry = [];
    const treats = [];
    const potentialTreatSpots = [];
    
    let currentX = 250;
    
    // Assemble chunks side-by-side with random spacer gaps
    while (currentX < width - 600) {
      const chunkType = Math.floor(Math.random() * 5); // 0 to 4
      const gap = 80 + Math.floor(Math.random() * 100);
      
      switch (chunkType) {
        case 0: // Simple Living Couch Group
          furniture.push(
            { x: currentX, y: 380, width: 200, height: 100, type: "semi-solid", label: "couch" },
            { x: currentX + 230, y: 440, width: 120, height: 40, type: "semi-solid-under", label: "coffee-table" }
          );
          laundry.push(
            { x: currentX + 60, y: 340, type: "shirt" },
            { x: currentX + 290, y: 410, type: "sock" } // under table
          );
          if (Math.random() > 0.45) {
            hazards.push({ x: currentX + 160, vx: 1.5, type: "dust-bunny" });
          }
          potentialTreatSpots.push({ x: currentX + 290, y: 390 }); // on table
          currentX += 370 + gap;
          break;
          
        case 1: // Stool + Bookcase climb
          furniture.push(
            { x: currentX, y: 410, width: 60, height: 70, type: "semi-solid", label: "footstool" },
            { x: currentX + 90, y: 340, width: 100, height: 140, type: "solid", label: "bookcase" }
          );
          laundry.push(
            { x: currentX + 140, y: 300, type: "sock" }
          );
          potentialTreatSpots.push({ x: currentX + 140, y: 290 }); // on bookcase
          currentX += 210 + gap;
          break;
          
        case 2: // High Cupboard Stepping climb
          furniture.push(
            { x: currentX, y: 430, width: 60, height: 50, type: "semi-solid", label: "chair" },
            { x: currentX + 100, y: 370, width: 70, height: 20, type: "semi-solid", label: "shelf-step" },
            { x: currentX + 200, y: 260, width: 110, height: 220, type: "solid", label: "cupboard" }
          );
          laundry.push(
            { x: currentX + 135, y: 335, type: "sock" },
            { x: currentX + 255, y: 220, type: "pants" }
          );
          if (Math.random() > 0.5) {
            hazards.push({ x: currentX + 80, vx: 1.3, type: "dust-bunny" });
          }
          potentialTreatSpots.push({ x: currentX + 255, y: 210 }); // on cupboard
          currentX += 330 + gap;
          break;
          
        case 3: // Countertops + high shelf climb
          furniture.push(
            { x: currentX, y: 360, width: 260, height: 120, type: "solid", label: "countertops" },
            { x: currentX + 130, y: 250, width: 110, height: 20, type: "semi-solid", label: "counter-shelf" }
          );
          laundry.push(
            { x: currentX + 60, y: 320, type: "pants" },
            { x: currentX + 180, y: 210, type: "shirt" }
          );
          if (Math.random() > 0.5) {
            hazards.push({
              x: currentX + 180,
              y: 215,
              type: "falling-toy",
              label: "mug",
              triggered: false,
              gravity: 0.4,
              vy: 0,
              initialY: 215
            });
          }
          potentialTreatSpots.push({ x: currentX + 180, y: 200 }); // on shelf
          currentX += 270 + gap;
          break;
          
        case 4: // Mezzanine + Stairs walk-up
          const mezW = 400;
          furniture.push(
            { x: currentX + 150, y: 320, width: mezW, height: 20, type: "floor-mezzanine", label: "mezzanine-1" },
            { x: currentX + 230, y: 260, width: 120, height: 60, type: "semi-solid", label: "sofa-m1" }
          );
          stairs.push(
            { startX: currentX, startY: 480, endX: currentX + 150, endY: 320, label: "stairs-up" },
            { startX: currentX + 150 + mezW, startY: 320, endX: currentX + 150 + mezW + 150, endY: 480, label: "stairs-down" }
          );
          laundry.push(
            { x: currentX + 280, y: 220, type: "pants" },
            { x: currentX + 430, y: 280, type: "sock" }
          );
          if (Math.random() > 0.5) {
            hazards.push({ x: currentX + 250, vx: 1.4, type: "dust-bunny", floorY: 300 });
          }
          potentialTreatSpots.push({ x: currentX + 280, y: 200 }); // above mezzanine sofa
          currentX += 150 + mezW + 150 + gap;
          break;
      }
    }

    // Select exactly one treat spot from potential list
    if (potentialTreatSpots.length > 0) {
      const idx = Math.floor(Math.random() * potentialTreatSpots.length);
      treats.push(potentialTreatSpots[idx]);
    } else {
      // Fallback
      treats.push({ x: width / 2, y: 440 });
    }

    // Pad end with basic floor laundry
    if (laundry.length < 5) {
      laundry.push(
        { x: width - 450, y: 440, type: "sock" },
        { x: width - 580, y: 440, type: "pants" }
      );
    }

    return {
      name,
      width,
      background,
      floorColor,
      wallpaperPattern,
      theme,
      furniture,
      stairs,
      hazards,
      laundry,
      treats
    };
  }

  // Discretized Pathfinding Accessibility Checker (Guards against impossible level configurations)
  isLevelSolvable(levelIndex) {
    const level = LEVELS[levelIndex];
    if (!level) return true;
    
    const startX = 80;
    const startY = 400;
    const goalX = level.width - 200;
    
    // Discretize grid
    const cellW = 35; // 35px width per column
    const cellH = 20; // 20px height per row
    const cols = Math.ceil(level.width / cellW);
    const rows = Math.ceil(540 / cellH);
    
    // Create solidity map (true means blocked solid)
    const grid = Array(cols).fill(0).map(() => Array(rows).fill(false));
    
    // Fill solid blocks into grid
    level.furniture.forEach(plat => {
      if (plat.type === 'solid') {
        const minCol = Math.floor(plat.x / cellW);
        const maxCol = Math.ceil((plat.x + plat.width) / cellW);
        const minRow = Math.floor(plat.y / cellH);
        const maxRow = Math.ceil((plat.y + plat.height) / cellH);
        
        for (let c = minCol; c <= maxCol; c++) {
          for (let r = minRow; r <= maxRow; r++) {
            if (c >= 0 && c < cols && r >= 0 && r < rows) {
              grid[c][r] = true;
            }
          }
        }
      }
    });

    const isSolidBelow = (c, r) => {
      // Main Floor
      const floorRow = Math.floor(480 / cellH);
      if (r >= floorRow - 1) return true;
      
      const checkX = c * cellW + cellW / 2;
      const checkY = (r + 1) * cellH;
      
      // Check platforms
      for (let plat of level.furniture) {
        if (checkX >= plat.x && checkX <= plat.x + plat.width) {
          if (checkY >= plat.y && checkY <= plat.y + 15) {
            return true;
          }
        }
      }
      
      // Check stairs
      for (let stair of level.stairs) {
        if (checkX >= stair.startX && checkX <= stair.endX) {
          const ratio = (checkX - stair.startX) / (stair.endX - stair.startX);
          const stairY = stair.startY + ratio * (stair.endY - stair.startY);
          if (checkY >= stairY - 10 && checkY <= stairY + 15) {
            return true;
          }
        }
      }
      return false;
    };

    // BFS Search Queue. A state is [col, row, onGround]
    const startCol = Math.floor(startX / cellW);
    const startRow = Math.floor(startY / cellH);
    const queue = [[startCol, startRow, true]];
    
    const visited = new Set();
    visited.add(`${startCol},${startRow},true`);
    
    const targetCol = Math.floor(goalX / cellW);
    let reachedGoal = false;
    
    let iter = 0;
    const maxIter = 15000;
    
    while (queue.length > 0 && iter < maxIter) {
      iter++;
      const [c, r, onGround] = queue.shift();
      
      if (c >= targetCol - 2) {
        reachedGoal = true;
        break;
      }
      
      const neighbors = [];
      
      if (!onGround) {
        // Must fall down
        const nr = r + 1;
        if (nr < rows && !grid[c][nr]) {
          const nextOnGround = isSolidBelow(c, nr);
          neighbors.push([c, nr, nextOnGround]);
        }
      } else {
        // On ground actions:
        // 1. Walk left / right
        if (c + 1 < cols && !grid[c+1][r]) {
          neighbors.push([c + 1, r, isSolidBelow(c + 1, r)]);
        }
        if (c - 1 >= 0 && !grid[c-1][r]) {
          neighbors.push([c - 1, r, isSolidBelow(c - 1, r)]);
        }
        
        // 2. Jump (initiate jump peak states, which are air cells where player starts falling)
        const maxJumpH = 5; // safety margin jump height
        for (let jh = 1; jh <= maxJumpH; jh++) {
          const nr = r - jh;
          if (nr >= 0 && !grid[c][nr]) {
            // Traverse laterally in air
            for (let dc = -3; dc <= 3; dc++) {
              const nc = c + dc;
              if (nc >= 0 && nc < cols && !grid[nc][nr]) {
                neighbors.push([nc, nr, false]);
              }
            }
          } else {
            break; // hit ceiling
          }
        }
      }
      
      for (let [nc, nr, nog] of neighbors) {
        const key = `${nc},${nr},${nog}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push([nc, nr, nog]);
        }
      }
    }
    
    return reachedGoal;
  }

  hideScreens() {
    this.startScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
  }

  quitToMenu() {
    this.gameState = 'START';
    this.synth.stopMusic();
    this.hideScreens();
    this.hud.classList.add('hidden');
    this.startScreen.classList.remove('hidden');

    // Highlight the active level button in start screen selection grid
    const levelBtns = document.querySelectorAll('.btn-level');
    levelBtns.forEach(btn => {
      const lvl = parseInt(btn.dataset.level, 10) - 1;
      if (lvl === this.currentLevelIndex) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      this.pauseScreen.classList.remove('hidden');
      this.synth.stopMusic();
    } else if (this.gameState === 'PAUSED') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.gameState = 'PLAYING';
    this.pauseScreen.classList.add('hidden');
    this.synth.startMusic();
  }

  // Update loop
  loop(timestamp) {
    const elapsed = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.gameState === 'PLAYING') {
      this.updatePhysics();
      this.updateEntities();
      this.checkCollisions();
      this.updateParticles();
      this.updateTimer();
    } else if (this.gameState === 'VICTORY') {
      this.updateVictorySequence();
      this.updateParticles();
    }

    this.render();

    requestAnimationFrame((ts) => this.loop(ts));
  }

  // Update physical player movement
  updatePhysics() {
    const p = this.player;

    // 1. Invulnerability timer flashing
    if (p.invulnTime > 0) p.invulnTime--;
    if (p.powerupTimer > 0) {
      p.powerupTimer--;
      // Spawn golden trail sparkles
      if (Math.random() > 0.6) {
        this.particles.push({
          x: p.x + Math.random() * p.width,
          y: p.y + Math.random() * p.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -Math.random() * 1.5,
          size: 2 + Math.random() * 3,
          color: '#fbbf24',
          alpha: 1.0,
          life: 0,
          maxLife: 20 + Math.random() * 15
        });
      }
    }

    // 2. Animate timers
    p.animTime += 0.016; // increment animation clock

    // 3. Handle Auto Deposit Sequence at washing machine
    if (p.isDepositing) {
      // Auto run right to washing machine center
      const targetX = this.washingMachine.x - 20;
      if (p.x < targetX) {
        p.vx = 2.0;
        p.facing = 'right';
      } else {
        p.vx = 0;
        p.x = targetX;
        // Start laundry drop-off once dog is in position
        if (!this.washingMachine.isSpinning) {
          this.triggerLaundryDeposit();
        }
      }
      p.x += p.vx;
      
      // Vertical snap to ground Y
      const groundY = this.getGroundY(p.x + p.width/2, p.y);
      p.y = groundY - p.height;
      p.vy = 0;
      p.onGround = true;
      return;
    }

    // 4. Handle Ducking state transition
    const duckKey = this.keys['ArrowDown'] || this.keys['KeyS'];
    if (duckKey && p.onGround) {
      if (!p.isDucking) {
        p.isDucking = true;
        p.height = p.duckHeight;
        p.y += (p.normalHeight - p.duckHeight); // push Y down to align feet
        this.synth.playDuck();
      }
    } else if (!duckKey && p.isDucking) {
      // Check clearance above player before allowing standing up
      if (this.checkClearance(p)) {
        p.isDucking = false;
        p.y -= (p.normalHeight - p.duckHeight); // pull Y up
        p.height = p.normalHeight;
      }
    }

    // 5. Left / Right speed
    const leftKey = this.keys['ArrowLeft'] || this.keys['KeyA'];
    const rightKey = this.keys['ArrowRight'] || this.keys['KeyD'];
    const isBoosted = p.powerupTimer > 0;
    const acc = isBoosted ? 0.85 : 0.55;
    const maxSpeed = p.isDucking ? (isBoosted ? 3.3 : 2.2) : (isBoosted ? 7.0 : 4.5);
    const friction = 0.86;

    if (leftKey) {
      p.vx -= acc;
      p.facing = 'left';
    } else if (rightKey) {
      p.vx += acc;
      p.facing = 'right';
    } else {
      p.vx *= friction;
    }

    // Clamp speed
    if (p.vx > maxSpeed) p.vx = maxSpeed;
    if (p.vx < -maxSpeed) p.vx = -maxSpeed;

    // Apply horizontal motion
    p.x += p.vx;
    this.handleHorizontalWorldBounds();

    // 6. Jump Logic
    p.vy += this.GRAVITY;
    const jumpKey = this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space'];
    if (jumpKey && p.onGround) {
      p.vy = isBoosted ? -13.0 : -10.5;
      p.onGround = false;
      this.synth.playJump();
      this.spawnDustCloud(p.x + p.width/2, p.y + p.height);
    }
    // Variable jump height: release key early to terminate jump rise
    if (!jumpKey && p.vy < -4.0) {
      p.vy = -4.0;
    }

    // Apply vertical motion
    p.y += p.vy;
  }

  // World bounds collision snaps
  handleHorizontalWorldBounds() {
    const p = this.player;
    if (p.x < 10) {
      p.x = 10;
      p.vx = 0;
    }
    // Cannot walk past the washing machine level exit bounds
    const exitBound = this.levelData.width - 50;
    if (p.x + p.width > exitBound) {
      p.x = exitBound - p.width;
      p.vx = 0;
    }
  }

  // Check stood up height clearance under solid objects
  checkClearance(p) {
    const tempY = p.y - (p.normalHeight - p.duckHeight);
    const tempHeight = p.normalHeight;
    for (let plat of this.platforms) {
      if (plat.type === 'solid' || plat.type === 'semi-solid-under') {
        // Tabletop top or solid wall block
        // Collide vertically with bounding box
        if (p.x + 5 < plat.x + plat.width && p.x + p.width - 5 > plat.x &&
            tempY < plat.y + plat.height && tempY + tempHeight > plat.y) {
          return false; // blocks player from standing
        }
      }
    }
    return true;
  }

  // Find the exact ground Y coordinate below the player's horizontal coordinate
  getGroundY(x, currentY) {
    let groundY = 480; // Main Floor Level Y

    // 1. Check inclined stairs first
    for (let stair of this.stairs) {
      if (x >= stair.startX && x <= stair.endX) {
        const ratio = (x - stair.startX) / (stair.endX - stair.startX);
        const stairY = stair.startY + ratio * (stair.endY - stair.startY);
        
        // Is player walking close to stair level?
        if (currentY + this.player.height <= stairY + 12) {
          groundY = stairY;
          return groundY; // Priority ground
        }
      }
    }

    // 2. Check solid mezzanine floors
    for (let plat of this.platforms) {
      if (plat.type === 'floor-mezzanine') {
        if (x >= plat.x && x <= plat.x + plat.width) {
          // If player's feet are above the mezzanine floor line
          if (currentY + this.player.height <= plat.y + 12) {
            groundY = plat.y;
          }
        }
      }
    }

    return groundY;
  }

  // Update non-player entities: Hazards patrol, falling traps
  updateEntities() {
    // 1. Patrol Hazards (Dust Bunnies)
    for (let hz of this.hazards) {
      if (hz.type === 'dust-bunny') {
        hz.x += hz.vx;
        
        // Snap bunny to their respective floor level
        const bunnyFloor = hz.floorY !== undefined ? hz.floorY : 480;
        hz.y = bunnyFloor - 24; // bunny size ~24px
        
        // Reverse direction at level bounds or custom boundaries
        if (hz.x < 50 || hz.x > this.levelData.width - 250) {
          hz.vx *= -1;
        }

        // Reverse if hitting solid furniture
        for (let plat of this.platforms) {
          if (plat.type === 'solid' && hz.x + 24 > plat.x && hz.x < plat.x + plat.width) {
            hz.vx *= -1;
            hz.x += hz.vx;
            break;
          }
        }
      }
      
      // 2. Falling toys triggers
      if (hz.type === 'falling-toy') {
        // Trigger falls when player center is within 160px horizontally
        const dist = Math.abs((this.player.x + this.player.width/2) - hz.x);
        if (dist < 160 && !hz.triggered && this.player.x < hz.x) {
          hz.triggered = true;
          this.spawnDangerWarn(hz.x, hz.initialY);
        }

        if (hz.triggered) {
          hz.vy += hz.gravity;
          hz.y += hz.vy;
          
          // Determine landing floor for the toy
          const landingY = this.getGroundY(hz.x, hz.y);
          if (hz.y + 20 >= landingY) {
            hz.y = landingY - 20;
            hz.vy = 0;
            hz.triggered = false; // Reset to static floor obstacle
            this.spawnImpactParticles(hz.x, landingY);
          }
        }
      }
    }
  }

  // Collision Checks
  checkCollisions() {
    const p = this.player;

    // Reset ground touch status
    let landed = false;
    
    // Fetch local ground limit
    const groundY = this.getGroundY(p.x + p.width/2, p.y);
    
    // Feet collide with floor
    if (p.y + p.height >= groundY) {
      p.y = groundY - p.height;
      p.vy = 0;
      p.onGround = true;
      landed = true;
    }

    // 1. Platforms collisions
    for (let plat of this.platforms) {
      if (plat.type === 'floor-mezzanine') continue; // Handled in getGroundY

      // Solid blocks (bookcases, wardrobe, refrigerator, cupboard)
      if (plat.type === 'solid') {
        const px = p.x;
        const py = p.y;
        const pw = p.width;
        const ph = p.height;
        
        // Bounding box overlap checks
        const xOverlap = px + pw > plat.x && px < plat.x + plat.width;
        const yOverlap = py < plat.y + plat.height && py + ph > plat.y;
        
        if (xOverlap && yOverlap) {
          const prevX = px - p.vx;
          const prevY = py - p.vy;
          
          // Did we fall onto the top of the solid platform?
          const wasAbove = (prevY + ph) <= plat.y + 6;
          // Did we bonk our head on the bottom?
          const wasBelow = prevY >= plat.y + plat.height - 6;
          
          if (wasAbove && p.vy >= 0) {
            p.y = plat.y - ph;
            p.vy = 0;
            p.onGround = true;
            landed = true;
          } else if (wasBelow && p.vy < 0) {
            p.y = plat.y + plat.height;
            p.vy = 0;
          } else {
            // Horizontal push out: determine entry side based on previous positions
            if (prevX + pw <= plat.x + 4) {
              p.x = plat.x - pw;
            } else if (prevX >= plat.x + plat.width - 4) {
              p.x = plat.x + plat.width;
            } else {
              // Fallback to closest boundary to prevent clipping inside
              const leftDist = Math.abs((px + pw) - plat.x);
              const rightDist = Math.abs(px - (plat.x + plat.width));
              if (leftDist < rightDist) {
                p.x = plat.x - pw;
              } else {
                p.x = plat.x + plat.width;
              }
            }
            p.vx = 0;
          }
        }
      }

      // Vertical Landing Check (semi-solids and coffee tables)
      const isOneWay = plat.type === 'semi-solid' || plat.type === 'semi-solid-under';
      if (isOneWay && p.vy >= 0) {
        // Feet must land from top edge
        const prevBottom = p.y + p.height - p.vy;
        if (prevBottom <= plat.y + 6 && p.y + p.height >= plat.y) {
          if (p.x + 10 < plat.x + plat.width && p.x + p.width - 10 > plat.x) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.onGround = true;
            landed = true;
          }
        }
      }
    }

    if (!landed) {
      p.onGround = false;
    }

    // 2. Laundry items collision (retrieval)
    for (let i = this.laundry.length - 1; i >= 0; i--) {
      const item = this.laundry[i];
      // Circle-box overlap check
      if (p.x < item.x + 20 && p.x + p.width > item.x - 20 &&
          p.y < item.y + 20 && p.y + p.height > item.y - 20) {
        
        // Collect!
        this.laundry.splice(i, 1);
        p.laundryCount++;
        this.score += 100;
        this.levelScore += 100;
        
        this.synth.playCollect();
        this.spawnCollectParticles(item.x, item.y);
        this.updateLaundryHud();
      }
    }

    // 2b. Treats collision (speed boost powerup)
    if (this.treats) {
      for (let i = this.treats.length - 1; i >= 0; i--) {
        const treat = this.treats[i];
        if (p.x < treat.x + 20 && p.x + p.width > treat.x - 20 &&
            p.y < treat.y + 20 && p.y + p.height > treat.y - 20) {
          
          this.treats.splice(i, 1);
          p.powerupTimer = 480; // 8 seconds at 60 FPS
          this.score += 250;
          this.levelScore += 250;
          
          this.synth.playTreat();
          this.spawnTreatParticles(treat.x, treat.y);
        }
      }
    }

    // 3. Hazard collisions (dust bunnies & falling objects)
    if (p.invulnTime === 0 && !p.isDepositing) {
      for (let hz of this.hazards) {
        // Check collision bounding box
        const sizeX = hz.type === 'dust-bunny' ? 24 : 20;
        const sizeY = hz.type === 'dust-bunny' ? 24 : 20;
        
        if (p.x + 5 < hz.x + sizeX && p.x + p.width - 5 > hz.x &&
            p.y + 5 < hz.y + sizeY && p.y + p.height - 5 > hz.y) {
          
          this.damagePlayer();
          break;
        }
      }
    }

    // 4. Reach exit Washing Machine goal trigger
    if (!p.isDepositing && Math.abs((p.x + p.width/2) - (this.washingMachine.x + 50)) < 70) {
      // Trigger deposit cutscene sequence!
      p.isDepositing = true;
    }
  }

  // Reduce health, apply knockback and flashing invulnerability
  damagePlayer() {
    const p = this.player;
    p.energy--;
    this.updateHeartsHud();
    this.synth.playHurt();
    
    // Spawn red blood-dust particles
    this.spawnHurtParticles(p.x + p.width/2, p.y + p.height/2);

    if (p.energy <= 0) {
      this.triggerGameOver();
    } else {
      // Invulnerability frames & bounce-back
      p.invulnTime = 90; // 1.5 seconds
      p.vy = -5.0; // slight bounce
      p.vx = p.facing === 'right' ? -4.5 : 4.5; // knockback push
    }
  }

  // Auto sequence for depositing laundry into washing machine
  triggerLaundryDeposit() {
    this.washingMachine.isSpinning = true;
    this.washingMachine.depositIndex = 0;
    this.washingMachine.spinTimer = 0;
    this.player.vx = 0;
    this.gameState = 'VICTORY'; // Transition to victory sequence immediately!
  }

  updateVictorySequence() {
    const p = this.player;
    const wm = this.washingMachine;

    wm.spinTimer++;

    // Release clothes one by one from dog back stack every 12 frames
    if (p.laundryCount > 0 && wm.spinTimer % 12 === 0) {
      p.laundryCount--;
      this.score += 150; // extra points for deposited clothes!
      this.levelScore += 150;
      
      this.synth.playDeposit();
      this.spawnDepositLaundryParticle(p.x + 30, p.y - 10, wm.x + 50, wm.y + 60);
      this.updateLaundryHud();
    }

    // Finished depositing, wait for machine cycle animation to finish
    if (p.laundryCount === 0 && wm.spinTimer > 180) {
      this.showVictoryScreen();
    }

    // Washing machine door shaker/shudder while spinning
    wm.doorAngle = Math.sin(wm.spinTimer * 0.8) * 0.1;
    
    // Bubbles!
    if (wm.spinTimer % 4 === 0) {
      wm.bubbles.push({
        x: wm.x + 30 + Math.random() * 40,
        y: wm.y + 50 + Math.random() * 40,
        vy: -0.8 - Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 1.0,
        size: 3 + Math.random() * 6,
        alpha: 0.8,
        life: 0,
        maxLife: 40 + Math.random() * 30
      });
    }

    // Update washing machine local bubbles
    for (let i = wm.bubbles.length - 1; i >= 0; i--) {
      const b = wm.bubbles[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life++;
      b.alpha = 1 - (b.life / b.maxLife);
      if (b.life >= b.maxLife) wm.bubbles.splice(i, 1);
    }
  }

  showVictoryScreen() {
    this.gameState = 'VICTORY';
    this.synth.stopMusic();
    this.synth.playVictory();
    
    // Hide HUD, show screen overlay
    this.hud.classList.add('hidden');
    this.victoryScreen.classList.remove('hidden');

    // Victory calculations
    const pct = this.laundryTotal > 0 ? (this.laundryTotal - this.laundry.length) / this.laundryTotal : 1.0;
    document.getElementById('victory-laundry-collected').textContent = `${this.laundryTotal - this.laundry.length} / ${this.laundryTotal}`;
    document.getElementById('victory-time').textContent = this.timeElapsedStr;
    document.getElementById('victory-score').textContent = `+${this.levelScore}`;

    // Score display updater
    document.getElementById('hud-score-val').textContent = this.score;

    // Render stars rating (1 to 3 stars based on collection %)
    const starContainer = document.getElementById('victory-stars');
    starContainer.innerHTML = '';
    let stars = 1;
    if (pct >= 1.0) stars = 3;
    else if (pct >= 0.6) stars = 2;

    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.textContent = i < stars ? '⭐' : '☆';
      if (i < stars) star.style.color = '#fbbf24';
      starContainer.appendChild(star);
    }

    // Spawn victory celebration confetti
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.gameWidth,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 1.5 + Math.random() * 3,
        size: 5 + Math.random() * 6,
        color: `hsl(${Math.random() * 360}, 90%, 60%)`,
        alpha: 1.0,
        life: 0,
        maxLife: 200 + Math.random() * 100,
        type: 'confetti',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    }
  }

  triggerGameOver() {
    this.gameState = 'GAMEOVER';
    this.synth.stopMusic();
    this.synth.playGameOver();
    
    this.hud.classList.add('hidden');
    this.gameoverScreen.classList.remove('hidden');
    
    document.getElementById('gameover-score').textContent = this.score;
    document.getElementById('gameover-level').textContent = `Level ${this.currentLevelIndex + 1}: ${this.levelData.name}`;
  }

  // Update custom canvas particle list
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life++;

      // Slow down air particles
      if (pt.type === 'dust') {
        pt.vx *= 0.95;
        pt.vy *= 0.95;
      } else if (pt.type === 'confetti') {
        pt.rotation += pt.rotSpeed;
        pt.vx += Math.sin(pt.life * 0.05) * 0.05; // sway wind
      }

      pt.alpha = 1 - (pt.life / pt.maxLife);

      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Format Level Time elapsed string
  updateTimer() {
    const ms = Date.now() - this.levelStartTime;
    const secTotal = Math.floor(ms / 1000);
    const min = Math.floor(secTotal / 60);
    const sec = secTotal % 60;
    this.timeElapsedStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  // HUD updates
  updateLaundryHud() {
    const totalCollected = this.laundryTotal - this.laundry.length;
    document.getElementById('hud-laundry-val').textContent = `${totalCollected} / ${this.laundryTotal}`;
  }

  updateHeartsHud() {
    const container = document.getElementById('hud-energy-container');
    container.innerHTML = '';
    for (let i = 0; i < this.player.maxEnergy; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.textContent = '❤️';
      if (i < this.player.energy) {
        heart.classList.add('active');
      }
      container.appendChild(heart);
    }
  }

  // Particle spawning utility functions
  spawnDustCloud(x, y) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y - 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.2 - Math.random() * 0.8,
        size: 4 + Math.random() * 5,
        color: 'rgba(148, 163, 184, 0.4)', // Slate gray puff
        alpha: 1.0,
        life: 0,
        maxLife: 30 + Math.random() * 15,
        type: 'dust'
      });
    }
  }

  spawnCollectParticles(x, y) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 1.5,
        size: 3 + Math.random() * 4,
        color: `hsl(${45 + Math.random() * 20}, 95%, 60%)`, // Golden sparks
        alpha: 1.0,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        type: 'sparkle'
      });
    }
  }

  spawnHurtParticles(x, y) {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2.0,
        size: 4 + Math.random() * 5,
        color: '#f87171', // Red warning blobs
        alpha: 1.0,
        life: 0,
        maxLife: 35 + Math.random() * 15,
        type: 'sparkle'
      });
    }
  }

  spawnDangerWarn(x, y) {
    // Red hazard warning exclamation sparkle
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 2.0,
        vy: -2.0 - Math.random() * 2.0,
        size: 4 + Math.random() * 3,
        color: '#ef4444',
        alpha: 1.0,
        life: 0,
        maxLife: 40,
        type: 'sparkle'
      });
    }
  }

  spawnImpactParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y - 2,
        vx: (Math.random() - 0.5) * 4.0,
        vy: -0.5 - Math.random() * 1.5,
        size: 3 + Math.random() * 4,
        color: '#94a3b8',
        alpha: 1.0,
        life: 0,
        maxLife: 30,
        type: 'dust'
      });
    }
  }

  spawnDepositLaundryParticle(sx, sy, tx, ty) {
    const steps = 30;
    this.particles.push({
      x: sx,
      y: sy,
      vx: (tx - sx) / steps,
      vy: (ty - sy) / steps - 2.0, // slight arch
      gravity: 0.13,
      size: 14,
      color: `hsl(${Math.random() * 360}, 80%, 55%)`,
      alpha: 1.0,
      life: 0,
      maxLife: steps,
      type: 'laundry-deposit',
      tx: tx,
      ty: ty
    });
  }

  // ==========================================================================
  // 4. RENDERING ENGINE (2D VECTOR GRAPHICS)
  // ==========================================================================
  render() {
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    
    // Determine Camera coordinates scroll offset (interpolated centering)
    let camX = this.player.x - this.gameWidth / 3.5;
    const maxCamX = this.levelData ? this.levelData.width - this.gameWidth : 0;
    camX = Math.max(0, Math.min(camX, maxCamX));

    this.ctx.save();
    this.ctx.translate(-camX, 0);

    // 1. Wallpaper background & decorations
    this.drawBackground(camX);

    // 2. Stairs Incline Ramps
    this.drawStairs();

    // 3. Furniture Platforms
    this.drawFurniture();

    // 4. Goal Washing Machine
    this.drawWashingMachine();

    // 5. Laundry Pickups
    this.drawLaundry();

    // 5b. Treats Pickups
    this.drawTreats();

    // 6. Hazard obstacles
    this.drawHazards();

    // 7. Main Player Dog
    this.drawPlayerDog();

    // 8. Particles
    this.drawParticles();

    this.ctx.restore();

    // Final UI Updates (non-scrolling HUD overlays updates)
    this.updateHUDProgressBar();
  }

  drawBackground(camX) {
    const l = this.levelData;
    if (!l) return;
    
    const theme = l.theme || 'living-room';

    // --------------------------------------------------
    // A. WALL DRAWING (0 TO 480 Y)
    // --------------------------------------------------
    if (theme === 'patio') {
      // Outdoor Sunset Sky Gradient
      const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 480);
      skyGrad.addColorStop(0, '#0ea5e9'); // bright blue sky top
      skyGrad.addColorStop(0.6, '#bae6fd'); // light sky blue
      skyGrad.addColorStop(1, '#ffedd5'); // sunset peach at horizon
      this.ctx.fillStyle = skyGrad;
      this.ctx.fillRect(0, 0, l.width, 480);

      // Draw Sunset Sun
      this.ctx.fillStyle = '#ffedd5';
      this.ctx.beginPath();
      this.ctx.arc(600, 300, 70, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = '#fdba74'; // orange sun glow
      this.ctx.beginPath();
      this.ctx.arc(600, 300, 50, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw clouds (scrolling slow parallax)
      const cloudSpacing = 800;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let cx = 150; cx < l.width; cx += cloudSpacing) {
        const px = cx + camX * 0.15; // slow scroll
        this.ctx.beginPath();
        this.ctx.arc(px, 120, 25, 0, Math.PI * 2);
        this.ctx.arc(px + 35, 105, 35, 0, Math.PI * 2);
        this.ctx.arc(px + 70, 120, 25, 0, Math.PI * 2);
        this.ctx.closePath();
        this.ctx.fill();
      }

      // Draw background tree silhouettes peeking
      this.ctx.fillStyle = '#14532d'; // very dark forest green
      const treeSpacing = 280;
      for (let tx = 100; tx < l.width; tx += treeSpacing) {
        this.ctx.beginPath();
        this.ctx.moveTo(tx, 480);
        this.ctx.lineTo(tx + 60, 240);
        this.ctx.lineTo(tx + 120, 480);
        this.ctx.closePath();
        this.ctx.fill();
      }

      // Draw wooden garden fence
      this.ctx.fillStyle = '#b45309'; // warm wood fence slats
      this.ctx.strokeStyle = '#78350f';
      this.ctx.lineWidth = 1;
      const fenceW = 16;
      const fenceH = 120;
      const fenceY = 360;
      for (let fx = 0; fx < l.width; fx += fenceW + 4) {
        this.ctx.beginPath();
        this.ctx.moveTo(fx, fenceY + fenceH);
        this.ctx.lineTo(fx, fenceY + 12);
        this.ctx.lineTo(fx + fenceW / 2, fenceY);
        this.ctx.lineTo(fx + fenceW, fenceY + 12);
        this.ctx.lineTo(fx + fenceW, fenceY + fenceH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }
      
      // Horizontal fence support beams
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(0, fenceY + 30, l.width, 8);
      this.ctx.fillRect(0, fenceY + fenceH - 30, l.width, 8);

    } else if (theme === 'attic') {
      // Dusty brown/grey wood paneling or brick wall
      this.ctx.fillStyle = '#292524'; // very dark brick/wood stone wall
      this.ctx.fillRect(0, 0, l.width, 480);

      // Draw wood planks background panels
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.lineWidth = 1;
      const step = 90;
      for (let x = 0; x < l.width; x += step) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, 480);
        this.ctx.stroke();
      }

      // Draw Sloped Roof lines (attic rafters ceiling triangles)
      this.ctx.fillStyle = '#1c1917'; // pitch black ceiling beams
      for (let rx = -200; rx < l.width; rx += 400) {
        this.ctx.beginPath();
        this.ctx.moveTo(rx, 0);
        this.ctx.lineTo(rx + 200, 100);
        this.ctx.lineTo(rx + 400, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        // vertical support columns
        this.ctx.fillStyle = '#44403c';
        this.ctx.fillRect(rx + 190, 100, 20, 380);
      }

      // Cobwebs in top rafters corners
      this.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      this.ctx.lineWidth = 1;
      for (let wx = 300; wx < l.width; wx += 800) {
        this.ctx.beginPath();
        this.ctx.moveTo(wx, 0);
        this.ctx.lineTo(wx + 30, 25);
        this.ctx.lineTo(wx + 60, 0);
        this.ctx.moveTo(wx, 0);
        this.ctx.quadraticCurveTo(wx + 30, 15, wx + 60, 0);
        this.ctx.quadraticCurveTo(wx + 30, 25, wx + 60, 0);
        this.ctx.stroke();
      }

    } else if (theme === 'gameroom') {
      // Dark arcade wall with glowing neon vectors
      this.ctx.fillStyle = '#0f172a'; // slate blue-black
      this.ctx.fillRect(0, 0, l.width, 480);

      // Neon grid lines
      this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)'; // glowing violet
      this.ctx.lineWidth = 2;
      const step = 80;
      
      const startDrawX = Math.floor(camX / step) * step;
      const endDrawX = startDrawX + this.gameWidth + step;
      
      for (let x = startDrawX; x < endDrawX; x += step) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 200);
        this.ctx.lineTo(x - 200, 480);
        this.ctx.stroke();
      }
      
      // Horizontal lines getting wider
      let hy = 200;
      let hStep = 10;
      while (hy < 480) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, hy);
        this.ctx.lineTo(l.width, hy);
        this.ctx.stroke();
        hStep *= 1.35;
        hy += hStep;
      }

      // Draw cute neon bone signs
      this.ctx.save();
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = '#06b6d4'; // glowing cyan
      this.ctx.strokeStyle = '#06b6d4';
      this.ctx.lineWidth = 4;
      for (let nx = 500; nx < l.width; nx += 1000) {
        this.ctx.beginPath();
        this.ctx.arc(nx - 15, 100, 8, 0.5 * Math.PI, 1.5 * Math.PI);
        this.ctx.arc(nx - 15, 84, 8, 0.5 * Math.PI, 1.5 * Math.PI);
        this.ctx.lineTo(nx + 15, 84);
        this.ctx.arc(nx + 15, 84, 8, 1.5 * Math.PI, 0.5 * Math.PI);
        this.ctx.arc(nx + 15, 100, 8, 1.5 * Math.PI, 0.5 * Math.PI);
        this.ctx.lineTo(nx - 15, 100);
        this.ctx.closePath();
        this.ctx.stroke();
      }
      this.ctx.restore();

    } else if (theme === 'basement') {
      // Cold concrete stone brick wall
      this.ctx.fillStyle = '#374151'; // cool grey
      this.ctx.fillRect(0, 0, l.width, 480);

      // Stone brick lines
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.lineWidth = 2;
      const brickW = 120;
      const brickH = 40;
      for (let y = 0; y < 480; y += brickH) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(l.width, y);
        this.ctx.stroke();
        
        const shiftX = (y % (brickH * 2) === 0) ? 0 : brickW / 2;
        for (let x = shiftX; x < l.width; x += brickW) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, y);
          this.ctx.lineTo(x, y + brickH);
          this.ctx.stroke();
        }
      }

      // Draw metallic pipes along top
      this.ctx.fillStyle = '#6b7280';
      this.ctx.fillRect(0, 30, l.width, 16);
      this.ctx.strokeStyle = '#1f2937';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(0, 30, l.width, 16);
      
      for (let px = 800; px < l.width; px += 1200) {
        this.ctx.fillStyle = '#4b5563';
        this.ctx.fillRect(px, 24, 10, 28);
        this.ctx.strokeRect(px, 24, 10, 28);

        this.ctx.fillStyle = '#f8fafc';
        this.ctx.beginPath();
        this.ctx.arc(px + 40, 38, 14, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(px + 40, 38);
        this.ctx.lineTo(px + 46, 32);
        this.ctx.stroke();
      }

    } else if (theme === 'library') {
      // Bookshelf background filling the library
      this.ctx.fillStyle = '#7c2d12'; // deep mahogany wall
      this.ctx.fillRect(0, 0, l.width, 480);
      
      this.ctx.fillStyle = '#451a03';
      const shelfH = 70;
      for (let y = 30; y < 480; y += shelfH) {
        this.ctx.fillRect(0, y, l.width, 6); // shelf lines
        
        this.ctx.save();
        const colors = ['#b91c1c', '#1d4ed8', '#047857', '#b45309', '#6d28d9', '#4b5563'];
        let bx = 30;
        while (bx < l.width - 40) {
          const bh = 30 + Math.random() * 25;
          const bw = 8 + Math.random() * 10;
          this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          this.ctx.fillRect(bx, y - bh, bw, bh);
          
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(bx + bw/2, y - bh + 4);
          this.ctx.lineTo(bx + bw/2, y - 4);
          this.ctx.stroke();
          
          bx += bw + 3;
        }
        this.ctx.restore();
      }

    } else {
      // DEFAULT DOMESTIC ROOMS: living-room, kitchen, hallway, bedroom
      this.ctx.fillStyle = l.background;
      this.ctx.fillRect(0, 0, l.width, 480);

      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      this.ctx.lineWidth = 2;
      
      if (l.wallpaperPattern === 'stripes-vertical') {
        const step = 60;
        const startDrawX = Math.floor(camX / step) * step;
        const endDrawX = startDrawX + this.gameWidth + step;
        for (let x = startDrawX; x < endDrawX; x += step) {
          this.ctx.beginPath();
          this.ctx.moveTo(x, 0);
          this.ctx.lineTo(x, 480);
          this.ctx.stroke();
        }
      } else if (l.wallpaperPattern === 'checkered') {
        const step = 80;
        const startDrawX = Math.floor(camX / step) * step;
        const endDrawX = startDrawX + this.gameWidth + step;
        for (let x = startDrawX; x < endDrawX; x += step) {
          for (let y = 0; y < 480; y += step) {
            this.ctx.strokeRect(x, y, step, step);
          }
        }
      } else if (l.wallpaperPattern === 'stripes-horizontal') {
        const step = 50;
        this.ctx.lineWidth = 1;
        for (let y = 0; y < 480; y += step) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(l.width, y);
          this.ctx.stroke();
        }
      }
      this.ctx.restore();

      if (theme === 'kitchen') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.05)';
        this.ctx.fillRect(0, 280, l.width, 80);
        this.ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        this.ctx.lineWidth = 1;
        for (let tx = 0; tx < l.width; tx += 20) {
          this.ctx.beginPath();
          this.ctx.moveTo(tx, 280);
          this.ctx.lineTo(tx, 360);
          this.ctx.stroke();
        }
        for (let ty = 280; ty <= 360; ty += 20) {
          this.ctx.beginPath();
          this.ctx.moveTo(0, ty);
          this.ctx.lineTo(l.width, ty);
          this.ctx.stroke();
        }
      } else if (theme === 'hallway') {
        this.ctx.fillStyle = '#b45309';
        this.ctx.fillRect(0, 330, l.width, 150);
        this.ctx.strokeStyle = '#78350f';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 330, l.width, 150);
        
        this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        this.ctx.lineWidth = 1;
        for (let sx = 0; sx < l.width; sx += 30) {
          this.ctx.beginPath();
          this.ctx.moveTo(sx, 330);
          this.ctx.lineTo(sx, 480);
          this.ctx.stroke();
        }
      }

      const windowSpacing = 900;
      for (let wx = 400; wx < l.width - 400; wx += windowSpacing) {
        this.ctx.save();
        
        this.ctx.fillStyle = '#bae6fd';
        this.ctx.fillRect(wx, 60, 140, 150);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(wx + 50, 110, 18, 0, Math.PI * 2);
        this.ctx.arc(wx + 75, 100, 22, 0, Math.PI * 2);
        this.ctx.arc(wx + 95, 110, 16, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = '#f8fafc';
        this.ctx.strokeRect(wx, 60, 140, 150);
        
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(wx + 70, 60);
        this.ctx.lineTo(wx + 70, 210);
        this.ctx.moveTo(wx, 135);
        this.ctx.lineTo(wx + 140, 135);
        this.ctx.stroke();

        this.ctx.fillStyle = (theme === 'bedroom') ? 'rgba(168, 85, 247, 0.7)' : 'rgba(239, 68, 68, 0.7)';
        this.ctx.beginPath();
        this.ctx.moveTo(wx, 60);
        this.ctx.quadraticCurveTo(wx + 30, 135, wx + 10, 210);
        this.ctx.lineTo(wx, 210);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.moveTo(wx + 140, 60);
        this.ctx.quadraticCurveTo(wx + 110, 135, wx + 130, 210);
        this.ctx.lineTo(wx + 140, 210);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
      }
    }

    // --------------------------------------------------
    // B. FLOOR DRAWING (480 TO 540 Y)
    // --------------------------------------------------
    if (theme === 'patio') {
      this.ctx.fillStyle = '#22c55e'; // vivid lawn green
      this.ctx.fillRect(0, 480, l.width, 60);

      this.ctx.strokeStyle = 'rgba(21, 128, 61, 0.2)';
      this.ctx.lineWidth = 2;
      const stoneStep = 40;
      for (let fx = 0; fx < l.width + stoneStep; fx += stoneStep) {
        this.ctx.beginPath();
        this.ctx.arc(fx, 510, 12, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.arc(fx - 20, 525, 12, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      
      this.ctx.fillStyle = '#16a34a';
      for (let gx = 0; gx < l.width; gx += 16) {
        this.ctx.beginPath();
        this.ctx.moveTo(gx, 480);
        this.ctx.lineTo(gx + 3, 472);
        this.ctx.lineTo(gx + 6, 480);
        this.ctx.fill();
      }
      
      this.ctx.fillStyle = '#15803d';
      this.ctx.fillRect(0, 475, l.width, 5);

    } else if (theme === 'bedroom' || theme === 'library') {
      this.ctx.fillStyle = (theme === 'library') ? '#7f1d1d' : '#818cf8';
      this.ctx.fillRect(0, 480, l.width, 60);

      this.ctx.fillStyle = (theme === 'library') ? '#991b1b' : '#c7d2fe';
      for (let cx = 0; cx < l.width; cx += 25) {
        this.ctx.fillRect(cx + (cx % 3)*4, 490 + (cx % 5)*7, 3, 3);
        this.ctx.fillRect(cx - (cx % 5)*2, 510 + (cx % 3)*6, 3, 3);
      }

      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.fillRect(0, 470, l.width, 10);
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillRect(0, 467, l.width, 3);

    } else if (theme === 'basement') {
      this.ctx.fillStyle = '#4b5563';
      this.ctx.fillRect(0, 480, l.width, 60);

      this.ctx.strokeStyle = '#1f2937';
      this.ctx.lineWidth = 3;
      for (let bx = 300; bx < l.width; bx += 400) {
        this.ctx.beginPath();
        this.ctx.moveTo(bx, 480);
        this.ctx.lineTo(bx - 30, 540);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = '#111827';
      this.ctx.fillRect(0, 470, l.width, 10);

    } else if (theme === 'kitchen') {
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillRect(0, 480, l.width, 60);

      this.ctx.strokeStyle = '#94a3b8';
      this.ctx.lineWidth = 2;
      const tileW = 40;
      for (let tx = 0; tx < l.width; tx += tileW) {
        if ((tx / tileW) % 2 === 0) {
          this.ctx.fillStyle = '#64748b';
          this.ctx.fillRect(tx, 480, tileW, 30);
        } else {
          this.ctx.fillStyle = '#64748b';
          this.ctx.fillRect(tx, 510, tileW, 30);
        }
      }
      
      this.ctx.strokeStyle = '#334155';
      this.ctx.beginPath();
      this.ctx.moveTo(0, 510);
      this.ctx.lineTo(l.width, 510);
      this.ctx.stroke();
      this.ctx.strokeRect(0, 480, l.width, 60);

      this.ctx.fillStyle = '#475569';
      this.ctx.fillRect(0, 470, l.width, 10);

    } else {
      this.ctx.fillStyle = l.floorColor;
      this.ctx.fillRect(0, 480, l.width, 60);

      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      this.ctx.lineWidth = 2;
      for (let fy = 495; fy < 540; fy += 15) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, fy);
        this.ctx.lineTo(l.width, fy);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = '#451a03';
      this.ctx.fillRect(0, 465, l.width, 15);
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.fillRect(0, 477, l.width, 3);
    }
  }

  drawFurniture() {
    const theme = this.levelData ? (this.levelData.theme || 'living-room') : 'living-room';
    
    this.platforms.forEach(plat => {
      this.ctx.save();
      
      const x = plat.x;
      const y = plat.y;
      const w = plat.width;
      const h = plat.height;

      // 1. solid bookcase / cupboard / pantry / wardrobe
      if (plat.label === 'bookcase' || plat.label === 'cupboard' || plat.label === 'pantry' || plat.label === 'wardrobe' || plat.label === 'wardrobe-m2' || plat.label === 'cabinet-m2') {
        if (theme === 'patio') {
          // Backyard Garden Shelf / Planter crate stack
          this.ctx.fillStyle = '#15803d'; // green painted wood
          this.ctx.fillRect(x, y, w, h);
          this.ctx.strokeStyle = '#166534';
          this.ctx.lineWidth = 4;
          this.ctx.strokeRect(x, y, w, h);
          
          // Draw horizontal shelves and plant pots
          const shelfHeight = 45;
          for (let sy = y + shelfHeight; sy < y + h; sy += shelfHeight) {
            this.ctx.fillStyle = '#166534';
            this.ctx.fillRect(x + 4, sy, w - 8, 4); // shelf wood
            
            // Draw 2 pots per shelf
            const potX1 = x + 15;
            const potX2 = x + w - 35;
            
            [potX1, potX2].forEach(px => {
              if (px > x && px < x + w - 10) {
                this.ctx.fillStyle = '#ea580c'; // terracotta pots
                this.ctx.beginPath();
                this.ctx.moveTo(px, sy);
                this.ctx.lineTo(px + 16, sy);
                this.ctx.lineTo(px + 13, sy - 14);
                this.ctx.lineTo(px + 3, sy - 14);
                this.ctx.closePath();
                this.ctx.fill();
                
                // Leafy green plants
                this.ctx.fillStyle = '#4ade80';
                this.ctx.beginPath();
                this.ctx.arc(px + 4, sy - 16, 6, 0, Math.PI*2);
                this.ctx.arc(px + 12, sy - 16, 6, 0, Math.PI*2);
                this.ctx.arc(px + 8, sy - 21, 7, 0, Math.PI*2);
                this.ctx.fill();
              }
            });
          }
        } else if (theme === 'basement') {
          // Steel storage shelf rack
          this.ctx.fillStyle = '#6b7280'; // grey steel rails
          this.ctx.fillRect(x, y, 6, h);
          this.ctx.fillRect(x + w - 6, y, 6, h);
          
          const shelfHeight = 45;
          for (let sy = y + shelfHeight; sy < y + h; sy += shelfHeight) {
            this.ctx.fillStyle = '#f97316'; // orange cross rails
            this.ctx.fillRect(x, sy, w, 4);
            
            // Cardboard boxes
            this.ctx.fillStyle = '#d97706'; // brown cardboard box
            this.ctx.fillRect(x + 10, sy - 20, w / 2 - 12, 20);
            this.ctx.strokeStyle = '#b45309';
            this.ctx.strokeRect(x + 10, sy - 20, w / 2 - 12, 20);
            
            this.ctx.fillRect(x + w / 2 + 2, sy - 16, w / 2 - 10, 16);
            this.ctx.strokeRect(x + w / 2 + 2, sy - 16, w / 2 - 10, 16);
          }
        } else {
          // Elegant wood cabinet
          this.ctx.fillStyle = '#b45309'; // warm amber wood
          this.ctx.fillRect(x, y, w, h);
          this.ctx.strokeStyle = '#78350f';
          this.ctx.lineWidth = 4;
          this.ctx.strokeRect(x, y, w, h);

          // Draw inner shelves & books
          const shelfHeight = 45;
          this.ctx.fillStyle = '#78350f';
          for (let sy = y + shelfHeight; sy < y + h; sy += shelfHeight) {
            this.ctx.fillRect(x + 4, sy, w - 8, 4); // shelf line
            
            // Draw colorful books sitting on this shelf
            this.ctx.save();
            const bookColors = ['#ef4444', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#06b6d4'];
            let bx = x + 10;
            while (bx < x + w - 18) {
              const bh = 15 + Math.random() * 20;
              const bw = 5 + Math.random() * 8;
              this.ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
              
              const isTilted = Math.random() > 0.8;
              if (isTilted) {
                this.ctx.save();
                this.ctx.translate(bx, sy);
                this.ctx.rotate(0.2);
                this.ctx.fillRect(0, -bh, bw, bh);
                this.ctx.restore();
              } else {
                this.ctx.fillRect(bx, sy - bh, bw, bh);
              }
              bx += bw + 3;
            }
            this.ctx.restore();
          }
        }
      }

      // 2. dining table / patio table
      else if (plat.label === 'dining-table' || plat.label.includes('table')) {
        if (theme === 'patio') {
          // Glass patio table with Beach Umbrella
          this.ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
          this.ctx.fillRect(x, y, w, 10);
          this.ctx.strokeStyle = '#0ea5e9';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, w, 10);
          
          // Table legs
          this.ctx.fillStyle = '#475569';
          this.ctx.fillRect(x + w/2 - 4, y + 10, 8, h - 10);
          this.ctx.fillRect(x + 15, y + h - 5, w - 30, 5); // metal stand base
          
          // Draw Beach Umbrella pole rising from center
          this.ctx.strokeStyle = '#475569';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.moveTo(x + w/2, y);
          this.ctx.lineTo(x + w/2, y - 75);
          this.ctx.stroke();
          
          // Umbrella Canopy
          this.ctx.fillStyle = '#ef4444'; // red canopy
          this.ctx.beginPath();
          this.ctx.arc(x + w/2, y - 75, 45, Math.PI, 2 * Math.PI);
          this.ctx.fill();
          
          // White stripes overlay on canopy
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.moveTo(x + w/2 - 15, y - 75);
          this.ctx.lineTo(x + w/2 + 15, y - 75);
          this.ctx.quadraticCurveTo(x + w/2, y - 110, x + w/2 - 15, y - 75);
          this.ctx.fill();
        } else if (theme === 'basement') {
          // Industrial work bench
          this.ctx.fillStyle = '#374151'; // dark steel grey top
          this.ctx.fillRect(x, y, w, 15);
          this.ctx.strokeStyle = '#111827';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(x, y, w, 15);
          
          // Thick steel legs
          this.ctx.fillStyle = '#4b5563';
          this.ctx.fillRect(x + 10, y + 15, 12, h - 15);
          this.ctx.fillRect(x + w - 22, y + 15, 12, h - 15);
        } else {
          // Thin top board
          this.ctx.fillStyle = '#78350f';
          this.ctx.fillRect(x, y, w, 15);
          
          // Shadow underneath
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          this.ctx.fillRect(x + 5, y + 15, w - 10, 6);

          // Legs (left and right)
          this.ctx.fillStyle = '#451a03';
          this.ctx.fillRect(x + 15, y + 15, 10, h - 15);
          this.ctx.fillRect(x + w - 25, y + 15, 10, h - 15);
        }
      }

      // 3. couch / sofas
      else if (plat.label.includes('couch') || plat.label.includes('sofa') || plat.label.includes('armchair')) {
        if (theme === 'patio') {
          // Wicker outdoor garden sofa
          this.ctx.fillStyle = '#78350f'; // wicker brown backing
          this.ctx.beginPath();
          this.ctx.roundRect(x, y, w, h, 8);
          this.ctx.fill();
          
          this.ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          this.ctx.lineWidth = 1;
          for (let sx = x + 10; sx < x + w; sx += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(sx, y);
            this.ctx.lineTo(sx, y + h);
            this.ctx.stroke();
          }

          this.ctx.fillStyle = '#f8fafc'; // clean white cushions
          this.ctx.beginPath();
          this.ctx.roundRect(x + 10, y + h - 35, w - 20, 30, 4);
          this.ctx.fill();
          
          this.ctx.fillStyle = '#451a03';
          this.ctx.fillRect(x + 15, y + h, 8, 8);
          this.ctx.fillRect(x + w - 23, y + h, 8, 8);
        } else if (theme === 'gameroom') {
          // Neon cyber sofa
          this.ctx.fillStyle = '#581c87'; // deep purple seat backing
          this.ctx.beginPath();
          this.ctx.roundRect(x, y, w, h, 12);
          this.ctx.fill();
          
          this.ctx.strokeStyle = '#a855f7'; // magenta neon border
          this.ctx.lineWidth = 3;
          this.ctx.strokeRect(x, y, w, h);

          this.ctx.fillStyle = '#06b6d4';
          this.ctx.beginPath();
          this.ctx.roundRect(x + 15, y + h - 35, w - 30, 30, 4);
          this.ctx.fill();
        } else {
          // Draw sofa backing
          this.ctx.fillStyle = '#312e81'; // Royal indigo sofa cloth
          this.ctx.beginPath();
          this.ctx.roundRect(x, y, w, h, 12);
          this.ctx.fill();

          // Draw armrests
          this.ctx.fillStyle = '#1e1b4b'; // Darker indigo for depth
          this.ctx.beginPath();
          this.ctx.roundRect(x, y + h - 50, 24, 50, 6);
          this.ctx.roundRect(x + w - 24, y + h - 50, 24, 50, 6);
          this.ctx.fill();

          // Draw seat cushion
          this.ctx.fillStyle = '#3f3f46'; // slate grey cushions
          this.ctx.beginPath();
          this.ctx.roundRect(x + 18, y + h - 35, w - 36, 30, 4);
          this.ctx.fill();
          
          // Sofa base legs
          this.ctx.fillStyle = '#111827';
          this.ctx.fillRect(x + 20, y + h, 10, 8);
          this.ctx.fillRect(x + w - 30, y + h, 10, 8);
        }
      }

      // 4. coffee table
      else if (plat.label.includes('coffee-table')) {
        if (theme === 'patio') {
          // Small garden bench stool
          this.ctx.fillStyle = '#b45309';
          this.ctx.fillRect(x, y, w, 12);
          this.ctx.fillStyle = '#78350f';
          this.ctx.fillRect(x + 8, y + 12, 8, h - 12);
          this.ctx.fillRect(x + w - 16, y + 12, 8, h - 12);
        } else {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // glass top look
          this.ctx.fillRect(x, y, w, 8);
          
          this.ctx.strokeStyle = '#e2e8f0';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, w, 8);

          this.ctx.fillStyle = '#475569'; // steel legs
          this.ctx.fillRect(x + 10, y + 8, 6, h - 8);
          this.ctx.fillRect(x + w - 16, y + 8, 6, h - 8);
        }
      }

      // 5. chairs
      else if (plat.label.includes('chair')) {
        this.ctx.fillStyle = (theme === 'patio') ? '#166534' : '#854d0e'; // green folding metal chair vs wood
        this.ctx.fillRect(x + w - 10, y, 10, h);
        this.ctx.fillRect(x, y + 45, w, 8);
        this.ctx.fillRect(x + 2, y + 53, 5, h - 53);
        this.ctx.fillRect(x + w - 8, y + 53, 5, h - 53);
      }

      // 6. refrigerator
      else if (plat.label === 'refrigerator') {
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillRect(x, y, w, h);
        
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, w, h);

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + h * 0.4);
        this.ctx.lineTo(x + w, y + h * 0.4);
        this.ctx.stroke();

        this.ctx.fillStyle = '#475569';
        this.ctx.fillRect(x + 10, y + h * 0.2, 5, 40);
        this.ctx.fillRect(x + 10, y + h * 0.45, 5, 50);
      }

      // 7. Kitchen Island / Countertop / patio BBQ Grill
      else if (plat.label.includes('kitchen') || plat.label.includes('counter')) {
        if (theme === 'patio') {
          // Brick BBQ Grill
          this.ctx.fillStyle = '#ef4444'; // red clay brick color
          this.ctx.fillRect(x, y, w, h);
          this.ctx.strokeStyle = '#991b1b';
          this.ctx.lineWidth = 1.5;
          for (let by = y + 15; by < y + h; by += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, by);
            this.ctx.lineTo(x + w, by);
            this.ctx.stroke();
          }
          for (let bx = x + 15; bx < x + w; bx += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(bx, y);
            this.ctx.lineTo(bx, y + h);
            this.ctx.stroke();
          }

          this.ctx.fillStyle = '#1e293b';
          this.ctx.fillRect(x - 4, y, w + 8, 10);
          
          this.ctx.fillStyle = '#f97316';
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = '#ef4444';
          for (let gx = x + 15; gx < x + w - 15; gx += 20) {
            this.ctx.beginPath();
            this.ctx.arc(gx, y + 4, 4, 0, Math.PI*2);
            this.ctx.fill();
          }
          this.ctx.shadowBlur = 0;
        } else {
          this.ctx.fillStyle = '#1e293b'; // slate dark counters
          this.ctx.fillRect(x, y, w, h);
          
          this.ctx.fillStyle = '#f1f5f9'; // white marble
          this.ctx.fillRect(x - 4, y, w + 8, 12);
          
          this.ctx.strokeStyle = '#cbd5e1';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x - 4, y, w + 8, 12);

          this.ctx.strokeStyle = '#0f172a';
          this.ctx.lineWidth = 2;
          const count = Math.round(w / 70);
          const panelW = w / count;
          for (let i = 0; i < count; i++) {
            this.ctx.strokeRect(x + i*panelW + 4, y + 20, panelW - 8, h - 30);
            
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.beginPath();
            this.ctx.arc(x + i*panelW + panelW - 12, y + h/2, 3, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }
      }

      // 8. Beds
      else if (plat.label.includes('bed')) {
        this.ctx.fillStyle = '#b45309';
        this.ctx.fillRect(x, y + 30, w, 30);
        
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(x + 10, y + 10, w - 10, 20);

        this.ctx.fillStyle = '#818cf8';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 15, y + 4, 35, 12, 4);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#6366f1';
        this.ctx.fillRect(x + 55, y + 10, w - 65, 20);
      }

      // 9. Chandeliers (hanging)
      else if (plat.label.includes('chandelier')) {
        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + w/2, 0);
        this.ctx.lineTo(x + w/2, y);
        this.ctx.stroke();

        this.ctx.fillStyle = '#fbbf24'; // brass metal
        this.ctx.fillRect(x, y, w, h);
        
        this.ctx.fillStyle = '#fef08a';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#fbbf24';
        
        this.ctx.beginPath();
        this.ctx.arc(x + 15, y - 5, 8, 0, Math.PI*2);
        this.ctx.arc(x + w/2, y - 8, 9, 0, Math.PI*2);
        this.ctx.arc(x + w - 15, y - 5, 8, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
      }

      // 10. Mezzanine floors
      else if (plat.type === 'floor-mezzanine') {
        this.ctx.fillStyle = '#451a03'; // deep wood beam
        this.ctx.fillRect(x, y, w, h);
        
        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.fillRect(x, y + h, w, 4);
      }

      // 11. General catchall block shelf
      else {
        this.ctx.fillStyle = '#854d0e';
        this.ctx.fillRect(x, y, w, h);
        this.ctx.strokeStyle = '#451a03';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);
      }

      this.ctx.restore();
    });
  }

  drawStairs() {
    this.stairs.forEach(stair => {
      this.ctx.save();
      
      const count = 12; // number of steps drawn
      const stepW = (stair.endX - stair.startX) / count;
      const stepH = (stair.endY - stair.startY) / count;

      // Draw wood stairway board base
      this.ctx.fillStyle = '#78350f';
      this.ctx.strokeStyle = '#451a03';
      this.ctx.lineWidth = 3;
      
      // Draw individual steps blocks staircasing down/up
      for (let i = 0; i < count; i++) {
        const sx = stair.startX + i * stepW;
        const sy = stair.startY + i * stepH;
        
        // Draw step step riser
        this.ctx.fillRect(sx, sy, stepW + 2, 480 - sy);
        this.ctx.strokeRect(sx, sy, stepW + 2, 480 - sy);
      }
      
      this.ctx.restore();
    });
  }

  drawWashingMachine() {
    const wm = this.washingMachine;
    this.ctx.save();
    
    // Machine body (rounded white rectangle)
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.roundRect(wm.x, wm.y, wm.width, wm.height, 16);
    this.ctx.fill();

    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(wm.x, wm.y, wm.width, wm.height);

    // Control panel top bar
    this.ctx.fillStyle = '#e2e8f0';
    this.ctx.fillRect(wm.x + 4, wm.y + 4, wm.width - 8, 20);

    // Control knob and light
    this.ctx.fillStyle = '#475569';
    this.ctx.beginPath();
    this.ctx.arc(wm.x + 20, wm.y + 14, 6, 0, Math.PI*2);
    this.ctx.fill();

    // Red/Green indicator lights
    this.ctx.fillStyle = wm.isSpinning ? '#22c55e' : '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(wm.x + wm.width - 20, wm.y + 14, 4, 0, Math.PI*2);
    this.ctx.fill();

    // Main Drum Window (Circular glass window)
    const cx = wm.x + wm.width / 2;
    const cy = wm.y + wm.height / 2 + 10;
    const r = 35;
    
    this.ctx.fillStyle = '#0f172a'; // dark inside drum
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI*2);
    this.ctx.fill();

    // If spinning, draw rotating laundry items inside
    if (wm.isSpinning) {
      this.ctx.save();
      this.ctx.translate(cx, cy);
      this.ctx.rotate(wm.spinTimer * 0.15);
      
      const colors = ['#f43f5e', '#3b82f6', '#fbbf24', '#a855f7'];
      // Draw colorful blobs swirling inside
      colors.forEach((col, idx) => {
        this.ctx.fillStyle = col;
        this.ctx.beginPath();
        this.ctx.arc(15 * Math.cos(idx * Math.PI/2), 15 * Math.sin(idx * Math.PI/2), 8, 0, Math.PI*2);
        this.ctx.fill();
      });
      this.ctx.restore();
    }

    // Glass Reflection Overlay
    this.ctx.fillStyle = 'rgba(186, 230, 253, 0.25)';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r - 2, 0, Math.PI*2);
    this.ctx.fill();

    // Draw Chrome door handle rim with shake physics rotation
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(wm.doorAngle);
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, r + 2, 0, Math.PI*2);
    this.ctx.stroke();

    // Handle hinge knob
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(r - 4, -4, 8, 8);
    this.ctx.restore();

    this.ctx.restore();
  }

  drawLaundry() {
    const time = Date.now() * 0.003;
    this.laundry.forEach(item => {
      this.ctx.save();
      
      // Bobbing up and down effect
      const bob = Math.sin(time * 1.5 + item.x) * 4;
      const rot = Math.sin(time * 0.8 + item.x) * 0.1;
      
      this.ctx.translate(item.x, item.y + bob);
      this.ctx.rotate(rot);

      // Shadow underneath
      this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 16 - bob, 12, 3, 0, 0, Math.PI*2);
      this.ctx.fill();

      // Sock
      if (item.type === 'sock') {
        this.ctx.strokeStyle = '#f43f5e';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-4, -6);
        this.ctx.lineTo(-4, 4);
        this.ctx.lineTo(6, 4);
        this.ctx.stroke();
        
        // white heel line
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-4, 0);
        this.ctx.lineTo(-2, 2);
        this.ctx.stroke();
      }
      // T-shirt
      else if (item.type === 'shirt') {
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        // Draw shirt polygon path
        this.ctx.moveTo(-12, -10);
        this.ctx.lineTo(12, -10);
        this.ctx.lineTo(12, -4);
        this.ctx.lineTo(7, -4);
        this.ctx.lineTo(7, 10);
        this.ctx.lineTo(-7, 10);
        this.ctx.lineTo(-7, -4);
        this.ctx.lineTo(-12, -4);
        this.ctx.closePath();
        this.ctx.fill();
      }
      // Pants
      else {
        this.ctx.fillStyle = '#10b981';
        // Left leg
        this.ctx.fillRect(-8, -8, 6, 18);
        // Right leg
        this.ctx.fillRect(2, -8, 6, 18);
        // Waist
        this.ctx.fillRect(-8, -10, 16, 6);
      }

      // Sparkle halo glow
      this.ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 16, 0, Math.PI*2);
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  drawTreats() {
    if (!this.treats) return;
    const time = Date.now() * 0.003;
    
    this.treats.forEach(treat => {
      this.ctx.save();
      
      const bob = Math.sin(time * 2.0 + treat.x) * 5;
      const rot = Math.sin(time * 0.8 + treat.x) * 0.2;
      
      this.ctx.translate(treat.x, treat.y + bob);
      this.ctx.rotate(rot);

      // Gold aura glow
      this.ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 18, 0, Math.PI*2);
      this.ctx.fill();

      // Shadow
      this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
      this.ctx.beginPath();
      this.ctx.ellipse(0, 14 - bob, 10, 3, 0, 0, Math.PI*2);
      this.ctx.fill();

      // Bone treat shape
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#d97706'; // Golden Retriever dark gold border
      this.ctx.lineWidth = 1.5;
      
      // Left joints
      this.ctx.beginPath();
      this.ctx.arc(-8, -4, 4, 0, Math.PI*2);
      this.ctx.arc(-8, 4, 4, 0, Math.PI*2);
      // Right joints
      this.ctx.arc(8, -4, 4, 0, Math.PI*2);
      this.ctx.arc(8, 4, 4, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.stroke();

      // Middle bone bar
      this.ctx.fillRect(-8, -3.5, 16, 7);
      this.ctx.strokeRect(-8, -3.5, 16, 7);

      this.ctx.restore();
    });
  }

  spawnTreatParticles(x, y) {
    const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff']; // golden sparkles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 0,
        maxLife: 25 + Math.random() * 15
      });
    }
  }

  drawHazards() {
    const time = Date.now() * 0.003;
    this.hazards.forEach(hz => {
      this.ctx.save();
      this.ctx.translate(hz.x, hz.y);

      // Dust Bunny (Animated crawling grey fuzzy ball)
      if (hz.type === 'dust-bunny') {
        const wiggle = Math.sin(time * 5.0 + hz.x) * 2;
        
        // Fuzzy spikes background
        this.ctx.fillStyle = '#475569';
        this.ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
          const r = 12 + Math.sin(time * 12 + a*3) * 3;
          this.ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Inner body
        this.ctx.fillStyle = '#64748b';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 9, 0, Math.PI*2);
        this.ctx.fill();

        // Glowing red eyes
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(hz.vx > 0 ? 3 : -3, -2, 2.2, 0, Math.PI*2);
        this.ctx.arc(hz.vx > 0 ? 8 : -8, -2, 2.2, 0, Math.PI*2);
        this.ctx.fill();
      }

      // Falling Household Toy Obstacle
      else if (hz.type === 'falling-toy') {
        const bounceAngle = hz.triggered ? 0 : Math.sin(time * 2 + hz.x) * 0.08;
        this.ctx.rotate(bounceAngle);
        
        if (hz.label === 'mug') {
          // Ceramic Coffee Mug
          this.ctx.fillStyle = '#ea580c'; // orange
          this.ctx.fillRect(-7, -8, 14, 16);
          this.ctx.strokeRect(-7, -8, 14, 16);
          
          // Handle
          this.ctx.strokeStyle = '#ea580c';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.arc(7, 0, 5, -Math.PI/2, Math.PI/2);
          this.ctx.stroke();
        } else {
          // Flower pot
          this.ctx.fillStyle = '#d97706'; // Terracotta
          this.ctx.beginPath();
          this.ctx.moveTo(-10, -9);
          this.ctx.lineTo(10, -9);
          this.ctx.lineTo(7, 9);
          this.ctx.lineTo(-7, 9);
          this.ctx.closePath();
          this.ctx.fill();
          
          // Rim
          this.ctx.fillStyle = '#b45309';
          this.ctx.fillRect(-12, -10, 24, 4);
        }
      }

      this.ctx.restore();
    });
  }

  drawPlayerDog() {
    const p = this.player;
    
    // Check invulnerability flashing effect
    if (p.invulnTime > 0 && Math.floor(p.invulnTime / 4) % 2 === 0) {
      return; // Skip rendering this frame (flashing effect)
    }

    this.ctx.save();
    
    // Translate coordinate space to dog center pivot
    this.ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
    
    // Face correct direction
    if (p.facing === 'left') {
      this.ctx.scale(-1, 1);
    }
    
    // Draw golden glow aura under the dog model when speed boosted
    if (p.powerupTimer > 0) {
      this.ctx.fillStyle = 'rgba(251, 191, 36, 0.22)';
      this.ctx.shadowBlur = 18;
      this.ctx.shadowColor = '#fbbf24';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 32, 0, Math.PI*2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset
    }
    
    const w = p.width;
    const h = p.height;
    
    const isMoving = Math.abs(p.vx) > 0.15 && p.onGround;
    const isDucking = p.isDucking;
    const isJumping = !p.onGround;
    
    // Tail rotation wag physics
    let tailAngle = 0;
    if (isMoving) {
      tailAngle = Math.sin(p.animTime * 20) * 0.35;
    } else if (p.onGround) {
      tailAngle = Math.sin(p.animTime * 3) * 0.12; // slow wag
    }
    
    // Leg stride swings
    let leg1 = 0;
    let leg2 = 0;
    if (isMoving) {
      leg1 = Math.sin(p.animTime * 14) * 0.45;
      leg2 = -Math.sin(p.animTime * 14) * 0.45;
    } else if (isJumping) {
      leg1 = 0.4;
      leg2 = -0.4;
    }
    
    // A. Draw Tail
    this.ctx.save();
    this.ctx.translate(-w/2 + 5, isDucking ? -1 : -6);
    this.ctx.rotate(-0.5 + tailAngle);
    this.ctx.fillStyle = '#b45309'; // gold shadow
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, 11, 4, 0, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.restore();

    // B. Draw Legs (Outer legs & Inner legs)
    const legY = h/2 - 4;
    this.ctx.lineWidth = 6;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#d97706'; // Golden Retriever dark gold
    
    // Rear Leg 1
    this.ctx.save();
    this.ctx.translate(-w/2 + 12, legY);
    this.ctx.rotate(leg1);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 10);
    this.ctx.stroke();
    this.ctx.restore();
    
    // Rear Leg 2
    this.ctx.save();
    this.ctx.translate(-w/2 + 18, legY);
    this.ctx.rotate(leg2);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 10);
    this.ctx.stroke();
    this.ctx.restore();

    // Front Leg 1
    this.ctx.save();
    this.ctx.translate(w/2 - 18, legY);
    this.ctx.rotate(leg2);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 10);
    this.ctx.stroke();
    this.ctx.restore();
    
    // Front Leg 2
    this.ctx.save();
    this.ctx.translate(w/2 - 12, legY);
    this.ctx.rotate(leg1);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, 10);
    this.ctx.stroke();
    this.ctx.restore();

    // C. Draw Torso Body
    this.ctx.fillStyle = '#f59e0b'; // golden retrieve body color
    this.ctx.beginPath();
    if (isDucking) {
      this.ctx.roundRect(-w/2, -h/2 + 2, w - 8, h - 8, 8);
    } else {
      this.ctx.roundRect(-w/2, -h/2, w - 10, h - 12, 11);
    }
    this.ctx.fill();

    // D. Draw Head
    this.ctx.save();
    if (isDucking) {
      this.ctx.translate(w/2 - 5, -3);
    } else {
      this.ctx.translate(w/2 - 7, -11);
    }
    
    // Head circle base
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 13, 0, Math.PI*2);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fill();
    
    // Floppy Ear
    this.ctx.save();
    this.ctx.translate(-3, -5);
    let ear = 0.2;
    if (isJumping) ear = -0.3;
    else if (isMoving) ear = Math.sin(p.animTime * 14) * 0.15 + 0.1;
    this.ctx.rotate(ear);
    
    this.ctx.fillStyle = '#d97706';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 7, 5.5, 11, 0.1, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.restore();

    // Cream Snout
    this.ctx.fillStyle = '#fef08a';
    this.ctx.beginPath();
    this.ctx.arc(7, 2, 5.5, 0, Math.PI*2);
    this.ctx.fill();
    
    // Black nose tip
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(11, 0, 2.5, 0, Math.PI*2);
    this.ctx.fill();

    // Eye
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(2, -4, 2, 0, Math.PI*2);
    this.ctx.fill();
    
    // Eye star glow highlight
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(1.5, -4.5, 0.7, 0, Math.PI*2);
    this.ctx.fill();
    
    this.ctx.restore(); // Head pop

    // E. Draw Stack of Laundry on Back!
    if (p.laundryCount > 0) {
      const stackX = -4;
      const stackY = isDucking ? -h/2 + 2 : -h/2 + 2;
      const wobble = isMoving ? Math.sin(p.animTime * 16) * 1.6 * (Math.abs(p.vx) / 3.5) : 0;
      
      this.ctx.save();
      this.ctx.translate(stackX + wobble, stackY);
      
      const renderCount = Math.min(p.laundryCount, 8); // draw max 8 items visually
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
      
      for (let i = 0; i < renderCount; i++) {
        this.ctx.fillStyle = colors[i % colors.length];
        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        this.ctx.lineWidth = 1;
        
        this.ctx.beginPath();
        const itemW = 28 - i * 1.2;
        const itemH = 6;
        const itemOffsetY = -i * 5;
        this.ctx.roundRect(-itemW/2, itemOffsetY - itemH, itemW, itemH, 2.5);
        this.ctx.fill();
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    this.ctx.restore(); // Dog reset

    // Render floating powerup bar above player's head (outside coordinate scaling)
    if (p.powerupTimer > 0) {
      this.ctx.save();
      const barW = 55;
      const barH = 5;
      const barX = p.x + p.width/2 - barW/2;
      const barY = p.y - 18;
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.fillRect(barX, barY, barW, barH);
      
      const pct = p.powerupTimer / 480;
      this.ctx.fillStyle = '#fbbf24'; // Golden speed fill
      this.ctx.fillRect(barX, barY, barW * pct, barH);
      
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(barX, barY, barW, barH);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 8px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#000000';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText("TREAT BOOST! ⚡", p.x + p.width/2, p.y - 25);
      this.ctx.restore();
    }
  }

  drawParticles() {
    this.particles.forEach(pt => {
      this.ctx.save();
      this.ctx.globalAlpha = pt.alpha;
      this.ctx.fillStyle = pt.color;

      if (pt.type === 'confetti') {
        this.ctx.translate(pt.x, pt.y);
        this.ctx.rotate(pt.rotation);
        this.ctx.fillRect(-pt.size/2, -pt.size/2, pt.size, pt.size);
      } else if (pt.type === 'laundry-deposit') {
        // Draw laundry shape flying into machine
        this.ctx.fillStyle = pt.color;
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, pt.size / 2, 0, Math.PI*2);
        this.ctx.fill();
      } else {
        // Sparkles / Dust circles
        this.ctx.beginPath();
        this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    // Draw washing machine specific bubbles (non-translated relative to wm coordinate)
    this.washingMachine.bubbles.forEach(b => {
      this.ctx.save();
      this.ctx.globalAlpha = b.alpha;
      this.ctx.strokeStyle = '#bae6fd';
      this.ctx.lineWidth = 1.5;
      
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.size, 0, Math.PI*2);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  updateHUDProgressBar() {
    if (this.gameState !== 'PLAYING') return;
    
    // Fill percentage: player position towards washing machine
    const length = this.levelData.width - 250;
    const progress = Math.min(100, Math.max(0, (this.player.x / length) * 100));
    document.getElementById('hud-progress-fill').style.width = `${progress}%`;
  }
}

// Instantiate and bind globally for browser console access / debug
let gameInstance = null;
window.addEventListener('DOMContentLoaded', () => {
  gameInstance = new Game();
});
