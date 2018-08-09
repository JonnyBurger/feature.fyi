const {readdirSync} = require('fs');
const {addArtist, createCollaboration} = require('./graph-api');
const {getArtistList} = require('./persistance');

const data = readdirSync('data');

(async () => {
	let i = 0;
	for (let file of data) {
		i++;
		const filename = file.substr(0, file.length - 5);
		const {artistName, features} = require(`../data/${file}`);
		const artists = getArtistList();
		const image = artists.find(a => a.id === filename).image;
		await addArtist({id: filename, name: artistName, image}); // eslint-disable-line
		for (let feature of features) {
			/* eslint-disable no-await-in-loop */
			await createCollaboration({
				artist1: filename,
				artist2: feature.featuredArtistId,
				songTitle: feature.trackName,
				songId: feature.trackId,
				cover: feature.cover,
				releaseDate: feature.release_date,
				preview: feature.preview
			});
			/* eslint-enable no-await-in-loop */
		}
		console.log(`${i} out of ${data.length}`);
	}
})()
	.then(() => {
		process.exit(0);
	})
	.catch(err => {
		console.log(err);
	});
