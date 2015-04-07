var blogroot = 'https://briangraymusic.wordpress.com';
var discography;

function onDataComplete(bcData) {
	new BG.Discography(bcData).buildDOM($('#'+BG.Discography.css.cont));
	registerGlobalJQueryUI();
	BG.Discography.registerJQueryUI();

// 	var startBlog = $.url().param('blog') ? $.url().param('blog') : ' ';
// 	navigate({ toptab: $.url().param('toptab'), song: $.url().param('song'), songtab: $.url().param('songtab'), blog: startBlog });
	navigate({
		toptab: $.url().param('toptab'), blog: $.url().param('blog'),
		song: $.url().param('song'), songtab: $.url().param('songtab')
	});
}

function registerGlobalJQueryUI() {
	$(document).tooltip();
	$('#bg-prefs-button').button();
	$('.bg-top-level-tabs').tabs();
	$('#bg-github').repo({ user: 'bgraymusic', name: 'nerdrock' });
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
