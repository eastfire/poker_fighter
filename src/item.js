var ItemModel = Backbone.Model.extend({
    defaults:function(){
        return {
            displayName:"",
            maxCharge: 1,
            durationTime: 1,
            maxCoolDown: 1,
            description:"牛X的人不需要使用技能",
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
            displayName:"唤云",
            maxCharge: 1,
            maxCoolDown: 10,
            description:"召唤云朵干扰对手视线",
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
        var effectTime = this.get("effectTime");
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
            displayName:"A",
            maxCharge: 1,
            maxCoolDown: 0,
            description:"为自己召唤一张无花色的A",
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
            scaleX: scale,
            scaleY: scale,
            opacity: 0,
            rotation: rotation
        });
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = playerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.onTouchRelease()
            },cardSprite)).speed(speedScale));
    }
});

var DizzyItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"dizzy",
            displayName:"眩晕",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"对手的牌全部旋转起来",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
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
            displayName:"快进",
            maxCharge: 1,
            maxCoolDown: 1,
            description:"对手的牌速度加快",
            showCharge: false,
            effectTime: 10
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
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
            description:"为对手召唤一张无花色的2",
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
            opacity: 0,
            rotation: rotation,
            scaleX: scale,
            scaleY: scale
        });
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = opponentPlayerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
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
            opacity: 0,
            rotation: rotation,
            scaleX: scale,
            scaleY: scale
        });
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = opponentPlayerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
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
            fallTime: 4
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isDown = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN;
        var rect = opponentPlayerSprite.getEffectRect();
        var startY = isDown ? (rect.y + rect.height - 20 ) : (rect.y+20) ;
        var endY = isDown ? (rect.y+20): (rect.y  + rect.height-20) ;
        var fallTime = this.get("fallTime");

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
            opacity: 0,
            rotation: rotation,
            scaleX: scale,
            scaleY: scale
        });
        mainLayer.addChild(cardSprite);
        gameModel.manageCard(cardModel);
        cardSprite.speedY = isDown ? -NATURE_SPEED : NATURE_SPEED;
        cardSprite.speedX = 0;

        var speedScale = opponentPlayerSprite.model.getSpeedAdjust();
        cardSprite.runAction(cc.sequence(
            cc.fadeIn(0.5),
            cc.callFunc(function(){
                this.onTouchRelease()
            },cardSprite)).speed(speedScale));
    }
});

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

//        var test = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-cloud.png"))
//        test.attr({
//            x: x,
//            y: y*3
//        })
//        this.foreground.addChild(test);
//        test.runAction(new cc.MoveTo(1,x,y));

        this.chargeLabel = new ccui.Text("", "Arial", 30 );
        this.chargeLabel.enableOutline(cc.color.WHITE, 2);
        this.chargeLabel.setTextColor(cc.color.BLACK);
        this.chargeLabel.attr({
            x: 70,
            y: 10
        })
        this.addChild(this.chargeLabel);

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
                    if ( (gameStatus === "game" || gameStatus === "countDown") && target.status === "usable" && target.model && target.model.canUse.call(target.model) ) {
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
    renderCharge:function(){
        this.chargeLabel.setString(this.model.get("charge"));
    },
    useItem:function(){
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
                },this));
            }
            sprite.runAction(cc.sequence(actionArray));
        }
    }
});

var ITEM_MODEL_CLASS_MAP = {
    "ace": AceItemModel,
    "bomb": BombItemModel,
    "cloud": CloudItemModel,
    "dizzy": DizzyItemModel,
    "enlarge":EnlargeItemModel,
    "fast": FastItemModel,
    "leaf": LeafItemModel,
    "nuke": NukeItemModel,
    "shrink":ShrinkItemModel,
    "slow": SlowItemModel,
    "spy": SpyItemModel,
    "thief": ThiefItemModel,
    "two": TwoItemModel

}
