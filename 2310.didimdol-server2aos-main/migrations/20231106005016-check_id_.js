'use strict';
const { DataTypes } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('check_info', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
    await queryInterface.changeColumn('vision_result', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
    await queryInterface.changeColumn('blind_spot_left_result', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
    await queryInterface.changeColumn('blind_spot_right_result', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
    await queryInterface.changeColumn('eye_movement_result', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
    await queryInterface.changeColumn('eye_movement_left_result', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
    await queryInterface.changeColumn('eye_movement_right_result', 'check_id', {
      type: DataTypes.STRING,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
