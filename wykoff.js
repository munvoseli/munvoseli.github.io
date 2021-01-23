// based on Wicki-Hayden note layout

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 1366;
canvas.height = 768;
canvas.style = "position: absolute; left: 0px; top: 0px;";

var gh = 1;
var gw = 2;
var hgw = gw / 2;
//var m = gh * 4/3 / gw;
function getHexagon(x, y) // stackoverflow
{
    var row = Math.floor(y / gh);
    var rowIsOdd = row & 1;
    var col = rowIsOdd ? Math.floor((x - hgw) / gw) : Math.floor(x / gw);
    var relY = y - row * gh;
    var relX = x - col * gw - (rowIsOdd ? hgw : 0);
    var c = gh * 1/3;
    var m = c / hgw;
    if (relY < (-m * relX) + c)
    {
	row--;
	if (!rowIsOdd)
	    col--;
    }
    else if (relY < (m * relX) - c)
    {
	row--;
	if (rowIsOdd)
	    col++;
    }
    col -= Math.floor(row / 2);
    return [col, row];
}
function getPitch(uc, vc)
{
    var u = 12 * (2 * uc / canvas.width - 1);
    var v = 5 * (2 * vc / canvas.height - 1);
    var colrow = getHexagon(u, v);
    var p = -5 * colrow[1] + 2 * colrow[0] + 60;
    return p;
}

var colorblind = [
    "#000", "#332", "#ddc", "#fef", "#ccd", "#223",
    "#221", "#ccb", "#eed", "#dde", "#bbc", "#112"
];
var colorsdeux = [
    "#000", "#333", "#ddd", "#fff", "#ddd", "#333",
    "#222", "#ccc", "#eee", "#eee", "#ccc", "#222"
];
var colorceleste = [
    "#101", "#303", "#c03", "#0af", "#c30", "#300",
    "#212", "#a02", "#06e", "#e50", "#a20", "#211"
];

var colorSet = colorsdeux;

function initImage()
{
    var imageData = new ImageData(canvas.width, canvas.height);
    var i = 0;
    for (var vc = 0; vc < canvas.height; vc++)
    {
	for (var uc = 0; uc < canvas.width; uc++)
	{
	    var u = 10 * (2 * uc / canvas.width - 1);
	    var v = 5 * (2 * vc / canvas.height - 1);
	    var p = getPitch(uc, vc);
	    var color = [ // it wouldn't surprise me if this were a pride flag, but I'm not well-versed enough in pride flags to know for sure. Chosen for color blindness.
		colorSet[ 9], colorSet[1], colorSet[10], colorSet[2],
		colorSet[11], colorSet[3], colorSet[ 6], colorSet[4],
		colorSet[ 7], colorSet[5], colorSet[ 8], colorSet[0]
	    ][p - 12 * Math.floor(p / 12)];
	    //alert(color);
	    imageData.data[i    ] = parseInt(color[1], 16) * 17;
	    imageData.data[i + 1] = parseInt(color[2], 16) * 17;
	    imageData.data[i + 2] = parseInt(color[3], 16) * 17;
	    imageData.data[i + 3] = 255;
	    i += 4;
	}
    }
    ctx.putImageData(imageData, 0, 0);
}
initImage();


function qsort(arr)
{
    if (arr.length <= 1)
	return arr;
    var lt = [];
    var eq = [];
    var gt = [];
    var measure = arr[0];
    for (var i = 0; i < arr.length; i++)
    {
	if (arr[i] < measure)
	    lt.push(arr[i]);
	else if (arr[i] == measure)
	    eq.push(arr[i]);
	else
	    gt.push(arr[i]);
    }
    lt = qsort(lt);
    gt = qsort(gt);
    return lt.concat(eq).concat(gt);
}

var actx = new AudioContext();
function Osc (p)
{
    this.p = p;
    this.n = 0;
    this.osc = null;
    this.gain = null;
    this.freq = 440 * 2 ** (p/12-6);
    this.osc = null;
    this.gain = null;
    this.setup();
}
Osc.prototype.setup = function()
{
    this.osc = actx.createOscillator();
    this.gain = actx.createGain();
    this.gain.gain.setValueAtTime(0, actx.currentTime);
    this.osc.type = "sawtooth";
    this.osc.frequency.value = this.freq;
    this.osc.connect(this.gain);
    this.gain.connect(actx.destination);
}
Osc.prototype.shrink = function()
{
    this.n--;
    if (this.n == 0)
    {
	this.gain.gain.setTargetAtTime(0, actx.currentTime, .1);
	this.osc.stop(actx.currentTime + .1);
	this.setup();
    }
    else
    {
	this.gain.gain.setTargetAtTime(this.n / 8, actx.currentTime, .1);
    }
}
Osc.prototype.grow = function()
{
    if (this.n == 0)
    {
	this.osc.start();
    }
    this.n++;
    this.gain.gain.setTargetAtTime(this.n / 8, actx.currentTime, .1);
    //alert("hiya" + this.osc.frequency.value);
}

var lastPitches = [];
var oscillators = [];

for (var i = 0; i < 144; i++)
{
    oscillators[i] = new Osc(i);
}

function updateTouches(touchList)
{
    var nowPitches = [];
    for (var touch of touchList)
    {
	var x = touch.pageX;
	var y = touch.pageY;
	var p = getPitch(x, y);
	nowPitches.push(p);
    }
    var add = [];
    var rem = [];
    var ni = 0;
    var li = 0;
    ctx.fillStyle = "#fff";
    for (var i = 0; i < 100; i++)
    {
	var nd = ni >= nowPitches.length;
	var ld = li >= lastPitches.length;
	if (nd && ld)
	    break;
	if (nd) // lp has something np doesn't, must remove them
	{
	    ctx.fillStyle = "#f00";
	    rem = rem.concat(lastPitches.slice(li));
	    break;
	}
	else if (ld)
	{
	    ctx.fillStyle = "#0f0";
	    add = add.concat(nowPitches.slice(ni));
	    break;
	}
	if (nowPitches[ni] < lastPitches[li]) // np has something lp doesn't
	{
	    add.push(nowPitches[ni]);
	    ni++;
	}
	else if (nowPitches[ni] > lastPitches[li])
	{
	    rem.push(lastPitches[li]);
	    li++;
	}
	else
	{
	    ni++;
	    li++;
	}
    }
    
    //alert(add.length + " " + add[0] + " " + oscillators[add[0]].grow + " " + nowPitches.length + " " + lastPitches.length);
    for (var i = 0; i < add.length; i++)
	oscillators[add[i]].grow();
    for (var i = 0; i < rem.length; i++)
	oscillators[rem[i]].shrink();
    /*ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = "#000";
      ctx.font = "30px monospace";
      ctx.fillText(add.length, 50, 50);
      ctx.fillText(rem.length, 50, 80);
      ctx.fillText(nowPitches.length, 20, 50);
      ctx.fillText(lastPitches.length, 20, 80);*/
    lastPitches = nowPitches;
}


function absorbEverything (e)
{
    e.preventDefault();
    e.stopPropogation();
    e.cancelBubble = true;
    e.returnValue = false;
}
function preventEverything (el) // for preventing default
{
    el.addEventListener("touchstart", absorbEverything, false);
    el.addEventListener("touchmove", absorbEverything, false);
    el.addEventListener("touchend", absorbEverything, false);
    el.addEventListener("touchcancel", absorbEverything, false);
}
preventEverything (window);
preventEverything (document);
preventEverything (canvas);
canvas.addEventListener("touchstart", function(e) {
    absorbEverything (e);
    updateTouches(e.touches);
}, false);
canvas.addEventListener("touchend", function(e) {
    absorbEverything (e);
    updateTouches(e.targetTouches);
}, false);
canvas.addEventListener("touchmove", function(e) {
    absorbEverything (e);
    updateTouches(e.touches);
}, false);
