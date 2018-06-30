'use strict';
module.exports = (sequelize, DataTypes) => {
  var Workout = sequelize.define('Workout', {
    exercise: DataTypes.STRING,
    time: DataTypes.INTEGER,
    miles: DataTypes.DECIMAL,
    weight: DataTypes.INTEGER,
    reps: DataTypes.INTEGER
  }, {});
  Workout.associate = function(models) {
    // associations can be defined here
    Workout.belongsTo(models.User, {
      foreignKey: 'userid',
      as: 'users',
      onDelete: 'CASCADE',
    })
  };
  return Workout;
};
