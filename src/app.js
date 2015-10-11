var GENERATE_CARD_INTERVAL = 5;

var MainLayer = cc.LayerColor.extend({
    sprite:null,
    ctor:function (options) {
        this._super(colors.table);
        this.need_read_fight = options.need_read_fight;

        this.initAudio();

        var size = cc.winSize;

        this.model = options.model;
        this.player1 = this.model.player1;
        this.player2 = this.model.player2;

        this.addChild(this.player1Sprite = new PlayerSprite({
            model : this.player1
        }));
        this.addChild(this.player2Sprite=new PlayerSprite({
            model : this.player2
        }));


        var pauseItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("pause-default.png"),
            cc.spriteFrameCache.getSpriteFrame("pause-press.png"),
            function () {

            }, this);
        pauseItem.attr({
            x: 0,
            y: cc.winSize.height/2,
            anchorX: 0,
            anchorY: 0.5
        });
        var menu = new cc.Menu([pauseItem]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);

        this.betRateLabel1 = new cc.LabelTTF("", "Arial", 30 );
//        this.betRateLabel1.enableOutline(colors.tableLabelOutline, 2);
//        this.betRateLabel1.setTextColor(colors.tableLabel);
        this.betRateLabel1.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            //anchorX: 1,
            anchorY: 1
        });
        this.addChild(this.betRateLabel1, 0);
        this.betRateLabel2 = new cc.LabelTTF("", "Arial", 30);//ccui.Text("", "Arial", 30 );
//        this.betRateLabel2.enableOutline(colors.tableLabelOutline, 2);
//        this.betRateLabel2.setTextColor(colors.tableLabel);
        this.betRateLabel2.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            rotation: 180,
            //anchorX: 0,
            anchorY: 1
        });
        this.addChild(this.betRateLabel2, 0);


        this.handTypeLabel1 = new cc.LabelTTF("", "Arial", 50 );
//        this.handTypeLabel1.enableOutline(colors.tableLabelOutline, 2);
//        this.handTypeLabel1.setTextColor(colors.tableLabel);
        this.handTypeLabel1.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: 120
        });
        this.addChild(this.handTypeLabel1, 0);
        this.handTypeLabel1.setVisible(false);

        this.handTypeLabel2 = new cc.LabelTTF("", "Arial", 50 );
//        this.handTypeLabel2.enableOutline(colors.tableLabelOutline, 2);
//        this.handTypeLabel2.setTextColor(colors.tableLabel);
        this.handTypeLabel2.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height - 120,
            rotation: 180
        });
        this.addChild(this.handTypeLabel2, 0);
        this.handTypeLabel2.setVisible(false);

        this.winLoseLabel1 = new cc.LabelTTF("", "Arial", 80 );
//        this.winLoseLabel1.enableOutline(colors.tableLabelOutline, 2);
//        this.winLoseLabel1.setTextColor(colors.tableLabel);
        this.winLoseLabel1.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: 250
        });
        this.addChild(this.winLoseLabel1, 0);
        this.winLoseLabel1.setVisible(false);

        this.winLoseLabel2 = new cc.LabelTTF("", "Arial", 80 );
//        this.winLoseLabel2.enableOutline(colors.tableLabelOutline, 2);
//        this.winLoseLabel2.setTextColor(colors.tableLabel);
        this.winLoseLabel2.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height - 250,
            rotation: 180
        });
        this.addChild(this.winLoseLabel2, 0);
        this.winLoseLabel2.setVisible(false);

        this.countDownLabel = new cc.LabelTTF("", "Arial", 70 );
//        this.countDownLabel.enableOutline(colors.tableLabelOutline, 2);
//        this.countDownLabel.setTextColor(colors.tableLabel);
        this.countDownLabel.attr({
            color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2
        });
        this.addChild(this.countDownLabel, 50);
        this.countDownLabel.setVisible(false);

        if ( this.need_read_fight ) {
            this.chipSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("ready.png"));
            this.chipSprite.attr({
                x:cc.winSize.width/2,
                y:cc.winSize.height/2
            })
            this.addChild(this.chipSprite);
            this.chipSprite.runAction(new cc.sequence(
                new cc.callFunc(function () {
                    cc.audioEngine.playEffect(res.ready_mp3, false);
                }, this),
                new cc.delayTime(0.4),
                new cc.scaleTo(0.2, 1, 0),
                new cc.callFunc(function () {
                    this.chipSprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("fight.png"));
                }, this),
                new cc.scaleTo(0.2, 1, 1),
                new cc.callFunc(function () {
                    cc.audioEngine.playEffect(res.fight_mp3, false);
                }, this),
                new cc.delayTime(0.5),
                new cc.callFunc(function () {
                    this.chipSprite.removeFromParent(true);
                    this.startNewRound();
                }, this)
            ));
        } else {
            this.startNewRound();
        }

        this.initEvent();

        this.renderBetRate();

        return true;
    },
    renderBetRate:function(){
        this.betRateLabel1.setString("×"+this.model.get("betRate"));
        this.betRateLabel2.setString("×"+this.model.get("betRate"));
    },
    renderMoney:function(){

    },
    onBetRateChange:function(){
        var seq = new cc.sequence(new cc.scaleTo(0.2,2,2),new cc.scaleTo(0.2,1,1));
        this.betRateLabel1.runAction(seq.clone());
        this.betRateLabel2.runAction(seq.clone());
        this.renderBetRate();
    },
    initEvent:function(){
        this.model.on("change:betRate", this.onBetRateChange, this);
        this.model.on("start-countdown", this.startRoundCountDown, this);
    },
    startRoundCountDown:function(){
        if ( gameModel.get("status") == "countDown" ) {
            return;
        }
        gameModel.set("status","countDown");
        var rotation;
        if ( gameModel.player1.canTakeCard() ) {
            rotation = 0;
        } else {
            rotation = 180
        }

        this.countDownLabel.setVisible(true);
        this.countDownLabel.setString(3);
        this.countDownLabel.attr({
            rotation: rotation,
            scaleX: 1,
            scaleY: 1
        });
        var scaleRate = 3;
        this.countDownLabel.runAction( new cc.sequence(
            new cc.callFunc(function(){
                cc.audioEngine.playEffect(res.countdown3_mp3, false);
            },this),
            new cc.scaleTo(1, scaleRate, scaleRate),
            new cc.callFunc(function(){
                cc.audioEngine.playEffect(res.countdown2_mp3, false);
                this.countDownLabel.setString(2);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.scaleTo(1, scaleRate, scaleRate),
            new cc.callFunc(function(){
                cc.audioEngine.playEffect(res.countdown1_mp3, false);
                this.countDownLabel.setString(1);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.scaleTo(1, scaleRate, scaleRate),
            new cc.callFunc(function(){
                this.countDownLabel.setVisible(false);
                this.model.clearNotOwnedCards();
                this.compareHands();
            },this)
        ));
    },
    compareHands:function(){
        this.model.set("status", "compare");
        this.unschedule(this.schedulePerSec);

        this.player1Sprite.forceShowHand();
        this.player2Sprite.forceShowHand();
        var player1Feature = this.player1.getFeature();
        var player2Feature = this.player2.getFeature();
        this.handTypeLabel1.setVisible(true);
        this.handTypeLabel1.setString( texts.handTypeDisplayName[player1Feature.type] );
        this.handTypeLabel2.setVisible(true);
        this.handTypeLabel2.setString( texts.handTypeDisplayName[player2Feature.type] );

        this.winLoseLabel1.setVisible(true);
        this.winLoseLabel2.setVisible(true);
        var money = this.model.get("betRate") * (player1Feature.rate + player2Feature.rate);
        if ( player1Feature.power > player2Feature.power ) {
            this.winLoseLabel1.setString("WIN");
            this.winLoseLabel2.setString("LOSE");
            this.giveMoney(money, this.player2Sprite, this.player1Sprite);
            cc.audioEngine.playEffect(res[player1Feature.type], false);
        } else {
            this.winLoseLabel1.setString("LOSE");
            this.winLoseLabel2.setString("WIN");
            this.giveMoney(money, this.player1Sprite, this.player2Sprite);
            cc.audioEngine.playEffect(res[player2Feature.type], false);
        }
        this.scheduleOnce(function(){
            this.model.set("betRate", this.model.get("betRate") + 1);
            if ( this.player1.get("money") <= 0 ) {
                this.gameOver();
            } else if ( this.player2.get("money") <= 0 ) {
                this.gameOver();
            } else {
                this.startNewRound();
            }
        }, times.compare)
    },
    giveMoney:function(money, fromPlayerSprite, toPlayerSprite ){
        var token100 = Math.min( 10, Math.floor(money / 100) );
        var token10 = 0;
        if ( token100 < 10 ) {
            token10 = Math.min( 10, (money % 100)/10 );
        }
        var token1 = 0;
        if ( token10 + token100 < 10 ) {
            token1 = Math.min( 10, money % 10 );
        }
        var restMoney = money - token1 - token10 * 10 - token100 * 100;
        var time = 0;
        for ( var i = 0; i < token100; i++ ) {
            var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-black.png") );
            sprite.attr({
                x: fromPlayerSprite.moneyLabel.x + Math.random()*20-10,
                y: fromPlayerSprite.moneyLabel.y + Math.random()*20-10
            });
            this.addChild(sprite, time);
            (function(sprite) {
                sprite.runAction(new cc.sequence(
                    new cc.delayTime(time),
                    new cc.callFunc(function () {
                        fromPlayerSprite.model.set("money", fromPlayerSprite.model.get("money") - 100);
                    }, this),
                    new cc.moveTo(times.giveMoney, toPlayerSprite.moneyLabel.x, toPlayerSprite.moneyLabel.y),
                    new cc.callFunc(function () {
                        toPlayerSprite.model.set("money", toPlayerSprite.model.get("money") + 100);
                        sprite.removeFromParent(true);
                    }, this)
                ));
            })(sprite, time);
            time += 0.1;
        }
        for ( var i = 0; i < token10; i++ ) {
            var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-red.png") );
            sprite.attr({
                x: fromPlayerSprite.moneyLabel.x + Math.random()*20-10,
                y: fromPlayerSprite.moneyLabel.y + Math.random()*20-10
            });
            this.addChild(sprite, time);
            (function(sprite) {
                sprite.runAction(new cc.sequence(
                    new cc.delayTime(time),
                    new cc.callFunc(function () {
                        fromPlayerSprite.model.set("money", fromPlayerSprite.model.get("money") - 10);
                    }, this),
                    new cc.moveTo(times.giveMoney, toPlayerSprite.moneyLabel.x, toPlayerSprite.moneyLabel.y),
                    new cc.callFunc(function () {
                        toPlayerSprite.model.set("money", toPlayerSprite.model.get("money") + 10);
                        sprite.removeFromParent(true);
                    }, this)
                ));
            })(sprite, time);
            time += 0.1;
        }
        for ( var i = 0; i < token1; i++ ) {
            var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-green.png") );
            sprite.attr({
                x: fromPlayerSprite.moneyLabel.x + Math.random()*20-10,
                y: fromPlayerSprite.moneyLabel.y + Math.random()*20-10
            });
            this.addChild(sprite, time);
            (function(sprite) {
                sprite.runAction(new cc.sequence(
                    new cc.delayTime(time),
                    new cc.callFunc(function () {
                        fromPlayerSprite.model.set("money", fromPlayerSprite.model.get("money") - 1);
                    }, this),
                    new cc.moveTo(times.giveMoney, toPlayerSprite.moneyLabel.x, toPlayerSprite.moneyLabel.y),
                    new cc.callFunc(function () {
                        toPlayerSprite.model.set("money", toPlayerSprite.model.get("money") + 1);
                        sprite.removeFromParent(true);
                    }, this)
                ));
            })(sprite, time);
            time += 0.1;
        }
        this.scheduleOnce(function(){
            fromPlayerSprite.model.set("money",fromPlayerSprite.model.get("money") - restMoney );
            toPlayerSprite.model.set("money",toPlayerSprite.model.get("money") + restMoney );
        }, time);
    },
    startNewRound:function(){
        this.model.set("status", "game");
        this.model.generateCardCountDown = 0;
        this.handTypeLabel1.setVisible(false);
        this.handTypeLabel2.setVisible(false);
        this.winLoseLabel1.setVisible(false);
        this.winLoseLabel2.setVisible(false);

        this.player1.set("hands", []);
        this.player2.set("hands", []);

        this.model.clearCards();

        this.model.newDeck();

//        for ( var i = 0; i < 10; i++ ) {
//            var cardModel = this.model.drawCard();
//            if (cardModel) {
//                var sprite = new PokerCardSprite({model: cardModel});
//                sprite.attr({
//                    x: Math.random() * 350 + 50,
//                    y: Math.random() * 500 + 150
//                })
//                this.addChild(sprite);
//                if (sprite.y >= cc.winSize.height / 2) sprite.rotation = 180;
//            }
//        }

        var self = this;
        if ( this.schedulePerSec == null ) {
            this.schedulePerSec = function () {
                if ( self.model.get("status") != "game" ) return;
                if ( self.model.generateCardCountDown <= 0 ) {
                    self.generateCards.call(self);
                    self.model.generateCardCountDown = GENERATE_CARD_INTERVAL;
                }
                self.model.generateCardCountDown--;
                self.model.totalTime++;
            }
        }
        this.schedule(this.schedulePerSec, 1);
    },
    generateCards:function(){
        var pattern = this.model.getPattern();
        var isOriginMirror = _.sample([0,1]);
        var mirrorType = _.sample([0,1]);
        var list = pattern.get("list");
        _.each(list, function(entry){
            var cardModel = this.model.drawCard();
            if ( cardModel == null ) return;

            var sprite = new PokerCardSprite({model: cardModel});
            sprite.attr({
                x: isOriginMirror ? cc.winSize.width - entry.start.x : entry.start.x,
                y: entry.start.y
            });
            this.addChild(sprite);
            var moveTime = entry.moveTime;
            if ( cardModel.get("number") === 14 ) moveTime /= 2;
            sprite.runAction(new cc.sequence(
                new cc.delayTime(entry.time),
                new cc.moveTo(moveTime, isOriginMirror ? cc.winSize.width - entry.end.x : entry.end.x, entry.end.y ),
                new cc.callFunc(function(){
                    gameModel.destroyCard(cardModel);
                },this)
            ));

            var mirrorCardModel = this.model.drawCard();
            if ( mirrorCardModel == null ) return;
            var mirrorSprite = new PokerCardSprite({model: mirrorCardModel});
            var endX,endY;
            if ( mirrorType ) {
                mirrorSprite.attr({
                    x: entry.start.x,
                    y: cc.winSize.height - entry.start.y
                });
                endX = entry.end.x;
                endY = cc.winSize.height - entry.end.y;
            } else {
                mirrorSprite.attr({
                    x: cc.winSize.width - entry.start.x,
                    y: cc.winSize.height - entry.start.y
                });
                endX = cc.winSize.width - entry.end.x;
                endY = cc.winSize.height - entry.end.y;
            }

            this.addChild(mirrorSprite);
            var moveTime = entry.moveTime;
            if ( mirrorCardModel.get("number") === 14 ) moveTime /= 2;
            mirrorSprite.runAction(new cc.sequence(
                new cc.delayTime(entry.time),
                new cc.moveTo(moveTime, endX, endY ),
                new cc.callFunc(function(){
                    gameModel.destroyCard(mirrorCardModel);
                },this)
            ));
        },this);
    },
    initAudio:function(){
        var store = cc.sys.localStorage.getItem("sound");
        if ( store != null ) {
            this.sound = store;
        } else {
            this.sound = 0.5;
        }
        cc.audioEngine.setEffectsVolume(this.sound);
    },
    gameOver:function(){
        cc.audioEngine.playEffect(res.game_over_mp3, false);
        this.betRateLabel1.setString("Game Over");
        this.betRateLabel2.setString("Game Over");

        this.betRateLabel1.runAction(new cc.spawn(new cc.moveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2),
        new cc.scaleTo(times.gameOver, 2,2)));
        this.betRateLabel2.runAction(new cc.spawn(new cc.moveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2),
            new cc.scaleTo(times.gameOver, 2,2)));
        this.handTypeLabel1.setVisible(false);
        this.handTypeLabel2.setVisible(false);

        this.player1Sprite.moneyLabel.runAction(new cc.spawn(new cc.moveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2 - 250),
            new cc.scaleTo(times.gameOver, 2,2)));
        this.player2Sprite.moneyLabel.runAction(new cc.spawn(new cc.moveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2 + 250),
            new cc.scaleTo(times.gameOver, 2,2)));

        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                cc.director.runScene(new IntroScene());
            }
        }), this);
    }
});

var GameModel = Backbone.Model.extend({
    initialize:function(){
        this.maxCountDown = 60;
        this.countDown = this.maxCountDown;
        this.generateCardCountDown = 0;
        this.set("betRate", 1);
        this.set("status", "ready");
        this.totalTime = 0;

        this.cidToModel = {};

        this.player1 = new PlayerModel({
            position : PLAYER_POSITION_DOWN,
            playerType: "player"
        });
        this.player2 = new PlayerModel({
            position : PLAYER_POSITION_UP,
            playerType: "player"
        });

        this.patternPool = [
            new PatternModel(),
            new Pattern2Model(),
            new Pattern3Model(),
            new Pattern4Model(),
            new Pattern5Model(),
            new Pattern6Model()
        ];
    },
    newDeck:function(){
        this.deck = newDeck();
        this.discardDeck = [];
    },
    drawCard:function(){
        var cardModel = this.deck.pop();
        if ( !cardModel ) {
            this.deck = _.shuffle(this.discardDeck);
            this.discardDeck = [];
            cardModel = this.deck.pop();
        }
        if ( cardModel ) {
            this.cidToModel[cardModel.cid] = cardModel;
            cardModel._owned = false;
        }
        return cardModel;
    },
    clearNotOwnedCards:function(){
        var deleteList = [];
        _.each( this.cidToModel, function(cardModel){
            if ( cardModel !=null && ! cardModel._owned ) {
                deleteList.push(cardModel);
            }
        },this);
        _.each( deleteList, function(cardModel){
            this.destroyCard(cardModel)
        },this)
    },
    clearCards:function(){
        var deleteList = [];
        _.each( this.cidToModel, function(cardModel){
            if ( cardModel !=null ) {
                deleteList.push(cardModel);
            }
        },this);
        _.each( deleteList, function(cardModel){
            this.destroyCard(cardModel)
        },this);
        this.cidToModel = {};
    },
    destroyCard:function(cardModel){
        this.discardDeck.push( new PokerCardModel({
            number: cardModel.get("number"),
            suit: cardModel.get("suit")
        }))
        cardModel.destroy();
        delete this.cidToModel[cardModel.cid];
    },
    getPattern:function(){
        return _.sample( this.patternPool );
    }
})

var MainScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        if ( window.gameModel )
            return;
        window.gameModel = new GameModel();
        var layer = new MainLayer({model:gameModel, need_read_fight:true});
        this.addChild(layer);
    }
});

