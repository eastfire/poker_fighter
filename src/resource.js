var res = {
    game_plist : "res/game.plist",
    game_png : "res/game.png",

    intro_png : "res/intro.png",

    explosion_mp3: "res/explosion.mp3",
    spring_mp3: "res/spring-boing.mp3",
    slot_machine_mp3: "res/slot-machine.mp3",
    cash_register_mp3: "res/cash-register.mp3",
    dizzy_mp3: "res/dizzy.mp3",
    kiss_mp3: "res/kiss.mp3",
    magnet_mp3: "res/magnet.mp3",
    slow_down_mp3: "res/slow-down.mp3",
    speed_up_mp3: "res/speed-up.mp3",
    sniper_mp3: "res/sniper.mp3",
    shrink_mp3: "res/shrink.mp3",
    enlarge_mp3: "res/enlarge.mp3",
    forbid_mp3: "res/forbid.mp3",
    tornado_mp3: "res/tornado.mp3",
    click_mp3: "res/click-button.mp3",
    thief_mp3: "res/thief.mp3",
    chip0_mp3: "res/chip0.mp3",
    chip1_mp3: "res/chip1.mp3",
    chip2_mp3: "res/chip2.mp3",
    chip3_mp3: "res/chip3.mp3",
    chips0_mp3: "res/chips0.mp3",
    chips1_mp3: "res/chips1.mp3",
    chips2_mp3: "res/chips2.mp3",
    chips3_mp3: "res/chips3.mp3",
    chips4_mp3: "res/chips4.mp3",

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

        letMeSee: "让我看看",
        player1 : "玩家1",
        player2 : "玩家2",
        aiPlayer: "AI玩家",
        deck: "使用的牌堆",
        token: "出现筹码",
        item: "出现道具",
        none: "无",
        few: "少量",
        normal: "普通",
        many: "很多",
        mania: "疯狂",

        startGame: "开始游戏",
        useDefault: "默认",
        returnToIntro: "返回",

        gameOver: "GAME OVER"
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

        letMeSee: "Let me see",
        player1 : "player1",
        player2 : "player2",
        aiPlayer: "A.I.",
        deck: "Using Deck",
        token: "Flying Token",
        item: "Flying Item",
        none: "none",
        few: "few",
        normal: "normal",
        many: "many",
        mania: "mania",

        startGame: "START GAME",
        useDefault: "DEFAULT",
        returnToIntro: "RETURN",

        gameOver: "GAME OVER"
    }
};



var colors = {
    table: new cc.color(0x3b,0x7f,0x42),
    tableLabel: new cc.color(0xd6,0xfe,0x9d),
    tableLabelOutline: new cc.color(0x40,0x66,0x1d),
    tutorial: new cc.color(0x80,0x80,0x80, 192)
};

var times = {
    card_sort : 0.1,
    performSkill: 0.2,
    flip: 0.2,
    quickFlip: 0.1,
    takeCard: 0.3,
    rotateDirection: 0.1,
    compare: 4,
    readResult: 1,
    giveMoney: 0.4,
    getMoney: 0.25,
    gameOver: 0.9,
    letMeSee: 0.5,
    slot_machine: 2.2,
    forbid: 0.4
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
    },

    //mode-select

    player1NamePosition: {
        x: 20,
        y: 700
    },
    player2NamePosition: {
        x: 20,
        y: 760
    },
    player1InitMoneyPosition: {
        x: 170,
        y: 700
    },
    player2InitMoneyPosition: {
        x: 170,
        y: 760
    },
    player1TargetMoneyPosition: {
        x: 350,
        y: 700
    },
    player2TargetMoneyPosition: {
        x: 350,
        y: 760
    },
    usingDeckPosition:{
        x: 150,
        y: 640
    },
    flyingMoney:{
        x: 50,
        y: 580
    },
    flyingItem:{
        x: 50,
        y: 520
    },
    itemList: {
        y: 445,
        stepY: 90
    },
    startGame:{
        y: 40
    }
};
