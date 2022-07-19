let loadedImage;

let cnv = {};
let ctx = {};
for (let key of ["fin", "bw", "sdf", "res"]) {
	cnv[key] = document.getElementById(key + "-canvas");
	ctx[key] = cnv[key].getContext("2d");
}

function getValueFromImageData(imgd, x, y) {
	return imgd.data[4 * (x + y * imgd.width)];
}

function setValueInImageData(imgd, x, y, v) {
	let i = 4 * (x + y * imgd.width);
	imgd.data[i] = v; ++i;
	imgd.data[i] = v; ++i;
	imgd.data[i] = v; ++i;
	imgd.data[i] = 255;
}

function getDistToNearest(imgd, x, y, r) {
	let g = getValueFromImageData;
	let d2min = r * r * 2;
	let vo = g(imgd, x, y);
	for (let b = -r; b <= r; ++b) {
	for (let a = -r; a <= r; ++a) {
		let vt = g(imgd, x + a, y + b);
		if (vt != vo) {
			let d2 = b * b + a * a;
			if (d2 < d2min) d2min = d2;
		}
	}}
	return Math.sqrt(d2min) * (vo ? -1 : 1);
}

function bilin(x, y, d00, d01, d10, d11) {
	return (
	d00 * (1-x) * (1-y) +
	d01 * (1-x) * (y  ) +
	d11 * (x  ) * (y  ) +
	d10 * (x  ) * (1-y));
}

function nv(id) {
	return +document.getElementById(id).value;
}

function doImage(img) {
	let g = getValueFromImageData;
	let s = setValueInImageData;
	cnv.fin.width = img.width;
	cnv.fin.height = img.height;
	cnv.bw.width = img.width;
	cnv.bw.height = img.height;
	ctx.fin.drawImage(img, 0, 0);
	let imgd = ctx.fin.getImageData(0, 0,
		cnv.fin.width, cnv.fin.height);
	let imd = imgd.data;
	for (let i = 0; i < imd.length; i += 4) {
		let v = imd[i] + imd[i + 1] + imd[i + 2];
		let nv = v > 20 ? 255 : 0;
		imd[i] = imd[i + 1] = imd[i + 2] = nv;
	}
	ctx.bw.putImageData(imgd, 0, 0);
	let r = 1 << nv("sdf-res");
	let sdf_imgd = new ImageData(
		Math.ceil(imgd.width / r) - 1,
		Math.ceil(imgd.height / r) - 1);
	{
	for (let y = 0; y < sdf_imgd.height; ++y) {
	for (let x = 0; x < sdf_imgd.width; ++x) {
		let hrx = x * r + r;
		let hry = y * r + r;
		let d = getDistToNearest(imgd, hrx, hry, r);
		let i = 4 * (x + y * sdf_imgd.width);
		sdf_imgd.data[i] = 127 - d *
			(document.getElementById("sdf-scale").value);
		sdf_imgd.data[i + 1] = sdf_imgd.data[i];
		sdf_imgd.data[i + 2] = sdf_imgd.data[i];
		sdf_imgd.data[i + 3] = 255;
	}}
	}
	cnv.sdf.width = sdf_imgd.width;
	cnv.sdf.height = sdf_imgd.height;
	ctx.sdf.putImageData(sdf_imgd, 0, 0);
	let k = r;
	imgd = new ImageData((sdf_imgd.width-1) * k, (sdf_imgd.height-1) * k);
	for (let y = 0; y < sdf_imgd.height - 1; ++y) {
	for (let x = 0; x < sdf_imgd.width - 1; ++x) {
		let d00 = g(sdf_imgd, x, y);
		let d01 = g(sdf_imgd, x, y + 1);
		let d11 = g(sdf_imgd, x + 1, y + 1);
		let d10 = g(sdf_imgd, x + 1, y);
		for (let yh = 0; yh < k; ++yh) {
		for (let xh = 0; xh < k; ++xh) {
			let v = bilin(xh/k, yh/k, d00,d01,d10,d11);
			v = v > 127 ? 255 : 0;
			s(imgd, xh+x*k, yh+y*k, v);
		}}
	}}
	cnv.res.width = imgd.width;
	cnv.res.height = imgd.height;
	ctx.res.putImageData(imgd, 0, 0);
}

let fin = document.getElementById("finput");
fin.addEventListener("change", function(e) {
	let fr = new FileReader();
	fr.onloadend = function(e) {
		let img = new Image();
		img.onload = function() {
			loadedImage = img;
			doImage(img);
		}
		img.src = fr.result;
	}
	fr.readAsDataURL(this.files[0]);
}, false);

function doWithLoadedImage() {
	if (loadedImage)
		doImage(loadedImage);
}

function addLoadedEventListener(id) {
	document.getElementById(id).addEventListener(
		"change", doWithLoadedImage, false);
}

addLoadedEventListener("sdf-scale");
addLoadedEventListener("sdf-res");
