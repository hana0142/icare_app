const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('check_vision_result', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    check_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    left_eye_result: {
      type: DataTypes.REAL,
      allowNull: true
    },
    right_eye_result: {
      type: DataTypes.REAL,
      allowNull: true
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    check_vision: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'check_vision_result',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "check_vision_result_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
