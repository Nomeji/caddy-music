// if you have better idea try #qa @ irc.lolicore.org

var playarrow = "▶";
var sortup = "▲";
var sortdn = "▼";

function table_sort(table,column,asc) {
	var pattern = /<tr><td.*?><.+?>(.+?)<\/a><\/td><td><.+?>[^ ]+ (.+?) (..)<\/a><\/td><td>(.+?)<\/td><\/tr>/g;
	var files = [];
	var dirs = [];
	var match;
	var tb = table.getElementsByTagName("tbody")[0];
	rt = tb.innerHTML;

	while (match = pattern.exec(rt)) {
		if (match[1].indexOf("/") >= 0)
			dirs.push(match);
		else
			files.push(match);
	}

	var scale = {
		"GB": 1024*1024,
		"MB": 1024,
		"KB": 1
	}

	function wrapnum(n) {
		var m = n.match(/^([0-9]+)(.*)/);
		if (!m) return n;
		var n = m[1];
		while (n.length < 8)
			n = '0' + n
		return n + m[2];
	}

	var cmpfun = function(a,b) {
		if (a[1].match("Parent directory"))
			return -1;
		if (b[1].match("Parent directory"))
			return 1;
		if (asc) {
			var t = a;
			a = b;
			b = t;
		}
		if (column == 0) {
			var x = wrapnum(a[1]);
			var y = wrapnum(b[1]);
			if (x > y)
				return 1;
			if (x < y)
				return -1;
			return 0;
		}
		if (column == 2) {
			if (a[4] > b[4])
				return 1;
			if (a[4] < b[4]);
				return -1;
			return 0;
		}
		if (column == 1)
			return parseFloat(a[2]) * scale[a[3]] -
				parseFloat(b[2]) * scale[b[3]];
	}
	dirs.sort(cmpfun);
	files.sort(cmpfun);
	var i;
	var res = [];
	for (i = 0; i < dirs.length; i++)
		res.push(dirs[i][0]);
	for (i = 0; i < files.length; i++)
		res.push(files[i][0]);
	tb.innerHTML = res.join("").replace(/▶/g, "");
}

function do_sort(t, col) {
	// var asc;
	// if (col === undefined) {
	// 	col = parseInt(localStorage.sortcolumn||"0");
	// }
	// var hdr = t.getElementsByTagName("th");
	// var i;
	// if (hdr[col].innerHTML.indexOf(sortup) >= 0) {
	// 	asc = false;
	// } else if (hdr[col].innerHTML.indexOf(sortdn) >= 0) {
	// 	asc = true;
	// } else {
	// 	asc = JSON.parse(localStorage.sortdir || "false");
	// }
	// localStorage.sortdir = asc;
	// localStorage.sortcolumn = col;

	// for (i = 0; i < 3; i++) {
	// 	hdr[i].innerHTML =
	// 		hdr[i].innerHTML.replace(sortup,"").replace(sortdn, "")
	// }
	// hdr[col].innerHTML = hdr[col].innerHTML + (asc?sortup:sortdn);
	// table_sort(t, col, asc);
	console.log("hook player");
	setTimeout(hook_player, 0);
}

function toggle_sort(t,col) {
	var hdr = t.getElementsByTagName("th");
	hdr[col].addEventListener('click', function() { do_sort(t, col); });
}

function hook_sort(t) {
	var i;
	for (i = 0; i < 3; i++)
		toggle_sort(t,i);
}

var tracks = [];
var current = 0;
var haveplayer = false;

function jump_dir() {
	if (document.location.pathname == "/") {
		localStorage.removeItem('autoplay');
		localStorage.removeItem('lastdir');
		return;
	}
	var url = document.location.href.split('#')[0];
	localStorage.lastdir = url.substr(url.substr(0,url.length-1).lastIndexOf('/') + 1);
	document.location.href = "..";
}

var lastdir;
function hook_player() {
	var playnow = false;
	var i, links = document.querySelectorAll('tr td a');
	var havemp3 = false;
	tracks = [];
	for (i = 0; i < links.length; i++) {
		var l = links[i];
		//var h = links[i-1].href;
		// if (lastdir && h.substr(h.length - lastdir.length) == lastdir) {
		// 	if (l.href.substr(l.href.length-1) == "/") {
		// 		localStorage.autoplay = "1";
		// 		document.location = l.href;
		// 		return;
		// 	}
		// }
		if (l.href.match(/\.(mp3|ogg|wav|flac|m4a)$/i)) {
			havemp3 = true;
			l.insertAdjacentHTML('afterbegin', playarrow);
			l.parentNode.className = "playable";
			(function(l) {
				l.parentNode.addEventListener('click', function (e) {
					e.preventDefault();
					set_current(tracks.indexOf(l));
				})
			})(l);
			var hv = '/' + document.location.hash.substr(1);
			try {
				hv = decodeURIComponent(hv);
			} catch (e) {};

			var sv = l.href;
			try {
				sv = decodeURIComponent(sv);
			} catch (e) {};
			sv = sv.substr(sv.length - hv.length);
//			hv = decodeURIComponent(hv);
//			sv = decodeURIComponent(sv);
//			console.log(hv);
//			console.log(sv);
			if (hv == sv) {
				current = tracks.length;
				playnow = true;
			}
			tracks.push(l);
		}
	}
	if (!havemp3) {
/*		if (localStorage.autoplay)
			jump_dir();*/
		return;
	}
	var pl = document.getElementById('player');
	if (!haveplayer) {
		pl.innerHTML = "<div id='player'><a href='/random'><button>random</button></a><button id='back'>&lt;&lt;</button><button id='forward'>&gt;&gt;</button><input type=checkbox id=gonext>Repeat<br><audio id='audio' controls></audio></div>";
	}
	var gonext = document.getElementById('gonext');
	var audio = document.getElementById('audio');
	var forward = document.getElementById('forward');
	var back = document.getElementById('back');
	if (!haveplayer) {
		var bc
		if (window.BroadcastChannel) {
			bc = new BroadcastChannel('play_notify');
			bc.onmessage = function(ev) {
				audio.pause();
			}
		}
		gonext.checked = !JSON.parse(localStorage.gonext || "false");
		gonext.addEventListener('click', function() {
			localStorage.gonext = !gonext.checked;
		})
		audio.addEventListener('play', function() {
			if (bc) bc.postMessage('playing');
			var e = tracks[current].parentNode;
			e.className = 'current';
			if (e.scrollIntoViewIfNeeded)
				e.scrollIntoViewIfNeeded(true);
		})
		audio.addEventListener('error', function(e) {
			setTimeout(fwd, 5000);
		});

		function fwd() {
			var ntr = (current + 1) % tracks.length;
			if (ntr == 0 && !gonext.checked) {
				jump_dir();
				return;
			}
			set_current(ntr);
		}

		audio.addEventListener('ended', function() {
			fwd();
		})
		forward.addEventListener('click', function() {
			fwd();
		})

		back.addEventListener('click', function() {
			set_current((tracks.length + current - 1) % tracks.length);
		})
		audio.src = tracks[current].href;
		if (localStorage.autoplay || (playnow)) {
			localStorage.removeItem('autoplay');
			audio.play();
		}
	}
	haveplayer = true;

	function set_current(n) {
		tracks[current].parentNode.className = 'playable';
		current = n;
		var hr = tracks[current].href;
		audio.src = hr;
		var hv = hr.substr(hr.lastIndexOf('/') + 1);
		history.replaceState(undefined, undefined, "#" + hv)
		audio.play();
	}
}

var gcse_spawned = false;
function spawn_gcse() {
    //console.log('gcse is', localStorage.search);
    var elm = document.getElementById('___gcse_0');
    if (!JSON.parse(localStorage.search || 'false')) {
	//console.log(elm);
	if (elm) elm.style.display = 'none';
	return;
    }
    if (gcse_spawned) {
       elm.style.display = 'block';
       return;
    }
    gcse_spawned = true;
    var cx = '016548008962335046113:f5uta2tifn4';
    var gcse = document.createElement('script');
    gcse.type = 'text/javascript';
    gcse.async = true;
    gcse.src = 'https://cse.google.com/cse.js?cx=' + cx;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(gcse, s);
}

document.addEventListener('DOMContentLoaded', function () {
	var tab = document.getElementsByTagName('table')[0];
	lastdir = localStorage.lastdir;
	localStorage.removeItem('lastdir');
	hook_sort(tab);
	do_sort(tab);
	var last = tab.getElementsByTagName('th')[3]
	last.innerHTML="<span id='srch'>&#x1F50D;</span>";
    	var srch = document.getElementById('srch');
	srch.addEventListener('click', function(e) {
	    localStorage.search = !JSON.parse(localStorage.search || 'false');
	    spawn_gcse();
	});
	spawn_gcse();
});



