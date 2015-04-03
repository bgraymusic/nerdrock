var BG = BG || {};

BG.Album = function(discography, bcInfo) {
	this.discography = discography;

	for (var prop in bcInfo) { this[prop] = bcInfo[prop]; }
//	this.workingTracks = this.tracks.slice(0);
	this.masterTracks = [];
	this.workingTracks = [];

	// Important HTML DOM elements
	this.cont = undefined;
	this.accordion = undefined;

	return this;
}

// Classes applied to elements for styling
BG.Album.css = {
	cont: 'bg-album', row: 'bg-album-row', meta: {
		cont: 'bg-album-meta-cell', art: 'bg-album-art',
		onesong: 'bg-onesong-button', repeat: 'bg-repeat-button', shuffle: 'bg-shuffle-button'
	}, content: {
		cont: 'bg-album-content-cell', title: 'bg-album-title', accordion: 'bg-album-accordion'
	}
}

BG.Album.getFromElement = function(element) {
	var cont = $(element).closest('.'+BG.Album.css.cont);
	if (cont.length) return cont.data().album;
	else return null;
}

// We're styling this stuff as a table, so assume we start with a table and add divs as if they were
// rows, cells, etc
BG.Album.prototype.buildDOM = function(albumTable) {
	this.cont = albumTable;
	$(this.cont).empty();
	$(this.cont).data().album = this;

	var albumRow = $('<div/>').addClass(BG.Album.css.row);
	this.cont.append(albumRow);

	var metaCell = $('<div/>').addClass(BG.Album.css.meta.cont);
	albumRow.append(metaCell);
	this.buildMetaCell(metaCell);

	var albumContents = $('<div/>').addClass(BG.Album.css.content.cont);
	albumRow.append(albumContents);
	this.buildAlbumContents(albumContents);
}

BG.Album.prototype.buildMetaCell = function(metaCell) {
	metaCell.append($('<img/>').addClass(BG.Album.css.meta.art).attr('src', this.small_art_url));

	metaCell.append($('<br/>'));

	metaCell.append($('<input/>').attr('type', 'checkbox').attr('id', this.album_id + '_onesong')
		.addClass(BG.Album.css.meta.onesong));
	metaCell.append($('<label/>').attr('for', this.album_id + '_onesong').text('Stop playing after song'));
	metaCell.append($('<input/>').attr('type', 'checkbox').attr('id', this.album_id + '_repeat')
		.addClass(BG.Album.css.meta.repeat));
	metaCell.append($('<label/>').attr('for', this.album_id + '_repeat').text('Repeat Album'));
	metaCell.append($('<input/>').attr('type', 'checkbox').attr('id', this.album_id + '_shuffle')
		.addClass(BG.Album.css.meta.shuffle));
	metaCell.append($('<label/>').attr('for', this.album_id + '_shuffle').text('Shuffle Album'));
}

BG.Album.prototype.buildAlbumContents = function(albumContents) {
	albumContents.append($('<div/>').addClass(BG.Album.css.content.title).text(this.title));

	this.accordion = $('<div/>').addClass(BG.Album.css.content.accordion);
	albumContents.append(this.accordion); 
	this.buildAlbumAccordion(this.accordion);
}

BG.Album.prototype.buildAlbumAccordion = function(albumAccordion) {
	var album = this;
	$(this.tracks).each(function() {
		var track = new BG.Track(album, this, trackInfo[this.track_id]);
		album.masterTracks.push(track);
		album.workingTracks.push(track);
		var header = $('<div/>').addClass(BG.Track.css.hdr.cont);
		var body = $('<div/>').addClass(BG.Track.css.body.cont);
		albumAccordion.append(header);
		albumAccordion.append(body);
		track.buildDOM(header, body);
	});
}

BG.Album.registerJQueryUI = function() {
	$('.'+BG.Album.css.meta.onesong).button({ icons: { primary: 'ui-icon-arrowthickstop-1-e' }, text: false });
	$('.'+BG.Album.css.meta.repeat).button({ icons: { primary: 'ui-icon-refresh' }, text: false });
	$('.'+BG.Album.css.meta.shuffle).button({ icons: { primary: 'ui-icon-shuffle' }, text: false }).click(function(event) {
		event.stopPropagation();
		var album = BG.Album.getFromElement($(this));
		if (this.checked) BG.Album.shuffle(album.workingTracks);
		else album.workingTracks = album.masterTracks.slice(0);
		var step = 0;
		$(album.workingTracks).each(function() { setTimeout(BG.Album.shuffleStart, 33*step, album.accordion, this); ++step; });
	});

	$('.'+BG.Album.css.content.accordion).accordion({
		collapsible: true, active: false, heightStyle: 'content', beforeActivate: function(event, ui) {
			$('.'+BG.Album.css.content.accordion).each(function() {
				if (this != event.target) $(this).accordion('option', 'active', false);
			});
		}
	});

	BG.Track.registerJQueryUI();
}

BG.Album.shuffleStart = function(accordion, track) {
//	$(accordion).append(track.hdr, track.body);
//	accordion.accordion('refresh');
	$(track.hdr).hide({ effect: 'highlight', color: '#599fcf', complete: function() {
		$(accordion).append(track.hdr, track.body);
		$(track.hdr).show('highlight', { color: '#599fcf' } );
	}});
}

BG.Album.shuffle = function(array) {
	var m = array.length, t, i;
	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);
		// And swap it with the current element.
		t = array[m]; array[m] = array[i]; array[i] = t;
	}
}