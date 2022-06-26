(function() {
let res = "";

for (let row of [...document.getElementsByTagName("tbody")[0].children]) {
	row = row.children;
	res += "\ngm " + row[0].innerText;
	res += "\nln " + row[0].children[0].href;
	let players = row[1].innerText.split(", ");
	for (let p of players) {
		res += "\nrn " + p;
	}
	let desc = row[2].innerText;
	if (desc.length) {
		res += "\nds " + desc.length;
		res += "\n" + desc;
	}
	res += "\nt0 " + new Date(row[3].innerText).getTime()/1000;
	res += "\nt2 " + new Date(row[4].innerText).getTime()/1000;
	res += "\nbd " + (row[5].innerText == "No" ? 0 : 1);
	res += "\n";
}

let ta = document.createElement("textarea");
ta.value = res;
document.getElementsByClassName("tracker--eventlist")[0].appendChild(ta);
})();
