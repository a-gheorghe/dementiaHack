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
  },
  rawDegreeOne: {
    type: Sequelize.STRING
  },
  degreeOne: {
    type: Sequelize.INTEGER
  },
  rawDegreeTwo: {
    type: Sequelize.STRING
  },
  degreeTwo: {
    type: Sequelize.INTEGER
  },
  rawSmoking: {
    type: Sequelize.FLOAT
  },
  smoking: {
    type: Sequelize.INTEGER
  },
  rawSugarIntake: {
    type: Sequelize.FLOAT
  },
  sugarIntake: {
    type: Sequelize.INTEGER
  },
  rawExercise: {
    type: Sequelize.FLOAT
  },
  exercise: {
    type: Sequelize.INTEGER
  },
  genome_blood_glucose: {
    type: Sequelize.INTEGER
  },
  genome_bmi: {
    type: Sequelize.INTEGER
  },
  genome_carb_intake: {
    type: Sequelize.INTEGER
  },
  genome_smoking: {
    type: Sequelize.INTEGER
  },
  genome_vit_a: {
    type: Sequelize.INTEGER
  },
  genome_vit_e: {
    type: Sequelize.INTEGER
  },
  genome_folate: {
    type: Sequelize.INTEGER
  },
  genome_vit_b12: {
    type: Sequelize.INTEGER
  },
  genome_caffeine: {
    type: Sequelize.INTEGER
  },
  genome_hippo: {
    type: Sequelize.INTEGER
  },
  genome_intelligence: {
    type: Sequelize.INTEGER
  },
  genome_depression: {
    type: Sequelize.INTEGER
  },
  genome_longevity: {
    type: Sequelize.INTEGER
  },
  genome_math: {
    type: Sequelize.INTEGER
  },
  genome_word_reading: {
    type: Sequelize.INTEGER
  },
  genome_spelling: {
    type: Sequelize.INTEGER
  },
  sage_year: {
    type: Sequelize.INTEGER
  },
  sage_picture: {
    type: Sequelize.INTEGER
  },
  sage_stars:{
    type: Sequelize.INTEGER
  }
});



module.exports = {
  sequelize,
  Sequelize,
  User
};
