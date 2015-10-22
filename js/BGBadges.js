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
		'1646334178': { id: 'jcc', img: 'img/jcc_boat.svg', title: 'Sea Monkey' },
		'-1309368522': { id: 'patreon', img: 'img/patreon_logo.png', title: 'Patron' },
		'-1883201621': { id: 'spintunes', img: 'img/spintunes_starburst.gif', title: 'Spin Tuner' }
	};
	this.badges = [];

	return this;
}

BG.Badges.prototype.bootstrap = function() {
	this.loadFromStorage();
	var newBadges = this.loadFromQueryString();
	this.store(newBadges.length > 0);
	this.draw();
}

BG.Badges.getHashForCode = function(code) { return code.toLowerCase().hashCode().toString(); }

BG.Badges.prototype.hasBadge = function(id) {
	$.each(this.badges, function() { if (this.id === id) return true; });
	return false;
}

BG.Badges.prototype.hasBadgeForCode = function(id) {
	$.each(this.badges, function() { if (this.id === id) return true; });
	return false;
}

BG.Badges.prototype.loadFromStorage = function() {
	if (typeof(Storage) !== 'undefined') {
		if (!localStorage.getItem('badges')) localStorage.setItem('badges', JSON.stringify([]));
		this.badges = JSON.parse(localStorage.getItem('badges'));
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
	if (typeof(Storage) !== 'undefined') {
		localStorage.setItem('badges', JSON.stringify(this.badges));
	} else if (gotNewBadges) {
		$('#bg-cannot-save-badges-alert').dialog('open');
	}
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
		$('#bg-new-badge-alert').dialog('open');
	}
}

BG.Badges.prototype.close = function() {
	$('#bg-add-badge-button').button().trigger('click');
}

BG.Badges.prototype.draw = function() {
	$('#bg-badges').empty();
	$('#bg-badges').text('Badges: ');
	var obj = this;
	$.each(this.badges, function() {
		$('#bg-badges').append($('<img/>').attr('src', obj.spec[this].img).attr('title', obj.spec[this].title));
	});
	$('#bg-badges').append($('<label/>').attr('for', 'bg-add-badge-button').text('Add new badge...'));
	$('#bg-badges').append($('<input/>').attr('type', 'checkbox').attr('id', 'bg-add-badge-button'));

	$('#bg-add-badge-button').button({ icons: { primary: 'ui-icon-plus' }, text: false }).click(function(event) {
		event.stopPropagation();
		if (this.checked) { $('#bg-add-badge-value').val(''); $('#bg-add-badge-dialog').removeClass('bg-hide'); }
		else $('#bg-add-badge-dialog').addClass('bg-hide');
	});
}
