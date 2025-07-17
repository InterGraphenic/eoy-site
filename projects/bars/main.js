const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;
const P = 5;

const data = Array.from({ length: 50 }, () => Math.floor(Math.random() * 20) + 1);
if (!data.includes(6)) data[0] = 6;
if (!data.includes(7)) data[1] = 7;

const BAR_W = (W - P * (data.length + 1)) / data.length;

function draw(active = []) {
	ctx.clearRect(0, 0, W, H);
	const max = Math.max(...data);

	data.forEach((v, i) => {
		const x = P + i * (BAR_W + P);
		const h = (v / max) * (H - 20);
		const y = H - h;

		ctx.fillStyle = active.includes(i) ? '#f1c40f' : '#3498db';
		ctx.fillRect(x, y, BAR_W, h);

		if (v === 6 || v === 7) { // highlight the tuff 67 bars
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'red';
			ctx.strokeRect(x, y, BAR_W, h);
		}
	});
}

let i = 0, j = 0;
const tick = 10;           
const timer = setInterval(() => {
	if (i < data.length) {
		if (j < data.length - i - 1) {
			if (data[j] > data[j + 1]) {
				[data[j], data[j + 1]] = [data[j + 1], data[j]];
			}
			draw([j, j + 1]); 
			j++;
		} else {               
			j = 0;
			i++;
		}
	} else {                  
		draw();                  
		clearInterval(timer);
	}
}, tick);

draw();                    
