var tinify = require("tinify");
tinify.key = "uMa6VWR374_Z_b6JvpaugGUwf9Ertr57";

var source = tinify.fromFile("res/game.png");
source.toFile("game.png");

var fs = require('fs');

//fs.createReadStream('game.png').pipe(fs.createWriteStream('res/game.png'));