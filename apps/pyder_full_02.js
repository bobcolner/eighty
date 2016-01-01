var EightyApp = function() {
	this.processDocument = function(html, url, headers, status, jQuery) {
		var app = this;
		$ = jQuery;
		var $html = app.parseHtml(html, $);
		var object = {};
		// 80legs craw timestamp
		object.crawled_at = app.formatDate(Date.now());
		// page basics
        object.title = $html.filter('title').text();
        object.canonical = object.og_site_name = $html.filter('link[rel="canonical"]').attr('href');
        object.meta_description = $html.filter('meta[name="description"]').attr('content');
        object.meta_keywords = $html.filter('meta[name="keywords"]').attr('content');
        object.news_keywords = $html.filter('meta[name="news_keywords"]').attr('content');
        // facebook og
        object.og_site_name = $html.filter('meta[property="og:site_name"]').attr('content');
        object.og_image = $html.filter('meta[property="og:image"]').attr('content');
        object.og_title = $html.filter('meta[property="og:title"]').attr('content');
        object.og_type = $html.filter('meta[property="og:type"]').attr('content');
        object.og_url = $html.filter('meta[property="og:url"]').attr('content');
        object.og_description = $html.filter('meta[property="og:description"]').attr('content');
        // twitter
        object.twitter_url = $html.filter('meta[property="twitter:url"]').attr('content');
        object.twitter_image = $html.filter('meta[property="twitter:image"]').attr('content');        
        // parsley
        object.parsely_link = $html.filter('meta[property="parsely-link"]').attr('content');
        object.parsely_type = $html.filter('meta[property="parsely-type"]').attr('content');
        object.parsely_pub_date = $html.filter('meta[property="parsely-pub-date"]').attr('content');
        object.parsely_link = $html.filter('meta[property="parsely-link"]').attr('content');
        object.parsely_author = $html.filter('meta[property="parsely-author"]').attr('content');
        object.parsely_section = $html.filter('meta[property="parsely-section"]').attr('content');
        object.parsely_tags = $html.filter('meta[property="parsely-tags"]').attr('content');        
        // sailthrouh
        object.sailthru_author = $html.filter('meta[property="sailthru.author"]').attr('content');

		// Get lossy content by removing javascript and css tags
        var lossyHTML = html;
        lossyHTML = lossyHTML.replace(/<script[\s\S]*?<\/script>/gi,"");
        lossyHTML = lossyHTML.replace(/<style[\s\S]*?<\/style>/gi,"");
        // lossyHTML = lossyHTML.replace(/<[\s\S]*?>/g,"");
        object.lossyHTML = lossyHTML;

		return app.replaceSpecialCharacters(JSON.stringify(object));
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