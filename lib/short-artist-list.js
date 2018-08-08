const fs = require('fs');
const {sortBy, take} = require('lodash');
const artistList = require('../artist-list');

const sorted = sortBy(artistList.filter(a => a.popularity), a => a.popularity)
	.filter(a => a.moreInfo)
	.reverse();
const first100000 = take(sorted, 100000);

fs.writeFileSync('short-list.json', JSON.stringify(first100000, null, 2));
