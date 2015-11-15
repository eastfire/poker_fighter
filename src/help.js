/**
 * Created by 赢潮 on 2015/10/29.
 */

var ACCELERATE_THRESHOLD_X = 0.2;
var ACCELERATE_THRESHOLD_Y = 0.2;

var PlayerRotateLayer = cc.LayerColor.extend({
    ctor: function () {
        this._super(colors.table);

//        this.letMeSeeItem = new cc.MenuItemImage(
//            cc.spriteFrameCache.getSpriteFrame("let-me-see-default.png"),
//            cc.spriteFrameCache.getSpriteFrame("let-me-see-press.png"),
//            function () {
//                this.rotateLayer();
//            }, this);
//        this.letMeSeeItem.attr({
//            x: cc.winSize.width/2,
//            y: cc.winSize.height,
//            anchorX: 0.5,
//            anchorY: 1
//        });

        var exitItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("exit-default.png"),
            cc.spriteFrameCache.getSpriteFrame("exit-press.png"),
            function () {
                cc.director.popScene();
            }, this);
        exitItem.attr({
            scaleX: 0.5,
            scaleY: 0.5,
            x: 30,
            y: 30
        });

        var menu = new cc.Menu([/*this.letMeSeeItem,*/ exitItem]);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);

//        var letMeSeeLabel = new ccui.Text(texts.letMeSee, "Arial", 30 );
//        letMeSeeLabel.enableOutline(colors.tableLabelOutline, 2);
//        letMeSeeLabel.setTextColor(colors.tableLabel);
//        letMeSeeLabel.attr({
//            x: cc.winSize.width/2,
//            y: cc.winSize.height - 18,
//            rotation: 180
//        });
//        this.addChild(letMeSeeLabel);

        if( 'accelerometer' in cc.sys.capabilities ) {
            var self = this;
            // call is called 30 times per second
            cc.inputManager.setAccelerometerInterval(1/30);
            cc.inputManager.setAccelerometerEnabled(true);
            cc.eventManager.addListener({
                event: cc.EventListener.ACCELERATION,
                callback: function(accelEvent, event){
                    var target = event.getCurrentTarget();
                    if ( Math.abs(accelEvent.x) < ACCELERATE_THRESHOLD_X ) {
                        if ( accelEvent.y > ACCELERATE_THRESHOLD_Y && self.rotation == 0 ) {
                            self.rotateLayer.call(self);
                        } else if ( accelEvent.y < -ACCELERATE_THRESHOLD_Y && self.rotation == 180 ) {
                            self.rotateLayer.call(self);
                        }
                    }
                }
            }, this);

        } else {
            cc.log("ACCELEROMETER not supported");
        }
    },
    rotateLayer:function(){
 //       this.letMeSeeItem.setEnabled(false);
        var rotation = (this.rotation + 180) % 360;
        this.runAction( cc.sequence( cc.rotateTo(times.letMeSee, rotation ),
            cc.callFunc(function(){
   //             this.letMeSeeItem.setEnabled(true);
            },this)));
    },
    onExit: function(){
        this._super();
        if( 'accelerometer' in cc.sys.capabilities )
            cc.inputManager.setAccelerometerEnabled(false);
    }
});

var HelpPokerLayer = PlayerRotateLayer.extend({
    renderFeature: function (cards, feature) {
        var scale = 0.7;
        var stepX = dimens.card_size.width * scale;
        var x = this.startX;

        _.each(cards, function (card) {
            var sprite = new PokerCardSprite({
                model: new PokerCardModel({
                    suit: card.suit,
                    number: card.number
                })
            });
            sprite.attr({
                x: x,
                y: this.currentY,
                scaleX: scale,
                scaleY: scale
            });
            x += stepX;
            this.addChild(sprite);

        }, this);

        var featureLabel = new ccui.Text(texts.handTypeDisplayName[feature], "Arial", 30 );
        featureLabel.setTextColor(colors.tableLabel);
        featureLabel.attr({
            x: this.featureLabelX,
            y: this.currentY
        });
        this.addChild(featureLabel);

        var betRateLabel = new ccui.Text("$"+dimens.bonus[feature], "Arial", 30 );
        betRateLabel.setTextColor(colors.tableLabel);
        betRateLabel.attr({
            x: this.betRateLabelX,
            y: this.currentY,
            anchorX: 0
        });
        this.addChild(betRateLabel);

        this.currentY -= this.stepY;
    },
    ctor:function(){
        this._super();

        var scale = 0.7;
        //straight flush
        this.currentY = cc.winSize.height - 50;
        this.startX = 50;
        this.featureLabelX = cc.winSize.width*2/3;
        this.betRateLabelX = cc.winSize.width - 65;
        var totalHeight = cc.winSize.height - 90;
        this.stepY = totalHeight / 9;
        var fiveOfAKindAppeared = cc.sys.localStorage.getItem("fiveOfAKindAppeared");
        if ( fiveOfAKindAppeared ) {
            this.stepY = totalHeight / 10;
            this.renderFeature( [{ suit:0, number: 14}, { suit:1, number: 14}, {
                    suit:2, number: 14}, { suit:3, number: 14}, { suit:4, number: 14}],
                "five-of-a-kind" );
        }
        this.renderFeature( [{ suit:0, number: 13}, { suit:0, number: 12}, { suit:0, number: 11}, { suit:0, number: 10}, { suit:0, number: 9}],  "straight-flush" );
        this.renderFeature( [{ suit:0, number: 13}, { suit:1, number: 13}, {
                suit:2, number: 13}, { suit:3, number: 13}],
            "four-of-a-kind" );
        this.renderFeature( [{ suit:0, number: 14}, { suit:1, number: 14}, {
                suit:2, number: 14}, { suit:0, number: 10}, { suit:1, number: 10}],
            "full-house" );
        this.renderFeature( [{ suit:1, number: 14}, { suit:1, number: 13}, {
                suit:1, number: 11}, { suit:1, number: 9}, { suit:1, number: 8}],
            "flush" );
        this.renderFeature( [{ suit:0, number: 14}, { suit:1, number: 13}, {
                suit:2, number: 12}, { suit:0, number: 11}, { suit:1, number: 10}],
            "straight" );
        this.renderFeature( [{ suit:0, number: 14}, { suit:1, number: 14}, {
                suit:2, number: 14}],
            "three-of-a-kind" );
        this.renderFeature( [{ suit:0, number: 14}, { suit:1, number: 14}, { suit:0, number: 10}, { suit:1, number: 10}],
            "two-pair" );
        this.renderFeature( [{ suit:0, number: 14}, { suit:1, number: 14}],
            "one-pair" );
        this.renderFeature( [{ suit:0, number: 13}, { suit:1, number: 11}, { suit:2, number: 8}],
            "high-card" );
    }
});

var HelpScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelpPokerLayer();
        this.addChild(layer);
    }
});
