function Board (w, h)
{
    this.w = w;
    this.h = h;
    this.arr = [];
    this.arr.length = w * h;
    this.arr.fill(-1);
}
Board.prototype.setSize = function (w, h)
{
    this.w = w;
    this.h = h;
    this.arr = [];
    this.arr.length = w * h;
    this.arr.fill(-1);
}
Board.prototype.getNeighborSum = function (x, y)
{
    var sum = 0;
    for (var xi = Math.max(x - 1, 0); xi < Math.min(x + 2, this.w); xi++)
    {
	for (var yi = Math.max(y - 1, 0); yi < Math.min(y + 2, this.h); yi++)
	{
	    if (xi == x && yi == y)
		continue;
	    if (this.arr[xi + yi * this.w] >= 0)
		sum++;
	}
    }
    return sum;
}
Board.prototype.getVal = function (x, y)
{
    return this.arr[x + y * this.w];
}
Board.prototype.fillWithStart = function (x, y)
{
    this.arr.fill(-1);
    this.arr[x + y * this.w] = 0;
    for (var iter = 1; iter < this.arr.length; iter++)
    {
	var canBeFilledCoords = [];
	for (var xi = 0; xi < this.w; xi++)
	    for (var yi = 0; yi < this.h; yi++)
		if (this.getVal(xi, yi) == -1 && this.getNeighborSum(xi, yi) > 0)
		    canBeFilledCoords.push([xi, yi]);
	var selCoords = canBeFilledCoords[Math.floor(Math.random() * canBeFilledCoords.length)];
	this.arr[selCoords[0] + selCoords[1] * this.w] = Math.ceil(this.getNeighborSum(selCoords[0], selCoords[1]) * (1 - Math.random() * Math.random()));
    }
}
Board.prototype.fill = function()
{
    var x = Math.floor(this.w * Math.random());
    var y = Math.floor(this.h * Math.random());
    this.fillWithStart(x, y);
}
var sprites = new Image();
sprites.src = "eyes.png";
Board.prototype.draw = function(canvas)
{
    canvas.width = this.w * 64;
    canvas.height = this.h * 64;
    var ctx = canvas.getContext("2d");
    for (var x = 0; x < this.w; x++)
    {
	for (var y = 0; y < this.h; y++)
	{
	    var val = this.getVal(x, y);
	    if (val >= 0)
		ctx.drawImage(sprites, 64 * val, 0, 64, 64, x * 64, y * 64, 64, 64);
	}
    }
}
Board.prototype.isClear = function()
{
    for (var i = 0; i < this.arr.length; i++)
	if (this.arr[i] != -1)
	    return false;
    return true;
}

var board = new Board(0, 0);
var startTime = new Date().getTime();
var hasFinished = false;
var totalTime = 0;
var timediv;
function canvasClick(e)
{
    var rect = e.target.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.x) * board.w / rect.width);
    var y = Math.floor((e.clientY - rect.y) * board.h / rect.height);
    var val = board.getVal(x, y);
    var nsum = board.getNeighborSum(x, y);
    if (val <= nsum)
    {
	board.arr[x + board.w * y] = -1;
	var ctx = e.target.getContext("2d");
	ctx.clearRect(x * 64, y * 64, 64, 64);
    }
    if (board.isClear() && !hasFinished)
    {
	hasFinished = true;
	var endTime = new Date().getTime();
	var elapsed = endTime - startTime;
	totalTime += elapsed;
	var p = document.createElement("p");
	p.innerHTML = board.w + "x" + board.h + ": " + (elapsed / 1000).toFixed(3);
	timediv.appendChild(p);
	var ctx = e.target.getContext("2d");
	ctx.font = "30px monospace";
	var y = 0;
	if (board.h >= 3)
	{
	    ctx.fillText("Congrats", 32, y += 32);
	    ctx.fillText("You defeated", 16, y += 32);
	    ctx.fillText("the goo.", 48, y += 32);
	}
	if (board.h >= 4)
	{
	    ctx.fillText("World hunger", 32, y += 32);
	    ctx.fillText("has been", 32, y += 32);
	    ctx.fillText("resolved", 32, y += 32);
	}
	if (board.h >= 5)
	{
	    ctx.fillText("everything is", 32, y += 32);
	    ctx.fillText("okay again.", 32, y += 32);
	}
	if (board.h >= 6)
	{
	    ctx.fillText("What happens when", 16, y += 32);
	    ctx.fillText("you scare magician?", 16, y += 32);
	}
	if (board.h >= 7)
	{
	    ctx.fillText("he poops your pants.", 16, y += 32);
	}
    }
}

window.onload = function() { // I don't actually know if the image is loaded, just assuming
    timediv = document.getElementById("timediv");
    var canvas = document.getElementById("canvas");
    function startGame()
    {
	hasFinished = false;
	startTime = new Date().getTime();
	var size = Number(document.getElementById("sizeinput").value);
	board = new Board(size, size);
	board.fill();
	board.draw(canvas);
	document.getElementById("explain").style.display = "none";
	document.getElementById("actualgamebox").style.display = "inline";
    }
    document.addEventListener("keydown", function(e) {
	if (e.key == "t")
	    timediv.style.display = "inline";
    }, false);
    canvas.addEventListener("click", canvasClick, false);
    var button = document.getElementById("startbutton");
    var hasLoadedSprites = false;
    var hasStartedGame = false;
    button.innerHTML = "Generate Board";

    function startFromButton()
    {
	startGame();
    }
    button.addEventListener("click", startFromButton, false);
}
//document.addEventListener("loadend", docOnLoad, false);
