var res = {
    game_plist : "res/game.plist",
    game_png : "res/game.png",

    intro_png : "res/intro.png",

    card_slide_mp3: "res/card-slide.mp3",
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

        gameOver: "GAME OVER",

        tutorials: {
            touchThisCard: "请点击这张牌。\n牌也可以被滑动或拖动。",
            showYourCard: "你得到了自己的第一张牌\n长按这个区域可以查看自己的手牌\n别让对手偷瞄到哦 ;)",
            collectYourCard:"在游戏过程中，你要不断收集手牌\n将手牌组成扑克牌的牌型\n牌型比对手大时就能赢得对手的钱。",
            thisIsYourMoney: "这是你的钱。\n如果你没钱了，你就输掉了游戏！",
            thisIsYourTarget: "这是你的目标金钱。\n如果你的钱达到这个数字，\n并且赢了一局，你就赢得游戏胜利！",
            thisIsForbidLine: "这是iOS浏览器的禁断之线。\n请勿在此区域向右滑动\n否则世界就会毁灭！",
            thisIsCountDown:"当任何一方得到５张手牌\n留给另一方的时间只剩下５秒",
            compareHands: "当倒计时结束，\n将比较双方的牌型。\n牌型较强的一方胜。",
            compareHands2: "如果牌型相同，\n则比较参与牌型的关键牌中最大的一张牌。\n(例如：满堂红中组成三条的牌)",
            betHelp:"牌型胜者得到败者的钱。\n钱数由双方的牌型对应的赌注之和，\n乘以当前赔率得到",
            handHelp: "如需牌型大小及其对应赌注的帮助，\n可以点击此按钮。",
            betRateIncrease: "赔率每经过一局会增加１"
        },

        items: {
            unknown: "未知",
            charge_before: "(可用",
            charge_after: "次)",
            on: "已开启",
            off: "已关闭",

            "unused":"你需要使用过这个道具一次才能在配置中停用或启用这个道具。",
            "ace":{
                name:"A",
                desc:"召唤一张无花色的A朝自己移动。"
            },
            bomb:{
                name:"炸弹",
                desc:"朝对手扔出一颗炸弹。如进入他的手牌，可以随机破坏他的一张手牌，但如果对手手牌已满则无效。"
            },
            cloud:{
                name:"行云",
                desc:"召唤很多行云干扰对手的视线。"
            },
            diamond:{
                name:"钻石",
                desc:"吸引全场的Q朝自己移动。"
            },
            dizzy:{
                name:"眩晕",
                desc:"对手的牌、筹码、道具不停旋转，持续10秒。"
            },
            enlarge:{
                name:"放大",
                desc:"放大自己的牌、筹码、道具，持续10秒。"
            },
            fast:{
                name:"快进",
                desc:"对手的牌、筹码、道具运动速度加快，持续10秒"
            },
            forbid:{
                name:"禁止",
                desc:"对手无法使用或获得道具。"
            },
            hammer:{
                name:"雷神之锤",
                desc:"召唤一个神锤击向对方区域。消灭任何打到的东西，吹飞敌方区域所有东西。"
            },
            kiss:{
                name:"热吻",
                desc:"吸引全场的K和J朝自己移动。"
            },
            leaf:{
                name:"落叶",
                desc:"召唤很多落叶干扰对手的视线。"
            },
            magnet:{
                name:"金钱磁铁",
                desc:"吸引全场的筹码朝自己移动（包括假的）"
            },
            nuke:{
                name:"核弹",
                desc:"消灭全场的牌、筹码和所有玩家的手牌。倒计时也会取消。"
            },
            shrink:{
                name:"缩小",
                desc:"缩小对手的牌、筹码、道具，持续10秒。"
            },
            spy:{
                name:"间谍",
                desc:"对手亮出手牌，持续10秒。"
            },
            slow:{
                name:"慢进",
                desc:"自己的牌、筹码、道具运动速度减慢，持续10秒"
            },
            sniper:{
                name:"狙击",
                desc:"消灭对手场上最大的牌，如果对手场上没有牌时则无效。"
            },
            thief:{
                name:"小偷",
                desc:"放出一个化装成筹码的小偷，如果进入对手的金库，可以偷走对手一些钱（数量受当前赔率影响）"
            },
            tornado:{
                name:"旋风",
                desc:"在对手面前放出很多旋风，干扰对手拿牌。"
            },
            two:{
                name:"2",
                desc:"召唤一张无花色的2朝对手移动。"
            }
        }
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

        gameOver: "GAME OVER",

        tutorials: {
            touchThisCard: "Touch this card.\nCards can also be swiped or dragged.",
            showYourCard: "You got you first card.\nCheck you hands by long press this area.\nDon't let opponent peek your cards ;)",
            collectYourCard:"Keep collecting cards.\nForm your cards to a Poker Hands.\nWin opponent's money by beat his hands.",
            thisIsYourMoney: "This is your money.\nIf your money is gone, you lose!",
            thisIsYourTarget: "This is your victory goal.\nIf your money reach this goal \nafter winning a round,you win the game!",
            thisIsForbidLine: "This is a forbid line for iOS Browser.\nPlease don't swipe from this area.\nOr the game will be closed!",
            thisIsCountDown:"When any player get their fifth card.\nThe other player only has five seconds left.",
            compareHands: "When count down finish,\nrevealed and compared both players' cards.\nPlayer with stronger hand win.",
            compareHands2: "If there is a tie,\ncompare key highest card that form the Hand.\n(e.g.:Card that form triple in Full House.)",
            betHelp:"Winner get money from loser.\nMoney amount equal to total of\nboth players hands' gambit,\nmultiplied by current bet rate.",
            handHelp: "If you need more info of\nPoker Hand and its gambit,\nclick this button.",
            betRateIncrease: "Bet rate increase 1 per round."
        },

        items: {
            unknown: "UNKNOWN",
            charge_before: "(",
            charge_after: "charges)",
            on: "ON",
            off: "OFF",

            "unused":"Use this item at least once, then you can switch it on or off in game options.",
            "ace":{
                name:"ACE",
                desc:"Summon an ace card which has no suit move toward you."
            },
            bomb:{
                name:"BOMB",
                desc:"Summon a bomb toward opponent.If it reach player's hand, bomb will randomly destroy one of his card.(If player's hand is full, bomb has no effect)"
            },
            cloud:{
                name:"CLOUD",
                desc:"Summon many clouds to disturb opponent sight."
            },
            diamond:{
                name:"DIAMOND",
                desc:"Attract all Qs toward you."
            },
            dizzy:{
                name:"DIZZY",
                desc:"All opponent's cards,tokens and items will rotate repeatedly for 10 seconds."
            },
            enlarge:{
                name:"ENLARGE",
                desc:"Enlarge all your cards,tokens and items for 10 seconds."
            },
            fast:{
                name:"FAST FORWARD",
                desc:"All opponent's cards,tokens and items move fast for 10 seconds."
            },
            forbid:{
                name:"Forbid",
                desc:"Opponent cant use item or get item for 10 seconds."
            },
            hammer:{
                name:"HAMMER OF GOD",
                desc:"Summon a hammer toward opponent.It will destroy anything it hit and blow away everything in opponent's field."
            },
            kiss:{
                name:"KISS",
                desc:"Attract all Ks and Js toward you."
            },
            leaf:{
                name:"FALLING LEAVES",
                desc:"Summon many falling leaves to disturb opponent sight."
            },
            magnet:{
                name:"TOKEN MAGNET",
                desc:"Attract all tokens toward you(including fake one)."
            },
            nuke:{
                name:"NUKE",
                desc:"Destroy all cards and tokens and all players' hands.Count down will also be cancelled."
            },
            shrink:{
                name:"SHRINK",
                desc:"Shrink all opponent's cards,tokens and items for 10 seconds."
            },
            spy:{
                name:"SPY",
                desc:"Opponent show you his hand for 10 seconds."
            },
            slow:{
                name:"SLOW FORWARD",
                desc:"All your cards,tokens and items move slowly for 10 seconds."
            },
            sniper:{
                name:"SNIPER",
                desc:"Destroy highest card in opponent's field.(If there is no card in opponent's field, nothing happened)"
            },
            thief:{
                name:"THIEF",
                desc:"Summon a thief who disguised as a token move toward opponent.If thief enter player's hand, he will steal money from him.(Money amount if effected by current bet rate)"
            },
            tornado:{
                name:"TORNADO",
                desc:"Summon many tornadoes in opponent's field which will disturb his taking card or token."
            },
            two:{
                name:"2",
                desc:"Summon a 2 card which has no suit move toward opponent."
            }
        }
    }
};



var colors = {
    table: new cc.color(0x3b,0x7f,0x42),
    tableLabel: new cc.color(0xd6,0xfe,0x9d),
    tableLabelOutline: new cc.color(0x40,0x66,0x1d),
    tutorialMask: new cc.color(0x00,0x00,0x00, 192),
    tutorialLabel: cc.color.WHITE,

    itemMask: cc.color.GRAY,
    itemOn: cc.color.GREEN,
    itemOff: cc.color.RED
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
    },
    itemDescIcon:{
        x: 50,
        y: 220
    }
};
