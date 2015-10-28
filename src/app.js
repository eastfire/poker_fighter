var GENERATE_CARD_INTERVAL = 5;

var texts;

var RARE_SPEED_RATE = 2;

var MainLayer = cc.LayerColor.extend({
    sprite:null,
    ctor:function (options) {
        this._super(colors.table);
        this.need_read_fight = options.need_read_fight;

        texts = texts_locale[cc.sys.language];
        if ( !texts )
            texts = texts_locale["en"];
        this.initAudio();

        this._touchInstanceUsed = {};

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

        var bound = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("player-bound.png"));
        bound.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2
        });
        this.addChild(bound);

        var pauseItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("pause-default.png"),
            cc.spriteFrameCache.getSpriteFrame("pause-press.png"),
            function () {
                cc.director.pushScene(new PauseMenuScene());
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

        this.betRateLabel1 = new ccui.Text("", "Arial", 30 );
        this.betRateLabel1.enableOutline(colors.tableLabelOutline, 2);
        this.betRateLabel1.setTextColor(colors.tableLabel);
        this.betRateLabel1.attr({
            //color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            //anchorX: 1,
            anchorY: 1
        });
        this.addChild(this.betRateLabel1, 0);
        this.betRateLabel2 = new ccui.Text("", "Arial", 30);//ccui.Text("", "Arial", 30 );
        this.betRateLabel2.enableOutline(colors.tableLabelOutline, 2);
        this.betRateLabel2.setTextColor(colors.tableLabel);
        this.betRateLabel2.attr({
            //color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            rotation: 180,
            //anchorX: 0,
            anchorY: 1
        });
        this.addChild(this.betRateLabel2, 0);


        this.handTypeLabel1 = new ccui.Text("", "Arial", 50 );
        this.handTypeLabel1.enableOutline(colors.tableLabelOutline, 2);
        this.handTypeLabel1.setTextColor(colors.tableLabel);
        this.handTypeLabel1.attr({
            //color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: 120
        });
        this.addChild(this.handTypeLabel1, 0);
        this.handTypeLabel1.setVisible(false);

        this.handTypeLabel2 = new ccui.Text("", "Arial", 50 );
        this.handTypeLabel2.enableOutline(colors.tableLabelOutline, 2);
        this.handTypeLabel2.setTextColor(colors.tableLabel);
        this.handTypeLabel2.attr({
            //color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height - 120,
            rotation: 180
        });
        this.addChild(this.handTypeLabel2, 0);
        this.handTypeLabel2.setVisible(false);

        this.winLoseLabel1 = new ccui.Text("", "Arial", 80 );
        this.winLoseLabel1.enableOutline(colors.tableLabelOutline, 2);
        this.winLoseLabel1.setTextColor(colors.tableLabel);
        this.winLoseLabel1.attr({
            //color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: 250
        });
        this.addChild(this.winLoseLabel1, 0);
        this.winLoseLabel1.setVisible(false);

        this.winLoseLabel2 = new ccui.Text("", "Arial", 80 );
        this.winLoseLabel2.enableOutline(colors.tableLabelOutline, 2);
        this.winLoseLabel2.setTextColor(colors.tableLabel);
        this.winLoseLabel2.attr({
            //color: colors.tableLabel,
            x: cc.winSize.width/2,
            y: cc.winSize.height - 250,
            rotation: 180
        });
        this.addChild(this.winLoseLabel2, 0);
        this.winLoseLabel2.setVisible(false);

        this.countDownLabel = new ccui.Text("", "Arial", 70 );
        this.countDownLabel.enableOutline(colors.tableLabelOutline, 2);
        this.countDownLabel.setTextColor(colors.tableLabel);
        this.countDownLabel.attr({
            //color: colors.tableLabel,
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
            this.chipSprite.runAction(new cc.Sequence(
                new cc.CallFunc(function () {
                    cc.audioEngine.playEffect(res.ready_mp3, false);
                }, this),
                new cc.DelayTime(0.4),
                new cc.ScaleTo(0.2, 1, 0),
                new cc.CallFunc(function () {
                    this.chipSprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("fight.png"));
                }, this),
                new cc.ScaleTo(0.2, 1, 1),
                new cc.CallFunc(function () {
                    cc.audioEngine.playEffect(res.fight_mp3, false);
                }, this),
                new cc.DelayTime(0.5),
                new cc.CallFunc(function () {
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
        var seq = new cc.Sequence(new cc.ScaleTo(0.2,2,2),new cc.ScaleTo(0.2,1,1));
        this.betRateLabel1.runAction(seq.clone());
        this.betRateLabel2.runAction(seq.clone());
        this.renderBetRate();
    },
    initEvent:function(){
        this.model.on("change:betRate", this.onBetRateChange, this);
        this.model.on("start-countdown", this.startRoundCountDown, this);
        cc.eventManager.addListener(this.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var touchId = cc.sys.isNative ? touch.getID() : touch.__instanceId;
                _.each( target.getChildren(), function(sprite){
                    if ( sprite instanceof PokerCardSprite && sprite.canBeTouch() && (!target._touchInstanceUsed[touchId] || sprite.touchingInstanceId === touchId ) ) {
                        var padding = 0;
                        var rect = cc.rect(sprite.x-sprite.width/2+padding, sprite.y-sprite.height/2+padding, sprite.width-2*padding,sprite.height-2*padding);

                        //Check the click area
                        if (cc.rectContainsPoint(rect, locationInNode)){
                            sprite.stopAllActions();
                            sprite.touchingInstanceId = touchId;
                            target._touchInstanceUsed[touchId] = true;
                            var delta = touch.getDelta();
                            sprite.x += delta.x;
                            sprite.y += delta.y;
                            sprite.speedX = delta.x;
                            if ( delta.y == 0 ) {
                                if (sprite.y >= cc.winSize.height / 2) {
                                    sprite.speedY = 1;
                                } else {
                                    sprite.speedY = -1;
                                }
                            } else {
                                sprite.speedY = delta.y;
                            }
                        } else if ( sprite.touchingInstanceId === touchId ) {
                            sprite.touchingInstanceId = null;
                            delete target._touchInstanceUsed[touchId];
                            sprite.onTouchRelease.call(sprite);
                        }
                    }
                },target);
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var prevLocationInNode = target.convertToNodeSpace(touch.getPreviousLocation());
                var touchId = cc.sys.isNative ? touch.getID() : touch.__instanceId;
                _.each( target.getChildren(), function(sprite){
                    if ( sprite instanceof PokerCardSprite && sprite.canBeTouch() ) {
                        var rect = cc.rect(sprite.x-sprite.width/2, sprite.y-sprite.height/2, sprite.width,sprite.height);

                        //Check the click area
                        if ( sprite.touchingInstanceId === touchId ){
                            sprite.touchingInstanceId = null;
                            sprite.onTouchRelease.call(sprite);
                        }
                    }
                },target);
                delete target._touchInstanceUsed[touchId];
            }
        }), this);
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

        this.countDownLabel.attr({
            rotation: rotation
        });
        var scaleRate = 3;
        this.countDownLabel.runAction( new cc.Sequence(
            new cc.CallFunc(function(){
                cc.audioEngine.playEffect(res.countdown5_mp3, false);
                this.countDownLabel.setString(5);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.ScaleTo(1, scaleRate, scaleRate),
            new cc.CallFunc(function(){
                cc.audioEngine.playEffect(res.countdown4_mp3, false);
                this.countDownLabel.setString(4);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.ScaleTo(1, scaleRate, scaleRate),
            new cc.CallFunc(function(){
                cc.audioEngine.playEffect(res.countdown3_mp3, false);
                this.countDownLabel.setString(3);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.ScaleTo(1, scaleRate, scaleRate),
            new cc.CallFunc(function(){
                cc.audioEngine.playEffect(res.countdown2_mp3, false);
                this.countDownLabel.setString(2);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.ScaleTo(1, scaleRate, scaleRate),
            new cc.CallFunc(function(){
                cc.audioEngine.playEffect(res.countdown1_mp3, false);
                this.countDownLabel.setString(1);
                this.countDownLabel.attr({
                    scaleX: 1,
                    scaleY: 1
                });
            },this),
            new cc.ScaleTo(1, scaleRate, scaleRate),
            new cc.CallFunc(function(){
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
        var winner = 0;
        if ( player1Feature.power > player2Feature.power ) {
            this.winLoseLabel1.setString(texts.win);
            this.winLoseLabel2.setString(texts.lose);
            this.giveMoney(money, this.player2Sprite, this.player1Sprite);
            cc.audioEngine.playEffect(res[player1Feature.type], false);
            winner = 1;
        } else if ( player2Feature.power > player1Feature.power ) {
            this.winLoseLabel1.setString(texts.lose);
            this.winLoseLabel2.setString(texts.win);
            this.giveMoney(money, this.player1Sprite, this.player2Sprite);
            cc.audioEngine.playEffect(res[player2Feature.type], false);
            winner = 2;
        } else {
            this.winLoseLabel1.setString(texts.tie);
            this.winLoseLabel2.setString(texts.tie);
            cc.audioEngine.playEffect(res.tie, false);
        }
        this.scheduleOnce(function(){
            this.model.set("betRate", this.model.get("betRate") + 1);
            if ( this.player1.get("money") <= 0 || ( this.player2.get("money") >= this.player2.get("initMoney") * 2 && winner === 2 ) ) {
                this.gameOver();
            } else if ( this.player2.get("money") <= 0 || ( this.player1.get("money") >= this.player1.get("initMoney") * 2 && winner === 1) ) {
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
                sprite.runAction(new cc.Sequence(
                    new cc.DelayTime(time),
                    new cc.CallFunc(function () {
                        fromPlayerSprite.model.set("money", fromPlayerSprite.model.get("money") - 100);
                    }, this),
                    new cc.MoveTo(times.giveMoney, toPlayerSprite.moneyLabel.x, toPlayerSprite.moneyLabel.y),
                    new cc.CallFunc(function () {
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
                sprite.runAction(new cc.Sequence(
                    new cc.DelayTime(time),
                    new cc.CallFunc(function () {
                        fromPlayerSprite.model.set("money", fromPlayerSprite.model.get("money") - 10);
                    }, this),
                    new cc.MoveTo(times.giveMoney, toPlayerSprite.moneyLabel.x, toPlayerSprite.moneyLabel.y),
                    new cc.CallFunc(function () {
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
                sprite.runAction(new cc.Sequence(
                    new cc.DelayTime(time),
                    new cc.CallFunc(function () {
                        fromPlayerSprite.model.set("money", fromPlayerSprite.model.get("money") - 1);
                    }, this),
                    new cc.MoveTo(times.giveMoney, toPlayerSprite.moneyLabel.x, toPlayerSprite.moneyLabel.y),
                    new cc.CallFunc(function () {
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

//        var cardModel = this.model.drawCard();
//        var sprite = new PokerCardSprite({model: cardModel});
//        sprite.attr({
//            x: 300,
//            y: 200
//        });
//        this.addChild(sprite);

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
    speedAdjust:function(moveTime, player){
        if ( player.get("speedUp") ) {
            moveTime /= 2;
        }
        if ( player.get("speedDown") ) {
            moveTime *= 2;
        }
        return moveTime;
    },
    generateCards:function(){
        var pattern = this.model.getPattern();
        var isOriginMirror = _.sample([0,1]);
        var mirrorType = _.sample([0,1]);
        var list = pattern.get("list");
        _.each(list, function(entry){
            var cardModel;
            var sprite;
            if ( this.model.get("allowCoin") && Math.random() < this.model.get("coinAppearRate")) {
                var money = 1;
                var isRare = false;
                if ( this.model.get("betRate") >= 10 ) {
                    money = 10;
                }
                if ( Math.random() < this.model.get("bigMoneyRate") ) {
                    money *= 10;
                    isRare = true;
                }
                cardModel = new MoneyCardModel({
                    money: money,
                    isRare: isRare
                });
                this.model.manageCard(cardModel);
                sprite = new MoneySpecialCardSprite({model: cardModel});
            } else {
                cardModel = this.model.drawCard();
                if ( cardModel == null ) return;
                sprite = new PokerCardSprite({model: cardModel});
            }

            sprite.attr({
                x: isOriginMirror ? cc.winSize.width - entry.start.x : entry.start.x,
                y: entry.start.y
            });
            this.addChild(sprite);
            var moveTime = entry.moveTime;
            if ( cardModel.get("isRare") ) moveTime /= RARE_SPEED_RATE;
            if ( sprite.y > cc.winSize.height/2 ) {
                moveTime = this.speedAdjust(moveTime, gameModel.player2);
            } else {
                moveTime = this.speedAdjust(moveTime, gameModel.player1);
            }
            sprite.runAction(new cc.Sequence(
                new cc.DelayTime(entry.time),
                new cc.MoveTo(moveTime, isOriginMirror ? cc.winSize.width - entry.end.x : entry.end.x, entry.end.y ),
                new cc.CallFunc(function(){
                    gameModel.destroyCard(cardModel);
                },this)
            ));

            var mirrorCardModel;
            var mirrorSprite;
            if ( cardModel instanceof MoneyCardModel ) {
                mirrorCardModel = new MoneyCardModel({
                    money: cardModel.get("money"),
                    isRare: cardModel.get("isRare")
                });
                this.model.manageCard(mirrorCardModel);
                mirrorSprite = new MoneySpecialCardSprite({model: mirrorCardModel});
            } else if ( cardModel instanceof PokerCardModel ) {
                mirrorCardModel = this.model.drawCard();
                if ( mirrorCardModel == null ) return;
                mirrorSprite = new PokerCardSprite({model: mirrorCardModel});
            }

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
            if ( mirrorSprite.y > cc.winSize.height/2 ) {
                mirrorSprite.rotation = 180;
            }

            this.addChild(mirrorSprite);
            var moveTime = entry.moveTime;
            if ( mirrorCardModel.get("isRare") ) moveTime /= RARE_SPEED_RATE;
            if ( mirrorSprite.y > cc.winSize.height/2 ) {
                moveTime = this.speedAdjust(moveTime, gameModel.player2);
            } else {
                moveTime = this.speedAdjust(moveTime, gameModel.player1);
            }
            mirrorSprite.runAction(new cc.Sequence(
                new cc.DelayTime(entry.time),
                new cc.MoveTo(moveTime, endX, endY ),
                new cc.CallFunc(function(){
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

        this.betRateLabel1.runAction(new cc.Spawn(new cc.MoveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2),
        new cc.ScaleTo(times.gameOver, 2,2)));
        this.betRateLabel2.runAction(new cc.Spawn(new cc.MoveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2),
            new cc.ScaleTo(times.gameOver, 2,2)));
        this.handTypeLabel1.setVisible(false);
        this.handTypeLabel2.setVisible(false);

        this.player1Sprite.moneyLabel.runAction(new cc.Spawn(new cc.MoveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2 - 250),
            new cc.ScaleTo(times.gameOver, 2,2)));
        this.player2Sprite.moneyLabel.runAction(new cc.Spawn(new cc.MoveTo(times.gameOver, cc.winSize.width/2, cc.winSize.height/2 + 250),
            new cc.ScaleTo(times.gameOver, 2,2)));

        gameModel.off();
        gameModel = null;
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
    defaults:function(){
        return {
            player1Money: 500,
            player2Money: 500,
            allowCoin: true,
            coinAppearRate: 0.2,
            bigMoneyRate: 0.1,
            allowItem: true,
            itemAppearRate: 0.1,
            gameSpeed: 1
        }
    },
    initialize:function(){
        this.maxCountDown = 60;
        this.countDown = this.maxCountDown;
        this.generateCardCountDown = 0;
        this.set("betRate", 1);
        this.set("status", "ready");
        this.totalTime = 0;

        this.cidToModel = {};

        this.player1 = new PlayerModel({
            money: this.get("player1Money"),
            position : PLAYER_POSITION_DOWN,
            playerType: "player"
        });
        this.player2 = new PlayerModel({
            money: this.get("player2Money"),
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
    manageCard:function(cardModel){
        this.cidToModel[cardModel.cid] = cardModel;
        cardModel._owned = false;
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
        if ( cardModel instanceof PokerCardModel ) {
            this.discardDeck.push(new PokerCardModel({
                number: cardModel.get("number"),
                suit: cardModel.get("suit"),
                isRare: cardModel.get("isRare")
            }))
        }
        cardModel.destroy();
        delete this.cidToModel[cardModel.cid];
    },
    getPattern:function(){
        return _.sample( this.patternPool );
    }
})

var PauseMenuLayer = cc.LayerColor.extend({
    ctor:function(){
        this._super(colors.table);

        var resumeItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("resume-default.png"),
            cc.spriteFrameCache.getSpriteFrame("resume-press.png"),
            function () {
                cc.director.popScene();
            }, this);
        resumeItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/8
        });

        var infoItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("info-default.png"),
            cc.spriteFrameCache.getSpriteFrame("info-press.png"),
            function () {

            }, this);
        infoItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*3/8
        });

        var restartItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("restart-default.png"),
            cc.spriteFrameCache.getSpriteFrame("restart-press.png"),
            function () {
                window.gameModel = null;
                cc.director.runScene(new MainScene());
            }, this);
        restartItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*5/8
        });

        var exitItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("exit-default.png"),
            cc.spriteFrameCache.getSpriteFrame("exit-press.png"),
            function () {
                window.gameModel = null;
                cc.director.runScene(new IntroScene());
            }, this);
        exitItem.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height*7/8
        });

        var menu = new cc.Menu([exitItem, restartItem, infoItem, resumeItem ]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);
    }
})

var PauseMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new PauseMenuLayer();
        this.addChild(layer);
    }
});

var MainScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        if ( window.gameModel )
            return;
        window.gameModel = new GameModel();
        window.mainLayer = new MainLayer({model:gameModel, need_read_fight:true});
        this.addChild(window.mainLayer);
    }
});

