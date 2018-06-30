'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
    weight: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    activitylevel: DataTypes.INTEGER,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    goals: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Workout, {
      foreignKey: 'userid',
      as: 'workouts',
    })
  };
  return User;
};
