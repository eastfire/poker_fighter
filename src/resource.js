var res = {
    game_plist : "res/game.plist",
    game_png : "res/game.png",

    intro_png : "res/intro.png",

    explosion_mp3: "res/explosion.mp3",
    spring_mp3: "res/spring-boing.mp3",
    slot_machine_mp3: "res/slot-machine.mp3",
    cash_register_mp3: "res/cash-register.mp3",

    ready_mp3: "res/ready.mp3",
    fight_mp3: "res/fight.mp3",
    countdown5_mp3: "res/countdown-5.mp3",
    countdown4_mp3: "res/countdown-4.mp3",
    countdown3_mp3: "res/countdown-3.mp3",
    countdown2_mp3: "res/countdown-2.mp3",
    countdown1_mp3: "res/countdown-1.mp3",
    game_over_mp3: "res/game-over.mp3",
    "five-of-a-kind": "res/five-of-a-kind.mp3",
    "straight-flush": "res/straight-flush.mp3",
    "four-of-a-kind": "res/four-of-a-kind.mp3",
    "full-house": "res/full-house.mp3",
    "flush": "res/flush.mp3",
    "straight": "res/straight.mp3",
    "three-of-a-kind": "res/three-of-a-kind.mp3",
    "two-pair": "res/two-pair.mp3",
    "one-pair": "res/one-pair.mp3",
    "high-card": "res/high-card.mp3",

    "tie":"res/tie.mp3"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

var texts_locale = {
    zh: {
        win:"胜利",
        lose:"失败",
        tie:"平手",
        handTypeDisplayName: {
            "five-of-a-kind": "五条",
            "straight-flush": "同花顺",
            "four-of-a-kind": "四条",
            "full-house": "满堂红",
            "flush": "同花",
            "straight": "顺子",
            "three-of-a-kind": "三条",
            "two-pair": "两对",
            "one-pair": "一对",
            "high-card": "散牌",
            "no-card": "没牌"
        },

        letMeSee: "让我看看"
    },
    en:{
        win:"WIN",
        lose:"LOSE",
        tie:"TIE",
        handTypeDisplayName: {
            "five-of-a-kind": "5 of a kind",
            "straight-flush": "straight flush",
            "four-of-a-kind": "4 of a kind",
            "full-house": "full house",
            "flush": "flush",
            "straight": "straight",
            "three-of-a-kind": "3 of a kind",
            "two-pair": "two pairs",
            "one-pair": "one pair",
            "high-card": "high card",
            "no-card": "no card"
        },

        letMeSee: "Let me see"
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
    getMoney: 0.25,
    gameOver: 0.9,
    letMeSee: 0.5,
    slot_machine: 2.2
};

var dimens = {
    card_size: {
        width: 50,
        height: 70
    },
    card_number_position:{
        x: 10,
        y: 55
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

    hand_line_card_padding : 0,

    bonus: {
        "five-of-a-kind": 100,
        "straight-flush": 50,
        "four-of-a-kind": 40,
        "full-house": 30,
        "flush": 20,
        "straight": 15,
        "three-of-a-kind": 10,
        "two-pair": 4,
        "one-pair": 2,
        "high-card": 1,
        "no-card": 1
    }
};
