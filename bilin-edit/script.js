
let cnv = {};
let ctx = {};
for (let key of ["din", "out"]) {
	cnv[key] = document.getElementById(key + "-canvas");
	ctx[key] = cnv[key].getContext("2d");
}
cnv.din.width = cnv.din.height = 64;
const k = 16;
cnv.out.width = cnv.out.height = 63 * k;

let indata = new Uint8Array(64 * 64);

function bilin(x, y, d00, d01, d10, d11) {
	return (
		d00 * (1-x) * (1-y) +
		d10 * (  x) * (1-y) +
		d11 * (  x) * (  y) +
		d01 * (1-x) * (  y));
}
function lerp(x, a, b) {
	return a + (b-a) * x;
}


function updateCanvases() {
	let imgd;// = new ImageData(64, 64);
//	{
//		let i = 0;
//		let j = 0;
//		for (; j < 64 * 64;) {
//			imgd.data[i++] = indata[j];
//			imgd.data[i++] = indata[j];
//			imgd.data[i++] = indata[j]; ++j;
//			imgd.data[i++] = 255;
//		}
//	}
//	ctx.din.putImageData(imgd, 0, 0);
	imgd = new ImageData(cnv.out.width, cnv.out.height);
	{
		let i = 0;
		for (let y = 0; y < cnv.out.height; ++y) {
		for (let x = 0; x < cnv.out.width; ++x) {
			let ix = Math.floor(x / k);
			let iy = Math.floor(y / k);
			let d00 = indata[ix + iy * 64]; ++iy;
			let d01 = indata[ix + iy * 64]; ++ix;
			let d11 = indata[ix + iy * 64]; --iy;
			let d10 = indata[ix + iy * 64]; --ix;
			let v = bilin(x/k - ix, y/k - iy, d00,d01,d10,d11);
			v = v > 127 ? 255 : 0;
			v = lerp(0.5, v, (d00+d01+d10+d11)/4);
			imgd.data[i++] = v;
			imgd.data[i++] = v;
			imgd.data[i++] = v;
			imgd.data[i++] = 255;
		}}
	}
	ctx.out.putImageData(imgd, 0, 0);
}

for (let i = 0; i < 64*64; ++i) {
//	indata[i] = 256 * Math.random();
}

updateCanvases();

let brush = 1;
function keyHandler(e, b) {
	if (e.key == "w") {
		brush = 2;
	} else if (e.key == "b") {
		brush = 0;
	} else if (e.key == "c") {
		brush = 1;
	}
}

addEventListener("keydown", e => keyHandler(e, true ), false);
addEventListener("keyup"  , e => keyHandler(e, false), false);

function relu(x) {return x >= 0 ? x : 0;}

cnv.out.addEventListener("mousemove", function(e) {
	let rect = this.getBoundingClientRect();
	let x = (e.clientX - rect.x) / rect.width * 64;
	let y = (e.clientY - rect.y) / rect.height * 64;
	let xi = Math.floor(x);
	let yi = Math.floor(y);
	if (brush != 1) {
		for (let yg = yi - 1; yg < yi + 2; ++yg) {
		for (let xg = xi - 1; xg < xi + 2; ++xg) {
			let power = relu(2 - (xg - x) ** 2 - (yg - y) ** 2) / 32;
			indata[xg + yg * 64] = lerp(
				power,
				indata[xg + yg * 64],
				brush == 0 ? 0 : 255);
		}}
	}
	updateCanvases();
}, false);
