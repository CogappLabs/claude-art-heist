import "./style.css";

// Game configuration - all magic numbers extracted here
const CONFIG = {
	// Player settings
	player: {
		baseSpeed: 4,
		size: 6,
		pulseAmount: 1.5,
		pulseSpeed: 100,
		directionIndicatorLength: 18,
	},

	// Guard settings
	guard: {
		size: 30,
		alertDistance: 120,
		alertIncreaseRate: 0.04,
		alertDecreaseRate: 0.015,
		chaseThreshold: 0.3,
		spotlightRange: 100,
		spotlightAngle: 0.5,
		minSpawnDistance: 3, // multiplied by guard size
	},

	// Artwork settings
	artwork: {
		size: 50,
		proximityGlowDistance: 150,
		glowSpeed: 0.05,
		collectionPadding: 8,
	},

	// Power-up settings
	powerUp: {
		size: 25,
		bobSpeed: 3,
		bobAmount: 5,
		speedBoostMultiplier: 1.5,
		speedBoostDuration: 5000,
		invisibilityDuration: 180, // frames
		magnetDuration: 300, // frames
		magnetRange: 150,
		magnetPullSpeed: 2,
	},

	// Laser settings
	laser: {
		minLength: 80,
		lengthVariance: 60,
		baseSpeed: 0.02,
		speedVariance: 0.02,
		hitWidth: 5,
	},

	// Combo system
	combo: {
		window: 2000, // ms
		maxMultiplier: 5,
		basePoints: 50,
	},

	// Spawn margins and positioning
	spawn: {
		margin: 50,
		minX: 80,
		guardMinX: 100,
		powerUpMinX: 150,
		laserMinX: 200,
		maxAttempts: 50,
	},

	// Level progression
	levels: {
		baseGuards: 4,
		baseArtworks: 3,
		fastGuardMinLevel: 3,
		fastGuardChance: 0.2,
		stationaryGuardMinLevel: 5,
		stationaryGuardChance: 0.15,
		powerUpMinLevel: 2,
		laserMinLevel: 4,
		levelCompleteBonus: 100,
	},

	// Visual effects
	effects: {
		nearMissDistance: 25,
		nearMissCooldown: 30,
		slowMoDuration: 15,
		slowMoTimeScale: 0.3,
		caughtShakeIntensity: 15,
		caughtShakeDuration: 40,
		caughtFlashAlpha: 0.7,
		caughtParticleCount: 40,
		levelCompleteZoom: 1.1,
		levelCompleteFlashAlpha: 0.4,
		levelCompleteParticleCount: 30,
		levelTransitionDuration: 60,
		collectParticleBase: 25,
		collectParticlePerCombo: 5,
		vignetteBase: 0.3,
		vignetteMaxDanger: 0.4,
	},

	// Audio settings
	audio: {
		musicBPM: 100,
		bassVolume: 0.08,
		highVolume: 0.03,
		collectVolume: 0.15,
		heartbeatMinInterval: 300,
		heartbeatMaxInterval: 800,
		heartbeatThreshold: 0.3,
	},

	// API settings
	api: {
		minArtworksPerStyle: 4,
		pageCount: 10,
		artworksPerPage: 100,
		imageSize: 80,
	},

	// Background grid
	background: {
		gridSpacing: 80,
		pillarSpacing: 200,
		floorLines: 10,
	},

	// Toast notification
	toast: {
		duration: 2500,
	},

	// Danger level
	danger: {
		maxDistance: 150,
	},
} as const;

// Type definitions
interface PathPoint {
	x: number;
	y: number;
	newSegment?: boolean;
}

interface Guard {
	baseX: number;
	baseY: number;
	x: number;
	y: number;
	phase: number;
	speedX: number;
	speedY: number;
	radiusX: number;
	radiusY: number;
	type: "normal" | "fast" | "stationary";
	alertLevel: number;
	spotlightAngle: number;
}

interface Artwork {
	x: number;
	y: number;
	collected: boolean;
	glowPhase: number;
	data?: ArtworkData;
}

interface ArtworkData {
	id: number;
	title: string;
	artist: string;
	date: string;
	medium: string;
	origin: string;
	style: string;
	imageUrl: string;
}

interface PowerUp {
	x: number;
	y: number;
	type: "speed" | "invisible" | "magnet";
	collected: boolean;
	bobPhase: number;
}

interface Laser {
	x: number;
	y: number;
	isHorizontal: boolean;
	length: number;
	phase: number;
	speed: number;
}

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	decay: number;
	size: number;
	maxSize?: number;
	color: string;
	type: "circle" | "star" | "ring";
}

interface FloatingText {
	x: number;
	y: number;
	text: string;
	color: string;
	life: number;
	vy: number;
}

interface SpeedLine {
	x: number;
	y: number;
	length: number;
	life: number;
	decay: number;
}

interface GameState {
	playerX: number;
	playerY: number;
	path: PathPoint[];
	guards: Guard[];
	artworks: Artwork[];
	powerUps: PowerUp[];
	lasers: Laser[];
	goingUp: boolean;
	gameOver: boolean;
	gameStarted: boolean;
	level: number;
	score: number;
	speed: number;
	baseSpeed: number;
	artworksLoaded: boolean;
	currentStyle: string | null;
	usedStyles: string[];
	stolenArtworks: ArtworkData[];
	combo: number;
	comboTimer: number;
	lastCollectTime: number;
	timeScale: number;
	slowMoTimer: number;
	isInvisible: boolean;
	invisibleTimer: number;
	hasMagnet: boolean;
	magnetTimer: number;
	nearMissTimer: number;
	levelTransition: boolean;
	levelTransitionTimer: number;
	dangerLevel: number;
}

interface GuardTypeData {
	emoji: string;
	speed: number;
	radius: number;
	color: string;
	hasSpotlight?: boolean;
}

interface BgLayer {
	offset: number;
	speed: number;
	color: string;
}

// DOM Elements
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
const gameOverEl = document.getElementById("game-over")!;
const levelEl = document.getElementById("level")!;
const scoreEl = document.getElementById("score")!;
const themeEl = document.getElementById("theme")!;
const titleScreenEl = document.getElementById("title-screen")!;
const comboDisplayEl = document.getElementById("combo-display")!;
const comboCountEl = document.getElementById("combo-count")!;
const srAnnouncementsEl = document.getElementById("sr-announcements")!;
const bestScoreEl = document.getElementById("best-score")!;
const finishScreenEl = document.getElementById("finish-screen")!;
const toastEl = document.getElementById("toast")!;
const speedBtns = document.querySelectorAll(
	".speed-btn",
) as NodeListOf<HTMLButtonElement>;

// Constants derived from config
const GUARD_SIZE = CONFIG.guard.size;
const ARTWORK_SIZE = CONFIG.artwork.size;
const MIN_ARTWORKS_PER_STYLE = CONFIG.api.minArtworksPerStyle;
const COMBO_WINDOW = CONFIG.combo.window;
const POWER_UP_SIZE = CONFIG.powerUp.size;

// Guard types
const GUARD_TYPES: Record<string, GuardTypeData> = {
	normal: { emoji: "👮", speed: 1, radius: GUARD_SIZE / 2, color: "#4a90d9" },
	fast: { emoji: "🏃", speed: 2, radius: GUARD_SIZE / 2 - 5, color: "#e94560" },
	stationary: {
		emoji: "🔦",
		speed: 0,
		radius: GUARD_SIZE,
		hasSpotlight: true,
		color: "#ffd700",
	},
};

// Announce to screen readers
function announce(message: string): void {
	srAnnouncementsEl.textContent = message;
}

// High score persistence
let highScore = parseInt(localStorage.getItem("artHeistHighScore") || "0", 10);
bestScoreEl.textContent = highScore.toString();

// Speed multiplier (selected on title screen) - persist preference
let speedMultiplier = parseInt(
	localStorage.getItem("artHeistSpeed") || "1",
	10,
);

// Initialize the speed button selection on load
function initSpeedSelection(): void {
	speedBtns.forEach((btn) => {
		const btnSpeed = parseInt(btn.dataset.speed || "1", 10);
		if (btnSpeed === speedMultiplier) {
			btn.classList.add("selected");
		} else {
			btn.classList.remove("selected");
		}
	});
}
initSpeedSelection();

function updateHighScore(score: number): boolean {
	if (score > highScore) {
		highScore = score;
		localStorage.setItem("artHeistHighScore", highScore.toString());
		bestScoreEl.textContent = highScore.toString();
		return true;
	}
	return false;
}

// Game state
const gameState: GameState = {
	playerX: 0,
	playerY: 0,
	path: [],
	guards: [],
	artworks: [],
	powerUps: [],
	lasers: [],
	goingUp: false,
	gameOver: false,
	gameStarted: false,
	level: 1,
	score: 0,
	speed: CONFIG.player.baseSpeed,
	baseSpeed: CONFIG.player.baseSpeed,
	artworksLoaded: false,
	currentStyle: null,
	usedStyles: [],
	stolenArtworks: [],
	combo: 0,
	comboTimer: 0,
	lastCollectTime: 0,
	timeScale: 1,
	slowMoTimer: 0,
	isInvisible: false,
	invisibleTimer: 0,
	hasMagnet: false,
	magnetTimer: 0,
	nearMissTimer: 0,
	levelTransition: false,
	levelTransitionTimer: 0,
	dangerLevel: 0,
};

// Store artworks grouped by style
let artworksByStyle: Record<string, ArtworkData[]> = {};
let availableStyles: string[] = [];
const artworkImages: Record<number, HTMLImageElement> = {};

// Floating text system
let floatingTexts: FloatingText[] = [];

function spawnFloatingText(
	x: number,
	y: number,
	text: string,
	color = "#ffd700",
): void {
	floatingTexts.push({
		x,
		y,
		text,
		color,
		life: 1.0,
		vy: -2,
	});
}

// Audio context for sound effects
let audioCtx: AudioContext | null = null;
let musicPlaying = false;
let heartbeatInterval: { lastBeat?: number } | null = null;

function initAudio(): void {
	if (!audioCtx) {
		audioCtx = new (
			window.AudioContext ||
			(window as unknown as { webkitAudioContext: typeof AudioContext })
				.webkitAudioContext
		)();
	}
}

// Background music using Web Audio API - Synthwave style
function startBackgroundMusic(): void {
	if (!audioCtx || musicPlaying) return;
	musicPlaying = true;

	function playNote(
		freq: number,
		startTime: number,
		duration: number,
		type: OscillatorType = "sine",
		volume = 0.05,
		detune = 0,
	): void {
		if (!audioCtx) return;
		const osc = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		const filter = audioCtx.createBiquadFilter();

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(audioCtx.destination);

		osc.type = type;
		osc.frequency.setValueAtTime(freq, startTime);
		osc.detune.setValueAtTime(detune, startTime);

		// Synthwave low-pass filter sweep
		filter.type = "lowpass";
		filter.frequency.setValueAtTime(800, startTime);
		filter.frequency.linearRampToValueAtTime(2000, startTime + duration * 0.3);
		filter.frequency.linearRampToValueAtTime(400, startTime + duration);
		filter.Q.setValueAtTime(5, startTime);

		gain.gain.setValueAtTime(0, startTime);
		gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
		gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
		osc.start(startTime);
		osc.stop(startTime + duration);
	}

	// Arpeggiator function for that classic synthwave sound
	function playArpeggio(
		notes: number[],
		startTime: number,
		noteLength: number,
	): void {
		notes.forEach((note, i) => {
			playNote(
				note,
				startTime + i * noteLength,
				noteLength * 0.8,
				"sawtooth",
				0.04,
				5,
			);
			// Add slight detuned layer for thickness
			playNote(
				note,
				startTime + i * noteLength,
				noteLength * 0.8,
				"sawtooth",
				0.02,
				-5,
			);
		});
	}

	function playMusicLoop(): void {
		if (!musicPlaying || !audioCtx) return;
		const now = audioCtx.currentTime;
		const bpm = CONFIG.audio.musicBPM;
		const beatDuration = 60 / bpm;

		// Deep synth bass with slight portamento feel
		const bassNotes = [55, 55, 73.42, 65.41]; // A1, A1, D2, C2
		bassNotes.forEach((note, i) => {
			playNote(
				note,
				now + i * beatDuration,
				beatDuration * 0.9,
				"sawtooth",
				CONFIG.audio.bassVolume,
				0,
			);
			// Sub bass layer
			playNote(
				note / 2,
				now + i * beatDuration,
				beatDuration * 0.9,
				"sine",
				0.06,
				0,
			);
		});

		// Synthwave arpeggio pattern
		const arpNotes = [220, 277.18, 329.63, 440, 329.63, 277.18]; // Am arpeggio
		playArpeggio(arpNotes, now, beatDuration / 3);

		// High synth stabs
		if (Math.random() > 0.5) {
			playNote(
				880,
				now + beatDuration * 2,
				beatDuration * 0.2,
				"square",
				CONFIG.audio.highVolume,
				10,
			);
		}

		setTimeout(playMusicLoop, beatDuration * 4 * 1000);
	}

	playMusicLoop();
}

function playHeartbeat(intensity: number): void {
	if (!audioCtx) return;
	const now = audioCtx.currentTime;
	const volume = 0.1 + intensity * 0.2; // Heartbeat volume scales with danger

	const lub = audioCtx.createOscillator();
	const lubGain = audioCtx.createGain();
	lub.connect(lubGain);
	lubGain.connect(audioCtx.destination);
	lub.type = "sine";
	lub.frequency.setValueAtTime(60, now);
	lub.frequency.exponentialRampToValueAtTime(40, now + 0.1);
	lubGain.gain.setValueAtTime(volume, now);
	lubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
	lub.start(now);
	lub.stop(now + 0.15);

	const dub = audioCtx.createOscillator();
	const dubGain = audioCtx.createGain();
	dub.connect(dubGain);
	dubGain.connect(audioCtx.destination);
	dub.type = "sine";
	dub.frequency.setValueAtTime(50, now + 0.2);
	dub.frequency.exponentialRampToValueAtTime(35, now + 0.3);
	dubGain.gain.setValueAtTime(volume * 0.7, now + 0.2);
	dubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
	dub.start(now + 0.2);
	dub.stop(now + 0.35);
}

function updateHeartbeat(): void {
	if (gameState.dangerLevel > 0.3 && !gameState.gameOver) {
		const interval = Math.max(300, 800 - gameState.dangerLevel * 500);
		if (
			!heartbeatInterval ||
			Date.now() - (heartbeatInterval.lastBeat || 0) > interval
		) {
			playHeartbeat(gameState.dangerLevel);
			if (!heartbeatInterval) heartbeatInterval = {};
			heartbeatInterval.lastBeat = Date.now();
		}
	}
}

function playCollectSound(comboMultiplier = 1): void {
	if (!audioCtx) return;

	const now = audioCtx.currentTime;
	const pitchMultiplier = 1 + (comboMultiplier - 1) * 0.15;

	// Futuristic "data acquired" sweep
	const sweep = audioCtx.createOscillator();
	const sweepGain = audioCtx.createGain();
	const sweepFilter = audioCtx.createBiquadFilter();

	sweep.connect(sweepFilter);
	sweepFilter.connect(sweepGain);
	sweepGain.connect(audioCtx.destination);

	sweep.type = "sawtooth";
	sweep.frequency.setValueAtTime(200 * pitchMultiplier, now);
	sweep.frequency.exponentialRampToValueAtTime(
		1200 * pitchMultiplier,
		now + 0.08,
	);
	sweep.frequency.exponentialRampToValueAtTime(
		800 * pitchMultiplier,
		now + 0.15,
	);

	sweepFilter.type = "bandpass";
	sweepFilter.frequency.setValueAtTime(1000, now);
	sweepFilter.Q.setValueAtTime(2, now);

	sweepGain.gain.setValueAtTime(0, now);
	sweepGain.gain.linearRampToValueAtTime(
		CONFIG.audio.collectVolume,
		now + 0.02,
	);
	sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

	sweep.start(now);
	sweep.stop(now + 0.2);

	// Digital blip confirmation
	const blip = audioCtx.createOscillator();
	const blipGain = audioCtx.createGain();
	blip.connect(blipGain);
	blipGain.connect(audioCtx.destination);
	blip.type = "square";
	blip.frequency.setValueAtTime(880 * pitchMultiplier, now + 0.05);
	blipGain.gain.setValueAtTime(0, now + 0.05);
	blipGain.gain.linearRampToValueAtTime(0.08, now + 0.06);
	blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
	blip.start(now + 0.05);
	blip.stop(now + 0.12);

	// Combo bonus sparkle effect
	if (comboMultiplier > 1 && audioCtx) {
		for (let i = 0; i < Math.min(comboMultiplier, 4); i++) {
			const sparkle = audioCtx.createOscillator();
			const sparkleGain = audioCtx.createGain();
			sparkle.connect(sparkleGain);
			sparkleGain.connect(audioCtx.destination);
			sparkle.type = "sine";
			sparkle.frequency.setValueAtTime(1500 + i * 200, now + 0.1 + i * 0.03);
			sparkleGain.gain.setValueAtTime(0, now + 0.1 + i * 0.03);
			sparkleGain.gain.linearRampToValueAtTime(0.06, now + 0.12 + i * 0.03);
			sparkleGain.gain.exponentialRampToValueAtTime(
				0.001,
				now + 0.25 + i * 0.03,
			);
			sparkle.start(now + 0.1 + i * 0.03);
			sparkle.stop(now + 0.25 + i * 0.03);
		}
	}
}

function playPowerUpSound(): void {
	if (!audioCtx) return;
	const now = audioCtx.currentTime;

	// Futuristic power-up charge sound
	const charge = audioCtx.createOscillator();
	const chargeGain = audioCtx.createGain();
	const chargeFilter = audioCtx.createBiquadFilter();

	charge.connect(chargeFilter);
	chargeFilter.connect(chargeGain);
	chargeGain.connect(audioCtx.destination);

	charge.type = "sawtooth";
	charge.frequency.setValueAtTime(100, now);
	charge.frequency.exponentialRampToValueAtTime(2000, now + 0.3);

	chargeFilter.type = "lowpass";
	chargeFilter.frequency.setValueAtTime(500, now);
	chargeFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);
	chargeFilter.Q.setValueAtTime(10, now);

	chargeGain.gain.setValueAtTime(0, now);
	chargeGain.gain.linearRampToValueAtTime(0.12, now + 0.1);
	chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

	charge.start(now);
	charge.stop(now + 0.35);

	// Confirmation burst
	const burst = audioCtx.createOscillator();
	const burstGain = audioCtx.createGain();
	burst.connect(burstGain);
	burstGain.connect(audioCtx.destination);
	burst.type = "sine";
	burst.frequency.setValueAtTime(1200, now + 0.25);
	burst.frequency.setValueAtTime(1600, now + 0.28);
	burstGain.gain.setValueAtTime(0, now + 0.25);
	burstGain.gain.linearRampToValueAtTime(0.15, now + 0.27);
	burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
	burst.start(now + 0.25);
	burst.stop(now + 0.4);
}

function playNearMissSound(): void {
	if (!audioCtx) return;
	const now = audioCtx.currentTime;

	// Warning siren sweep
	const siren = audioCtx.createOscillator();
	const sirenGain = audioCtx.createGain();
	const sirenFilter = audioCtx.createBiquadFilter();

	siren.connect(sirenFilter);
	sirenFilter.connect(sirenGain);
	sirenGain.connect(audioCtx.destination);

	siren.type = "sawtooth";
	siren.frequency.setValueAtTime(400, now);
	siren.frequency.linearRampToValueAtTime(1200, now + 0.08);
	siren.frequency.linearRampToValueAtTime(300, now + 0.18);

	sirenFilter.type = "bandpass";
	sirenFilter.frequency.setValueAtTime(800, now);
	sirenFilter.Q.setValueAtTime(3, now);

	sirenGain.gain.setValueAtTime(0, now);
	sirenGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
	sirenGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

	siren.start(now);
	siren.stop(now + 0.2);

	// Digital glitch noise
	const noise = audioCtx.createOscillator();
	const noiseGain = audioCtx.createGain();
	noise.connect(noiseGain);
	noiseGain.connect(audioCtx.destination);
	noise.type = "square";
	noise.frequency.setValueAtTime(60, now + 0.05);
	noiseGain.gain.setValueAtTime(0.08, now + 0.05);
	noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
	noise.start(now + 0.05);
	noise.stop(now + 0.1);
}

function playLevelCompleteSound(): void {
	if (!audioCtx) return;
	const now = audioCtx.currentTime;

	// Triumphant synth fanfare
	const notes = [440, 554.37, 659.25, 880]; // A4 C#5 E5 A5
	notes.forEach((freq, i) => {
		if (!audioCtx) return;
		const osc = audioCtx.createOscillator();
		const osc2 = audioCtx.createOscillator();
		const gain = audioCtx.createGain();
		const filter = audioCtx.createBiquadFilter();

		osc.connect(filter);
		osc2.connect(filter);
		filter.connect(gain);
		gain.connect(audioCtx.destination);

		osc.type = "sawtooth";
		osc2.type = "sawtooth";
		osc.frequency.setValueAtTime(freq, now + i * 0.12);
		osc2.frequency.setValueAtTime(freq * 1.005, now + i * 0.12); // Slight detune

		filter.type = "lowpass";
		filter.frequency.setValueAtTime(2000, now + i * 0.12);
		filter.Q.setValueAtTime(2, now + i * 0.12);

		gain.gain.setValueAtTime(0, now + i * 0.12);
		gain.gain.linearRampToValueAtTime(0.1, now + i * 0.12 + 0.02);
		gain.gain.setValueAtTime(0.1, now + i * 0.12 + 0.15);
		gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

		osc.start(now + i * 0.12);
		osc2.start(now + i * 0.12);
		osc.stop(now + i * 0.12 + 0.4);
		osc2.stop(now + i * 0.12 + 0.4);
	});

	// Success chime
	const chime = audioCtx.createOscillator();
	const chimeGain = audioCtx.createGain();
	chime.connect(chimeGain);
	chimeGain.connect(audioCtx.destination);
	chime.type = "sine";
	chime.frequency.setValueAtTime(1760, now + 0.5);
	chimeGain.gain.setValueAtTime(0, now + 0.5);
	chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.52);
	chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
	chime.start(now + 0.5);
	chime.stop(now + 0.8);
}

function playCaughtSound(): void {
	if (!audioCtx) return;

	const now = audioCtx.currentTime;

	// System failure alarm
	const alarm = audioCtx.createOscillator();
	const alarmGain = audioCtx.createGain();
	const alarmFilter = audioCtx.createBiquadFilter();

	alarm.connect(alarmFilter);
	alarmFilter.connect(alarmGain);
	alarmGain.connect(audioCtx.destination);

	alarm.type = "sawtooth";
	alarm.frequency.setValueAtTime(600, now);
	alarm.frequency.linearRampToValueAtTime(200, now + 0.15);
	alarm.frequency.linearRampToValueAtTime(500, now + 0.3);
	alarm.frequency.linearRampToValueAtTime(100, now + 0.5);

	alarmFilter.type = "lowpass";
	alarmFilter.frequency.setValueAtTime(3000, now);
	alarmFilter.frequency.exponentialRampToValueAtTime(300, now + 0.5);

	alarmGain.gain.setValueAtTime(0, now);
	alarmGain.gain.linearRampToValueAtTime(0.2, now + 0.02);
	alarmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

	alarm.start(now);
	alarm.stop(now + 0.5);

	// Digital distortion burst
	const distort = audioCtx.createOscillator();
	const distortGain = audioCtx.createGain();
	distort.connect(distortGain);
	distortGain.connect(audioCtx.destination);
	distort.type = "square";
	distort.frequency.setValueAtTime(80, now);
	distort.frequency.setValueAtTime(120, now + 0.1);
	distort.frequency.setValueAtTime(60, now + 0.2);
	distortGain.gain.setValueAtTime(0.15, now);
	distortGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
	distort.start(now);
	distort.stop(now + 0.4);

	// Heavy bass impact
	const impact = audioCtx.createOscillator();
	const impactGain = audioCtx.createGain();
	impact.connect(impactGain);
	impactGain.connect(audioCtx.destination);
	impact.type = "sine";
	impact.frequency.setValueAtTime(60, now);
	impact.frequency.exponentialRampToValueAtTime(20, now + 0.3);
	impactGain.gain.setValueAtTime(0.35, now);
	impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
	impact.start(now);
	impact.stop(now + 0.35);
}

// Screen effects
let screenShake = { intensity: 0, duration: 0 };
let screenFlash: { color: string | null; alpha: number } = {
	color: null,
	alpha: 0,
};
let screenZoom = { scale: 1, target: 1 };
const vignette = { intensity: 0.3 };

// Particle system
let particles: Particle[] = [];
let speedLines: SpeedLine[] = [];

function triggerCaughtEffect(x: number, y: number): void {
	screenShake.intensity = 15;
	screenShake.duration = 40;

	screenFlash.color = "#e94560";
	screenFlash.alpha = 0.7;

	const colors = ["#e94560", "#ff6b6b", "#ffffff", "#ffd700"];
	for (let i = 0; i < 40; i++) {
		const angle = Math.random() * Math.PI * 2;
		const speed = 3 + Math.random() * 8;
		particles.push({
			x: x,
			y: y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1.0,
			decay: 0.012 + Math.random() * 0.01,
			size: 4 + Math.random() * 8,
			color: colors[Math.floor(Math.random() * colors.length)],
			type: Math.random() > 0.3 ? "circle" : "star",
		});
	}

	for (let i = 0; i < 4; i++) {
		particles.push({
			x: x,
			y: y,
			vx: 0,
			vy: 0,
			life: 1.0,
			decay: 0.02 + i * 0.008,
			size: GUARD_SIZE / 2,
			maxSize: GUARD_SIZE * 4,
			color: i === 0 ? "#e94560" : i === 1 ? "#ff6b6b" : "#ffffff",
			type: "ring",
		});
	}
}

function triggerLevelComplete(): void {
	gameState.levelTransition = true;
	gameState.levelTransitionTimer = 60;
	screenZoom.target = 1.1;
	screenFlash.color = "#ffd700";
	screenFlash.alpha = 0.4;
	playLevelCompleteSound();
	announce(
		`Level ${gameState.level} complete! Advancing to level ${gameState.level + 1}`,
	);

	for (let i = 0; i < 30; i++) {
		particles.push({
			x: Math.random() * canvas.width,
			y: canvas.height + 20,
			vx: (Math.random() - 0.5) * 4,
			vy: -8 - Math.random() * 6,
			life: 1.0,
			decay: 0.01 + Math.random() * 0.01,
			size: 3 + Math.random() * 5,
			color: ["#ffd700", "#e94560", "#4ade80", "#60a5fa"][
				Math.floor(Math.random() * 4)
			],
			type: "star",
		});
	}
}

function updateScreenEffects(): void {
	if (screenShake.duration > 0) {
		screenShake.duration--;
		screenShake.intensity *= 0.92;
	}

	if (screenFlash.alpha > 0) {
		screenFlash.alpha *= 0.9;
		if (screenFlash.alpha < 0.01) screenFlash.alpha = 0;
	}

	screenZoom.scale += (screenZoom.target - screenZoom.scale) * 0.1;
	if (Math.abs(screenZoom.scale - screenZoom.target) < 0.001) {
		screenZoom.scale = screenZoom.target;
	}

	vignette.intensity = 0.3 + gameState.dangerLevel * 0.4;
}

function applyScreenShake(): void {
	if (screenShake.duration > 0) {
		const offsetX = (Math.random() - 0.5) * screenShake.intensity * 2;
		const offsetY = (Math.random() - 0.5) * screenShake.intensity * 2;
		ctx.translate(offsetX, offsetY);
	}
}

function drawScreenFlash(): void {
	if (screenFlash.alpha > 0 && screenFlash.color) {
		ctx.fillStyle = screenFlash.color;
		ctx.globalAlpha = screenFlash.alpha;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;
	}
}

function drawVignette(): void {
	const gradient = ctx.createRadialGradient(
		canvas.width / 2,
		canvas.height / 2,
		canvas.height * 0.3,
		canvas.width / 2,
		canvas.height / 2,
		canvas.height * 0.9,
	);
	gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
	gradient.addColorStop(1, `rgba(0, 0, 0, ${vignette.intensity})`);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateSpeedLines(): void {
	if (!gameState.gameOver && gameState.speed > 2) {
		if (Math.random() < 0.3) {
			speedLines.push({
				x: gameState.playerX - 10,
				y: gameState.playerY + (Math.random() - 0.5) * 20,
				length: 20 + Math.random() * 30,
				life: 1.0,
				decay: 0.08,
			});
		}
	}

	for (let i = speedLines.length - 1; i >= 0; i--) {
		const line = speedLines[i];
		line.x -= 8;
		line.life -= line.decay;
		if (line.life <= 0 || line.x + line.length < 0) {
			speedLines.splice(i, 1);
		}
	}
}

function drawSpeedLines(): void {
	ctx.strokeStyle = "#e94560";
	for (const line of speedLines) {
		ctx.globalAlpha = line.life * 0.5;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(line.x, line.y);
		ctx.lineTo(line.x + line.length, line.y);
		ctx.stroke();
	}
	ctx.globalAlpha = 1;
}

function spawnCollectParticles(x: number, y: number): void {
	const colors = ["#ffd700", "#ffec8b", "#fff8dc", "#e94560", "#ffffff"];
	const particleCount = 25 + gameState.combo * 5;

	for (let i = 0; i < particleCount; i++) {
		const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
		const speed = 2 + Math.random() * 5 + gameState.combo;
		particles.push({
			x: x,
			y: y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life: 1.0,
			decay: 0.02 + Math.random() * 0.02,
			size: 3 + Math.random() * 4,
			color: colors[Math.floor(Math.random() * colors.length)],
			type: Math.random() > 0.5 ? "circle" : "star",
		});
	}

	const ringCount = 1 + Math.min(gameState.combo, 3);
	for (let r = 0; r < ringCount; r++) {
		particles.push({
			x: x,
			y: y,
			vx: 0,
			vy: 0,
			life: 1.0,
			decay: 0.03 + r * 0.01,
			size: ARTWORK_SIZE / 2,
			maxSize: ARTWORK_SIZE * (1.5 + r * 0.5),
			color: r === 0 ? "#ffd700" : "#ffffff",
			type: "ring",
		});
	}
}

function updateParticles(): void {
	for (let i = particles.length - 1; i >= 0; i--) {
		const p = particles[i];
		p.life -= p.decay;

		if (p.type === "ring" && p.maxSize) {
			p.size += (p.maxSize - ARTWORK_SIZE / 2) * p.decay * 2;
		} else {
			p.x += p.vx;
			p.y += p.vy;
			p.vy += 0.1;
			p.vx *= 0.98;
		}

		if (p.life <= 0) {
			particles.splice(i, 1);
		}
	}

	for (let i = floatingTexts.length - 1; i >= 0; i--) {
		const t = floatingTexts[i];
		t.y += t.vy;
		t.life -= 0.02;
		if (t.life <= 0) {
			floatingTexts.splice(i, 1);
		}
	}
}

function drawStar(x: number, y: number, size: number, color: string): void {
	ctx.fillStyle = color;
	ctx.beginPath();
	for (let i = 0; i < 5; i++) {
		const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
		const innerAngle = angle + Math.PI / 5;
		if (i === 0) {
			ctx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
		} else {
			ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
		}
		ctx.lineTo(
			x + Math.cos(innerAngle) * size * 0.4,
			y + Math.sin(innerAngle) * size * 0.4,
		);
	}
	ctx.closePath();
	ctx.fill();
}

function drawParticles(): void {
	for (const p of particles) {
		ctx.globalAlpha = p.life;

		if (p.type === "ring") {
			ctx.strokeStyle = p.color;
			ctx.lineWidth = 3 * p.life;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.stroke();
		} else if (p.type === "star") {
			drawStar(p.x, p.y, p.size, p.color);
		} else {
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	ctx.globalAlpha = 1;

	ctx.font = "bold 18px Courier New";
	ctx.textAlign = "center";
	for (const t of floatingTexts) {
		ctx.globalAlpha = t.life;
		ctx.fillStyle = t.color;
		ctx.fillText(t.text, t.x, t.y);
	}
	ctx.globalAlpha = 1;
}

// Toast notification system
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function showToast(artworkData: ArtworkData, points: number): void {
	if (toastTimeout) clearTimeout(toastTimeout);

	const titleEl = toastEl.querySelector(".toast-title")!;
	const artistEl = toastEl.querySelector(".toast-artist")!;
	const detailsEl = toastEl.querySelector(".toast-details")!;
	const pointsEl = toastEl.querySelector(".toast-points")!;

	titleEl.textContent = artworkData.title || "Untitled";
	artistEl.textContent = artworkData.artist;

	const details: string[] = [];
	if (artworkData.date) details.push(artworkData.date);
	if (artworkData.origin) details.push(artworkData.origin);
	if (artworkData.medium) details.push(artworkData.medium);
	detailsEl.textContent = details.join(" · ");
	if (artworkData.style) {
		detailsEl.textContent += (details.length ? " · " : "") + artworkData.style;
	}

	pointsEl.textContent = `+${points} points${gameState.combo > 1 ? ` (${gameState.combo}x combo!)` : ""}`;

	toastEl.classList.add("show");

	toastTimeout = setTimeout(() => {
		toastEl.classList.remove("show");
	}, 2500);
}

// Fetch artworks from Art Institute of Chicago API
async function fetchArtworks(): Promise<void> {
	try {
		const randomPage = Math.floor(Math.random() * 10) + 1;
		const response = await fetch(
			`https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&fields=id,title,image_id,artist_display,date_display,medium_display,place_of_origin,style_title&limit=100&page=${randomPage}`,
		);
		const data = await response.json();

		artworksByStyle = {};
		for (const art of data.data) {
			if (!art.image_id || !art.style_title) continue;

			const style = art.style_title;
			if (!artworksByStyle[style]) {
				artworksByStyle[style] = [];
			}

			const isLocalDev =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1";
			const imageUrl = isLocalDev
				? `/iiif/2/${art.image_id}/full/80,/0/default.jpg`
				: `https://www.artic.edu/iiif/2/${art.image_id}/full/80,/0/default.jpg`;

			artworksByStyle[style].push({
				id: art.id,
				title: art.title,
				artist: art.artist_display || "Unknown artist",
				date: art.date_display || "Date unknown",
				medium: art.medium_display || "",
				origin: art.place_of_origin || "",
				style: style,
				imageUrl: imageUrl,
			});
		}

		availableStyles = Object.keys(artworksByStyle).filter(
			(style) => artworksByStyle[style].length >= MIN_ARTWORKS_PER_STYLE,
		);

		console.log(
			`Loaded ${availableStyles.length} art styles:`,
			availableStyles,
		);
		gameState.artworksLoaded = true;
	} catch (error) {
		console.error("Failed to fetch artworks:", error);
		gameState.artworksLoaded = true;
	}
}

function loadArtworkImage(
	artwork: ArtworkData,
): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		if (artworkImages[artwork.id]) {
			resolve(artworkImages[artwork.id]);
			return;
		}
		const img = new Image();
		const isLocalDev =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1";
		if (isLocalDev) {
			img.crossOrigin = "anonymous";
		}
		img.onload = () => {
			artworkImages[artwork.id] = img;
			resolve(img);
		};
		img.onerror = () => {
			resolve(null);
		};
		img.src = artwork.imageUrl;
	});
}

function pickNewStyle(): void {
	const unusedStyles = availableStyles.filter(
		(s) => !gameState.usedStyles.includes(s),
	);

	if (unusedStyles.length === 0) {
		gameState.usedStyles = [];
		unusedStyles.push(...availableStyles);
	}

	if (unusedStyles.length > 0) {
		const randomIndex = Math.floor(Math.random() * unusedStyles.length);
		gameState.currentStyle = unusedStyles[randomIndex];
		gameState.usedStyles.push(gameState.currentStyle);
	} else {
		gameState.currentStyle = null;
	}
}

function isOverlappingGuard(newGuard: {
	x?: number;
	y?: number;
	baseX?: number;
	baseY?: number;
}): boolean {
	for (const guard of gameState.guards) {
		const gx = guard.baseX || guard.x;
		const gy = guard.baseY || guard.y;
		const nx = newGuard.baseX || newGuard.x || 0;
		const ny = newGuard.baseY || newGuard.y || 0;
		const dx = nx - gx;
		const dy = ny - gy;
		if (Math.sqrt(dx * dx + dy * dy) < GUARD_SIZE * 3) {
			return true;
		}
	}
	return false;
}

function isOverlappingArtwork(newArtwork: { x: number; y: number }): boolean {
	for (const art of gameState.artworks) {
		const dx = newArtwork.x - art.x;
		const dy = newArtwork.y - art.y;
		if (Math.sqrt(dx * dx + dy * dy) < ARTWORK_SIZE * 1.5) {
			return true;
		}
	}
	for (const guard of gameState.guards) {
		const gx = guard.baseX || guard.x;
		const gy = guard.baseY || guard.y;
		const dx = newArtwork.x - gx;
		const dy = newArtwork.y - gy;
		const guardRadius = Math.max(guard.radiusX || 0, guard.radiusY || 0);
		if (
			Math.sqrt(dx * dx + dy * dy) <
			ARTWORK_SIZE + GUARD_SIZE + guardRadius
		) {
			return true;
		}
	}
	return false;
}

function isOverlappingAnything(obj: { x: number; y: number }): boolean {
	for (const guard of gameState.guards) {
		const dx = obj.x - (guard.baseX || guard.x);
		const dy = obj.y - (guard.baseY || guard.y);
		if (Math.sqrt(dx * dx + dy * dy) < GUARD_SIZE * 2) return true;
	}
	for (const art of gameState.artworks) {
		const dx = obj.x - art.x;
		const dy = obj.y - art.y;
		if (Math.sqrt(dx * dx + dy * dy) < ARTWORK_SIZE * 1.5) return true;
	}
	return false;
}

function spawnGuards(count: number): void {
	gameState.guards = [];
	const margin = 50;
	const minX = 100;

	for (let i = 0; i < count; i++) {
		let guard: Guard;
		let attempts = 0;

		let guardType: "normal" | "fast" | "stationary" = "normal";
		if (gameState.level >= 3 && Math.random() < 0.2) {
			guardType = "fast";
		}
		if (gameState.level >= 5 && Math.random() < 0.15) {
			guardType = "stationary";
		}

		const typeData = GUARD_TYPES[guardType];

		do {
			guard = {
				baseX: minX + Math.random() * (canvas.width - minX - margin),
				baseY: margin + Math.random() * (canvas.height - margin * 2),
				x: 0,
				y: 0,
				phase: Math.random() * Math.PI * 2,
				speedX: (0.3 + Math.random() * 0.4) * typeData.speed,
				speedY: (0.3 + Math.random() * 0.4) * typeData.speed,
				radiusX: 15 + Math.random() * 20,
				radiusY: 10 + Math.random() * 15,
				type: guardType,
				alertLevel: 0,
				spotlightAngle: Math.random() * Math.PI * 2,
			};
			guard.x = guard.baseX;
			guard.y = guard.baseY;
			attempts++;
		} while (attempts < 50 && isOverlappingGuard(guard));

		gameState.guards.push(guard);
	}
}

function spawnArtworks(count: number): void {
	gameState.artworks = [];
	const margin = 50;
	const minX = 80;

	const styleArtworks = gameState.currentStyle
		? artworksByStyle[gameState.currentStyle] || []
		: [];

	const shuffled = [...styleArtworks].sort(() => Math.random() - 0.5);

	for (let i = 0; i < count; i++) {
		let artwork: Artwork;
		let attempts = 0;

		do {
			artwork = {
				x: minX + Math.random() * (canvas.width - minX - margin),
				y: margin + Math.random() * (canvas.height - margin * 2),
				collected: false,
				glowPhase: Math.random() * Math.PI * 2,
			};
			attempts++;
		} while (
			attempts < 50 &&
			(isOverlappingGuard(artwork) || isOverlappingArtwork(artwork))
		);

		if (shuffled.length > 0) {
			const artData = shuffled[i % shuffled.length];
			artwork.data = artData;
			loadArtworkImage(artData);
		}

		gameState.artworks.push(artwork);
	}
}

function spawnPowerUps(): void {
	gameState.powerUps = [];
	if (gameState.level < 2) return;

	const powerUpTypes: Array<"speed" | "invisible" | "magnet"> = [
		"speed",
		"invisible",
		"magnet",
	];
	const count = Math.min(2, Math.floor(gameState.level / 2));

	for (let i = 0; i < count; i++) {
		let attempts = 0;
		let powerUp: PowerUp;
		do {
			powerUp = {
				x: 150 + Math.random() * (canvas.width - 200),
				y: 50 + Math.random() * (canvas.height - 100),
				type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
				collected: false,
				bobPhase: Math.random() * Math.PI * 2,
			};
			attempts++;
		} while (attempts < 30 && isOverlappingAnything(powerUp));

		gameState.powerUps.push(powerUp);
	}
}

function spawnLasers(): void {
	gameState.lasers = [];
	if (gameState.level < 4) return;

	const count = Math.min(3, Math.floor((gameState.level - 3) / 2));

	for (let i = 0; i < count; i++) {
		const isHorizontal = Math.random() > 0.5;
		gameState.lasers.push({
			x: 200 + Math.random() * (canvas.width - 400),
			y: 100 + Math.random() * (canvas.height - 200),
			isHorizontal: isHorizontal,
			length: 80 + Math.random() * 60,
			phase: Math.random() * Math.PI * 2,
			speed: 0.02 + Math.random() * 0.02,
		});
	}
}

function updateUI(): void {
	levelEl.textContent = gameState.level.toString();
	scoreEl.textContent = gameState.score.toString();
	themeEl.textContent = gameState.currentStyle || "Mixed";
}

function escapeHtml(str: string): string {
	return str
		? str
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
		: "";
}

function showFinishScreen(): void {
	document.getElementById("finish-level")!.textContent =
		gameState.level.toString();
	document.getElementById("finish-count")!.textContent =
		gameState.stolenArtworks.length.toString();
	document.getElementById("finish-score")!.textContent =
		gameState.score.toString();

	const isNewHighScore = updateHighScore(gameState.score);
	document.getElementById("new-high-score")!.style.display = isNewHighScore
		? "block"
		: "none";

	const lootGrid = document.getElementById("loot-grid")!;
	lootGrid.innerHTML = "";

	if (gameState.stolenArtworks.length === 0) {
		lootGrid.innerHTML =
			'<div class="no-loot">No artworks stolen... maybe next time!</div>';
	} else {
		for (const art of gameState.stolenArtworks) {
			const item = document.createElement("div");
			item.className = "loot-item";
			item.setAttribute("role", "listitem");

			const img = artworkImages[art.id];
			const artUrl = `https://www.artic.edu/artworks/${art.id}`;
			const altText = `${art.title || "Untitled"} by ${art.artist}`;

			let imageHtml: string;
			if (img) {
				imageHtml = `<img class="loot-image" src="${art.imageUrl}" alt="">`;
			} else {
				imageHtml = `<div class="loot-image-placeholder" aria-hidden="true">ART</div>`;
			}

			const details: string[] = [];
			if (art.date) details.push(art.date);
			if (art.origin) details.push(art.origin);
			if (art.medium) details.push(art.medium);

			item.innerHTML = `
        <a href="${artUrl}" target="_blank" rel="noopener noreferrer" class="loot-link" aria-label="${escapeHtml(altText)} - View on Art Institute of Chicago website">
          ${imageHtml}
          <div class="loot-info">
            <h3 class="loot-title">${escapeHtml(art.title) || "Untitled"}</h3>
            <p class="loot-artist">${escapeHtml(art.artist)}</p>
            <p class="loot-details">${escapeHtml(details.join(" · "))}</p>
            <p class="loot-style">${escapeHtml(art.style) || ""}</p>
          </div>
        </a>
      `;

			lootGrid.appendChild(item);
		}
	}

	finishScreenEl.classList.add("show");
	announce(
		`Game over. You reached level ${gameState.level} and scored ${gameState.score} points.${isNewHighScore ? " New high score!" : ""}`,
	);
}

function hideFinishScreen(): void {
	finishScreenEl.classList.remove("show");
}

function init(): void {
	gameState.playerX = 0;
	gameState.playerY = Math.random() * (canvas.height - 100) + 50;
	gameState.path = [{ x: gameState.playerX, y: gameState.playerY }];
	gameState.goingUp = false;
	gameState.gameOver = false;
	gameState.combo = 0;
	gameState.comboTimer = 0;
	gameState.timeScale = 1;
	gameState.slowMoTimer = 0;
	gameState.isInvisible = false;
	gameState.invisibleTimer = 0;
	gameState.hasMagnet = false;
	gameState.magnetTimer = 0;
	gameState.speed = gameState.baseSpeed;
	gameState.levelTransition = false;
	gameState.levelTransitionTimer = 0;
	screenZoom.target = 1;
	gameOverEl.classList.remove("show");
	hideFinishScreen();
	comboDisplayEl.classList.remove("active");

	pickNewStyle();

	spawnGuards(4 + gameState.level);
	spawnArtworks(3 + gameState.level);
	spawnPowerUps();
	spawnLasers();
	updateUI();
}

function updateGuards(): void {
	const time = Date.now() / 1000;
	let closestDistance = Infinity;
	// Guards get faster too, but not as much as player (sqrt scaling)
	const guardSpeedMult = Math.sqrt(speedMultiplier);

	for (const guard of gameState.guards) {
		const typeData = GUARD_TYPES[guard.type];

		const dx = gameState.playerX - guard.x;
		const dy = gameState.playerY - guard.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		closestDistance = Math.min(closestDistance, dist);

		const alertDist = 120;
		if (dist < alertDist && !gameState.isInvisible) {
			guard.alertLevel = Math.min(1, guard.alertLevel + 0.04);
		} else {
			guard.alertLevel = Math.max(0, guard.alertLevel - 0.015);
		}

		if (typeData.speed > 0) {
			const patrolX =
				guard.baseX +
				Math.sin(time * guard.speedX * guardSpeedMult + guard.phase) *
					guard.radiusX;
			const patrolY =
				guard.baseY +
				Math.cos(time * guard.speedY * guardSpeedMult + guard.phase) *
					guard.radiusY;

			if (guard.alertLevel > 0.3 && !gameState.isInvisible && dist > 0) {
				const chaseStrength = (guard.alertLevel - 0.3) * 1.5;
				const chaseSpeed = (0.4 + chaseStrength * 0.5) * guardSpeedMult;

				const chaseX = guard.x + (dx / dist) * chaseSpeed;
				const chaseY = guard.y + (dy / dist) * chaseSpeed;

				const blendFactor = Math.min(1, chaseStrength);
				guard.x = patrolX * (1 - blendFactor) + chaseX * blendFactor;
				guard.y = patrolY * (1 - blendFactor) + chaseY * blendFactor;
			} else {
				guard.x = patrolX;
				guard.y = patrolY;
			}
		} else {
			guard.x = guard.baseX;
			guard.y = guard.baseY;

			if (guard.alertLevel > 0.5 && !gameState.isInvisible) {
				const targetAngle = Math.atan2(dy, dx);
				let angleDiff = targetAngle - guard.spotlightAngle;
				while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
				while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
				guard.spotlightAngle +=
					angleDiff * 0.05 * guard.alertLevel * guardSpeedMult;
			} else {
				guard.spotlightAngle += 0.02 * guardSpeedMult;
			}
		}

		guard.x = Math.max(
			GUARD_SIZE,
			Math.min(canvas.width - GUARD_SIZE, guard.x),
		);
		guard.y = Math.max(
			GUARD_SIZE,
			Math.min(canvas.height - GUARD_SIZE, guard.y),
		);
	}

	gameState.dangerLevel = Math.max(0, 1 - closestDistance / 150);
}

function updateLasers(): void {
	for (const laser of gameState.lasers) {
		laser.phase += laser.speed * Math.sqrt(speedMultiplier);
	}
}

function applyPowerUp(type: "speed" | "invisible" | "magnet"): void {
	switch (type) {
		case "speed":
			gameState.speed = gameState.baseSpeed * 1.5;
			setTimeout(() => {
				gameState.speed = gameState.baseSpeed;
			}, 5000);
			spawnFloatingText(
				gameState.playerX,
				gameState.playerY - 30,
				"SPEED!",
				"#4ade80",
			);
			announce("Speed boost activated!");
			break;
		case "invisible":
			gameState.isInvisible = true;
			gameState.invisibleTimer = 180;
			spawnFloatingText(
				gameState.playerX,
				gameState.playerY - 30,
				"INVISIBLE!",
				"#60a5fa",
			);
			announce("Invisibility activated!");
			break;
		case "magnet":
			gameState.hasMagnet = true;
			gameState.magnetTimer = 300;
			spawnFloatingText(
				gameState.playerX,
				gameState.playerY - 30,
				"MAGNET!",
				"#f472b6",
			);
			announce("Art magnet activated!");
			break;
	}
}

function update(): void {
	updateParticles();
	updateScreenEffects();
	updateSpeedLines();

	if (gameState.levelTransition) {
		gameState.levelTransitionTimer--;
		if (gameState.levelTransitionTimer <= 0) {
			gameState.levelTransition = false;
			gameState.level++;
			gameState.score += 100;
			init();
		}
		return;
	}

	if (gameState.gameOver) return;

	if (gameState.slowMoTimer > 0) {
		gameState.slowMoTimer--;
		gameState.timeScale = 0.3;
	} else {
		gameState.timeScale = Math.min(1, gameState.timeScale + 0.05);
	}

	if (gameState.invisibleTimer > 0) {
		gameState.invisibleTimer--;
		if (gameState.invisibleTimer <= 0) gameState.isInvisible = false;
	}
	if (gameState.magnetTimer > 0) {
		gameState.magnetTimer--;
		if (gameState.magnetTimer <= 0) gameState.hasMagnet = false;
	}

	if (gameState.combo > 0) {
		const timeSinceCollect = Date.now() - gameState.lastCollectTime;
		if (timeSinceCollect > COMBO_WINDOW) {
			gameState.combo = 0;
			comboDisplayEl.classList.remove("active");
		}
	}

	updateGuards();
	updateLasers();
	updateHeartbeat();

	const effectiveSpeed =
		gameState.speed * gameState.timeScale * speedMultiplier;
	const angle = gameState.goingUp ? -Math.PI / 4 : Math.PI / 4;
	gameState.playerX += Math.cos(angle) * effectiveSpeed;
	gameState.playerY += Math.sin(angle) * effectiveSpeed;

	if (gameState.playerY < 0) {
		gameState.path.push({ x: gameState.playerX, y: 0 });
		gameState.playerY = canvas.height;
		gameState.path.push({
			x: gameState.playerX,
			y: canvas.height,
			newSegment: true,
		});
	} else if (gameState.playerY > canvas.height) {
		gameState.path.push({ x: gameState.playerX, y: canvas.height });
		gameState.playerY = 0;
		gameState.path.push({ x: gameState.playerX, y: 0, newSegment: true });
	}

	gameState.path.push({ x: gameState.playerX, y: gameState.playerY });

	if (gameState.hasMagnet) {
		for (const artwork of gameState.artworks) {
			if (artwork.collected) continue;
			const dx = gameState.playerX - artwork.x;
			const dy = gameState.playerY - artwork.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist < 150 && dist > 0) {
				artwork.x += (dx / dist) * 2;
				artwork.y += (dy / dist) * 2;
			}
		}
	}

	for (const powerUp of gameState.powerUps) {
		if (powerUp.collected) continue;
		const dx = gameState.playerX - powerUp.x;
		const dy = gameState.playerY - powerUp.y;
		if (Math.sqrt(dx * dx + dy * dy) < POWER_UP_SIZE + 5) {
			powerUp.collected = true;
			playPowerUpSound();
			applyPowerUp(powerUp.type);
			spawnCollectParticles(powerUp.x, powerUp.y);
		}
	}

	for (const artwork of gameState.artworks) {
		if (artwork.collected) continue;
		const halfSize = ARTWORK_SIZE / 2 + 8;
		const dx = Math.abs(gameState.playerX - artwork.x);
		const dy = Math.abs(gameState.playerY - artwork.y);
		if (dx < halfSize && dy < halfSize) {
			artwork.collected = true;

			gameState.combo++;
			gameState.lastCollectTime = Date.now();

			const comboMultiplier = Math.min(gameState.combo, 5);
			const points = 50 * comboMultiplier;
			gameState.score += points;

			if (gameState.combo > 1) {
				comboCountEl.textContent = gameState.combo.toString();
				comboDisplayEl.classList.add("active");
			}

			updateUI();
			spawnCollectParticles(artwork.x, artwork.y);
			spawnFloatingText(
				artwork.x,
				artwork.y - 30,
				`+${points}`,
				gameState.combo > 1 ? "#ff6b6b" : "#ffd700",
			);
			playCollectSound(comboMultiplier);

			if (artwork.data) {
				gameState.stolenArtworks.push(artwork.data);
				showToast(artwork.data, points);
				announce(
					`Collected ${artwork.data.title || "artwork"} for ${points} points`,
				);
			}
		}
	}

	if (!gameState.isInvisible) {
		for (const guard of gameState.guards) {
			const typeData = GUARD_TYPES[guard.type];
			const dx = gameState.playerX - guard.x;
			const dy = gameState.playerY - guard.y;
			const dist = Math.sqrt(dx * dx + dy * dy);

			if (typeData.hasSpotlight) {
				const angleToPlayer = Math.atan2(dy, dx);
				const angleDiff = Math.abs(angleToPlayer - guard.spotlightAngle);
				const normalizedAngleDiff = Math.min(
					angleDiff,
					Math.PI * 2 - angleDiff,
				);
				if (dist < 100 && normalizedAngleDiff < 0.5) {
					gameState.gameOver = true;
					triggerCaughtEffect(gameState.playerX, gameState.playerY);
					playCaughtSound();
					setTimeout(showFinishScreen, 800);
					return;
				}
			}

			if (dist < typeData.radius + 5) {
				gameState.gameOver = true;
				triggerCaughtEffect(gameState.playerX, gameState.playerY);
				playCaughtSound();
				setTimeout(showFinishScreen, 800);
				return;
			}

			if (dist < typeData.radius + 25 && dist >= typeData.radius + 5) {
				if (gameState.nearMissTimer <= 0) {
					gameState.nearMissTimer = 30;
					gameState.slowMoTimer = 15;
					playNearMissSound();
					spawnFloatingText(
						gameState.playerX,
						gameState.playerY - 20,
						"CLOSE!",
						"#ff6b6b",
					);
					screenShake.intensity = 3;
					screenShake.duration = 10;
				}
			}
		}
		if (gameState.nearMissTimer > 0) gameState.nearMissTimer--;
	}

	for (const laser of gameState.lasers) {
		const active = Math.sin(laser.phase) > 0;
		if (!active) continue;

		let hit = false;
		if (laser.isHorizontal) {
			if (
				Math.abs(gameState.playerY - laser.y) < 5 &&
				gameState.playerX > laser.x - laser.length / 2 &&
				gameState.playerX < laser.x + laser.length / 2
			) {
				hit = true;
			}
		} else {
			if (
				Math.abs(gameState.playerX - laser.x) < 5 &&
				gameState.playerY > laser.y - laser.length / 2 &&
				gameState.playerY < laser.y + laser.length / 2
			) {
				hit = true;
			}
		}

		if (hit && !gameState.isInvisible) {
			gameState.gameOver = true;
			triggerCaughtEffect(gameState.playerX, gameState.playerY);
			playCaughtSound();
			setTimeout(showFinishScreen, 800);
			return;
		}
	}

	if (gameState.playerX >= canvas.width) {
		triggerLevelComplete();
	}
}

// Parallax background layers
const bgLayers: BgLayer[] = [
	{ offset: 0, speed: 0.2, color: "rgba(0, 255, 255, 0.1)" },
	{ offset: 0, speed: 0.4, color: "rgba(255, 0, 255, 0.08)" },
	{ offset: 0, speed: 0.6, color: "rgba(0, 255, 255, 0.05)" },
];

function drawBackground(): void {
	// Dark base with gradient
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, "#050510");
	gradient.addColorStop(0.5, "#0a0a18");
	gradient.addColorStop(1, "#050510");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Animated neon grid
	for (const layer of bgLayers) {
		layer.offset -= layer.speed * speedMultiplier;
		if (layer.offset < -80) layer.offset = 0;
	}

	// Vertical lines (cyan)
	ctx.strokeStyle = "rgba(0, 255, 255, 0.15)";
	ctx.lineWidth = 1;
	for (let x = bgLayers[0].offset; x < canvas.width; x += 80) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
		ctx.stroke();
	}

	// Horizontal lines (magenta)
	ctx.strokeStyle = "rgba(255, 0, 255, 0.1)";
	for (let y = 0; y < canvas.height; y += 80) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
		ctx.stroke();
	}

	// Museum floor perspective effect
	ctx.strokeStyle = "rgba(0, 255, 255, 0.08)";
	for (let i = 0; i < 10; i++) {
		const y = canvas.height - 50 + i * 5;
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
		ctx.stroke();
	}

	// Architectural pillars (decorative)
	ctx.fillStyle = "rgba(0, 255, 255, 0.03)";
	for (let x = 100; x < canvas.width; x += 200) {
		ctx.fillRect(x - 10, 0, 20, canvas.height);
	}
}

// Draw cyber guard as geometric robot
function drawCyberGuard(
	x: number,
	y: number,
	type: "normal" | "fast" | "stationary",
	alertLevel: number,
	spotlightAngle: number,
): void {
	const size = GUARD_SIZE;

	// Spotlight for stationary guards
	if (type === "stationary") {
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
		gradient.addColorStop(0, `rgba(255, 255, 0, ${0.15 + alertLevel * 0.2})`);
		gradient.addColorStop(1, "transparent");
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, 100, spotlightAngle - 0.5, spotlightAngle + 0.5);
		ctx.closePath();
		ctx.fill();
	}

	// Alert indicator
	if (alertLevel > 0.3) {
		ctx.fillStyle = `rgba(255, 0, 0, ${alertLevel})`;
		ctx.shadowColor = "#ff0000";
		ctx.shadowBlur = 20;
		ctx.beginPath();
		ctx.arc(x, y - size - 5, 6 + alertLevel * 4, 0, Math.PI * 2);
		ctx.fill();

		if (alertLevel > 0.7) {
			ctx.fillStyle = "#fff";
			ctx.font = "bold 12px Courier New";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("!", x, y - size - 5);
		}
		ctx.shadowBlur = 0;
	}

	// Guard body color based on type
	const bodyColor =
		type === "fast" ? "#ff0066" : type === "stationary" ? "#ffff00" : "#00ffff";
	const glowColor =
		type === "fast"
			? "rgba(255, 0, 102, 0.8)"
			: type === "stationary"
				? "rgba(255, 255, 0, 0.8)"
				: "rgba(0, 255, 255, 0.8)";

	// Outer glow
	ctx.shadowColor = glowColor;
	ctx.shadowBlur = 15 + alertLevel * 10;

	// Hexagonal body
	ctx.fillStyle = bodyColor;
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = (i * Math.PI) / 3 - Math.PI / 6;
		const px = x + Math.cos(angle) * (size * 0.6);
		const py = y + Math.sin(angle) * (size * 0.6);
		if (i === 0) {
			ctx.moveTo(px, py);
		} else {
			ctx.lineTo(px, py);
		}
	}
	ctx.closePath();
	ctx.fill();

	// Inner dark core
	ctx.shadowBlur = 0;
	ctx.fillStyle = "#0a0a0f";
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = (i * Math.PI) / 3 - Math.PI / 6;
		const px = x + Math.cos(angle) * (size * 0.4);
		const py = y + Math.sin(angle) * (size * 0.4);
		if (i === 0) {
			ctx.moveTo(px, py);
		} else {
			ctx.lineTo(px, py);
		}
	}
	ctx.closePath();
	ctx.fill();

	// Scanning eye
	const eyePhase = Date.now() / 500;
	const eyeX = x + Math.cos(eyePhase) * 3;
	ctx.fillStyle = alertLevel > 0.5 ? "#ff0000" : bodyColor;
	ctx.shadowColor = alertLevel > 0.5 ? "#ff0000" : glowColor;
	ctx.shadowBlur = 10;
	ctx.beginPath();
	ctx.arc(eyeX, y, 4, 0, Math.PI * 2);
	ctx.fill();
	ctx.shadowBlur = 0;

	// Speed indicator for fast guards
	if (type === "fast") {
		ctx.strokeStyle = "#ff0066";
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(x - size, y);
		ctx.lineTo(x - size - 8, y - 4);
		ctx.moveTo(x - size, y);
		ctx.lineTo(x - size - 8, y + 4);
		ctx.stroke();
	}
}

function draw(): void {
	ctx.save();

	if (screenZoom.scale !== 1) {
		ctx.translate(canvas.width / 2, canvas.height / 2);
		ctx.scale(screenZoom.scale, screenZoom.scale);
		ctx.translate(-canvas.width / 2, -canvas.height / 2);
	}

	applyScreenShake();

	drawBackground();

	// Draw lasers
	for (const laser of gameState.lasers) {
		const active = Math.sin(laser.phase) > 0;
		const warning = Math.sin(laser.phase) > -0.3 && Math.sin(laser.phase) < 0;

		if (active) {
			ctx.strokeStyle = "#ff0000";
			ctx.lineWidth = 4;
			ctx.shadowColor = "#ff0000";
			ctx.shadowBlur = 15;
		} else if (warning) {
			ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
			ctx.lineWidth = 2;
			ctx.shadowBlur = 0;
		} else {
			ctx.strokeStyle = "rgba(255, 0, 0, 0.1)";
			ctx.lineWidth = 1;
			ctx.shadowBlur = 0;
		}

		ctx.beginPath();
		if (laser.isHorizontal) {
			ctx.moveTo(laser.x - laser.length / 2, laser.y);
			ctx.lineTo(laser.x + laser.length / 2, laser.y);
		} else {
			ctx.moveTo(laser.x, laser.y - laser.length / 2);
			ctx.lineTo(laser.x, laser.y + laser.length / 2);
		}
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	// Draw power-ups
	const time = Date.now() / 1000;
	for (const powerUp of gameState.powerUps) {
		if (powerUp.collected) continue;

		const bobY = Math.sin(time * 3 + powerUp.bobPhase) * 5;
		const x = powerUp.x;
		const y = powerUp.y + bobY;

		ctx.shadowColor =
			powerUp.type === "speed"
				? "#4ade80"
				: powerUp.type === "invisible"
					? "#60a5fa"
					: "#f472b6";
		ctx.shadowBlur = 15;

		ctx.fillStyle = ctx.shadowColor;
		ctx.beginPath();
		ctx.arc(x, y, POWER_UP_SIZE, 0, Math.PI * 2);
		ctx.fill();

		ctx.fillStyle = "#ffffff";
		ctx.font = "16px Arial";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const icon =
			powerUp.type === "speed"
				? "⚡"
				: powerUp.type === "invisible"
					? "👻"
					: "🧲";
		ctx.fillText(icon, x, y);
		ctx.shadowBlur = 0;
	}

	// Draw artworks with holographic display effect
	for (const artwork of gameState.artworks) {
		if (artwork.collected) continue;

		const dx = gameState.playerX - artwork.x;
		const dy = gameState.playerY - artwork.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const proximityGlow = Math.max(0, 1 - dist / 150);

		artwork.glowPhase += 0.05;

		// Holographic pedestal
		ctx.fillStyle = "rgba(255, 0, 255, 0.1)";
		ctx.beginPath();
		ctx.moveTo(
			artwork.x - ARTWORK_SIZE / 2 - 10,
			artwork.y + ARTWORK_SIZE / 2 + 5,
		);
		ctx.lineTo(
			artwork.x + ARTWORK_SIZE / 2 + 10,
			artwork.y + ARTWORK_SIZE / 2 + 5,
		);
		ctx.lineTo(artwork.x + ARTWORK_SIZE / 2, artwork.y + ARTWORK_SIZE / 2 + 15);
		ctx.lineTo(artwork.x - ARTWORK_SIZE / 2, artwork.y + ARTWORK_SIZE / 2 + 15);
		ctx.closePath();
		ctx.fill();

		// Neon frame glow
		const glowIntensity =
			0.5 + proximityGlow * 0.5 + Math.sin(artwork.glowPhase) * 0.2;
		ctx.shadowColor = proximityGlow > 0.3 ? "#ff00ff" : "#00ffff";
		ctx.shadowBlur = 15 * glowIntensity;

		// Outer frame
		ctx.strokeStyle = proximityGlow > 0.3 ? "#ff00ff" : "#00ffff";
		ctx.lineWidth = 2 + proximityGlow * 2;
		ctx.strokeRect(
			artwork.x - ARTWORK_SIZE / 2 - 4,
			artwork.y - ARTWORK_SIZE / 2 - 4,
			ARTWORK_SIZE + 8,
			ARTWORK_SIZE + 8,
		);

		// Corner accents
		ctx.fillStyle = proximityGlow > 0.3 ? "#ff00ff" : "#00ffff";
		const cornerSize = 6;
		// Top-left
		ctx.fillRect(
			artwork.x - ARTWORK_SIZE / 2 - 4,
			artwork.y - ARTWORK_SIZE / 2 - 4,
			cornerSize,
			2,
		);
		ctx.fillRect(
			artwork.x - ARTWORK_SIZE / 2 - 4,
			artwork.y - ARTWORK_SIZE / 2 - 4,
			2,
			cornerSize,
		);
		// Top-right
		ctx.fillRect(
			artwork.x + ARTWORK_SIZE / 2 + 4 - cornerSize,
			artwork.y - ARTWORK_SIZE / 2 - 4,
			cornerSize,
			2,
		);
		ctx.fillRect(
			artwork.x + ARTWORK_SIZE / 2 + 2,
			artwork.y - ARTWORK_SIZE / 2 - 4,
			2,
			cornerSize,
		);
		// Bottom-left
		ctx.fillRect(
			artwork.x - ARTWORK_SIZE / 2 - 4,
			artwork.y + ARTWORK_SIZE / 2 + 2,
			cornerSize,
			2,
		);
		ctx.fillRect(
			artwork.x - ARTWORK_SIZE / 2 - 4,
			artwork.y + ARTWORK_SIZE / 2 + 4 - cornerSize,
			2,
			cornerSize,
		);
		// Bottom-right
		ctx.fillRect(
			artwork.x + ARTWORK_SIZE / 2 + 4 - cornerSize,
			artwork.y + ARTWORK_SIZE / 2 + 2,
			cornerSize,
			2,
		);
		ctx.fillRect(
			artwork.x + ARTWORK_SIZE / 2 + 2,
			artwork.y + ARTWORK_SIZE / 2 + 4 - cornerSize,
			2,
			cornerSize,
		);

		ctx.shadowBlur = 0;

		const img = artwork.data ? artworkImages[artwork.data.id] : null;
		if (img) {
			ctx.drawImage(
				img,
				artwork.x - ARTWORK_SIZE / 2,
				artwork.y - ARTWORK_SIZE / 2,
				ARTWORK_SIZE,
				ARTWORK_SIZE,
			);
		} else {
			// Placeholder with neon gradient
			const artGradient = ctx.createLinearGradient(
				artwork.x - ARTWORK_SIZE / 2,
				artwork.y - ARTWORK_SIZE / 2,
				artwork.x + ARTWORK_SIZE / 2,
				artwork.y + ARTWORK_SIZE / 2,
			);
			artGradient.addColorStop(0, "#00ffff");
			artGradient.addColorStop(1, "#ff00ff");
			ctx.fillStyle = artGradient;
			ctx.fillRect(
				artwork.x - ARTWORK_SIZE / 2,
				artwork.y - ARTWORK_SIZE / 2,
				ARTWORK_SIZE,
				ARTWORK_SIZE,
			);
			ctx.fillStyle = "#000";
			ctx.font = "bold 10px Courier New";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("DATA", artwork.x, artwork.y);
		}
	}

	// Draw guards
	for (const guard of gameState.guards) {
		drawCyberGuard(
			guard.x,
			guard.y,
			guard.type,
			guard.alertLevel,
			guard.spotlightAngle,
		);
	}

	drawSpeedLines();

	// Draw path with neon trail
	if (gameState.path.length > 1) {
		// Outer glow
		ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
		ctx.lineWidth = 10;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.shadowColor = "#00ffff";
		ctx.shadowBlur = 20;

		ctx.beginPath();
		ctx.moveTo(gameState.path[0].x, gameState.path[0].y);

		for (let i = 1; i < gameState.path.length; i++) {
			if (gameState.path[i].newSegment) {
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(gameState.path[i].x, gameState.path[i].y);
			} else {
				ctx.lineTo(gameState.path[i].x, gameState.path[i].y);
			}
		}
		ctx.stroke();

		// Core line
		ctx.strokeStyle = "#00ffff";
		ctx.lineWidth = 2;
		ctx.shadowBlur = 0;

		ctx.beginPath();
		ctx.moveTo(gameState.path[0].x, gameState.path[0].y);

		for (let i = 1; i < gameState.path.length; i++) {
			if (gameState.path[i].newSegment) {
				ctx.stroke();
				ctx.beginPath();
				ctx.moveTo(gameState.path[i].x, gameState.path[i].y);
			} else {
				ctx.lineTo(gameState.path[i].x, gameState.path[i].y);
			}
		}
		ctx.stroke();
	}

	// Draw player as cyber drone
	const pulseSize = 6 + Math.sin(Date.now() / 100) * 1.5;
	const playerAlpha = gameState.isInvisible ? 0.3 : 1;

	ctx.globalAlpha = playerAlpha;

	// Outer glow
	ctx.shadowColor = "#ff00ff";
	ctx.shadowBlur = 25;

	// Diamond shape for player
	ctx.fillStyle = "#ff00ff";
	ctx.beginPath();
	ctx.moveTo(gameState.playerX, gameState.playerY - pulseSize);
	ctx.lineTo(gameState.playerX + pulseSize, gameState.playerY);
	ctx.lineTo(gameState.playerX, gameState.playerY + pulseSize);
	ctx.lineTo(gameState.playerX - pulseSize, gameState.playerY);
	ctx.closePath();
	ctx.fill();

	// Inner core
	ctx.shadowBlur = 0;
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.arc(
		gameState.playerX,
		gameState.playerY,
		pulseSize * 0.4,
		0,
		Math.PI * 2,
	);
	ctx.fill();

	// Direction indicator
	const dirAngle = gameState.goingUp ? -Math.PI / 4 : Math.PI / 4;
	const indicatorLength = 18;
	ctx.strokeStyle = "#00ffff";
	ctx.lineWidth = 2;
	ctx.shadowColor = "#00ffff";
	ctx.shadowBlur = 10;
	ctx.beginPath();
	ctx.moveTo(gameState.playerX, gameState.playerY);
	ctx.lineTo(
		gameState.playerX + Math.cos(dirAngle) * indicatorLength,
		gameState.playerY + Math.sin(dirAngle) * indicatorLength,
	);
	ctx.stroke();
	ctx.shadowBlur = 0;

	ctx.globalAlpha = 1;

	drawVignette();
	drawScreenFlash();
	drawParticles();

	ctx.restore();
}

function gameLoop(): void {
	if (gameState.gameStarted) {
		update();
		draw();
	}
	requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener("keydown", (e) => {
	initAudio();

	if (e.code === "Space") {
		e.preventDefault();

		if (!gameState.gameStarted) {
			gameState.gameStarted = true;
			titleScreenEl.classList.add("hidden");
			canvas.focus();
			startBackgroundMusic();
			init();
			announce("Game started. Hold spacebar to go up, release to go down.");
			return;
		}

		gameState.goingUp = true;
	}

	if (e.code === "KeyR") {
		// Return to title screen
		gameState.gameStarted = false;
		gameState.level = 1;
		gameState.score = 0;
		gameState.usedStyles = [];
		gameState.stolenArtworks = [];
		gameState.combo = 0;
		particles = [];
		floatingTexts = [];
		speedLines = [];
		screenShake = { intensity: 0, duration: 0 };
		screenFlash = { color: null, alpha: 0 };
		screenZoom = { scale: 1, target: 1 };
		comboDisplayEl.classList.remove("active");
		hideFinishScreen();
		titleScreenEl.classList.remove("hidden");
		announce("Returned to title screen.");
	}
});

document.addEventListener("keyup", (e) => {
	if (e.code === "Space") {
		gameState.goingUp = false;
	}
});

window.addEventListener("keydown", (e) => {
	if (e.code === "Space") {
		e.preventDefault();
	}
});

// Speed button handlers
speedBtns.forEach((btn) => {
	btn.addEventListener("click", () => {
		speedBtns.forEach((b) => {
			b.classList.remove("selected");
		});
		btn.classList.add("selected");
		speedMultiplier = parseInt(btn.dataset.speed || "1", 10);
		localStorage.setItem("artHeistSpeed", speedMultiplier.toString());
	});
});

// Start loading
async function startGame(): Promise<void> {
	ctx.fillStyle = "#16213e";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#fff";
	ctx.font = "24px Courier New";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("Loading artworks...", canvas.width / 2, canvas.height / 2);

	await fetchArtworks();
	gameLoop();
}

startGame();
