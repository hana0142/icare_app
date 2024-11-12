const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('eye_movement_result', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    check_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "eye_movement_result_check_id_key"
    },
    user_id: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    left_vfi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    right_vfi: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'eye_movement_result',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "eye_movement_result_check_id_key",
        unique: true,
        fields: [
          { name: "check_id" },
        ]
      },
      {
        name: "eye_movement_result_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
