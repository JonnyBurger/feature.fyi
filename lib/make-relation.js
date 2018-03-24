const pascalCase = require('pascal-case');

const escapeQuote = string => {
	return string.replace(/\\/g, /\\\\/).replace(/'/g, '\\\'');
};

const createTag = name => {
	return 'Artist' + pascalCase(name);
};

exports.createArtist = ({name, id, image}) => {
	return `CREATE (${createTag(name)}:Artist {title:'${escapeQuote(
		name
	)}', id:'${id}', image:'${image}'})`;
};

exports.createConstraint = `CREATE CONSTRAINT ON (artist:Artist) ASSERT artist.title IS UNIQUE`;

exports.createCollaboration = ({
	artist1,
	artist2,
	songTitle,
	songId,
	releaseDate,
	cover,
	preview
}) => {
	return [
		`MATCH (a:Artist),(b:Artist) WHERE a.id = '${escapeQuote(
			artist1
		)}' AND b.id = '${escapeQuote(artist2)}'`,
		`CREATE (a)-[:COLLABORATED {song: '${escapeQuote(
			songTitle
		)}',id:"${songId}",release_date:"${releaseDate}",cover:"${cover}",preview:"${preview}"}]->(b)`
	].join(' ');
};

exports.query = ({artist1, artist2}) => {
	return `
    MATCH p=shortestPath(
      (:Artist {title:"${artist1}"})-[*..10]-(:Artist {title:"${artist2}"})
    )
    RETURN p
`;
};
