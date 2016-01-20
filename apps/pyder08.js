var EightyApp = function() {
    this.processDocument = function(html, url, headers, status, jQuery) {
        var app = this;
        var $ = jQuery;
        var $html = app.parseHtml(html, $);
        var object = {};
        var tmp = {};

        object.status = status;
        object.crawed_time = app.formatDate(Date());
        // page basics
        tmp.title_tag = $html.filter('title').text();
        tmp.canonical_link = $html.filter('link[rel="canonical"]').attr('href');
        tmp.meta_description = $html.filter('meta[name="description"]').attr('content');
        tmp.meta_keywords = $html.filter('meta[name="keywords"]').attr('content');
        tmp.news_keywords = $html.filter('meta[name="news_keywords"]').attr('content');
        tmp.meta_author = $html.filter('meta[name="Author"]').attr('content');
        // date tags
        tmp.meta_article_date_original = $html.filter('meta[name="article_date_original"]').attr('content');
        tmp.meta_article_published_time = $html.filter('meta[property="article:published_time"]').attr('content');
        tmp.meta_publication_date = $html.filter('meta[name="publication_date"]').attr('content');
        tmp.meta_publishdate = $html.filter('meta[name="PublishDate"]').attr('content');
        tmp.meta_date = $html.filter('meta[name="date"]').attr('content');
        tmp.meta_display_date = $html.filter('meta[name="DisplayDate"]').attr('content');
        // facebook og tags
        tmp.og_url = $html.filter('meta[property="og:url"]').attr('content');
        tmp.og_site_name = $html.filter('meta[property="og:site_name"]').attr('content');
        tmp.og_image = $html.filter('meta[property="og:image"]').attr('content');
        tmp.og_title = $html.filter('meta[property="og:title"]').attr('content');
        tmp.og_published_time = $html.filter('meta[property="og:published_time"]').attr('content');
        tmp.og_description = $html.filter('meta[property="og:description"]').attr('content');        
        tmp.og_type = $html.filter('meta[property="og:type"]').attr('content');
        // twitter
        tmp.twitter_url = $html.filter('meta[name="twitter:url"]').attr('content');
        tmp.twitter_image = $html.filter('meta[name="twitter:image"]').attr('content');
        tmp.twitter_site = $html.filter('meta[name="twitter:site"]').attr('content');
        tmp.twitter_title = $html.filter('meta[name="twitter:title"]').attr('content');
        // parsley
        tmp.parsely_link = $html.filter('meta[name="parsely-link"]').attr('content');
        tmp.parsely_type = $html.filter('meta[name="parsely-type"]').attr('content');
        tmp.parsely_pubdate = $html.filter('meta[name="parsely-pub-date"]').attr('content');
        tmp.parsely_author = $html.filter('meta[name="parsely-author"]').attr('content');
        // tmp.parsely_page = $html.filter('meta[name="parsely-page"]').attr('content');        
        tmp.parsely_section = $html.filter('meta[name="parsely-section"]').attr('content');
        tmp.parsely_tags = $html.filter('meta[name="parsely-tags"]').attr('content');        
        // sailthrouh
        tmp.sailthru_author = $html.filter('meta[name="sailthru.author"]').attr('content');
        tmp.sailthru_date = $html.filter('meta[name="sailthru.date"]').attr('content');
             
        // merge results
        object.canonical_url = tmp.canonical_link || tmp.parsely_link || tmp.og_url || tmp.twitter_url;
        object.title = tmp.og_title || tmp.twitter_title || tmp.title_tag;;
        object.pubdate = tmp.parsely_pubdate || tmp.sailthru_date || tmp.og_published_time || tmp.meta_date || tmp.meta_article_date_original || tmp.meta_article_published_time || tmp.meta_publication_date || tmp.meta_publishdate || tmp.meta_display_date;
        object.author = tmp.parsely_author || tmp.sailthru_author || tmp.meta_author;
        object.keywords = tmp.parsely_tags || tmp.meta_keywords || tmp.news_keywords;
        object.image = tmp.og_image || tmp.twitter_image;
        object.description = tmp.og_description || tmp.meta_description;
        object.type = tmp.parsely_type || tmp.og_type;
        object.section = tmp.parsely_section;
        object.site_name = tmp.og_site_name || tmp.twitter_site;
        
        // add domain parse
        var add_domain = false;
        if (add_domain) {
            var domain_rx = /:\/\/(.[^/]+)/;
            var domain = url.match(domain_rx)[1];
            if (domain !== null) {
                object.domain = domain;
                object.domain_parts = domain.split(".");
            }
        }   
        // add tmp data
        var full_data = false;
        if (full_data) {
            object.data = tmp;
        }
        // add full meta data
        var full_meta = false;
        if (full_meta) {
            var meta_tags = [];
            $html.filter('meta').each(function(i, obj) {
                var meta_obj = {};
                meta_obj.name = $(this).attr('name');
                meta_obj.property = $(this).attr('property');
                meta_obj.content = $(this).attr('content');
                meta_obj.href = $(this).attr('href');
                meta_obj.charset = $(this).attr('charset');
                meta_tags.push(meta_obj);
            });
            object.meta_tags = meta_tags;    
        }
        // add links
        var full_links = false;
        if (full_links) {
            var links = [];
            var domain_rx = /:\/\/(.[^/]+)/;
            // var domain_rx = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
            var urlDomain = url.match(domain_rx)[1];
            // gets all links in the html document
            $html.find('a').each(function(i, obj) {
                // console.log($(this).attr('href'));
                var link = app.makeLink(url, $(this).attr('href'));
                link = link.replace("////", "//");
                if(link !== null) {
                    var linkDomain = link.match(domain_rx)[1];
                    if (urlDomain == linkDomain) {
                        links.push(link);
                    }
                }
            });
            object.links = links;
        }
        // return JSON output
        return app.replaceSpecialCharacters(JSON.stringify(output));
    };

    this.parseLinks = function(html, url, headers, status, jQuery) {
        var app = this;
        var $ = jQuery;
        var $html = app.parseHtml(html, $);
        var links = [];
        var norm_url_rx = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
        var urlDomain = url.match(norm_url_rx)[1];
        // gets all links in the html document
        $html.find('a').each(function(i, obj) {
            // console.log($(this).attr('href'));
            var link = app.makeLink(url, $(this).attr('href'));
            link = link.replace("////", "//");
            if(link !== null) {
                var linkDomain = link.match(norm_url_rx)[1];
                if (urlDomain == linkDomain) {
                    links.push(link);
                }
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
