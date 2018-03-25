global.Error.captureStackTrace = () => {};

const {createArtist, createCollaboration, query} = require('./make-relation');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(
	'bolt://localhost',
	neo4j.auth.basic('neo4j', 'bitnami')
);

const session = driver.session();

exports.addArtist = ({name, id, image}) => {
	return session.run(createArtist({name, id, image}));
};

exports.createCollaboration = ({
	artist1,
	artist2,
	songTitle,
	songId,
	releaseDate,
	cover,
	preview
}) => {
	return session.run(
		createCollaboration({
			artist1,
			artist2,
			songTitle,
			songId,
			releaseDate,
			cover,
			preview
		})
	);
};

exports.ask = ({artist1, artist2}) => {
	return session.run(query({artist1, artist2}));
};
