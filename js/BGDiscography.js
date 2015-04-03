var BG = BG || {};

BG.Discography = function(bcInfo) {
	this.albums = bcInfo;
	this.bgAlbums = [];

	// Important HTML DOM elements
	this.cont = undefined;

	return this;
}

// Classes applied to elements for styling
BG.Discography.css = { cont: 'bg-music' }

BG.Discography.getFromElement = function(element) {
	var discography = $('#'+BG.Discography.css.cont);
	if (discography.length) return discography.data().discography;
	else return null;
}

BG.Discography.prototype.buildDOM = function(musicDiv) {
	this.cont = musicDiv;
	$(this.cont).empty();
	$(this.cont).data().discography = this;
	var discography = this;
	$(this.albums.reverse()).each(function() {
 		if ($('.'+BG.Album.css.cont).length) $(musicDiv).append($('<hr/>'));
 		var album = new BG.Album(discography, this);
 		discography.bgAlbums.push(album);
 		var albumDiv = $('<div/>').addClass(BG.Album.css.cont);
 		$(musicDiv).append(albumDiv);
 		album.buildDOM(albumDiv);
	});
}

BG.Discography.registerJQueryUI = function() {
	BG.Album.registerJQueryUI();
}
