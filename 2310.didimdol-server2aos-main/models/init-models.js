var DataTypes = require("sequelize").DataTypes;
var _SequelizeMeta = require("./SequelizeMeta");
var _blind_spot_left_result = require("./blind_spot_left_result");
var _blind_spot_result = require("./blind_spot_result");
var _blind_spot_right_result = require("./blind_spot_right_result");
var _check_info = require("./check_info");
var _check_vision_result = require("./check_vision_result");
var _eye_movement_left_result = require("./eye_movement_left_result");
var _eye_movement_result = require("./eye_movement_result");
var _eye_movement_right_result = require("./eye_movement_right_result");
var _users = require("./users");
var _vision_result = require("./vision_result");

function initModels(sequelize) {
  var SequelizeMeta = _SequelizeMeta(sequelize, DataTypes);
  var blind_spot_left_result = _blind_spot_left_result(sequelize, DataTypes);
  var blind_spot_result = _blind_spot_result(sequelize, DataTypes);
  var blind_spot_right_result = _blind_spot_right_result(sequelize, DataTypes);
  var check_info = _check_info(sequelize, DataTypes);
  var check_vision_result = _check_vision_result(sequelize, DataTypes);
  var eye_movement_left_result = _eye_movement_left_result(sequelize, DataTypes);
  var eye_movement_result = _eye_movement_result(sequelize, DataTypes);
  var eye_movement_right_result = _eye_movement_right_result(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var vision_result = _vision_result(sequelize, DataTypes);


  return {
    SequelizeMeta,
    blind_spot_left_result,
    blind_spot_result,
    blind_spot_right_result,
    check_info,
    check_vision_result,
    eye_movement_left_result,
    eye_movement_result,
    eye_movement_right_result,
    users,
    vision_result,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
