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

var BG = BG || {};

BG.Badges = function() {
	this.spec = {
		'1646334178': { id: 'jcc', img: 'img/jcc_boat.svg', title: 'Sea Monkey', aid: 24668382 },
		'-1309368522': { id: 'patreon', img: 'img/patreon_logo.png', title: 'Patron', aid: 3599490148 },
		'-1883201621': { id: 'spintunes', img: 'img/spintunes_starburst.gif', title: 'Spin Tuner', aid: 444214854 },
		'113796': { id: 'sfw', img: 'img/safety.png', title: 'Safe for Work' }
	};
	this.badges = [];

	return this;
}

BG.Badges.getHashForCode = function(code) { return code.toLowerCase().hashCode().toString(); }

BG.Badges.registerJQueryUI = function() {
	$('#bg-cannot-save-badges-alert').dialog({ autoOpen: false, resizable: false, modal: true, buttons: {
		'Don\'t tell me what to do': function() { $(this).dialog('close'); },
		'Ok': function() { $(this).dialog('close'); }
	}});
	$('#bg-new-badge-alert').dialog({ autoOpen: false, resizable: false, modal: true, buttons: {
		'Woo-hoo!': function() { $(this).dialog('close'); },
		'Just Ok': function() { $(this).dialog('close'); }
	}});
	$('#bg-nsfw-alert').dialog({ autoOpen: false, resizable: false, modal: true, width: 400, buttons: {
		'Stay Safe': function() { $(this).dialog('close'); },
		'Enter NSFW Mode': function() {
			var idx = badges.badges.indexOf('113796');
			if (idx > -1) {
				badges.badges.splice(idx, 1);
				badges.store();
			}
			$(this).dialog('close');
			discography.albums.reverse();
			bgInit();
			badges.draw();
		}
	}});
}

BG.Badges.prototype.bootstrap = function() {
	this.loadFromStorage();
	BG.Badges.registerJQueryUI();
	var newBadges = this.loadFromQueryString();
	this.store(newBadges.length > 0);
	this.draw();
}

BG.Badges.prototype.hasBadges = function() { return !!this.badges.length; }

BG.Badges.prototype.hasBadge = function(id) {
	var spec = this.spec;
	var found = false;
	$.each(this.badges, function() { if (spec[this].id === id) found = true; });
	return found;
}

BG.Badges.prototype.hasBadgeForCode = function(id) {
	$.each(this.badges, function() { if (this.id === id) return true; });
	return false;
}

BG.Badges.prototype.loadFromStorage = function() {
	if (typeof(Storage) !== 'undefined') {
		if (!localStorage.getItem('badges')) this.badges = [];
		else this.badges = JSON.parse(localStorage.getItem('badges'));
	} else badges = [];
}

BG.Badges.prototype.loadFromQueryString = function() {
	var queryBadges = $.url().param('badges') ? $.url().param('badges').split(',') : [];
	var newBadges = [];
	var obj = this;
	$.each(queryBadges, function() {
		var hash = BG.Badges.getHashForCode(this);
		if (obj.badges.indexOf(hash) === -1 && obj.spec[hash]) {
			newBadges.push(hash);
			obj.addNewBadge(this);
		}
	});
	return newBadges;
}

BG.Badges.prototype.store = function(gotNewBadges) {
	try {
		if (typeof(Storage) !== 'undefined') {
			localStorage.setItem('badges', JSON.stringify(this.badges));
		} else if (gotNewBadges) {
			$('#bg-cannot-save-badges-alert').dialog('open');
		}
	} catch(e) { /* can't store, NBD */ }
}

BG.Badges.prototype.addNewBadge = function(code) {
	var hash = BG.Badges.getHashForCode(code);
	if (this.badges.indexOf(hash) === -1 && this.spec[hash]) {
		this.badges.push(hash);
		this.store();
		this.close();
		this.draw();
		$('#bg-new-badge-icon').attr('src', this.spec[hash].img);
		$('#bg-new-badge-msg').text(this.spec[hash].title);
		$('#bg-new-badge-alert').data('badge', this.spec[hash]);
		$('#bg-new-badge-alert').dialog('open');
		var aid = this.spec[hash].album;
		if (aid) {
			var album = { album_id: aid };
			bc.getAlbum(album);
			discography.addAlbum(album);
			discography.addAlbumDOM(album);
		}
	}
}

BG.Badges.prototype.close = function() {
	$('#bg-add-badge-button').button().trigger('click');
}

BG.Badges.prototype.draw = function() {
	$('#bg-badges').empty();
//	$('#bg-badges').text('Badges: ');
	var obj = this;
	$.each(this.badges, function() {
		$('#bg-badges').append($('<img/>').attr('id', 'badge-' + obj.spec[this].id)
		                                  .attr('src', obj.spec[this].img).attr('title', obj.spec[this].title));
		$('#bg-badges').append($('<br/>'));
	});
// 	$('#bg-badges').append($('<label/>').attr('for', 'bg-add-badge-button').text('Add new badge...'));
// 	$('#bg-badges').append($('<input/>').attr('type', 'checkbox').attr('id', 'bg-add-badge-button'));
// 
// 	$('#bg-add-badge-button').button({ icons: { primary: 'ui-icon-plus' }, text: false }).click(function(event) {
// 		event.stopPropagation();
// 		if (this.checked) { $('#bg-add-badge-value').val(''); $('#bg-add-badge-dialog').removeClass('bg-hide'); }
// 		else $('#bg-add-badge-dialog').addClass('bg-hide');
// 	});
}
