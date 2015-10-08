SUIT_NUMBER_MAP = {
    spade: 0,
    heart : 1,
    club: 2,
    diamond: 3
};
SUIT_ARRAY = ["spade","heart","club","diamond"];

var PokerCardModel = Backbone.Model.extend({
    defaults:function(){
        return {
            number : 1,
            suit: 0
        }
    }
});

function newDeck(){
    var deck = [];
    for ( var number = 8; number <= 14; number ++ ) {
        for ( var suit = 0; suit <= 3; suit ++ ) {
            deck.push(new PokerCardModel({ number: number, suit: suit }));
        }
    }
    return _.shuffle( deck );
}

var MIN_SPEED = 5;
var MAX_SPEED = 20;

var PokerCardSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super();
        this.model = options.model;
        this.reverse = options.reverse;

        this.numberSprite = new cc.Sprite();
        this.numberSprite.attr({
            x: 25,
            y: 55
        });
        this.setName(this.model.cid);
        this.addChild(this.numberSprite, 0);

        var self = this;
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
                    target.stopAllActions();
                    target.speedX = 0;
                    if ( target.y >= cc.winSize.height/2 ) {
                        target.speedY = 1;
                    } else {
                        target.speedY = -1;
                    }
                    return true;
                }
                return false;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
                var target = event.getCurrentTarget();
                if ( target.alreadyTaken )
                    return;

                var delta = touch.getDelta();
                self.x += delta.x;
                self.y += delta.y;
                self.speedX = delta.x;
                self.speedY = delta.y;
                var midY = cc.winSize.height/2;
                if ( self.rotation === 0 && self.y >= midY ) {
                    target.runAction(new cc.rotateTo(times.rotateDirection, 180));
                } else if ( self.rotation === 180 && self.y < midY ) {
                    target.runAction(new cc.rotateTo(times.rotateDirection, 0));
                }
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                if ( target.alreadyTaken )
                    return;
                if ( target.y < dimens.player1Y ) {
                    target.playerTakeCard.call(target, gameModel.player1);
                    return;
                }
                if ( target.y > dimens.player2Y ) {
                    target.playerTakeCard.call(target, gameModel.player2);
                    return;
                }

                var midY = cc.winSize.height/2;
                var player1Y = dimens.player1Y;
                var player2Y = dimens.player2Y;

                var originSpeed = Math.max(0.1, Math.sqrt( self.speedX*self.speedX + self.speedY * self.speedY ) );
                var speed = Math.min( MAX_SPEED, Math.max( MIN_SPEED, originSpeed ) ) * 30;

                var actionArray = []
                if ( self.speedY > 0 ) {
                    if ( target.y < midY ) {
                        var pointX = self.getCrossPointX.call(self, midY);
                        var time = Math.sqrt((target.x - pointX) * (target.x - pointX) + (target.y - midY) * (target.y - midY)) / speed;
                        actionArray.push(new cc.moveTo(time, pointX, midY));

                        var pointX2 = self.getCrossPointX.call(self, player2Y);
                        var time2 = Math.sqrt((pointX2 - pointX) * (pointX2 - pointX) + (player2Y - midY) * (player2Y - midY)) / speed;
                        actionArray.push(new cc.spawn(new cc.rotateTo(times.rotateDirection, 180),
                            new cc.moveTo(time2, pointX2, player2Y)));
                        if (pointX2 > -dimens.card_size.width / 2 && pointX2 < cc.winSize.width + dimens.card_size.width / 2) {
                            actionArray.push(new cc.callFunc(function () {
                                target.playerTakeCard.call(target, gameModel.player2);
                            }, self));
                        } else {
                            actionArray.push(new cc.callFunc(function () {
                                gameModel.destroyCard(target.model);
                            }, self));
                        }
                    } else {
                        var pointX2 = self.getCrossPointX.call(self, player2Y);
                        var time = Math.sqrt((target.x - pointX2) * (target.x - pointX2) + (target.y - player2Y) * (target.y - player2Y)) / speed;
                        actionArray.push(new cc.moveTo(time, pointX2, player2Y));

                        if (pointX2 > -dimens.card_size.width / 2 && pointX2 < cc.winSize.width + dimens.card_size.width / 2) {
                            actionArray.push(new cc.callFunc(function () {
                                target.playerTakeCard.call(target, gameModel.player2);
                            }, self));
                        } else {
                            actionArray.push(new cc.callFunc(function () {
                                gameModel.destroyCard(target.model);
                            }, self));
                        }
                    }
                } else if ( self.speedY < 0 ) {
                    if ( target.y > midY ) {
                        var pointX = self.getCrossPointX.call(self, midY);
                        var time = Math.sqrt((target.x - pointX) * (target.x - pointX) + (target.y - midY) * (target.y - midY)) / speed;
                        actionArray.push(new cc.moveTo(time, pointX, midY));

                        var pointX2 = self.getCrossPointX.call(self, player1Y);
                        var time2 = Math.sqrt((pointX2 - pointX) * (pointX2 - pointX) + (player1Y - midY) * (player1Y - midY)) / speed;
                        actionArray.push(new cc.spawn(new cc.rotateTo(times.rotateDirection, 0),
                            new cc.moveTo(time2, pointX2, player1Y)));
                        if (pointX2 > -dimens.card_size.width / 2 && pointX2 < cc.winSize.width + dimens.card_size.width / 2) {
                            actionArray.push(new cc.callFunc(function () {
                                target.playerTakeCard.call(target, gameModel.player1);
                            }, self));
                        } else {
                            actionArray.push(new cc.callFunc(function () {
                                gameModel.destroyCard(target.model);
                            }, self));
                        }
                    } else {
                        var pointX2 = self.getCrossPointX.call(self, player1Y);
                        var time = Math.sqrt((target.x - pointX2) * (target.x - pointX2) + (target.y - player1Y) * (target.y - player1Y)) / speed;
                        actionArray.push(new cc.moveTo(time, pointX2, player1Y));

                        if (pointX2 > -dimens.card_size.width / 2 && pointX2 < cc.winSize.width + dimens.card_size.width / 2) {
                            actionArray.push(new cc.callFunc(function () {
                                target.playerTakeCard.call(target, gameModel.player1);
                            }, self));
                        } else {
                            actionArray.push(new cc.callFunc(function () {
                                gameModel.destroyCard(target.model);
                            }, self));
                        }
                    }
                } else if ( self.speedY == 0 ) {
                    if ( self.speedX < 0 ) {
                        var time = ( target.x - ( - dimens.card_size.width/2 ) ) / speed;
                        actionArray.push(new cc.moveTo(time, - dimens.card_size.width/2, target.y));
                        actionArray.push(new cc.callFunc(function () {
                            gameModel.destroyCard(target.model);
                        }, self));
                    } else if ( self.speedX > 0 ) {
                        var time = ( cc.winSize.width + dimens.card_size.width/2 - target.x ) / speed;
                        actionArray.push(new cc.moveTo(time, cc.winSize.width + dimens.card_size.width/2, target.y));
                        actionArray.push(new cc.callFunc(function () {
                            gameModel.destroyCard(target.model);
                        }, self));
                    }
                }
                if ( actionArray.length) target.runAction( new cc.sequence(actionArray) );
            }
        });
    },
    playerTakeCard:function(player){
        if ( player.canTakeCard() ) {
            this.isNewHand = true;
            this.setTag(0);
            player.addHand(this.model);
            this.alreadyTaken = true;
            cc.eventManager.removeListener(this.listener);
        } else {
            this.stopAllActions();
            gameModel.destroyCard(this.model);
        }
    },
    getCrossPointX:function(lineY){
        return ( lineY - this.y ) * this.speedX / this.speedY + this.x;
    },
    render:function(){
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-"+SUIT_ARRAY[this.model.get("suit")]+".png"));
        this.numberSprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("number-"+this.model.get("number")+".png"));
    },
    onEnter:function(){
        this._super();
        this.initEvent();
        this.render();
    },
    onExit:function(){
        this.closeEvent();
        this._super();
    },
    initEvent:function(){
        cc.eventManager.addListener(this.listener, this);
        this.model.on("destroy",this.onDestroy,this);
    },
    closeEvent:function(){
        cc.eventManager.removeListener(this.listener);
        this.model.off("destroy",this.onDestroy);
    },
    onDestroy:function(){
        this.removeFromParent(true);
    },
    getFlipToFrontSequence:function(){
        var oldScaleX = 1;
        var oldScaleY = 1;
        return new cc.sequence( new cc.scaleTo(times.flip/2, 0, oldScaleY), new cc.callFunc(function(){
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-"+SUIT_ARRAY[this.model.get("suit")]+".png"));
            this.numberSprite.setVisible(true);
        },this), new cc.scaleTo(times.flip/2,oldScaleX,oldScaleY));
    },
    getFlipToBackSequence:function(){
        var oldScaleX = 1;
        var oldScaleY = 1;
        return new cc.sequence( new cc.scaleTo(times.flip/2, 0, oldScaleY), new cc.callFunc(function(){
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-back.png"));
            this.numberSprite.setVisible(false);
        },this), new cc.scaleTo(times.flip/2,oldScaleX,oldScaleY));
    }
});
