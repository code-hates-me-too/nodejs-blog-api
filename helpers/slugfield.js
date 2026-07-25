const slugify = require("slugify");

const options = {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: true,
    locale: 'tr',
    trim: true
};

module.exports = (str) => {
    return slugify(str, options);
};

// const slugify = require("slugify");

// module.exports = function slugField(text) {
//     return slugify(text, {
//         lower: true,
//         strict: true,
//         locale: "tr",
//         trim: true
//     });
// };