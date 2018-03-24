const fs = require('fs');
const {sortBy, take} = require('lodash');
const artistList = require('../artist-list');

const sorted = sortBy(
	artistList.filter(a => a.popularity),
	a => a.popularity
).reverse();
const first10000 = take(sorted, 10000);

fs.writeFileSync('short-list.json', JSON.stringify(first10000, null, 2));
