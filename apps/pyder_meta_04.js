var EightyApp = function() {
	this.processDocument = function(html, url, headers, status, jQuery) {
		var app = this;
		$ = jQuery;
		var $html = app.parseHtml(html, $);
        return $html.filter('link[rel="canonical"]').attr('href') || $html.filter('meta[property="og:url"]').attr('content')
	}

	this.parseLinks = function(html, url, headers, status, jQuery) {
		var app = this;
		var $ = jQuery;
		var $html = app.parseHtml(html, $);
		var links = [];
		var r = /:\/\/(.[^/]+)/;
		var urlDomain = url.match(r)[1]
		// gets all links in the html document
		$html.find('a').each(function(i, obj) {
			// console.log($(this).attr('href'));
			var link = app.makeLink(url, $(this).attr('href'));

			if(link != null) {
	        	var linkDomain = link.match(r)[1]
				if (urlDomain == linkDomain) {
					links.push(link);
				}
			}
		});
		return links;
	}
}

try {
	// Testing
	module.exports = function(EightyAppBase) {
		EightyApp.prototype = new EightyAppBase();
		return new EightyApp();
	}
} catch(e) {
	// Production
	console.log("Eighty app exists.");
	EightyApp.prototype = new EightyAppBase();
}