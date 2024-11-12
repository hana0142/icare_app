const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vision_result', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    check_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "vision_result_check_id_key"
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
    check_corrected: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vision_result',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "vision_result_check_id_key",
        unique: true,
        fields: [
          { name: "check_id" },
        ]
      },
      {
        name: "vision_result_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
