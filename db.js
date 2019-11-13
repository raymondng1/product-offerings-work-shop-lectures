const Sequelize = require('sequelize');
const conn = new Sequelize(
	process.env.DATABASE_URL || 'postgres://localhost/users_stories_reviews_db'
);
const { VIRTUAL, DECIMAL, STRING, UUID, UUIDV4 } = Sequelize;

const uuidDefinition = {
	type: UUID,
	primaryKey: true,
	defaultValue: UUIDV4
};

const User = conn.define('user', {
	id: uuidDefinition,
	firstName: {
		type: STRING,
		allowNull: false,
		set: function(firstName) {
			return this.setDataValue('firstName', firstName.toUpperCase()); //decides the data going in
		}
		//		get: function () {
		// 	return this.getDataValue('firstName').toUpperCase()
		// }          *this only gets the data from the database but not set it, can't use arrow
	},
	lastName: {
		type: STRING,
		allowNull: false
	},
	fullName: {
		type: VIRTUAL,
		get: function() {
			return `${this.firstName} ${this.lastName}`;
		}
	} // return a property but not set in the database, a VIRTUAL property
});

const Story = conn.define('story', {
	id: uuidDefinition,
	title: {
		type: STRING,
		allowNull: false
	}
});

const Review = conn.define('review', {
	id: uuidDefinition,
	rating: DECIMAL
}); // defining our relationships here and setting our ID

Story.belongsTo(User, { as: 'author' });
User.hasMany(Story, { foreignKey: 'authorId' }); // will get the author ID column, instead of the 'userId

Review.belongsTo(User, { as: 'reviewer' });
Review.belongsTo(Story);

Story.hasMany(Review);
User.hasMany(Review, { foreignKey: 'reviewerId' });

User.belongsTo(User, { as: 'manager' });
User.hasMany(User, { as: ' manages', foreignKey: 'managerId' });

const syncAndSeed = async () => {
	await conn.sync({ force: true });
	const users = [
		{ firstName: 'moe', lastName: 'green' },
		{ firstName: 'larry', lastName: 'blue' },
		{ firstName: 'curly', lastName: 'red' }
	];
	const [moe, larry, curly] = await Promise.all(
		users.map(user => User.create(user))
	);
	const stories = [
		{ title: 'Node is great', authorId: moe.id },
		{ title: 'I love sequelize', authorId: moe.id },
		{ title: 'Javascript rocks', authorId: curly.id }
	];
	const [nodeStory, seqStory, jsStory] = await Promise.all(
		stories.map(story => Story.create(story))
	);
	const reviews = [
		{ reviewerId: larry.id, storyId: nodeStory.id, rating: 2 },
		{ reviewerId: curly.id, storyId: nodeStory.id, rating: 4.3 }
	];
	const [larryReview, curlyReview] = await Promise.all(
		reviews.map(review => Review.create(review))
	);
	moe.managerId = larry.id;
	await moe.save() /// we will see that moe has a manager ID, have a foreign key on the same table, self-referencing column, some kind of hierchy you are trying to capture
	console.log(moe.get());
};

module.exports = {
	syncAndSeed,
	models: {
		User,
		Story,
		Review // our 3 models 
	}
}
