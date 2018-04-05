const loudRejection = require('loud-rejection');
const SpotifyWrapper = require('spotify-web-api-node');
const {flatten, uniqBy} = require('lodash');
const chalk = require('chalk');
const {
	saveArtist,
	getArtistList,
	saveArtistList,
	getArtist
} = require('./persistance');

loudRejection(console.log);

const MIN_POPULARITY = 57;

const spotify = new SpotifyWrapper({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const authorize = async () => {
	const {body} = await spotify.clientCredentialsGrant();
	spotify.setAccessToken(body.access_token);
};

const getArtistFeatures = async (artist = '3wyVrVrFCkukjdVIdirGVY', length) => {
	const artistResponse = await spotify.getArtist(artist);
	const image =
		artistResponse.body.images.length > 0 ?
			artistResponse.body.images[0].url :
			'https://i.scdn.co/image/5d7efd90adb771ffa3c1d96b299748532fdaa7ca';
	const artistList = getArtistList();

	if (artistResponse.body.popularity > MIN_POPULARITY) {
		console.log(
			`Searching for ${artistResponse.body.name} (Popularity: ${
				artistResponse.body.popularity
			})`
		);
		const albums = await spotify.getArtistAlbums(artist);
		const tracksResponse = await spotify.getAlbums(
			albums.body.items.map(a => a.id)
		);
		const tracks = flatten(
			tracksResponse.body.albums.map(a =>
				a.tracks.items.map(t => ({
					...t,
					release_date: a.release_date, // eslint-disable-line camelcase
					cover: a.images.length > 0 ? a.images[0].url : null
				}))
			)
		);
		const tracksWithOtherArtists = tracks.filter(
			t =>
				// Exclude tracks that don't feature any other artists
				t.artists.find(a => a.id !== artist) &&
				// Exclude tracks that don't feature artist we search for
				t.artists.find(a => a.id === artist)
		);
		const collaborations = uniqBy(
			flatten(
				tracksWithOtherArtists.map(track => {
					return track.artists.filter(a => a.id !== artist).map(a => {
						return {
							featuredArtist: a.name,
							featuredArtistId: a.id,
							trackName: track.name,
							trackId: track.id,
							preview: track.preview_url,
							cover: track.cover,
							release_date: track.release_date // eslint-disable-line camelcase
						};
					});
				})
			),
			track => track.featuredArtistId
		);
		saveArtist({
			artistName: artistResponse.body.name,
			artistId: artist,
			features: collaborations
		});
		for (let collaboration of collaborations) {
			if (artistList.find(a => a.id === collaboration.featuredArtistId)) {
				continue;
			}
			artistList.push({
				id: collaboration.featuredArtistId,
				name: collaboration.featuredArtist
			});
		}
	} else {
		console.log(
			chalk.gray(
				`[${length}] Skipping ${artistResponse.body.name} (Popularity: ${
					artistResponse.body.popularity
				})`
			)
		);
	}
	const index = artistList.findIndex(a => a.id === artist);
	artistList[index].popularity = artistResponse.body.popularity;
	artistList[index].image = image;
	artistList[index].moreInfo = true;
	saveArtistList(artistList);
};

authorize()
	.then(async () => {
		try {
			while (getArtist(MIN_POPULARITY).length) {
				const {artist, length} = getArtist(MIN_POPULARITY);
				await getArtistFeatures(artist.id, length); // eslint-disable-line
			}
		} catch (err) {
			console.log(err);
		}
	})
	.catch(err => console.log(err));
