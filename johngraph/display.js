let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
canvas.width = 1400;
canvas.height = 2000;

//function yo(y, ys, miny, yd) {
//	return Math.log(y)
//}
function rh() {
return "0123456789abc"[Math.floor(Math.random() * 13)];
}

function isTooClose(y, yvals) {
	for (let y2 of yvals)
		if (Math.abs(y - y2) < 12) return true;
	return false;
}

//let yscl = y => Math.pow(Math.log(y), .2);
let yscl = y => y;

function drawPlot() {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	let maxy = yscl(1000);
	let miny = yscl(4);
	let maxx = data[data.length-1].date.getTime();
	let minx = data[0].date.getTime();
	let textx = canvas.width - 200;
	let xs = textx / (maxx - minx);
	let ys = canvas.height;
	let yd = maxy - miny;

	let colors = {};
	ctx.textBaseline = "middle";
	let cyvals = [];
	for (let key of data[data.length-1].sorted.map(x=>x[0])) {
		let color = "#" + rh() + rh() + rh();
		colors[key] = color;
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		ctx.beginPath();
		for (let i = 0; i < data.length; ++i) {
			if (data[i].stats[key]) {
				let y = yscl(data[i].stats[key]);
				let x = data[i].date.getTime();
				ctx.lineTo(
					xs * (x - minx),
					ys * (1 - (y - miny) / yd));
			}
		}
		ctx.stroke();
		ctx.closePath();
		let y = yscl(data[data.length-1].stats[key]);
		y = ys * (1 - (y - miny) / yd);
		while (isTooClose(y, cyvals)) ++y;
		cyvals.push(y);
		ctx.fillText(key, textx, y);
	}
//	for (let i = 0; i < data[data.length-1].sorted.length; ++i) {
//		let row = data[data.length-1].sorted[i];
//		ctx.fillStyle = colors[row[0]];
//		ctx.fillText(row[0], textx, (i + .5) * canvas.height / data[data.length-1].sorted.length);
//	}
}
drawPlot();
