var ItemModel = Backbone.Model.extend({
    defaults:function(){
        return {
            maxCharge: 1,
            durationTime: 1,
            maxCoolDown: 1,
            showCharge: false
        }
    },
    initialize:function(){
        this.set({
            charge: this.get("maxCharge"),
            coolDown: 0
        });
    },
    effect:function(playerSprite, opponentPlayerSprite){

    },
    canUse:function(){
        return this.get("charge") > 0 && this.get("coolDown") <= 0;
    }
});

var CloudItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"cloud",
            maxCharge: 1,
            maxCoolDown: 10,
            showCharge: false,
            cloudCount : 50,
            cloudScale: 1.75,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isMirror = Math.random() > 0.5;
        var startX = isMirror ? cc.winSize.width+80 : -80;
        var endX = isMirror ? -80 : cc.winSize.width+80;
        var rotation = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN ? 0 : 180;
        var rect = opponentPlayerSprite.getEffectRect();
        var scale = this.get("cloudScale");
        opponentPlayerSprite.model.set("blockSight", this.get("effectTime"));
        for ( var i = 0; i < this.get("cloudCount") ; i ++ ) {
            var cloud = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("cloud.png"));
            cloud.attr( {
                x: startX ,
                y: Math.round(Math.random()*(rect.height - 30)*10)/10+rect.y+15,
                rotation: rotation,
                scaleX: scale,
                scaleY: scale
            } );
            mainLayer.addChild(cloud,50);

            (function(sprite) {
                var delay = Math.round(Math.random()*50)/10;
                sprite.runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.moveTo(5, endX, sprite.y),
                    cc.callFunc(function () {
                        sprite.removeFromParent(true);
                    })))
            })(cloud);
        }
    }
});

var AceItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"ace",
            maxCharge: 1,
            maxCoolDown: 0,
            showCharge: false,
            moveTime: 5
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = playerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = playerSprite.getEffectRect();
        var rotation = isDown ? 0 : 180;
        var startY = cc.winSize.height/2;
        var startX = 50 + Math.random()*(cc.winSize.width-100);
        var cardModel = new PokerCardModel({
            suit: 4,
            number: 14
        });
        cardModel.isSpecialCard = true;
        var cardSprite = new PokerCardSprite({
            model: cardModel
        });
        var scale = playerSprite.model.getSizeAdjust();
        cardSprite.attr({
            x: startX,
            y: startY,
            opacity: 0
        });
        cardSprite.contentSprite.attr({
            scaleX: scale,
            scaleY: scale,
            rotation: rotation
        })
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = playerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.lastTouchBy = playerSprite.model.get("position")
                this.onTouchRelease()
            },cardSprite)).speed(speedScale));
    }
});

var DizzyItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"dizzy",
            maxCharge: 1,
            maxCoolDown: 1,
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.dizzy_mp3, false);
        opponentPlayerSprite.model.set("dizzy", this.get("effectTime"));
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if (opponentPlayerSprite.isThisSide(sprite.y) && !sprite.alreadyTaken ){
                    sprite.dizzy();
                }
            }
        });
    }
});

var FastItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"fast",
            maxCharge: 1,
            maxCoolDown: 1,
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.speed_up_mp3, false);
        opponentPlayerSprite.model.set({
            "speedDown":0,
            "speedUp":this.get("effectTime")
        });
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if (opponentPlayerSprite.isThisSide(sprite.y) && !sprite.alreadyTaken){
                    sprite.onTouchRelease();
                }
            }
        });
    }
});

var HammerItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"hammer",
            maxCharge: 1,
            maxCoolDown: 1,
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var rotation, x,y;
        x = Math.random()*(cc.winSize.width-140)+70
        if ( playerSprite.model.get("position") === PLAYER_POSITION_DOWN ) {
            y = dimens.player2Y - Math.random()*(cc.winSize.height/4)
            rotation = 0;
        } else {
            y = Math.random()*(cc.winSize.height/4)+dimens.player1Y
            rotation = 180
        }
        var hammerSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("hammer.png"))
        hammerSprite.attr({
            x:playerSprite.itemSlotSprite.x,
            y:playerSprite.itemSlotSprite.y,
            opacity: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            rotation: rotation
        })
        mainLayer.addChild(hammerSprite);
        var hammerWidth = 30;
        var hammerHeight = 20;
        hammerSprite.runAction(cc.sequence(cc.fadeIn(0.1), cc.spawn(cc.scaleTo(0.4, 1,1),cc.moveTo(0.4, x,y), cc.rotateBy(0.4,1080)), cc.callFunc(function(){
            cc.audioEngine.playEffect(res.explosion_mp3,false)
            mainLayer.shake();
            _.each( mainLayer.getChildren(), function(sprite) {
                if (sprite instanceof NormalCardSprite ) {
                    if (opponentPlayerSprite.isThisSide(sprite.y) && !sprite.alreadyTaken){
                        var dx = sprite.x - x;
                        var dy = sprite.y - y;
                        if ( Math.abs(dx) < hammerWidth && Math.abs(dy) < hammerHeight ) {
                            gameModel.destroyCard(sprite.model);

                            statistic.destroyCard = statistic.destroyCard || 0;
                            statistic.destroyCard++;
                        } else {
                            var d = Math.sqrt(dx*dx+dy*dy);
                            sprite.speedX = NATURE_SPEED*2*dx/d;
                            sprite.speedY = NATURE_SPEED*2*dy/d;
                            sprite.onTouchRelease();
                        }
                    }
                }
            });
        },this),cc.delayTime(0.2), cc.removeSelf(true)))
    }
})

var KissItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"kiss",
            maxCharge: 2,
            maxCoolDown: 3,
            showCharge: true
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.kiss_mp3, false);
        var sy,playerY, rotation;
        if ( playerSprite.model.get("position") === PLAYER_POSITION_DOWN ) {
            sy = -NATURE_SPEED;
            playerY = 0;
            rotation = 0;
        } else {
            sy = NATURE_SPEED;
            playerY = cc.winSize.height;
            rotation = 180
        }
        var playerY = playerSprite.model.get("position") === PLAYER_POSITION_DOWN ? 0 : cc.winSize.height;
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if ( !sprite.alreadyTaken && sprite.x >= 0 && sprite.x <= cc.winSize.width
                    && ( sprite.model.get("number") == 13 || sprite.model.get("number") == 11 )
                    && sprite.y !== playerY ){
                    sprite.speedY = sy;
                    sprite.speedX = sy * ( sprite.x - cc.winSize.width/2 ) / (sprite.y - playerY);
                    sprite.lastTouchBy = playerSprite.model.get("position");
                    sprite.onTouchRelease();

                    var loveSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame( sprite.model.get("number") == 13 ? "k-in-love.png" : "j-in-love.png"));
                    loveSprite.attr({
                        x: sprite.width/2,
                        y: sprite.height/2
                    })
                    sprite.addChild(loveSprite);
                    loveSprite.runAction(cc.sequence(
                        cc.scaleTo(0.3,1.3,1.3),
                        cc.scaleTo(0.1,1,1),
                        cc.delayTime(0.5),
                        cc.callFunc(function(){
                            this.removeFromParent(true);
                        },loveSprite)
                    ))
                }
            }
        });
        var lips = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("lips.png"));
        lips.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            opacity: 0,
            rotation: rotation
        });
        mainLayer.addChild(lips);
        lips.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.3,2,2), cc.fadeIn(0.3)), cc.fadeOut(0.2),cc.callFunc(function(){
            this.removeFromParent(true);
        },lips)));
    }
});

var MagnetItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"magnet",
            displayName:"磁铁",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"吸引全场的筹码(包括假的)",
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.magnet_mp3, false);
        var sy,playerY, rotation;
        if ( playerSprite.model.get("position") === PLAYER_POSITION_DOWN ) {
            sy = -NATURE_SPEED;
            playerY = 0;
            rotation = 0;
        } else {
            sy = NATURE_SPEED;
            playerY = cc.winSize.height;
            rotation = 180
        }
        var playerY = playerSprite.model.get("position") === PLAYER_POSITION_DOWN ? 0 : cc.winSize.height;
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof MoneySpecialCardSprite || sprite instanceof ThiefSpecialCardSprite ) {
                if ( !sprite.alreadyTaken && sprite.y !== playerY && sprite.x >= 0 && sprite.x <= cc.winSize.width ){
                    sprite.speedY = sy;
                    sprite.speedX = sy * ( sprite.x - cc.winSize.width/2 ) / (sprite.y - playerY);
                    if ( sprite instanceof MoneySpecialCardSprite )
                        sprite.lastTouchBy = playerSprite.model.get("position");
                    sprite.onTouchRelease();
                }
            }
        });

        var magnet = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("magnet.png"));
        magnet.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            opacity: 0,
            rotation: rotation
        });
        mainLayer.addChild(magnet);
        magnet.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.3,2,2), cc.fadeIn(0.3)), cc.fadeOut(0.2),cc.callFunc(function(){
            this.removeFromParent(true);
        },magnet)));
    }
});

var DiamondItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"diamond",
            displayName:"钻戒",
            maxCharge: 2,
            maxCoolDown: 3,
            description:"吸引全场的Q",
            showCharge: true
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var sy,playerY, rotation;
        if ( playerSprite.model.get("position") === PLAYER_POSITION_DOWN ) {
            sy = -NATURE_SPEED;
            playerY = 0;
            rotation = 0;
        } else {
            sy = NATURE_SPEED;
            playerY = cc.winSize.height;
            rotation = 180
        }
        var playerY = playerSprite.model.get("position") === PLAYER_POSITION_DOWN ? 0 : cc.winSize.height;
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if ( !sprite.alreadyTaken && sprite.x >= 0 && sprite.x <= cc.winSize.width
                    && sprite.model.get("number") == 12 && sprite.y !== playerY ){
                    sprite.speedY = sy;
                    sprite.speedX = sy * ( sprite.x - cc.winSize.width/2 ) / (sprite.y - playerY);
                    sprite.lastTouchBy = playerSprite.model.get("position");
                    sprite.onTouchRelease();

                    var loveSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("q-in-love.png"));
                    loveSprite.attr({
                        x: sprite.width/2,
                        y: sprite.height/2
                    })
                    sprite.addChild(loveSprite);
                    loveSprite.runAction(cc.sequence(
                        cc.scaleTo(0.3,1.3,1.3),
                        cc.scaleTo(0.1,1,1),
                        cc.delayTime(0.5),
                        cc.callFunc(function(){
                            this.removeFromParent(true);
                        },loveSprite)
                    ))
                }
            }
        });
        var diamond = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("diamond.png"));
        diamond.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            opacity: 0,
            rotation: rotation
        });
        mainLayer.addChild(diamond);
        diamond.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.3,2,2), cc.fadeIn(0.3)), cc.fadeOut(0.2),cc.callFunc(function(){
            this.removeFromParent(true);
        },diamond)));
    }
});

var SlowItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"slow",
            displayName:"减速",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"自己的牌减速",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.slow_down_mp3, false);
        playerSprite.model.set({
            "speedUp":0,
            "speedDown":this.get("effectTime")
        });
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if (playerSprite.isThisSide(sprite.y) && !sprite.alreadyTaken){
                    sprite.onTouchRelease();
                }
            }
        });
    }
});

var SniperItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"sniper",
            displayName:"狙击手",
            maxCharge: 3,
            maxCoolDown: 2,
            description:"消灭对手场上一张最大的牌",
            showCharge: true
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var currentSprite = null;
        var currentValue = 0;
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof PokerCardSprite ) {
                if ( !sprite.alreadyTaken && cc.rectContainsPoint(opponentPlayerSprite.getEffectRect(), {
                    x:sprite.x,
                    y:sprite.y
                }) ){
                    var value = sprite.model.get("number")*100+10-sprite.model.get("suit");
                    if ( value > currentValue ) {
                        currentValue = value;
                        currentSprite = sprite;
                    }
                }
            }
        });
        if ( currentSprite ) {
            var sniperSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("crosshair.png"));
            sniperSprite.attr({
                x: playerSprite.itemSlotSprite.x - currentSprite.x,
                y: playerSprite.itemSlotSprite.y - currentSprite.y
            })
            currentSprite.addChild(sniperSprite);
            sniperSprite.runAction(cc.sequence(
                cc.moveTo(0.3, currentSprite.width/2, currentSprite.height/2),
                cc.delayTime(0.3),
                cc.callFunc(function(){
                    if ( !currentSprite.alreadyTaken ) {
                        cc.audioEngine.playEffect(res.sniper_mp3, false);

                        gameModel.destroyCard(currentSprite.model);

                        statistic.destroyCard = statistic.destroyCard || 0;
                        statistic.destroyCard++;
                    } else {
                        sniperSprite.removeFromParent(true);
                    }
                })
            ))
        }
    }
});

var KatanaItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"katana",
            maxCharge: 3,
            maxCoolDown: 0.5,
            showCharge: true
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var maskSprite = new cc.DrawNode();
        mainLayer.addChild(maskSprite,99);
        var rect = opponentPlayerSprite.getEffectRect();
        maskSprite.drawRect(cc.p(rect.x, rect.y), cc.p(rect.x+rect.width, rect.y+rect.height), cc.color.BLACK, 0, cc.color.BLACK);
        var y = rect.y + 80 + Math.random()*(rect.height-160);
        var secPerFrame = 0.06;
        var totalFrame = 7;

        cc.audioEngine.playEffect(res.slash_mp3,false);
        var frames = [];
        for (var i = 0; i < totalFrame-1; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("slash-" + i + ".png");
            frames.push(frame);
        }
        var offsetX = 80;
        var x = _.sample([offsetX,cc.winSize.width-offsetX]);
        var rotation = Math.random()*8 - 4;
        var slashSprite = new cc.Sprite();
        slashSprite.attr({
            x: x,
            y: y,
            rotation: rotation
        })
        maskSprite.addChild(slashSprite);

        var endY = y + ( x === offsetX ? -1 : 1) * Math.tan(rotation/360*3.1415926*2)*(cc.winSize.width-2*offsetX)
        var midY = ( endY + y )/2;
        slashSprite.runAction(cc.sequence(
            cc.callFunc(function(){
                _.each( mainLayer.getChildren(), function(sprite) {
                    if (sprite instanceof NormalCardSprite ) {
                        if ( !sprite.alreadyTaken ){
                            var realHeight = sprite.contentSprite.height*sprite.contentSprite.scaleY;
                            if ( midY >= sprite.y - realHeight/2 - 10 && midY <= sprite.y + realHeight/2 + 10) {
                                //hit
                                sprite.stopAllActions();
                                sprite.contentSprite.stopAllActions();
                                sprite.alreadyTaken = true;
                                sprite.contentSprite.runAction(cc.sequence(
                                    cc.fadeOut(1),
                                    cc.callFunc(function(){
                                        gameModel.destroyCard(this.model);
                                        if ( this instanceof PokerCardSprite ) {
                                            statistic.destroyCard = statistic.destroyCard || 0;
                                            statistic.destroyCard++;
                                        }
                                    }, sprite )
                                ))
                            }
                        }
                    }
                });
            },this),
            cc.spawn(
                cc.moveTo(totalFrame*secPerFrame, x === offsetX ? cc.winSize.width - offsetX: offsetX, endY),
                new cc.Animate(new cc.Animation(frames, secPerFrame))
            ),
            cc.callFunc(function(){
                maskSprite.removeFromParent();
            },this)
        ));
    }
});

var ShieldItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"shield",
            maxCharge: 1,
            maxCoolDown: 1,
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.shield_up_mp3, false);
        playerSprite.model.set({
            "shield":this.get("effectTime")
        });
    }
});

var NukeItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"nuke",
            displayName:"核弹",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"毁掉场上所有的牌和玩家的手牌",
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){

        gameModel.set("status", "game");
        mainLayer.countDownLabel.setVisible(false);

        playerSprite.model.set("hands", []);
        opponentPlayerSprite.model.set("hands", []);

        statistic.destroyCard = statistic.destroyCard || 0;
        statistic.destroyCard+=gameModel.countPokerCards();

        gameModel.clearCards();

        gameModel.newDeck();

        var explosionSprite = new cc.Sprite();
        explosionSprite.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            scaleX: 10,
            scaleY: 10,
            rotation: playerSprite.model.get("position") === PLAYER_POSITION_DOWN ? 0 : 180
        });

        var explosionFrames = [];
        for (var i = 0; i < 8; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("big-explosion-"+i+".png");
            explosionFrames.push(frame);
        }
        var animation = new cc.Animation(explosionFrames, 0.12);
        var explosionAction = new cc.Animate(animation);

        mainLayer.addChild(explosionSprite);

        cc.audioEngine.playEffect(res.explosion_mp3, false);
        mainLayer.bigShake();
        explosionSprite.runAction(new cc.Sequence(
            explosionAction,
            cc.callFunc(function(){
                explosionSprite.removeFromParent(true);
            },this)
        ));

    }
});

var ShrinkItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"shrink",
            displayName:"缩小光线",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"对手的牌全部缩小",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.shrink_mp3, false);
        opponentPlayerSprite.model.set({
            "sizeUp":0,
            "sizeDown":this.get("effectTime")
        });
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if (opponentPlayerSprite.isThisSide(sprite.y) && !sprite.alreadyTaken){
                    sprite.shrink();
                }
            }
        });
    }
});

var EnlargeItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"enlarge",
            displayName:"放大光线",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"对手的牌全部放大",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.enlarge_mp3, false);
        playerSprite.model.set({
            "sizeDown":0,
            "sizeUp":this.get("effectTime")
        } );
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                if (playerSprite.isThisSide(sprite.y) && !sprite.alreadyTaken){
                    sprite.enlarge();
                }
            }
        });
    }
});

var ForbidItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"forbid",
            displayName:"禁令",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"对手不能使用道具，也不能获得道具。",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.forbid_mp3, false);
        opponentPlayerSprite.model.set({ "forbid":this.get("effectTime") } );
    }
});

var SpyItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"spy",
            displayName:"窥探",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"看对手的牌10秒钟",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        opponentPlayerSprite.model.set("spy", this.get("effectTime"));
    }
});

var TwoItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"two",
            displayName:"2",
            maxCharge: 1,
            maxCoolDown: 0,
            description:"召唤一张无花色的2飞向对手",
            showCharge: false,
            moveTime: 5
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();
        var rotation = isDown ? 0 : 180;
        var startY = cc.winSize.height/2;
        var startX = 50 + Math.random()*(cc.winSize.width-100);
        var cardModel = new PokerCardModel({
            suit: 4,
            number: 2
        });
        cardModel.isSpecialCard = true;
        var cardSprite = new PokerCardSprite({
            model: cardModel
        });
        var scale = opponentPlayerSprite.model.getSizeAdjust();
        cardSprite.attr({
            x: startX,
            y: startY,
            opacity: 0
        });
        cardSprite.contentSprite.attr({
            scaleX: scale,
            scaleY: scale,
            rotation: rotation
        })
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = opponentPlayerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.lastTouchBy = playerSprite.model.get("position");
                this.onTouchRelease()
            },cardSprite)).speed(speedScale));
    }
});

var BombItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"bomb",
            displayName:"炸弹",
            maxCharge: 1,
            maxCoolDown: 0,
            description:"召唤一个可摧毁对方手牌的炸弹",
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();
        var rotation = isDown ? 0 : 180;
        var startY = cc.winSize.height/2;
        var startX = 50 + Math.random()*(cc.winSize.width-100);
        var cardModel = new BombSpecialCardModel({});
        var cardSprite = new BombSpecialCardSprite({
            model: cardModel
        });
        var scale = opponentPlayerSprite.model.getSizeAdjust();
        cardSprite.attr({
            x: startX,
            y: startY,
            opacity: 0
        });
        cardSprite.contentSprite.attr({
            scaleX: scale,
            scaleY: scale,
            rotation: rotation
        })

        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = opponentPlayerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.lastTouchBy = playerSprite.model.get("position");
                this.onTouchRelease()
            },cardSprite)).speed(speedScale));
    }
});

var LeafItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"leaf",
            displayName:"落叶",
            maxCharge: 1,
            maxCoolDown: 10,
            description:"召唤落叶干扰对手视线",
            showCharge: false,
            leafCount : 40,
            leafScale: 1,
            fallTime: 4,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();
        var startY = isDown ? (rect.y + rect.height - 20 ) : (rect.y+20) ;
        var endY = isDown ? (rect.y+20): (rect.y  + rect.height-20) ;
        var fallTime = this.get("fallTime");

        opponentPlayerSprite.model.set("blockSight", this.get("effectTime"));
        var scale = this.get("leafScale");
        for ( var i = 0; i < this.get("leafCount") ; i ++ ) {
            var leaf = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("leaf.png"));
            leaf.attr( {
                x: Math.round(Math.random()*(rect.width - 30)*10)/10 + 15 ,
                y: startY,
                rotation: Math.round(Math.random()*3600)/10,
                scaleX: scale,
                scaleY: scale,
                opacity: 0
            } );
            mainLayer.addChild(leaf,50);

            (function(sprite) {
                var delay = Math.round(Math.random()*50)/10;
                sprite.runAction(cc.sequence(
                    cc.delayTime(delay),
                    cc.fadeIn(0.1),
                    cc.spawn( cc.moveTo(fallTime, sprite.x, endY), cc.rotateTo(fallTime, 2000) ),
                    cc.fadeOut(0.1),
                    cc.callFunc(function () {
                        sprite.removeFromParent(true);
                    })));
            })(leaf);
        }
    }
});

var FireworkItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"firework",
            maxCharge: 1,
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();

        var effectTime = this.get("effectTime");

        var fireworkFrames = [];
        var actions  = []
        for ( var fireworkType = 1; fireworkType <= 4; fireworkType++ ){
            fireworkFrames[fireworkType] = [];
            for (var i = 0; i < 5; i++) {
                var frame = cc.spriteFrameCache.getSpriteFrame("firework" + fireworkType + "-"+i + ".png");
                fireworkFrames[fireworkType].push(frame);
            }
            actions[fireworkType] = new cc.Animate(new cc.Animation(fireworkFrames[fireworkType], 0.2))
        }
        for ( var j = 0; j < 200; j++) {
            var sprite = new cc.Sprite();
            sprite.attr({
                x: Math.random() * rect.width,
                y: Math.random() * rect.height + rect.y,
                scaleX: 2,
                scaleY: 2,
                rotation: isDown ? 0 : 180
            })
            var fireworkType = _.sample([1, 2, 3, 4]);

            mainLayer.addChild(sprite,50)
            sprite.runAction(cc.sequence(
                cc.delayTime(Math.random()*effectTime),
                cc.callFunc(function(){
                    if ( Math.random() < 0.2 ) {
                        cc.audioEngine.playEffect(_.sample([res.firework1_mp3, res.firework2_mp3, res.firework3_mp3]), false);
                    }
                },this),
                actions[fireworkType],
                cc.removeSelf(true)
            ));
        }
    }
});

var UpwardItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"upward",
            maxCharge: 1,
            maxCoolDown: 10,
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        gameModel.set("betRate",gameModel.get("originBetRate")+Math.floor(Math.random()*4+1));
    }
});

var DownwardItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"downward",
            maxCharge: 1,
            maxCoolDown: 10,
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        gameModel.set("betRate",Math.max(1,gameModel.get("originBetRate")-Math.floor(Math.random()*4+1)));
    }
});

var ThiefItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"thief",
            displayName:"小偷",
            maxCharge: 1,
            maxCoolDown: 0,
            description:"派出小偷潜入对方金库。使对方损失1～5乘以当前赔率的金钱（一定概率损失10）",
            showCharge: false
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();
        var rotation = isDown ? 0 : 180;
        var startY = cc.winSize.height/2;
        var startX = 50 + Math.random()*(cc.winSize.width-100);
        var cardModel = new ThiefSpecialCardModel({});
        var cardSprite = new ThiefSpecialCardSprite({
            model: cardModel
        });
        var scale = opponentPlayerSprite.model.getSizeAdjust();
        cardSprite.attr({
            x: startX,
            y: startY,
            opacity: 0
        });
        cardSprite.contentSprite.attr({
            scaleX: scale,
            scaleY: scale,
            rotation: rotation
        })
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = opponentPlayerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.lastTouchBy = playerSprite.model.get("position");
                this.onTouchRelease()
            },cardSprite)).speed(speedScale));
    }
});

//Tornado
var TornadoItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"tornado",
            displayName:"龙卷风",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"在对手的区域产生龙卷风干扰其拿牌",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        cc.audioEngine.playEffect(res.tornado_mp3, false);
        opponentPlayerSprite.model.set("tornado", this.get("effectTime"));

    }
});

var VaseItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"vase",
            maxCharge: 1,
            maxCoolDown: 1,
            showCharge: false,
            effectTime: 10,
            vaseCount : 2
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();

        var vaseCount = this.get("vaseCount");
        for ( var i = 0; i < vaseCount; i++){
            var vaseType = _.sample([1,2])
            var vase = new VaseSprite({
                vaseType : vaseType,
                player : opponentPlayerSprite.model,
                durationTime : this.get("effectTime")
            });
            vase.attr( {
                x: (i + Math.random())*cc.winSize.width/vaseCount ,
                y: rect.y + rect.height/2,
                rotation: isDown?0:180
            } );

            mainLayer.addChild(vase,0);
            mainLayer.manageItemSprites(vase);
        }

    }
});

var VaseSprite = cc.Sprite.extend({
    ctor:function(options) {
        this.vaseType = options.vaseType;
        this.player = options.player;
        this.durationTime = options.durationTime;

        this._super();

        this.vase = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("vase"+this.vaseType+".png"))
        this.vase.attr({
            opacity: 0
        })
        this.addChild(this.vase)

        this.status = "appear";

        this.vase.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.status = "ready"
            },this)
        ))
        this.scheduleOnce(function(){
            this.status = "disappear"
            this.vase.runAction(cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(this.removeSelf, this)
            ))
        },this.durationTime);

        if ( this.player.get("type") === PLAYER_TYPE_PLAYER ) {
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: function (touch, event) {
                    var target = event.getCurrentTarget();

                    return target.checkBreak(touch.getLocation());
                },
                //Trigger when moving touch
                onTouchMoved: function (touch, event) {
                },
                //Process the touch end event
                onTouchEnded: function (touch, event) {
                }
            }), this);
        }
    },
    removeSelf:function(){
        mainLayer.removeManagedItemSprite(this);
        this.removeFromParent(true);
    },
    checkBreak:function(location){
        if ( this.status !== "ready") return false;

        var locationInNode = this.vase.convertToNodeSpace(location);
        var s = this.vase.getContentSize();
        var rect = cc.rect(0, 0, s.width, s.height);
        if (cc.rectContainsPoint(rect, locationInNode)) {
            this.broken();
            return true;
        }
        return false;
    },
    broken:function(){
        this.status = "broken";
        cc.audioEngine.playEffect(res.vase_break_mp3, false);

        this.piece1 = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("vasepiece"+this.vaseType+"1.png"));
        this.piece2 = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("vasepiece"+this.vaseType+"2.png"));
        this.piece3 = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("vasepiece"+this.vaseType+"3.png"));
        this.addChild(this.piece1)
        this.addChild(this.piece2)
        this.addChild(this.piece3)
        this.priceTag = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("price-tag.png"));
        this.addChild(this.priceTag)

        this.vase.removeFromParent(true);

        this.piece1.runAction(cc.spawn(
            cc.moveBy(times.breakVase,0,20+Math.random()*20),
            cc.rotateBy(times.breakVase, Math.random()*20-10),
            cc.fadeOut(times.breakVase)
        ))
        this.piece2.runAction(cc.spawn(
            cc.moveBy(times.breakVase,-20,-10-Math.random()*10),
            cc.rotateBy(times.breakVase, -Math.random()*20+10),
            cc.fadeOut(times.breakVase)
        ))
        this.piece3.runAction(cc.spawn(
            cc.moveBy(times.breakVase,20,-10-Math.random()*10),
            cc.rotateBy(times.breakVase, Math.random()*20-10),
            cc.fadeOut(times.breakVase)
        ))
        this.priceTag.runAction(cc.sequence(
            cc.callFunc(function(){
                var money = this.player.get("money")
                var loseMoney = Math.ceil(Math.random()*5)*gameModel.get("betRate")
                this.player.set("money",Math.max(1, money - loseMoney) )
            },this),
            cc.scaleTo(times.breakVase/2, 1.5,1.5),
            cc.scaleTo(times.breakVase/2, 1,1),
            cc.callFunc(this.removeSelf,this)
        ))
    }
})

var DUMMY_ITEM_COUNT = 10;

var ItemSlotSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super(cc.spriteFrameCache.getSpriteFrame("item-slot-bg.png"));
        this.status = "none";
        this.owner = options.owner;

        var x = this.width/2;
        var y = this.height/2;
        this.foreground = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("no-item.png"));
        this.foreground.attr({
            x: 0,
            y: 0
        });

        var clipper = new cc.ClippingNode();
        clipper.stencil = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-fg-mask.png"));
        clipper.attr({
            x: x,
            y: y
        })
        this.addChild(clipper);
        clipper.setAlphaThreshold(0);

        clipper.addChild(this.foreground);

        this.chargeLabel = new ccui.Text("", "Arial", 30 );
        this.chargeLabel.enableOutline(cc.color.WHITE, 2);
        this.chargeLabel.setTextColor(cc.color.BLACK);
        this.chargeLabel.attr({
            x: 70,
            y: 10
        })
        this.addChild(this.chargeLabel);

        if ( gameModel.getPlayerByPosition(this.owner).get("type") == PLAYER_TYPE_PLAYER ) {
            this.listener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function (touch, event) {
                    var target = event.getCurrentTarget();

                    var locationInNode = target.convertToNodeSpace(touch.getLocation());
                    var s = target.getContentSize();
                    var rect = cc.rect(0, 0, s.width, s.height);

                    //Check the click area
                    if (cc.rectContainsPoint(rect, locationInNode)) {
                        var gameStatus = gameModel.get("status");
                        if (target.canPressItem()) {
                            target.foreground.opacity = 200;
                            return true;
                        }
                    }
                    return false;
                },
                //Trigger when moving touch
                onTouchMoved: function (touch, event) {
                },
                //Process the touch end event
                onTouchEnded: function (touch, event) {
                    var target = event.getCurrentTarget();
                    target.foreground.opacity = 255;
                    target.useItem.call(target);
                }
            });

            this.initEvent();
        }
    },
    canPressItem:function(){
        var gameStatus = gameModel.get("status");
        if ((gameStatus === "game" || gameStatus === "countDown") && this.status === "usable" && this.model && this.model.canUse()) {
            return true;
        }
        return false;
    },
    initEvent:function(){
        cc.eventManager.addListener( this.listener, this);
    },
    setItemModel:function(model){
        this.stopAllActions();
        if ( this.model ) {
            this.model.off();
            delete this.model;
            this.status = "none";
        }

        this.model = model;

        if ( this.model ) {
            this.getItemStatistic();
            this.status = "usable"
            this.foreground.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("item-" + this.model.get("name") + ".png"));
            this.chargeLabel.setVisible(this.model.get("showCharge"));
            this.renderCharge();
            this.model.on("change:charge", this.renderCharge, this);
            this.foreground.opacity = 255;
        } else {
            this.chargeLabel.setVisible(false);
            this.foreground.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("no-item.png"));
        }
    },
    getCurrentItemName:function(){
        if ( this.model ) {
            return this.model.get("name")
        } else return null;
    },
    renderCharge:function(){
        this.chargeLabel.setString(this.model.get("charge"));
    },
    useItem:function(){
        if ( gameModel.getPlayerByPosition(this.owner).get("forbid") ) {
            cc.audioEngine.playEffect(res.forbid_mp3, false);
            return;
        }
        this.useItemStatistic();
        this.model.set("coolDown", this.model.get("maxCoolDown") );
        this.model.set("charge", this.model.get("charge") - 1);
        if ( this.owner === PLAYER_POSITION_DOWN ) {
            this.model.effect( mainLayer.player1Sprite, mainLayer.player2Sprite );
        } else if ( this.owner === PLAYER_POSITION_UP ) {
            this.model.effect( mainLayer.player2Sprite, mainLayer.player1Sprite );
        }

        if ( this.model.get("charge") <= 0 ) {
            this.setItemModel(null);
        } else {
            this.foreground.opacity = 128;
            this.runAction(new cc.Sequence(new cc.DelayTime(this.model.get("maxCoolDown")),
                new cc.CallFunc(function () {
                    this.model.set("coolDown", 0 );
                    this.foreground.opacity = 255;
                }, this)));
        }
    },
    useItemStatistic:function(){
        statistic.totalUseItem = statistic.totalUseItem || 0;
        statistic.totalUseItem++;
        statistic.useItem = statistic.useItem || {};
        var itemName = this.model.get("name");
        statistic.useItem[itemName] = statistic.useItem[itemName] || 0;
        statistic.useItem[itemName]++;
    },
    getAnItem:function(name){
        if ( this.status == "rolling" ) return;
        this.status = "rolling";
        cc.audioEngine.playEffect(res.slot_machine_mp3, false);
        if ( this.model ) {
            var sprite = new cc.Sprite( cc.spriteFrameCache.getSpriteFrame("item-" + this.model.get("name") + ".png") );
            sprite.attr({
                x: this.width/2,
                y: this.height/2
            });
            this.foreground.addChild(sprite);
            var actionArray = [cc.moveBy(times.slot_machine, 0, -this.height * (DUMMY_ITEM_COUNT+1)).easing(cc.easeSineInOut()), cc.removeSelf(true)];
            sprite.runAction(cc.sequence(actionArray));
            this.chargeLabel.setVisible(false);
            this.foreground.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("no-item.png"));
        }
        var itemName = name || window.gameModel.generateItemName();
        for ( var i = 0; i < DUMMY_ITEM_COUNT+1; i++ ) {
            var randomName
            if ( i == DUMMY_ITEM_COUNT ) {
                randomName = itemName;
            } else randomName = window.gameModel.generateItemName();

            var sprite = new cc.Sprite( cc.spriteFrameCache.getSpriteFrame("item-" + randomName + ".png") );
            sprite.attr({
                x: this.width/2,
                y: this.height*3/2+this.height*i
            });
            this.foreground.addChild(sprite);
            var actionArray = [cc.moveBy(times.slot_machine, 0, -this.height * (DUMMY_ITEM_COUNT+1)).easing(cc.easeSineInOut()), cc.removeSelf(true)];
            if ( i == DUMMY_ITEM_COUNT ) {
                actionArray.push(cc.callFunc(function(){
                    this.setItemModel(new ITEM_MODEL_CLASS_MAP[itemName]());
                    gameModel.getPlayerByPosition(this.owner).onGetItem(itemName);
                },this));
            }
            sprite.runAction(cc.sequence(actionArray));
        }
    },
    getItemStatistic:function(){
        statistic.getItem = statistic.getItem || {};
        var itemName = this.model.get("name");
        statistic.getItem[itemName] = statistic.getItem[itemName] || 0;
        statistic.getItem[itemName]++;
    }
});


//fog


var ITEM_MODEL_CLASS_MAP = {
    "ace": AceItemModel,
    "bomb": BombItemModel,
    "cloud": CloudItemModel,
    "diamond": DiamondItemModel,
    "dizzy": DizzyItemModel,
    "downward":DownwardItemModel,
    "enlarge":EnlargeItemModel,
    "fast": FastItemModel,
    "firework":FireworkItemModel,
    "forbid": ForbidItemModel,
    "hammer": HammerItemModel,
    "katana": KatanaItemModel,
    "kiss": KissItemModel,
    "leaf": LeafItemModel,
    "magnet": MagnetItemModel,
    "nuke": NukeItemModel,
    "shield":ShieldItemModel,
    "shrink":ShrinkItemModel,
    "slow": SlowItemModel,
    "sniper": SniperItemModel,
    "spy": SpyItemModel,
    "thief": ThiefItemModel,
    "tornado": TornadoItemModel,
    "two": TwoItemModel,
    "upward":UpwardItemModel,
    "vase":VaseItemModel
}

var CHECK_UNLOCKED_FUNC_MAP = {
    "ace": function(){
        statistic.winAI1 = statistic.winAI1 || 0;
        statistic.winAI2 = statistic.winAI2 || 0;
        statistic.winAI3 = statistic.winAI3 || 0;
        var allWinAI = statistic.winAI1 + statistic.winAI2 + statistic.winAI3;
        if ( allWinAI >= ACE_UNLOCK_CONDITION ) {
            return true;
        } else
            return texts.items.ace.unlock+"("+allWinAI+"/"+ACE_UNLOCK_CONDITION+")";
        return true
    },
    "bomb": function(){
        return true
    },
    "cloud": function(){
        return true
    },
    "diamond": function(){
        return true
    },
    "dizzy": function(){
        return true
    },
    "downward": function(){
        statistic.maxBetRate = statistic.maxBetRate || 0;
        if ( statistic.maxBetRate >= DOWNWARD_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.downward.unlock+"("+statistic.maxBetRate+"/"+DOWNWARD_UNLOCK_CONDITION+")";
    },
    "enlarge":function(){
        statistic.game = statistic.game || {};
        statistic.game["vs"] = statistic.game["vs"] || 0;
        if ( statistic.game["vs"] >= ENLARGE_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.enlarge.unlock+"("+statistic.game["vs"]+"/"+ENLARGE_UNLOCK_CONDITION+")";
    },
    "fast": function(){
        return true
    },
    "forbid": function(){
        statistic.totalUseItem = statistic.totalUseItem || 0;
        if ( statistic.totalUseItem >= FORBID_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.forbid.unlock+"("+statistic.totalUseItem+"/"+FORBID_UNLOCK_CONDITION+")";
    },
    "hammer": function(){
        statistic.handType = statistic.handType || {};
        var count = statistic.handType["five-of-a-kind"] || 0;
        if ( count >= HAMMER_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.hammer.unlock+"("+count+"/"+HAMMER_UNLOCK_CONDITION+")";
    },
    "katana": function(){
        statistic.winAI2 = statistic.winAI2 || 0;
        statistic.winAI3 = statistic.winAI3 || 0;
        var allWinAI = statistic.winAI2 + statistic.winAI3;
        if ( allWinAI >= KATANA_UNLOCK_CONDITION ) {
            return true;
        } else
            return texts.items.katana.unlock+"("+allWinAI+"/"+KATANA_UNLOCK_CONDITION+")";
    },
    "kiss": function(){
        statistic.game = statistic.game || {};
        statistic.game["vs"] = statistic.game["vs"] || 0;
        if ( statistic.game["vs"] >= KISS_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.kiss.unlock+"("+statistic.game["vs"]+"/"+KISS_UNLOCK_CONDITION+")";
    },
    "leaf": function(){
        statistic.handType = statistic.handType || {};
        var count = statistic.handType["straight-flush"] || 0;
        if ( count >= LEAF_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.leaf.unlock+"("+count+"/"+LEAF_UNLOCK_CONDITION+")";
    },
    "magnet": function(){
        statistic.takeToken = statistic.takeToken || 0;
        if ( statistic.takeToken >= MAGNET_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.magnet.unlock+"("+statistic.takeToken+"/"+MAGNET_UNLOCK_CONDITION+")";
    },
    "nuke": function(){
        statistic.destroyCard = statistic.destroyCard || 0;
        if ( statistic.destroyCard >= NUKE_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.nuke.unlock+"("+statistic.destroyCard+"/"+NUKE_UNLOCK_CONDITION+")";
    },
    "shield":function(){
        statistic.takeOpponentSendCard = statistic.takeOpponentSendCard || 0;
        if ( statistic.takeOpponentSendCard >= SHIELD_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.shield.unlock+"("+statistic.takeOpponentSendCard+"/"+SHIELD_UNLOCK_CONDITION+")";
    },
    "shrink":function(){
        return true
    },
    "slow": function(){
        return true
    },
    "sniper": function(){
        return true
    },
    "spy": function(){
        return true
    },
    "thief": function(){
        statistic.takeTokenAmount = statistic.takeTokenAmount || 0;
        if ( statistic.takeTokenAmount >= THIEF_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.thief.unlock+"("+statistic.takeTokenAmount+"/"+THIEF_UNLOCK_CONDITION+")";
    },
    "tornado": function(){
        return true
    },
    "two": function(){
        statistic.game = statistic.game || {};
        var count = statistic.game["vs"] || 0;
        count += statistic.game["vs-ai"] || 0;
        if ( count >= TWO_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.two.unlock+"("+count+"/"+TWO_UNLOCK_CONDITION+")";
    },
    "upward": function(){
        statistic.maxBetRate = statistic.maxBetRate || 0;
        if ( statistic.maxBetRate >= UPWARD_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.upward.unlock+"("+statistic.maxBetRate+"/"+UPWARD_UNLOCK_CONDITION+")";
    },
    "vase": function(){
        var count = statistic.gameTime["vs"] || 0;
        count += statistic.gameTime["vs-ai"] || 0;
        count = Math.round(count / 60);
        if ( count >= VASE_UNLOCK_CONDITION ) {
            return true
        } else
            return texts.items.vase.unlock+"("+count+"/"+VASE_UNLOCK_CONDITION+")";
    }
}
