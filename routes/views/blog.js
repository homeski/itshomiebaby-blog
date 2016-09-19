var keystone = require('keystone');
var async = require('async');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'blog';
	locals.filters = {
		category: req.params.category,
	};
	locals.data = {
		posts: [],
		categories: [],
	};

	// Load all categories
	view.on('init', function (next) {

		keystone.list('PostCategory').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function (category, next) {

				keystone.list('Post').model.count().where('categories').in([category.id]).exec(function (err, count) {
					category.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current category filter
	view.on('init', function (next) {

		keystone.list('PostCategory').model.findOne({ key: 'headline' }).exec(function (err, result) {
			locals.data.category = result;
			next(err);
		});
	});

	// Load the posts
	view.on('init', function (next) {

		var r = keystone.list('Post').model.find()
			.where('state', 'published')
			.sort('-publishedDate')
			.populate('author categories');

		async.parallel([
			function(callback) {
				r.exec(function (err , results) {
					locals.data.posts = results;
					callback(null, results);
				});
			},
			function(callback) {
				r.where('categories').in([locals.data.category]);
				
				r.exec(function (err, results) {
					locals.data.headlines = results;
					callback(null, results);
				});
			}
		], function(err, results){ 
			next(err);
		});
	});

	// Render the view
	view.render('blog');
};
