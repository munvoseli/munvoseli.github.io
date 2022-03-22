'use strict';

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 600;

document.body.style.backgroundColor = "#000";

ctx.beginPath();
let points = [300, 300];
let d = 15;
ctx.strokeStyle = "#fff";
let p1 = 0.4;
let p2 = 0.9;
for (let i = 0; points.length < 5000 && i < points.length; i += 2) {
	for (let j = 0; j < 6; ++j) {
		let a = Math.random() * 2 * Math.PI;
		let ox = points[i];
		let oy = points[i + 1];
		let nx = ox + d * Math.cos(a);
		let ny = oy + d * Math.sin(a);
		let no = false;
		let conto = [];
		for (let k = 0; k < points.length; k += 2) {
			let ds = (nx - points[k]) ** 2 + (ny - points[k + 1]) ** 2;
			if (ds < d * d * p1) {
				no = true;
				break;
			} else if (ds < d * d * p2) {
				conto.push(k);
			}
		}
		if (no) continue;
		for (let k of conto) {
			ctx.moveTo(points[k], points[k + 1]);
			ctx.lineTo(nx, ny);
		}
		//ctx.moveTo(ox, oy);
		//ctx.lineTo(nx, ny);
		points.push(nx);
		points.push(ny);
	}
}
ctx.stroke();
ctx.closePath();
