// http://80apptester.80legs.com/

var EightyApp = function() {
	this.processDocument = function(html, url, headers, status, jQuery) {
		var app = this;
		$ = jQuery;
		var $html = app.parseHtml(html, $);

        var object = {};		
		// 80legs craw timestamp
		object.crawled_at = app.formatDate(Date.now());
		object.crawled_url = url
		// page basics
        var page = {};
        page.title_tag = $html.filter('title').text();
        page.canonical_link = $html.filter('link[rel="canonical"]').attr('href');
        // full date
        var date = {}
        date.article_published_time = $html.filter('meta[property="article:published_time"]').attr('content');
        date.publication_date = $html.filter('meta[name="publication_date"]').attr('content');
        date.publishdate = $html.filter('meta[name="PublishDate"]').attr('content');
        date.date = $html.filter('meta[name="date"]').attr('content');
        date.datepublished = $html.filter('meta[itemprop="datePublished"]').attr('datetime');
        date.article_date_original = $html.filter('meta[name="article_date_original"]').attr('datetime');
        
        page.description = $html.filter('meta[name="description"]').attr('content');
        page.keywords = $html.filter('meta[name="keywords"]').attr('content');
        page.news_keywords = $html.filter('meta[name="news_keywords"]').attr('content');
		// facebook og tags
		page.og_url = $html.filter('meta[property="og:url"]').attr('content');
        page.og_site_name = $html.filter('meta[property="og:site_name"]').attr('content');
        page.og_image = $html.filter('meta[property="og:image"]').attr('content');
        page.og_title = $html.filter('meta[property="og:title"]').attr('content');
        date.og_published_time = $html.filter('meta[property="og:published_time"]').attr('content');
        // page.og_description = $html.filter('meta[property="og:description"]').attr('content');        
        page.og_type = $html.filter('meta[property="og:type"]').attr('content');
        // twitter
        page.twitter_url = $html.filter('meta[name="twitter:url"]').attr('content');
        page.twitter_image = $html.filter('meta[name="twitter:image"]').attr('content');
        page.twitter_site = $html.filter('meta[name="twitter:site"]').attr('content');
        page.twitter_title = $html.filter('meta[name="twitter:title"]').attr('content');
        // parsley
        page.parsely_link = $html.filter('meta[name="parsely-link"]').attr('content');
        page.parsely_type = $html.filter('meta[name="parsely-type"]').attr('content');
        date.parsely_pubdate = $html.filter('meta[name="parsely-pub-date"]').attr('content');
        page.parsely_author = $html.filter('meta[name="parsely-author"]').attr('content');
        page.parsely_section = $html.filter('meta[name="parsely-section"]').attr('content');
        page.parsely_tags = $html.filter('meta[name="parsely-tags"]').attr('content');        
        // sailthrouh
        page.sailthru_author = $html.filter('meta[name="sailthru.author"]').attr('content');
        page.sailthru_date = $html.filter('meta[name="sailthru.date"]').attr('content');
        // merge results
        object.canonical_url = page.canonical_link || page.parsely_link || page.og_url || page.twitter_url || null; 
        object.title = page.og_title || page.twitter_title || page.title_tag || null;
        object.pubdate = page.parsely_pubdate || page.sailthru_date || page.og_published_time || page.date || null;
        object.author = page.parsely_author || page.sailthru_author || page.author || null;
        object.keywords = page.keywords || page.parsely_tags || null;
        object.image = page.og_image || object.twitter_image
        // add page to output object
        object.page = page
        
        // gets all links in the html document
        var link_stats = false;
        if(link_stats) {
            var links = [];
            $html.find('a').each(function(i, obj) {
                var link = app.makeLink(url, $(this).attr('href'));
                if(link === null) { return; }
                var d = {}
            	d.link = link;
            	d.link_length = link.length;
            	var match = link.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
            	if(match != null) {
            		var url_parts =  {
    			        protocol: match[1],
    			        hostport: match[2],
    			        host: match[3],
    			        port: match[4],
    			        path: match[5],
    			        search: match[6],
    			        hash: match[7]
    		    	};		    	
    		    	d.url_parts = url_parts;
    				d.path_length = url_parts.path.length;
            	};
                links.push(d);
        	});
    		object.links = links;
    	}
		return app.replaceSpecialCharacters(JSON.stringify(object));
		// return JSON.stringify(object);
		// return object
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

			if(link === null) { return; }

        	var linkDomain = link.match(r)[1]        	
			if (urlDomain == linkDomain) {
				links.push(link);
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