var DIRECTION_ME = 0;
var DIRECTION_OPPONENT = 1;
var DIRECTION_OUT = 2;

var AIPlayerModel = PlayerModel.extend({
    initialize:function(options){
        options = options || {};
        this.iWant = [];
        this.iDontWant = [];
        this.opponentWant = [];
        this.opponentDontWant = [];
        this.scheduleLength = 0.5;
    },
    moveCard:function(cardSprite, direction){
        cardSprite.lastTouchBy = this.get("position");
        if ( direction === DIRECTION_ME ) {
            cardSprite.speedX = 0;
            cardSprite.speedY = this.get("position") === PLAYER_POSITION_UP ? NATURE_SPEED : -NATURE_SPEED;
        } else if ( direction === DIRECTION_OPPONENT ) {
            cardSprite.speedX = 0;
            cardSprite.speedY = this.get("position") === PLAYER_POSITION_UP ? -NATURE_SPEED : NATURE_SPEED;
        } else {
            cardSprite.speedX = 0;
            cardSprite.speedY = Math.random()>0.5?NATURE_SPEED:-NATURE_SPEED;
        }
        var finger = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("finger.png"));
        finger.attr({
            x: cardSprite.width/2,
            y: cardSprite.height/2,
            anchorY: 1
        })
        cardSprite.addChild(finger);
        finger.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.removeSelf(true)
        ))
        cardSprite.onTouchRelease();
    },
    checkMovable:function(sprite) {
        if ( sprite.alreadyTaken || sprite.lastTouchBy === this.get("position")) return false;
        var midY = cc.winSize.height/2;
        return ( this.get("position") === PLAYER_POSITION_UP && sprite.y > midY || this.get("position") === PLAYER_POSITION_DOWN && sprite.y < midY ) &&
            ( sprite.x > dimens.card_size.width/2 && sprite.x < cc.winSize.width - dimens.card_size.width/2 ) ;
    }

})

var SimpleAIPlayerModel = AIPlayerModel.extend({
    onStartNewRound:function(){
    },
    onGetCard:function(cardModel){
    },
    onOpponentGetCard:function(cardModel){
    },
    onAskStrategy:function(){
        //filter my card
        var finish = false;
        _.each( mainLayer.getChildren(), function(sprite) {
            if ( finish ) return;
            if (sprite instanceof PokerCardSprite ) {
                if ( this.checkMovable(sprite)  && this.canTakeCard() ) {
                    this.moveCard(sprite, DIRECTION_ME);
                    finish = true;
                }
            } else if (sprite instanceof MoneySpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    this.moveCard(sprite, DIRECTION_ME);
                    finish = true;
                }
            } else if (sprite instanceof ItemSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    this.moveCard(sprite, DIRECTION_ME);
                    finish = true;
                }
            } else if (sprite instanceof ThiefSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    this.moveCard(sprite, DIRECTION_OPPONENT);
                    finish = true;
                }
            } else if (sprite instanceof BombSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    this.moveCard(sprite, DIRECTION_OPPONENT);
                    finish = true;
                }
            }
        }, this);
    },
    onGetItem:function(itemName){
    },
    onStartCountDown:function(){
    }
})