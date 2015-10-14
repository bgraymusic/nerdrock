var blogroot = 'https://briangraymusic.wordpress.com';
var discography;

// Used to detect initial (useless) popstate.
// If history.state exists, assume browser isn't going to fire initial popstate.
var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var badgeSpec = {
	// seamonkey
	'1646334178': { id: 'jcc', img: 'jcc_boat.svg' },
	// expecto
	'-1309368522': { id: 'patreon', img: 'patreon_logo.png' },
	// spintunes
	'-2114035591': { id: 'spintunes', img: 'spintunes_starburst.gif' }
};
var badges = [];

function assignBadges() {
	// Fetch existing badges
	if (typeof(Storage) !== 'undefined') {
		if (!localStorage.getItem('badges')) localStorage.setItem('badges', JSON.stringify([]));
		badges = JSON.parse(localStorage.getItem('badges'));
	}

	var newBadgesMaybe = $.url().param('badges') ? $.url().param('badges').split(',') : [];
	var actualNewBadgeFound = false;
	$.each(newBadgesMaybe, function() {
		var hash = this.hashCode().toString();
		if (badges.indexOf(hash) === -1 && badgeSpec[hash]) {
			badges.push(hash);
			alert(badgeSpec[hash].id + ' found');
			actualNewBadgeFound = true;
		}
	});

	if (typeof(Storage) !== 'undefined') {
		localStorage.setItem('badges', JSON.stringify(badges));
	} else if (actualNewBadgeFound) {
		$('#bg-cannot-save-badges-alert').dialog('open');
	}
}

function onDataComplete(bcData) {
	new BG.Discography(bcData).buildDOM($('#'+BG.Discography.css.cont));
	registerGlobalJQueryUI();
	BG.Discography.registerJQueryUI();

	assignBadges();

	navigate({
		toptab: $.url().param('toptab'), blog: $.url().param('blog'),
		song: $.url().param('song'), songtab: $.url().param('songtab')
	});
}

function registerGlobalJQueryUI() {
//	$(document).tooltip();
	$('#bg-prefs-button').button();
	$('.bg-top-level-tabs').tabs({ activate: function(event, ui) { saveState(); } });
	$('#bg-github').repo({ user: 'bgraymusic', name: 'nerdrock' });
	$(window).bind('popstate', function(event) {
		// Ignore inital popstate that some browsers fire on page load
		var initialPop = !popped && location.href == initialURL;
		popped = true;
		if (!initialPop) {
			navigate({
				toptab: $.url().param('toptab'), blog: $.url().param('blog'),
				song: $.url().param('song'), songtab: $.url().param('songtab')
			});
		}
	});
	$('#bg-cannot-save-badges-alert').dialog({ autoOpen: false, resizable: false, modal: true, buttons: {
		'Don\'t tell me what to do': function() { $(this).dialog('close'); },
		'Ok': function() { $(this).dialog('close'); }
	}});
}

function saveState() {
	var state = {};
	state.toptab = $('#bg-top-level-tabs').tabs('option', 'active');
	$('.bg-album-accordion').each(function() {
		var idx = $(this).accordion('option', 'active');
		if (idx !== false) {
			var header = $(this).find('.bg-accordion-header')[idx];
			state.song = $(header).attr('song');
			state.songtab = $(header).next().tabs('option', 'active');
		}
	});
	var url = '?toptab=' + state.toptab;
	if (state.song !== undefined) url += '&song=' + state.song;
	if (state.songtab !== undefined) url += '&songtab=' + state.songtab;
	window.history.pushState(state, '', url);
}

// params: toptab(0-n), song(title), songtab(0-n), blog(relative path off blogroot)
function navigate(params) {
	if (params['toptab']) {
		$('#bg-top-level-tabs').tabs('option', 'active', params['toptab']);
	}
	if (params['song']) {
		$('.bg-album-accordion').each(function() {
			var header = $(this).find('.bg-accordion-header[song=' + BG.Track.mashTitle(params['song']) + ']');
			var index = $(this).find('.bg-accordion-header').index(header);
			if (index >= 0) {
				$(this).accordion('option', 'active', index);
				$('#bg-contents').animate({ scrollTop: header.position().top }, 1000);
				if (params['songtab']) header.next().tabs('option', 'active', params['songtab']);
			}
		});
	}
	$('#bg-blogframe').attr('src', blogroot + (params['blog'] ? params['blog'] : ''));
}
