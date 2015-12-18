var tinify = require("tinify");
tinify.key = "uMa6VWR374_Z_b6JvpaugGUwf9Ertr57";

var source = tinify.fromFile("res/game.png");
source.toFile("res/game.png");