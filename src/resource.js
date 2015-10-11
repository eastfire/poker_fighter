var res = {
    game_plist : "res/game.plist",
    game_png : "res/game.png",

    ready_mp3: "res/ready.mp3",
    fight_mp3: "res/fight.mp3",
    countdown3_mp3: "res/countdown-3.mp3",
    countdown2_mp3: "res/countdown-2.mp3",
    countdown1_mp3: "res/countdown-1.mp3",
    game_over_mp3: "res/game-over.mp3",
    "flush-straight": "res/flush-straight.mp3",
    "four-of-a-kind": "res/four-of-a-kind.mp3",
    "full-house": "res/full-house.mp3",
    "flush": "res/flush.mp3",
    "straight": "res/straight.mp3",
    "three-of-a-kind": "res/three-of-a-kind.mp3",
    "two-pair": "res/two-pair.mp3",
    "one-pair": "res/one-pair.mp3",
    "high-card": "res/high-card.mp3"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

var texts = {
    handTypeDisplayName : {
        "flush-straight":"同花顺",
        "four-of-a-kind":"四条",
        "full-house":"满堂红",
        "flush":"同花",
        "straight":"顺子",
        "three-of-a-kind":"三条",
        "two-pair":"两对",
        "one-pair":"一对",
        "high-card":"散牌",
        "no-card":"没牌"
    }
};

var colors = {
    table: new cc.color(0x3b,0x7f,0x42),
    tableLabel: new cc.color(0xd6,0xfe,0x9d),
    tableLabelOutline: new cc.color(0x40,0x66,0x1d)
};

var times = {
    card_sort : 0.1,
    performSkill: 0.2,
    flip: 0.2,
    takeCard: 0.3,
    rotateDirection: 0.1,
    compare: 3.5,
    giveMoney: 0.4,
    gameOver: 0.9
};

var dimens = {
    card_size: {
        width: 57,
        height: 80
    },
    card_number_position:{
        x: 38,
        y: 65
    },
    player1Y : 95,
    player2Y : 705,


    player1HandPosition:{
        x: 225,
        y: 25
    },
    player2HandPosition:{
        x: 225,
        y: 775
    },
    betRatePosition:{
        x: 430,
        y: 380
    },

    hand_line_card_padding : -5,
    hand_line_width: 450
};