var models = require('./models');

models.sequelize.sync({ force: true })
  .then(function() {
    console.log('Successfully updated database tables!');
    process.exit(0);
  })
  .catch(function(err) {
    console.log('Error updating tables. The error was: ', err)
    process.exit(1);
  });
