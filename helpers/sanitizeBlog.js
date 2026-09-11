const sanitizeHtml = require("sanitize-html");

function temizle(html) {
    return sanitizeHtml(html || "", {
        allowedTags: ["p", "h2", "h3", "strong", "em", "s", "ul", "ol", "li", "blockquote", "a", "br"],
        allowedAttributes: {
            a: ["href", "target", "rel"]
        },
        allowedSchemes: ["http", "https", "mailto"]
    });
}

module.exports = { temizle };