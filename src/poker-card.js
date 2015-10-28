SUIT_NUMBER_MAP = {
    spade: 0,
    heart : 1,
    club: 2,
    diamond: 3,
    blank: 4
};
SUIT_ARRAY = ["spade","heart","club","diamond", "blank"];

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
            deck.push(new PokerCardModel({ number: number,
                suit: suit,
                isRare: number == 14
            }));
        }
    }
    return _.shuffle( deck );
}

var MIN_SPEED = 10;
var MAX_SPEED = 25;

var PokerCardSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super();
	    this.retain();
        this.model = options.model;

        this.setName(this.model.cid);
        this.touchable = true;

        this.initView();

        /*this.listener = cc.EventListener.create({
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
                target.x += delta.x;
                target.y += delta.y;
                target.speedX = delta.x;
                target.speedY = delta.y;
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                if ( target.alreadyTaken )
                    return;
                target.onTouchRelease.call(target);
            }
        });*/
    },
    initView:function(){
        this.numberSprite = new cc.Sprite();
        this.numberSprite.attr({
            x: dimens.card_number_position.x,
            y: dimens.card_number_position.y
        });
        this.addChild(this.numberSprite, 0);

        this.numberDownSprite = new cc.Sprite();
        this.numberDownSprite.attr({
            x: dimens.card_size.width - dimens.card_number_position.x,
            y: dimens.card_size.height - dimens.card_number_position.y,
            rotation: 180
        });
        this.addChild(this.numberDownSprite, 0);
    },
    onTouchRelease:function(){
        var target = this;
        if ( target.y < dimens.player1Y ) {
            target.playerTakeCard.call(target, gameModel.player1);
            return;
        }
        if ( target.y > dimens.player2Y ) {
            target.playerTakeCard.call(target, gameModel.player2);
            return;
        }

        var player1Y = dimens.player1Y;
        var player2Y = dimens.player2Y;

        var midY = cc.winSize.height/2;
        if ( target.speedY > 0 ) {
            if ( target.y < midY ) {
                var totalTime = target.moveToLine.call(target, gameModel.player1, player2Y, function(){
                    this.playerTakeCard.call(this, gameModel.player2);
                }, target);
                var midTime = (target.y - midY ) * totalTime / (target.y - player2Y);
                target.runAction( new cc.Sequence(new cc.DelayTime(midTime),
                    new cc.CallFunc(function(){
                        //check speed
                        var speedScale = this.getSpeedScale(gameModel.player2);
                        if ( speedScale != this.speedScale ) {
                            this.stopAllActions();
                            var speed = this.getSpeed(gameModel.player2);
                            var newTime = Math.sqrt((this.x - this.destX) * (this.x - this.destX) + (this.y - this.destY) * (this.y - this.destY)) / speed;
                            this.runAction(new cc.Sequence( new cc.MoveTo( newTime, this.destX, this.destY ),
                                new cc.CallFunc(function(){
                                    if ( this.destX > -dimens.card_size.width / 2 && this.destX < cc.winSize.width + dimens.card_size.width / 2 ) {
                                        this.playerTakeCard.call(this, gameModel.player2);
                                    } else {
                                        gameModel.destroyCard(this.model);
                                    }
                                },this) ) );
                        }
                    },target)) );
            } else {
                target.moveToLine.call(target, gameModel.player2, player2Y, function(){
                    target.playerTakeCard.call(target, gameModel.player2);
                }, target);
            }
        } else if ( target.speedY < 0 ) {
            if ( target.y >= midY ) {
                var totalTime = target.moveToLine.call(target, gameModel.player2, player1Y, function(){
                    this.playerTakeCard.call(this, gameModel.player1);
                }, target);
                var midTime = (target.y - midY ) * totalTime / (target.y - player1Y);
                target.runAction( new cc.Sequence(new cc.DelayTime(midTime),
                    new cc.CallFunc(function(){
                        //check speed
                        var speedScale = this.getSpeedScale(gameModel.player1);
                        if ( speedScale != this.speedScale ) {
                            this.stopAllActions();
                            var speed = this.getSpeed(gameModel.player1);
                            var newTime = Math.sqrt((this.x - this.destX) * (this.x - this.destX) + (this.y - this.destY) * (this.y - this.destY)) / speed;
                            this.runAction(new cc.Sequence( new cc.MoveTo( newTime, this.destX, this.destY ),
                                new cc.CallFunc(function(){
                                    if ( this.destX > -dimens.card_size.width / 2 && this.destX < cc.winSize.width + dimens.card_size.width / 2 ) {
                                        this.playerTakeCard.call(this, gameModel.player1);
                                    } else {
                                        gameModel.destroyCard(this.model);
                                    }
                                },this) ) );
                        }
                    },target)) );
            } else {
                target.moveToLine.call(target, gameModel.player1, player1Y, function(){
                    target.playerTakeCard.call(target, gameModel.player1);
                }, target);
            }
        } else if ( target.speedY == 0 ) {
            var actionArray = [];
            var speed = target.y < midY ? target.getSpeed(gameModel.player1) : target.getSpeed(gameModel.player2);
            if ( target.speedX < 0 ) {
                var time = ( target.x - ( - dimens.card_size.width/2 ) ) / speed;
                actionArray.push(new cc.MoveTo(time, - dimens.card_size.width/2, target.y));
                actionArray.push(new cc.CallFunc(function () {
                    gameModel.destroyCard(target.model);
                }, target));
            } else if ( target.speedX > 0 ) {
                var time = ( cc.winSize.width + dimens.card_size.width/2 - target.x ) / speed;
                actionArray.push(new cc.MoveTo(time, cc.winSize.width + dimens.card_size.width/2, target.y));
                actionArray.push(new cc.CallFunc(function () {
                    gameModel.destroyCard(target.model);
                }, target));
            }
            target.runAction( new cc.Sequence(actionArray) );
        }
    },
    canBeTouch:function(){
        return !this.alreadyTaken && this.touchable;
    },
    playerTakeCard:function(player){
        if ( this.alreadyTaken )
            return;
        if ( player.canTakeCard() ) {
            this.stopAllActions();
            this.isNewHand = true;
            this.setTag(0);
            player.addHand(this.model);
            this.alreadyTaken = true;
            //cc.eventManager.removeListener(this.listener);
        } else {
            this.stopAllActions();
            gameModel.destroyCard(this.model);
        }
    },
    getSpeedScale:function(player){
        var speedScale = 1;
        if ( player.get("speedUp") ) {
            speedScale = speedScale*2;
        }
        if ( player.get("speedDown") ) {
            speedScale = speedScale/2;
        }
        return speedScale;
    },
    getSpeed:function(player){
        var originSpeed = Math.max(0.1, Math.sqrt( this.speedX*this.speedX + this.speedY * this.speedY ) );
        var speed = Math.min( MAX_SPEED, Math.max( MIN_SPEED, originSpeed ) ) * 30;
        this.speedScale = this.getSpeedScale(player);
        speed = speed * this.speedScale;
        return speed;
    },
    changeSpeed:function(){

    },
    moveToLine:function(player, lineY, callback, context){
        var actionArray = [];
        var pointX = this.getCrossPointX.call(this, lineY);
        var speed = this.getSpeed(player);
        var time = Math.sqrt((this.x - pointX) * (this.x - pointX) + (this.y - lineY) * (this.y - lineY)) / speed;
        this.destX = pointX;
        this.destY = lineY;
        actionArray.push(new cc.MoveTo(time, pointX, lineY));
        if (pointX > -dimens.card_size.width / 2 && pointX < cc.winSize.width + dimens.card_size.width / 2) {
            actionArray.push(new cc.CallFunc(callback, context));
        } else {
            actionArray.push(new cc.CallFunc(function () {
                gameModel.destroyCard(this.model);
            }, this));
        }
        this.runAction( new cc.Sequence(actionArray) );
        return time;
    },
    getCrossPointX:function(lineY){
        return ( lineY - this.y ) * this.speedX / this.speedY + this.x;
    },
    render:function(){
        this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-"+SUIT_ARRAY[this.model.get("suit")]+".png"));
        this.numberSprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("number-"+this.model.get("number")+".png"));
        this.numberDownSprite.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("number-"+this.model.get("number")+".png"));
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
        //cc.eventManager.addListener(this.listener, this);
        this.model.on("destroy",this.onDestroy,this);
    },
    closeEvent:function(){
        //cc.eventManager.removeListener(this.listener);
        this.model.off("destroy",this.onDestroy);
    },
    onDestroy:function(){
	    this.release();
        this.removeFromParent(true);
    },
    getFlipToFrontSequence:function(){
        var oldScaleX = 1;
        var oldScaleY = 1;
        return new cc.Sequence( new cc.ScaleTo(times.flip/2, 0, oldScaleY), new cc.CallFunc(function(){
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-"+SUIT_ARRAY[this.model.get("suit")]+".png"));
            this.numberSprite.setVisible(true);
            this.numberDownSprite.setVisible(true);
        },this), new cc.ScaleTo(times.flip/2,oldScaleX,oldScaleY));
    },
    getFlipToBackSequence:function(){
        var oldScaleX = 1;
        var oldScaleY = 1;
        return new cc.Sequence( new cc.ScaleTo(times.flip/2, 0, oldScaleY), new cc.CallFunc(function(){
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("card-back.png"));
            this.numberSprite.setVisible(false);
            this.numberDownSprite.setVisible(false);
        },this), new cc.ScaleTo(times.flip/2,oldScaleX,oldScaleY));
    }
});

