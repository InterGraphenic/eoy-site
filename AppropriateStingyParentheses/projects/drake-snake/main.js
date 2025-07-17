const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const TILE = 20;
const COLS = canvas.width / TILE | 0;   // full width
const ROWS = canvas.height / TILE | 0;

const drakeImg = new Image(); drakeImg.src = 'assets/drake.png';
const mangoImg = new Image(); mangoImg.src = 'assets/mango.png';
const mustardImg = new Image(); mustardImg.src = 'assets/mustard.png';
const assets = [drakeImg, mangoImg, mustardImg];

const DIR = {
	ArrowUp: { x: 0, y: -1, ang: -Math.PI / 2 },
	ArrowDown: { x: 0, y: 1, ang: Math.PI / 2 },
	ArrowLeft: { x: -1, y: 0, ang: Math.PI },
	ArrowRight: { x: 1, y: 0, ang: 0 }
};

let drake, dir, nextDir, fruit, score, stepMs = 120;
let lastTime, growPending, gameOver = false;
let hscore = 0;

/* ---------- game setup ---------- */
function reset() {
	drake = [{ x: COLS / 2 | 0, y: ROWS / 2 | 0 }];
	dir = nextDir = DIR.ArrowRight;
	score = 0;
	growPending = 0;
	gameOver = false;
	spawnFruit();
	lastTime = performance.now();
	requestAnimationFrame(loop);
}

function spawnFruit() {
	const type = Math.random() < 0.10 ? 'rare' : 'common';
	let pos;
	do {
		pos = { x: Math.random() * COLS | 0, y: Math.random() * ROWS | 0 };
	} while (drake.some(s => s.x === pos.x && s.y === pos.y));
	fruit = { ...pos, type };
}

/* ---------- input ---------- */
addEventListener('keydown', e => {
	if (DIR[e.key]) {
		const nd = DIR[e.key];
		if (nd.x !== -dir.x || nd.y !== -dir.y) nextDir = nd;   // no 180° turns
	} else if (e.key === ' ' && gameOver) {
		reset();
	}
});

/* ---------- main loop ---------- */
function loop(now) {
	if (!gameOver && now - lastTime >= stepMs) {
		lastTime = now;
		step();
	}
	render();
	requestAnimationFrame(loop);
}

/* ---------- update ---------- */
function step() {
	dir = nextDir;

	const head = {
		x: (drake[0].x + dir.x + COLS) % COLS,
		y: (drake[0].y + dir.y + ROWS) % ROWS
	};

	const eats = head.x === fruit.x && head.y === fruit.y;

	if (growPending === 0) {
		drake.pop();
	} else {
		growPending--;
	}

	if (drake.some(s => s.x === head.x && s.y === head.y)) {
		gameOver = true;
		return;
	}

	drake.unshift(head);

	if (eats) {
		const bonus = fruit.type === 'rare' ? 10 : 1;
		score += bonus;
		growPending += bonus;
		hscore = Math.max(hscore, score)
		spawnFruit();
	}
}

function render() {
	ctx.fillStyle = '#b4d27b';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const fImg = fruit.type === 'rare' ? mustardImg : mangoImg;
	ctx.drawImage(fImg, fruit.x * TILE, fruit.y * TILE, TILE, TILE);

	ctx.fillStyle = '#3b5d1e';
	for (let i = 1; i < drake.length; i++) {
		const s = drake[i];
		ctx.fillRect(s.x * TILE + 0.1 * TILE,
			s.y * TILE + 0.1 * TILE,
			TILE - 0.2 * TILE,
			TILE - 0.2 * TILE);
	}

	const h = drake[0];
	ctx.save();
	ctx.translate((h.x + 0.5) * TILE, (h.y + 0.5) * TILE);
	ctx.rotate(dir.ang);
	ctx.drawImage(drakeImg, -TILE / 2, -TILE / 2, TILE, TILE);
	ctx.restore();

	ctx.fillStyle = '#fff';
	ctx.font = '16px monospace';
	ctx.textAlign = 'left';
	ctx.fillText(`Score: ${score} High score: ${hscore}`, 8, 20);

	if (gameOver) {
		ctx.fillStyle = 'rgba(0,0,0,0.6)';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#fff';
		ctx.font = '24px monospace';
		ctx.textAlign = 'center';
		ctx.fillText('Game is so gone', canvas.width / 2, canvas.height / 2 - 10);
		ctx.fillText('Press Space to Restart',
			canvas.width / 2, canvas.height / 2 + 20);
	}
}

let loaded = 0;
assets.forEach(img => img.onload = () =>
	(++loaded === assets.length && reset())
);
