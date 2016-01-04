// http://80apptester.80legs.com/

var EightyApp = function() {
    this.processDocument = function(html, url, headers, status, jQuery) {
        // start timer
        var start_time = Date.now();
        // parse html as jQuery/Cherro.js object
        var app = this;
        $ = jQuery;
        var $html = app.parseHtml(html, $);

        // 80legs output data
        var output = {};
        output.crawled_status = status;
        // output.headers = headers;
        output.crawled_at = app.formatDate(Date.now());
        output.crawled_url = url;
        output.html_size = html.length;
        
        // TODO: cache meta tags
        // var meta = $html.find('meta');
        // output.find_test1 = $(meta).filter('meta[name="twitter:site"]').attr('content');
        // output.find_test2 = $(meta).filter('meta[name="keywords"]').attr('content');

        // page basics
        var tmp = {};
        tmp.title_tag = $html.filter('title').text();
        tmp.canonical_link = $html.filter('link[rel="canonical"]').attr('href');
        // full date       
        tmp.meta_article_date_original = $html.filter('meta[name="article_date_original"]').attr('content');
        tmp.meta_article_published_time = $html.filter('meta[property="article:published_time"]').attr('content');
        tmp.meta_publication_date = $html.filter('meta[name="publication_date"]').attr('content');
        tmp.meta_publishdate = $html.filter('meta[name="PublishDate"]').attr('content');
        tmp.meta_date = $html.filter('meta[name="date"]').attr('content');
        // other meta
        tmp.meta_description = $html.filter('meta[name="description"]').attr('content');
        tmp.news_keywords = $html.filter('meta[name="news_keywords"]').attr('content');
        tmp.meta_keywords = $html.filter('meta[name="keywords"]').attr('content');
        // facebook og tags
        tmp.og_url = $html.filter('meta[property="og:url"]').attr('content');
        // tmp.og_site_name = $html.filter('meta[property="og:site_name"]').attr('content');
        tmp.og_image = $html.filter('meta[property="og:image"]').attr('content');
        tmp.og_title = $html.filter('meta[property="og:title"]').attr('content');
        tmp.og_published_time = $html.filter('meta[property="og:published_time"]').attr('content');
        tmp.og_description = $html.filter('meta[property="og:description"]').attr('content');        
        // tmp.og_type = $html.filter('meta[property="og:type"]').attr('content');
        // twitter
        tmp.twitter_url = $html.filter('meta[name="twitter:url"]').attr('content');
        tmp.twitter_image = $html.filter('meta[name="twitter:image"]').attr('content');
        tmp.twitter_site = $html.filter('meta[name="twitter:site"]').attr('content');
        tmp.twitter_title = $html.filter('meta[name="twitter:title"]').attr('content');
        // parsley
        tmp.parsely_link = $html.filter('meta[name="parsely-link"]').attr('content');
        // tmp.parsely_type = $html.filter('meta[name="parsely-type"]').attr('content');
        tmp.parsely_pubdate = $html.filter('meta[name="parsely-pub-date"]').attr('content');
        tmp.parsely_author = $html.filter('meta[name="parsely-author"]').attr('content');
        // tmp.parsely_section = $html.filter('meta[name="parsely-section"]').attr('content');
        // tmp.parsely_tags = $html.filter('meta[name="parsely-tags"]').attr('content');        
        // sailthrouh
        tmp.sailthru_author = $html.filter('meta[name="sailthru.author"]').attr('content');
        tmp.sailthru_date = $html.filter('meta[name="sailthru.date"]').attr('content');
        // Add tmp
        // output.data = tmp;
        
        // merge results
        output.canonical_url = tmp.canonical_link || tmp.parsely_link || tmp.og_url || tmp.twitter_url;
        output.title = tmp.og_title || tmp.twitter_title || tmp.title_tag;
        output.pubdate = tmp.parsely_pubdate || tmp.sailthru_date || tmp.og_published_time || tmp.meta_date || 
            tmp.meta_article_date_original || tmp.meta_article_published_time || tmp.meta_publication_date || 
            tmp.meta_publishdate;
        output.author = tmp.parsely_author || tmp.sailthru_author || tmp.meta_author;
        output.keywords = tmp.parsely_tags || tmp.keywords || tmp.news_keywords;
        output.image = tmp.og_image || output.twitter_image;
        output.description = tmp.og_description || tmp.meta_description;
        output.twitter_site = tmp.twitter_site;
        
        // Add optional link data to output
        var link_stats = false;
        if(link_stats) {
            var links = [];
            $html.find('a').each(function(i, obj) {
                var link = app.makeLink(url, $(this).attr('href'));
                if(link === null) { return; }
                var d = {};
                d.link = link;
                d.link_length = link.length;
                var match = link.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
                if(match !== null) {
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
                }
                links.push(d);
            });
            output.links = links;
        }
        // page scrape runtime
        output.craw_runtime_ms = Date.now() - start_time;
        
        // Output as JSON string
        return app.replaceSpecialCharacters(JSON.stringify(output));
        // return JSON.stringify(output);
        // return output
    };

    this.parseLinks = function(html, url, headers, status, jQuery) {
        var app = this;
        var $ = jQuery;
        var $html = app.parseHtml(html, $);
        var links = [];
        // url domain parse regex
        var r = /:\/\/(.[^/]+)/;
        var urlDomain = url.match(r)[1];
        // gets all links in the html document
        $html.find('a').each(function(i, obj) {
            // console.log($(this).attr('href'));
            var link = app.makeLink(url, $(this).attr('href'));
            // skip null link
            if(link === null) { return; }
            // skip links outside craw domain
            var linkDomain = link.match(r)[1];
            if (urlDomain == linkDomain) {
                links.push(link);
            }
        });
        return links;
    };
};

try {
    // Testing
    module.exports = function(EightyAppBase) {
        EightyApp.prototype = new EightyAppBase();
        return new EightyApp();
    };
} catch(e) {
    // Production
    console.log("Eighty app exists.");
    EightyApp.prototype = new EightyAppBase();
}
