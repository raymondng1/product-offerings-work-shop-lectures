const express = require('express');
const app = express();
const db = require('./db');
const { User, Story, Review } = db.models;

const PORT = process.env.PORT || 3000;

db.syncAndSeed().then(() => {
	app.listen(PORT, () => {
		console.log(`listening on port ${PORT}`);
	});
});

app.get('/api/users', (req, res, next) => {
	// try {
	//     res.send(await.User.findAll())
	// }
	// catch(ex){
	//     next(ex)
	// } by not having this make 'async' and await same as the promise below , ends up reading better
	User.findAll({
		include: [{
            model: User,
            as: 'manager'
        }]
	})
		.then(users => res.send(users))
		.catch(next);
});
