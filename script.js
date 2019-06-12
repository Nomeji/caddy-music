// if you have better idea try #qa @ irc.lolicore.org
// This code was originaly created by someone from lolicore.org
// It doesn't belong to me.

var playarrow = "▶";

function do_sort(t, col) {
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
			if (hv == sv) {
				current = tracks.length;
				playnow = true;
			}
			tracks.push(l);
		}
		if (l.href.match(/cover\.(jpg|png)$/i)) {
			var img = document.createElement("img");
			img.src = l.href;
			img.alt = "cover"
			img.id = "cover"
			var listing = document.getElementsByClassName("listing")[0];
			listing.appendChild(img);
		}
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



