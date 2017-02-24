var BG = BG || {};

BG.Track = function(album, bcInfo, bgInfo) {
	this.album = album;
	this.player = undefined;

	// Merge incoming info, overwriting any BandCamp data with local data of same name
	for (var prop in bcInfo) { this[prop] = bcInfo[prop]; }
	for (var prop in bgInfo) { this[prop] = bgInfo[prop]; }

	// Important HTML DOM elements
	this.hdr = undefined;
	this.body = undefined;

	return this;
}

// Classes applied to elements for styling
BG.Track.css = {
	hdr: {
		cont: 'bg-accordion-header', name: 'bg-track-name', name_text: 'bg-track-name-text', player: 'bg-track-player',
		controls: {
			cont: 'bg-track-controls', play: 'bg-track-play-pause-button',
			shuttle: {
				cont: 'bg-track-shuttle', table: 'bg-track-shuttle-table',
				value: 'bg-track-shuttle-value', slider: 'bg-track-shuttle-slider', max: 'bg-track-shuttle-max'
			}, vol: {
				cont: 'bg-track-volume', table: 'bg-track-volume-table',
				min: 'bg-track-volume-min', slider: 'bg-track-volume-slider', max: 'bg-track-volume-max'
			}, buy: 'bg-track-buy-button'
		}
	}, body: {
		cont: 'bg-accordion-body',
		lyr: { cont: 'bg-lyrics', elapsed: 'bg-lyrics-elapsed', now: 'bg-lyrics-now', unelapsed: 'bg-lyrics-unelapsed' },
		notes: 'bg-track-notes', media: 'bg-track-media', tab: 'vex-tabdiv', score: 'vex-tabdiv'
	}
}

BG.Track.getFromElement = function(element) {
	var hdr = $(element).closest('.'+BG.Track.css.hdr.cont);
	var body = $(element).closest('.'+BG.Track.css.body.cont);
	if (hdr.length) return hdr.data().track;
	else if (body.length) return body.data().track;
	else return null;
}

BG.Track.prototype.buildDOM = function(hdr, body) {
	this.hdr = hdr;
	this.body = body;
	$(hdr).data().track = this;
	$(body).data().track = this;
	this.buildHeader();
	this.buildBody();
}

BG.Track.prototype.buildHeader = function() {
//	this.hdr.attr('title', this.title);
	this.hdr.attr('song', BG.Track.mashTitle(this.title));
	var controls = $('<div/>').addClass(BG.Track.css.hdr.controls.cont);
	this.hdr.append(controls);
	this.buildControls(controls);
	this.hdr.append($('<div/>').addClass(BG.Track.css.hdr.name).append(
		$('<span/>').addClass(BG.Track.css.hdr.name_text).text(this.title)
	));
}

BG.Track.mashTitle = function(title) {
	return title.toLowerCase().replace(/[\.,-\/#!$%\^&\*\?;:{}=\-_'`~()]/g,"").replace(/\s+/g, "");
}

BG.Track.prototype.buildControls = function(controls) {
	this.player = $('<div/>').addClass(BG.Track.css.hdr.player).data('controls', controls);
	this.buildPlayer();

	controls.append($('<button/>').addClass(BG.Track.css.hdr.controls.play));

	var shuttle = $('<div/>').addClass(BG.Track.css.hdr.controls.shuttle.cont);
	var shuttleTable = $('<div/>').addClass(BG.Track.css.hdr.controls.shuttle.table);
	controls.append(shuttle.append(shuttleTable));
	this.buildTrackShuttle(shuttleTable);

	var vol = $('<div/>').addClass(BG.Track.css.hdr.controls.vol.cont);
	var volTable = $('<div/>').addClass(BG.Track.css.hdr.controls.vol.table);
	controls.append(vol.append(volTable));
	this.buildTrackVolume(volTable);

	controls.append($('<button/>').addClass(BG.Track.css.hdr.controls.buy)
		.attr('title', 'Buy "' + this.title + '" on BandCamp.com').data('href', Bandcamp.URL + this.url));
}

BG.Track.prototype.buildPlayer = function() {
	this.player.jPlayer({
		ready: function(event) {
			var track = BG.Track.getFromElement($(this).data().controls);
			$(this).jPlayer('setMedia', { mp3: track.streaming_url });
			$(this).data('track', track);
			$(this).data('slider', track.hdr.find('.'+BG.Track.css.hdr.controls.shuttle.slider));
			var lyrics = track.body.find('.'+BG.Track.css.body.lyr.cont);
			$(this).data('lyrics', lyrics);
			$(this).data('elapsedLyrics', lyrics.find('.'+BG.Track.css.body.lyr.elapsed));
			$(this).data('currentLyrics', lyrics.find('.'+BG.Track.css.body.lyr.now));
			$(this).data('futureLyrics', lyrics.find('.'+BG.Track.css.body.lyr.unelapsed));
		},
		ended: function(event) {
			window.clearInterval($(this).data().ticks);
			var track = BG.Track.getFromElement($(this).data().controls);
			var playButton = track.hdr.find('.'+BG.Track.css.hdr.controls.play);
			BG.Track.setPlayButton(track.hdr.find('.'+BG.Track.css.hdr.controls.play), true);
			var slider = track.hdr.find('.'+BG.Track.css.hdr.controls.shuttle.slider);
			slider.slider('value', 0);
			slider.prev().text($.jPlayer.convertTime(0));
			var onesong = track.album.cont.find('.'+BG.Album.css.meta.onesong).prop('checked');
			var repeat = track.album.cont.find('.'+BG.Album.css.meta.repeat).prop('checked');
			if (!onesong) {
				var idx = $.inArray(track, track.album.workingTracks);
				var targetTrack;
				if (idx >= 0 && idx < track.album.workingTracks.length - 1) {
					targetTrack = track.album.workingTracks[idx+1];
				} else if (idx == track.album.workingTracks.length - 1 && repeat) {
					targetTrack = track.album.workingTracks[0];
				}
				targetTrack.player.data().jPlayer.stop();
				targetTrack.hdr.find('.'+BG.Track.css.hdr.controls.play).click();
			}
		},
		play: function(event) {
			var track = BG.Track.getFromElement($(this).data().controls);
			if (track.album.cont.find('.'+BG.Album.css.meta.follow).prop('checked')) {
				var idx = track.album.accordion.find('.bg-accordion-header').index(track.hdr);
				track.album.accordion.accordion('option', 'active', idx);
			}
			$(this).data('ticks', window.setInterval(BG.Track.playerTick, 10, this));
		},
		pause: function(event) {
			window.clearInterval($(this).data().ticks);
		},
		swfPath: 'swf', supplied: 'mp3', preload: 'none'
	});
}

BG.Track.prototype.buildTrackShuttle = function(shuttle) {
	shuttle.append($('<div/>').addClass(BG.Track.css.hdr.controls.shuttle.value).text($.jPlayer.convertTime(0)));
	shuttle.append($('<div/>').addClass(BG.Track.css.hdr.controls.shuttle.slider));
	shuttle.append($('<div/>').addClass(BG.Track.css.hdr.controls.shuttle.max)
		.text($.jPlayer.convertTime(this.duration)));
}

BG.Track.prototype.buildTrackVolume = function(vol) {
	vol.append($('<div/>').addClass(BG.Track.css.hdr.controls.vol.min).addClass('ui-icon ui-icon-volume-off'));
	vol.append($('<div/>').addClass(BG.Track.css.hdr.controls.vol.slider));
	vol.append($('<div/>').addClass(BG.Track.css.hdr.controls.vol.max).addClass('ui-icon ui-icon-volume-on'));
}

BG.Track.prototype.buildBody = function() {
	var tabs = $('<ul/>').addClass('bg-tabs-nav');
	this.body.append(tabs);

	if (this.lyrics) {
		tabs.append($('<li/>').append($('<a/>').attr('href', '#' + this.track_id + 'lyrics').text('Lyrics')));
		this.body.append($('<div/>')
			.attr('id', this.track_id + 'lyrics').addClass(BG.Track.css.body.lyr.cont)
			.append($('<span/>').addClass(BG.Track.css.body.lyr.elapsed))
			.append($('<span/>').addClass(BG.Track.css.body.lyr.now))
			.append($('<span/>').addClass(BG.Track.css.body.lyr.unelapsed).html(this.lyrics)));
	}

	if (this.about) {
		tabs.append($('<li/>').append($('<a/>').attr('href', '#' + this.track_id + 'notes').text('Notes')));
		this.body.append($('<div/>')
			.attr('id', this.track_id + 'notes').addClass(BG.Track.css.body.notes).html(this.about));
	}

	if (this.media) {
		tabs.append($('<li/>').append($('<a/>').attr('href', '#' + this.track_id + 'media').text('Media')));
		this.body.append($('<div/>').attr('id', this.track_id + 'media').addClass(BG.Track.css.body.media));
	}

/*
	if (this.tab) {
		tabs.append($('<li/>').append($('<a/>').attr('href', '#' + this.track_id + 'tab').text('Tablature')));
		this.body.append(
			$('<div/>').attr('id', this.track_id + 'tab').addClass(BG.Track.css.body.tab).attr('scale', '2')
				.attr('width', '600').html(this.tab)
		);
	}

	if (this.score) {
		tabs.append($('<li/>').append($('<a/>').attr('href', '#' + this.track_id + 'score').text('Score')));
		this.body.append(
			$('<div/>').attr('id', this.track_id + 'score').addClass(BG.Track.css.body.score).attr('scale', '2')
				.attr('width', '600').html(this.score)
		);
	}
*/
}

BG.Track.setPlayButton = function(button, play) {
	if (play) $(button).button('option', 'icons', { primary: 'ui-icon-play' });
	else {
		$('.'+BG.Track.css.hdr.controls.play).each(function() {
			$(button).button('option', 'icons', { primary: 'ui-icon-play' });
		});
		$(button).button('option', 'icons', { primary: 'ui-icon-pause' });
	}
}

BG.Track.playerTick = function(player) {
	var track = BG.Track.getFromElement($(player).data().controls);
// 	var slider = track.hdr.find('.'+BG.Track.css.hdr.controls.shuttle.slider);
// 	var lyrics = track.body.find('.'+BG.Track.css.body.lyr.cont);
	var time = $(player).data().jPlayer.status.currentTime;
	BG.Track.updateSlider($(player).data().slider, time);
	BG.Track.markElapsedLyrics(player, time);
}

BG.Track.updateSlider = function(slider, time) {
	if (!slider.data('sliding')) {
		slider.slider('value', time);
		slider.prev().text($.jPlayer.convertTime(time));
	}
}

BG.Track.markElapsedLyrics = function(player, time) {
	if (!$(player).data().lyrics.length) return;
//	var trackId = BG.Track.getFromElement(lyrics).track_id;
	var trackId = $(player).data().track.track_id;
	if (!trackInfo[trackId] || !trackInfo[trackId].lyrics || !trackInfo[trackId].timing)
		return;

	var elapsedLyrics = $(player).data().elapsedLyrics;
	var currentLyrics = $(player).data().currentLyrics;
	var futureLyrics = $(player).data().futureLyrics;
	var highTime;
	for (highTime = 0; highTime < trackInfo[trackId].timing.length; ++highTime) {
		if (time < trackInfo[trackId].timing[highTime]) break;
	}
	var tokens = trackInfo[trackId].lyrics.split('\u200C');
	elapsedLyrics.html(tokens.slice(0, highTime).join(''));
	currentLyrics.html(tokens[highTime]);
	futureLyrics.html(tokens.slice(highTime + 1).join(''));
	if (debugLyricTimings) { console.log(trackInfo[trackId].timing[highTime] + ': ' + tokens[highTime]); }
}

BG.Track.registerJQueryUI = function() {
	$('.bg-track-play-pause-button').button({ icons: { primary: 'ui-icon-play' }, text: false }).click(function(event) {
		event.stopPropagation();
		var track = BG.Track.getFromElement(this);
		var isPlaying = $(this).button('option', 'icons').primary == 'ui-icon-pause';
		if (!isPlaying) {
			track.player.jPlayer('pauseOthers');
			$('.bg-track-play-pause-button').button('option', 'icons', { primary: 'ui-icon-play' });
		}
		track.player.jPlayer(isPlaying ? 'pause' : 'play');
		BG.Track.setPlayButton(this, isPlaying);
	});

	$('.bg-track-shuttle-slider').each(function() {
		$(this).slider({
			range: 'min', min: 0, max: Math.floor(BG.Track.getFromElement(this).duration), value: 0,
			start: function(event, ui) {
				$(this).data('sliding', true);
			},
			slide: function(event, ui) {
				$(this).prev().text($.jPlayer.convertTime(ui.value));
				BG.Track.markElapsedLyrics(BG.Track.getFromElement(this).player, ui.value);
			},
			stop: function(event, ui) {
				var player = BG.Track.getFromElement(this).player.data().jPlayer;
				if (player.status.paused) player.pause(ui.value);
				else player.play(ui.value);
				$(this).data('sliding', false);
			},
			animate: 'fast'
		});
	});

	$('.bg-track-volume-slider').slider({
			range: 'min', min: 0, max: 100, value: 100, animate: 'fast',
			slide: function(event, ui) { BG.Track.getFromElement(this).player.data().jPlayer.volume(ui.value / 100); }
		});

	$('.bg-track-buy-button').button({ icons: { primary: 'ui-icon-cart' }, text: false }).click(function(event) {
		event.stopPropagation();
		window.open($(this).data().href);
	});

	$('.bg-accordion-body').tabs({ activate: function(event, ui) { saveState(); } });

//	try { Vex.Flow.TabDiv.start(); } catch(e) { console.log('Error starting up VexFlow.'); }
}
