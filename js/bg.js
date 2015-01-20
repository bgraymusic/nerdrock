// 3:35 = 215 seconds
var songLength = 215;

function buildAlbums(discography) {
	for (var i = discography.length; i > 0; --i) {
		var album = discography[i-1];
		if ($('#bg-music .bg-album').length)
			$('#bg-music').append($('<hr/>'));

		var albumDiv = $('<div></div>').addClass('bg-album');
		var albumRow = $('<div></div>').addClass('bg-album-row');
		buildAlbumDiv(albumRow, album);
		albumDiv.append(albumRow);
		$('#bg-music').append(albumDiv);
	}
//	$('#bg-music').append($('<div id="bg-buy-dialog"></div>'));
	registerJQueryUI();
	navigateUI();
}

function buildAlbumDiv(albumRow, album) {
	var artCell = $('<div></div>').addClass('bg-album-art-cell');
	artCell.append($('<img></img>').addClass('bg-album-art').attr('src', album.small_art_url));
	albumRow.append(artCell);

	var albumContents = $('<div></div>').addClass('bg-album-content-cell');
	buildAlbumContents(albumContents, album);
	albumRow.append(albumContents);
}

function buildAlbumContents(albumContents, album) {
	albumContents.append($('<div></div>').addClass('bg-album-title').text(album.title));

	var albumAccordion = $('<div></div>').addClass('bg-album-accordion');
	buildAlbumAccordion(albumAccordion, album);
	albumContents.append(albumAccordion);
}

function buildAlbumAccordion(albumAccordion, album) {
	$(album.tracks).each(function() {
		var header = $('<div></div>').addClass('bg-accordion-header');
		buildAlbumAccordionHeader(header, this);
		albumAccordion.append(header);

		var body = $('<div></div>').addClass('bg-accordion-body');
		buildAlbumAccordionBody(body, this);
		albumAccordion.append(body);
	});
}

function buildAlbumAccordionHeader(header, track) {
	header.attr('song', mashTitle(track.title));
	var trackControls = $('<div></div>').addClass('bg-track-controls');
	buildTrackControls(trackControls, track);
	header.append(trackControls);
	header.append($('<div></div>').addClass('bg-track-name').text(track.title));
}

function mashTitle(title) {
	return title.toLowerCase().replace(/[\.,-\/#!$%\^&\*\?;:{}=\-_`~()]/g,"").replace(/\s+/g, "");
}

function buildTrackControls(controls, track) {
	controls.data('track', track);
	var player = $('<div></div>').jPlayer({
		ready: function(event) { $(this).jPlayer("setMedia", { mp3: track.streaming_url }); },
		timeupdate: function(event) {
			var slider = $(this).data('controls').find('.bg-track-shuttle-slider');
			if (!slider.data('sliding')) {
				slider.slider('value', event.jPlayer.status.currentTime);
				slider.prev().text($.jPlayer.convertTime(event.jPlayer.status.currentTime));
				markElapsedLyrics($(this).data('controls').closest('.bg-accordion-header').next().find('.bg-lyrics'), event.jPlayer.status.currentTime);
			}
		},
		ended: function(event) {
			var playButton = $(this).data('controls').find('.bg-track-play-pause-button');
			setPlayButton(playButton, true);
			var slider = $(this).data('controls').find('.bg-track-shuttle-slider');
			slider.slider('value', 0);
		},
		swfPath: 'swf', supplied: 'mp3', preload: 'none'
	}).data('controls', controls);
	controls.data('player', player);

	controls.append($('<button></button>')
		.addClass('bg-track-play-pause-button ui-icon ui-icon-play'));

	var shuttle = $('<div></div>').addClass('bg-track-shuttle');
	var shuttleTable = $('<div></div>').addClass('bg-track-shuttle-table');
	buildTrackShuttle(shuttleTable, track);
	controls.append(shuttle.append(shuttleTable));

	var volume = $('<div></div>').addClass('bg-track-volume');
	var volumeTable = $('<div></div>').addClass('bg-track-volume-table');
	buildTrackVolume(volumeTable, track);
	controls.append(volume.append(volumeTable));

// If you can "buy" at $0, does it make sense to have a separate download button?
// Maybe, if buying opens another page but downloading can be done directly
/*
	controls.append($('<button></button>')
		.addClass('bg-track-download-button ui-icon ui-icon-arrowthickstop-1-s'));
*/
	controls.append($('<a title="Buy "' + track.title + '" on BandCamp.com" href="' + Bandcamp.URL + track.url + '" target="_blank"></a>')
		.addClass('bg-track-buy-button ui-icon ui-icon-cart'));
}

function buildTrackShuttle(shuttle, track) {
	shuttle.append($('<div></div>').addClass('bg-track-shuttle-value').text($.jPlayer.convertTime(0)));
	shuttle.append($('<div></div>').addClass('bg-track-shuttle-slider').data('track', track));
	shuttle.append($('<div></div>').addClass('bg-track-shuttle-max')
		.text($.jPlayer.convertTime(track.duration)));
}

function buildTrackVolume(volume, track) {
	volume.append($('<div></div>').addClass('bg-track-volume-min ui-icon ui-icon-volume-off'));
	volume.append($('<div></div>').addClass('bg-track-volume-slider'));
	volume.append($('<div></div>').addClass('bg-track-volume-max ui-icon ui-icon-volume-on'));
}

function buildAlbumAccordionBody(body, track) {
	var tabs = $('<ul></ul>').addClass('bg-tabs-nav');
	tabs.append($('<li></li').append($('<a></a>').attr('href', '#' + track.track_id + 'lyrics').text('Lyrics')));
	tabs.append($('<li></li').append($('<a></a>').attr('href', '#' + track.track_id + 'notes').text('Notes')));
	body.append(tabs);

	var elapsedSpan = $('<span></span>').addClass('bg-lyrics-elapsed');
	var nowSpan = $('<span></span>').addClass('bg-lyrics-now');
	var unelapsedSpan = $('<span></span>').addClass('bg-lyrics-unelapsed');
	var info = trackInfo[track.track_id];

	if (info && info.lyrics)
		unelapsedSpan.html(trackInfo[track.track_id].lyrics);
	else
		unelapsedSpan.html(track.lyrics);
	var lyrics = $('<div></div>').attr('id', track.track_id + 'lyrics').addClass('bg-lyrics').data('lyrics', track.lyrics).data('track', track);
	lyrics.append(elapsedSpan).append(nowSpan).append(unelapsedSpan);
	body.append(lyrics);

	if (info && info.notes)
		body.append($('<div></div>').addClass('bg-track-notes').attr('id', track.track_id + 'notes').html(trackInfo[track.track_id].notes));
	else
		body.append($('<div></div>').attr('id', track.track_id + 'notes').html(track.about));

	if (info && info.tab) {
		tabs.append($('<li></li').append($('<a></a>').attr('href', '#' + track.track_id + 'tab').text('Tablature')));
		body.append($('<div></div>').attr('id', track.track_id + 'tab').addClass('vex-tabdiv').attr('scale', '2').attr('width', '600').html(info.tab));
	}
	if (info && info.score) {
		tabs.append($('<li></li').append($('<a></a>')
			.attr('href', '#' + track.track_id + 'score').text('Score')));
		body.append($('<div></div>').attr('id', track.track_id + 'score')
			.addClass('vex-tabdiv').attr('scale', '2').attr('width', '600').html(info.score));
	}
}

function registerJQueryUI() {
	$('.bg-top-level-tabs').tabs();
	var accordions = $('.bg-album-accordion').accordion({
		collapsible: true, active: false, heightStyle: 'content',
		beforeActivate: function(event, ui) {
			$('.bg-album-accordion').each(function() {
				if (this != event.target)
					$(this).accordion('option', 'active', false);
			});
		}
	});
	$('#bg-buy-dialog').dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		appendTo: '#bg-top-level-tabs',
		draggable: false
	});
	$('.ui-dialog-titlebar-close').tooltip({ disabled: true });
	$('#bg-contents .bg-track-play-pause-button').button().click(function(event) {
		event.stopPropagation();
		if ($(this).hasClass('ui-icon-play')) {
			$(this).parent().data('player').jPlayer('pauseOthers');
			$(this).parent().data('player').jPlayer('play');
			setPlayButton(this, false);
		} else {
			$(this).parent().data('player').jPlayer('pause');
			setPlayButton(this, true);
		}
	});
	$('#bg-contents .bg-track-shuttle-slider').each(function() {
		$(this).slider({
			range: 'min', min: 0, max: Math.floor($(this).data().track.duration), value: 0,
			start: function(event, ui) {
				$(this).data('sliding', true);
			},
			slide: function(event, ui) {
				$(this).prev().text($.jPlayer.convertTime(ui.value));
				markElapsedLyrics($(this).closest('.bg-accordion-header').next().find('.bg-lyrics'), ui.value);
			},
			stop : function(event, ui) {
				var player = $(this).parent().parent().parent().data('player');
				if (player.data().jPlayer.status.paused) {
					player.jPlayer('pause', ui.value);
				} else {
					player.jPlayer('play', ui.value);
				}
				$(this).data('sliding', false);
			},
			animate: 'fast'
		});
	});
	$('#bg-contents .bg-track-volume-slider')
		.slider({
			range: 'min', min: 0, max: 100, value: 100, animate: 'fast',
			slide: function(event, ui) {
				var player = $(this).parent().parent().parent().data('player');
				player.jPlayer('volume', ui.value/100);
			}
		});
/*
	$('#bg-contents .bg-track-download-button')
		.button().click(function(event) { event.stopPropagation(); });
*/
	$('#bg-contents .bg-track-buy-button').button().click(function(event) {
/*
		var dialog = $('#bg-buy-dialog');
		dialog.empty();
		dialog.append($('<iframe src="/bc' + $(this).parent().data('track').url + '?action=buy"></iframe>'));
		dialog.dialog('option', 'title', 'Buy ' + $(this).parent().data('track').title);
		dialog.dialog('option', 'position', { my: 'right top', at: 'left top', of: $(this) });
		dialog.dialog('open');
*/
		event.stopPropagation();
	});
	$('#bg-contents .bg-accordion-body').tabs();

	$('#bg-github').repo({ user: 'bgraymusic', name: 'nerdrock' });

	$(document).tooltip();

	try {
		Vex.Flow.TabDiv.start();
	} catch(e) {
//		window.alert('Error starting up VexFlow.');
	}
}

function navigateUI() {
	if ($.url().param('toptab')) {
		$('#bg-top-level-tabs').tabs('option', 'active', $.url().param('toptab'));
	}
	if ($.url().param('song')) {
		$('.bg-album-accordion').each(function() {
			var header = $(this).find('.bg-accordion-header[song=' + mashTitle($.url().param('song')) + ']');
			var index = $(this).find('.bg-accordion-header').index(header);
			if (index >= 0) {
				$(this).accordion('option', 'active', index);
				$('#bg-contents').animate({ scrollTop: header.position().top }, 1000);
			}
		});
	}
}

function setPlayButton(button, play) {
	if (play) {
		$(button).removeClass('ui-icon-pause');
		$(button).addClass('ui-icon-play');
		$(button).css('background-position-x', '0px');
	} else {
		$('#bg-contents .bg-track-play-pause-button').each(function() {
			$(this).removeClass('ui-icon-pause');
			$(this).addClass('ui-icon-play');
			$(this).css('background-position-x', '0px');
		});
		$(button).removeClass('ui-icon-play');
		$(button).addClass('ui-icon-pause');
		$(button).css('background-position-x', '-17px');
	}
}

function markElapsedLyrics(lyrics, time) {
	var trackId = lyrics.data('track').track_id;
	if (!trackInfo[trackId] || !trackInfo[trackId].lyrics)
		return;

	var elapsedLyrics = lyrics.find('.bg-lyrics-elapsed');
	var currentLyrics = lyrics.find('.bg-lyrics-now');
	var futureLyrics = lyrics.find('.bg-lyrics-unelapsed');
	if (trackInfo[trackId].timing) {
		var highTime;
		for (highTime = 0; highTime < trackInfo[trackId].timing.length; ++highTime) {
			if (time < trackInfo[trackId].timing[highTime]) break;
		}
		var tokens = trackInfo[trackId].lyrics.split('\u200C');
		elapsedLyrics.html(tokens.slice(0, highTime).join(''));
		currentLyrics.html(tokens[highTime]);
		futureLyrics.html(tokens.slice(highTime + 1).join(''));
	} else if (trackInfo[trackId].syllables) {
		var highTime;
		for (highTime = 0; highTime < trackInfo[trackId].syllables.length; ++highTime) {
			if (time < trackInfo[trackId].syllables[highTime][0]) break;
		}
		elapsedLyrics.html(trackInfo[trackId].lyrics.substring(0, trackInfo[trackId].syllables[highTime-1][1]));
		currentLyrics.html(trackInfo[trackId].lyrics.substring(trackInfo[trackId].syllables[highTime-1][1], trackInfo[trackId].syllables[highTime][1]));
		futureLyrics.html(trackInfo[trackId].lyrics.substring(trackInfo[trackId].syllables[highTime][1]));
	}
}
