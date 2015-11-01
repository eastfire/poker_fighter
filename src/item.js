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
            maxCharge: 3,
            maxCoolDown: 10,
            description:"召唤云朵干扰对手视线",
            showCharge: true,
            cloudCount : 35,
            cloudScale: 1.75,
            cloudTime: 5
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var isMirror = Math.random() > 0.5;
        var startX = isMirror ? cc.winSize.width+80 : -80;
        var endX = isMirror ? -80 : cc.winSize.width+80;
        var rotation = opponentPlayerSprite.model.get("position") === PLAYER_POSITION_DOWN ? 0 : 180;
        var rect = opponentPlayerSprite.getEffectRect();
        var scale = this.get("cloudScale");
        var cloudTime = this.get("cloudTime");
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
                    cc.moveTo(cloudTime, endX, sprite.y),
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
        var startX = cc.winSize.width/2;
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
        cardSprite.speedY = isDown ? -1 : 1;
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
            maxCharge: 3,
            maxCoolDown: 3,
            description:"对手的牌全部旋转起来",
            showCharge: true
        }
    },
    effect:function(playerSprite, opponentPlayerSprite){
        var rect = opponentPlayerSprite.getEffectRect();
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof NormalCardSprite ) {
                var point = new cc.Point(sprite.x, sprite.y);
                if (cc.rectContainsPoint(rect, point)){
                    sprite.runAction(cc.rotateBy(0.5,360).repeatForever())
                }
            }
        });
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
        var startX = cc.winSize.width/2;
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
        cardSprite.speedY = isDown ? -1 : 1;
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
            maxCharge: 3,
            maxCoolDown: 10,
            description:"召唤落叶干扰对手视线",
            showCharge: true,
            leafCount : 25,
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
                    if ( target.status === "usable" && target.model && target.model.canUse.call(target.model) ) {
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
    getAnItem:function(){
        this.status = "rolling";
        var itemName = window.gameModel.generateItemName();
        this.setItemModel(new ITEM_MODEL_CLASS_MAP[itemName]());
    }
});

var ITEM_MODEL_CLASS_MAP = {
    "cloud": CloudItemModel,
    "leaf": LeafItemModel,
    "ace": AceItemModel,
    "dizzy": DizzyItemModel,
    "two": TwoItemModel
}
