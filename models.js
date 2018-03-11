const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

// Connect to SQL database
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully')
  })
  .catch((err) => {
    console.log('Unable to connect to database. The error is: ', err)
  })

  // define models

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  age: {
    type: Sequelize.INTEGER
  }
});



module.exports = {
  sequelize,
  Sequelize,
  User
};
