'use strict';
var url = window.location.href;
var indexOfQuery = url.indexOf("?");
var player;
var duration;
function onYouTubeIframeAPIReady()
{
    if (indexOfQuery >= 0)
    {
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



function keepVideoLooped() // can't use the end event, or my iPhone will just stop, even with telling it to play
{
    if (player.getCurrentTime() + .1 > duration)
	player.seekTo(0);
}
function onPlayerReady() {
    duration = player.getDuration();
    setInterval(keepVideoLooped, 100);
};
function onPlayerStateChange(e) {
    //if (e.data == YT.PlayerState.PLAYING)
    //setTimeout(function() {player.seekTo(0);}, Math.round(duration - 1) * 1000);
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



var ul = document.getElementById("linklist");
var links = `\
5K4AsbH3xm8 This Day Aria
vlnTkwOfjZ4 You'll Play Your Part
mZvSriNSvUk Open Up Your Eyes
YzNL-0wXK84 A Kirin Tale
nplYVvRp4XQ Magic of Friendship
xPfMb50dsOk Discord
H4tyvJJzSDk Lullaby for a Princess
AfMYKSdZdAY Soldiers of the Night
5ZrMvFmSKDo Pegasus Device
nZrdeMWWpAQ Equality
YoiUZZk6SwU A Sound I'll Never Know
uH2Ns9Tewpo FiW - It'll Be Ok
r1ezBY62TUs swim
ped4MouGzzs Paint the Moon Red
5e_4Devi_YY House of Glass
oiKj0Z_Xnjc Papaoutai
CAMWdvo71ls Tous Les Memes
rK0lMLCM3Mg Warriors
RrirVkPHNdM Listening with a Million Ears
iKnwVvXkWq0 Celeste 5B
ZGM90Bo3zH0 Steins;Gate opening`.split("\n");
for (var link of links)
{
    var i = link.indexOf(" ");
    var id = link.substring(0, i);
    var text = link.substring(i + 1);
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.innerHTML = text;
    a.href = "?" + id;
    li.appendChild(a);
    ul.appendChild(li);
}
