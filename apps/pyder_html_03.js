// http://80apptester.80legs.com/

var EightyApp = function() {
	this.processDocument = function(html, url, headers, status, jQuery) {
		return html;
	}

	this.parseLinks = function(html, url, headers, status, jQuery) {
		return []
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
