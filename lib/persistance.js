const {readFileSync, writeFileSync, existsSync} = require('fs');

exports.saveArtist = ({artistName, artistId, features}) => {
	writeFileSync(
		`data/${artistId}.json`,
		JSON.stringify(
			{
				artistName,
				features
			},
			null,
			2
		)
	);
};

exports.getArtistList = () => {
	const data = readFileSync('artist-list.json', 'utf8');
	try {
		return JSON.parse(data);
	} catch (err) {
		console.log({data});
	}
};

exports.saveArtistList = list => {
	writeFileSync('artist-list.json', JSON.stringify(list, null, 2));
};

exports.getArtist = MIN_POPULARITY => {
	const list = exports.getArtistList();
	const artists = list.filter(item => {
		return (
			!existsSync(`data/${item.id}.jsonk`) &&
			(item.popularity === undefined ||
				(item.popularity > MIN_POPULARITY && !item.moreInfo))
		);
	});
	return {
		artist: artists[0],
		length: artists.length
	};
};
