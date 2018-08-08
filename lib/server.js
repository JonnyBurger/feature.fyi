const express = require('express');
const {sortBy, min} = require('lodash');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const {ask} = require('./graph-api');

app.use(bodyParser.json());
app.use(cors());

const isRemix = s => {
	return (
		s.relationship.properties.song.match(/remix/i) ||
		s.relationship.properties.song.match(/megamix/i)
	);
};

app.get('/:one/:two', async (request, response) => {
	try {
		const {one, two} = request.params;
		const data = await ask({artist1: one, artist2: two}); // TODO: Escaping and checking if exists
		const nicer = data.records.map(r => {
			return r._fields[0];
		});
		const minConnections = min(nicer.map(r => r.segments.length));
		// Prefer chains with less remixes because they are cooler
		const remixSorted = sortBy(
			nicer.filter(r => r.segments.length === minConnections),
			r => r.segments.filter(isRemix).length
		).reverse();
		// Prefer chains where every artist has an image
		const minRemixes = min(nicer.map(n => n.segments.filter(isRemix).length));
		const imageSorted = sortBy(
			remixSorted.filter(n => n.segments.filter(isRemix).length === minRemixes),
			r =>
				r.segments.filter(
					s =>
						s.start.properties.image && s.start.properties.image !== 'undefined'
				).length
		).reverse();
		response.json({success: true, data: imageSorted[0]});
	} catch (err) {
		response.json({
			success: false,
			error: err.message
		});
	}
});

app.listen(process.env.PORT || 7000);
console.log('Started server.');
