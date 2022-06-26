// https://gamesdonequick.com/schedule/39
(function() {
let h1 = document.getElementsByTagName("h1")[0];
let res = "\nev " + h1.innerText.substring(0, h1.innerText.length - 9);

let rows = [...document.getElementsByTagName("tbody")[0].children]
.filter(x=>x.classList[0]!="day-split");
for (let i = 0; i < rows.length; i++) {
	let startTime = rows[i].children[0].innerText;
	let game = rows[i].children[1].innerText;
	let runners = rows[i].children[2].innerText;
	++i;
	let elapsed = rows[i].children[0].innerText;
	let emd = String.fromCharCode(8212);
	let categoryPlatform = rows[i].children[1].innerText.split(emd);
	let couch = rows[i].children[2].innerText;
	res += "\n";
	res += "\nt0 " + new Date(startTime).getTime() / 1000;
	res += "\ndt " + elapsed.substring(1);
	res += "\ngm " + game;
	if (categoryPlatform[0].length)
		res += "\nct " + categoryPlatform[0];
	if (categoryPlatform[1].length)
		res += "\npl " + categoryPlatform[1];
	res += "\nrn " + runners;
	if (couch.length)
		res += "\nch " + couch;
}
let ta = document.createElement("textarea");
ta.value = res + "\n\n";
h1.parentElement.insertBefore(ta, h1);

})();
