let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let numer = [3, 2, 7, 5, 3, 11, 5, 6];
let denom = [1, 1, 4, 3, 2,  8, 4, 5];
//let ratios = [2, 7/4, 5/3, 3/2, 11/8, 5/4, 6/5];
let ratios = [];
for (let i = 0; i < numer.length; ++i) {
	ratios[i] = numer[i] / denom[i];
}

let minb = 1.013;
let maxb = 1.09;
let minx = 100;
let maxx = canvas.width;
const f = 0.008;
//let m = Math.log(maxb / minb) / (maxx - minx);
//let n = Math.log(minb) - m * minx;

//let m = (maxx / Math.log(maxb) - minx / Math.log(minb)) / (1 / Math.log(maxb) - 1 / Math.log(minb));
let n = (minx * Math.log(minb) - maxx * Math.log(maxb)) / Math.log(maxb / minb);
let m = (minx + n) * Math.log(minb);

function kc(r, b) {
	return tri(Math.log(r) / Math.log(b)) * Math.log(b);
}

function lerp(a, b, x) {
	return a + x * (b - a);
}

function tri(x) {
	x -= Math.floor(x);
	x -= 0.5;
	x = Math.abs(x);
	return 0.5 - x;
}

function xtob(x) {
	//return lerp(minb, maxb, (x - minx) / (maxx - minx));
	return Math.exp(m / (x + n));
}
function btox(b) {
	//return lerp(minx, maxx, (b - minb) / (maxb - minb));
	return m / Math.log(b) - n;
}
function cap(a, x) {
	return a < x ? a : x;
}

let imageData = new ImageData(canvas.width, canvas.height);

function allkc(b) {
	let golf = 0;
	for (let r of ratios) {
		golf += cap(kc(r, b), f) / f;
	}
	return golf;
}

let h = Math.floor(canvas.height / (ratios.length + 1));
for (let i = 0; i < ratios.length; ++i) {
	let y0 = h * i;
	for (let x = minx; x < maxx; ++x) {
		let b = xtob(x);
		let kv = cap(kc(ratios[i], b), f) * 100 / f;
		for (let y = y0; y < y0 + h; ++y) {
			let j = (y * imageData.width + x) * 4;
			imageData.data[j++] = kv;
			imageData.data[j++] = kv;
			imageData.data[j++] = kv;
			imageData.data[j++] = 255;
		}
	}
}
{
	let y0 = h * ratios.length;
	for (let x = minx; x < maxx; ++x) {
		let b = xtob(x);
		let kv = allkc(b) * 30;
		for (let y = y0; y < y0 + h; ++y) {
			let j = (y * imageData.width + x) * 4;
			imageData.data[j++] = kv;
			imageData.data[j++] = kv;
			imageData.data[j++] = kv;
			imageData.data[j++] = 255;
		}
	}
}

ctx.putImageData(imageData, 0, 0);

function putLineAtB(b, color) {
	let x = btox(b);
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(x, 0);
	ctx.lineTo(x, canvas.height);
	ctx.stroke();
	ctx.closePath();
}

ctx.lineWidth = 2;
putLineAtB(2**(1/12), "#fa0");
putLineAtB(2**(1/19), "#fa0");
putLineAtB(2**(1/23), "#fa0");
putLineAtB(2**(1/24), "#fa0");
putLineAtB(2**(1/26), "#fa0");
putLineAtB(2**(1/27), "#fa0");
putLineAtB(2**(1/29), "#fa0");
putLineAtB(2**(1/31), "#fa0");
putLineAtB(2**(1/34), "#fa0");
putLineAtB(2**(1/41), "#fa0");
putLineAtB(2**(1/46), "#fa0");
putLineAtB(2**(1/53), "#fa0");
putLineAtB(2**(1/15.385), "#af0");
putLineAtB(2**(1/18.809), "#af0");
putLineAtB(2**(1/34.188), "#af0");
putLineAtB(3**(1/13), "#0af");

ctx.font = "20px monospace";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

for (let i = 0; i < ratios.length; ++i) {
	let y0 = i * h;
	ctx.fillText(numer[i], minx / 2, y0 + 1/3 * h);
	ctx.fillText(denom[i], minx / 2, y0 + 2/3 * h);
}
