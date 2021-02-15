'use strict';
var url = window.location.href;
var indexOfQuery = url.indexOf("?");
var player;
function onYouTubeIframeAPIReady()
{
    if (indexOfQuery >= 0)
    {
	console.log("hi");
	player = new YT.Player ("player", {
	    width: "640",
	    height: "390",
	    videoId: url.substring(indexOfQuery + 1),
	    events: {
		"onReady": onPlayerReady,
		"onStateChange": onPlayerStateChange
	    }
	});
    }
}

var startPlayTime;
var endPlayTime;

function onPlayerReady() {
    console.log("e", e);
};
function onPlayerStateChange(e) {
    console.log(e);
    if (e.data == YT.PlayerState.PLAYING)
    {
	if (!startPlayTime)
	    startPlayTime = new Date().getTime();
	else if (endPlayTime)
	    setTimeout(function() {player.seekTo(0);}, endPlayTime - startPlayTime - 1000);
    }
    else if (e.data == YT.PlayerState.ENDED)
	if (!endPlayTime)
	    endPlayTime = new Date().getTime();
}

var input = document.getElementById("input");
var button = document.getElementById("button");
const ytstrings = [
    "youtu.be/",
    "?v=", // only works if v is only parameter, just quick fix
    ""
];
function getYoutubeId (str)
{
    var i;
    var ytstr;
    for (ytstr of ytstrings)
	if ((i = str.indexOf(ytstr)) != -1)
	    break;
    return str.substring(i + ytstr.length);
}
function submitString ()
{
    var str = input.value;
    var id = getYoutubeId (str);
    var newurl = "";
    if (indexOfQuery >= 0)
	newurl = window.location.href.replace(/\?.*/, "?" + id);
    else
	newurl += "?" + id;
    window.location.href = newurl;
}
button.addEventListener("click", submitString, false);
