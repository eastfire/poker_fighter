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
        this.scheduleLength = 1;
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
        var padding = 40;
        return ( this.get("position") === PLAYER_POSITION_UP && sprite.y > midY+padding || this.get("position") === PLAYER_POSITION_DOWN && sprite.y < midY-padding ) &&
            ( sprite.x > dimens.card_size.width/2 && sprite.x < cc.winSize.width - dimens.card_size.width/2 ) ;
    },
    countSprite:function(){
        return _.countBy( mainLayer.getChildren(), function(sprite) {
            if (sprite.x < 0 || sprite.x > cc.winSize.width)
                return "nothing";
            if (sprite instanceof MoneySpecialCardSprite) {
                if (!sprite.alreadyTaken) {
                    return "money";
                }
            } else if (sprite instanceof PokerCardSprite ) {
                if ( !sprite.alreadyTaken ) {
                    var number = sprite.model.get("number");
                    if ( number === 12 ) {
                        return "q";
                    } else if ( number === 11 ) {
                        return "j";
                    } else if ( number === 13 ) {
                        return "k";
                    }
                }
            }
            return "nothing";
        });
    },
    onAskStrategy:function(){
        var candidates = [];
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof PokerCardSprite ) {
                if ( this.checkMovable(sprite) && this.canTakeCard() ) {
                    candidates.push({
                        sprite: sprite,
                        direction: DIRECTION_ME,
                        value: this.evaluatePokerCard(sprite)
                    });
                }
            } else if (sprite instanceof MoneySpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    candidates.push({
                        sprite: sprite,
                        direction: DIRECTION_ME,
                        value: this.evaluateMoney(sprite)
                    });
                }
            } else if (sprite instanceof ItemSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    var value = this.evaluateItem(sprite)
                    if ( value ) {
                        candidates.push({
                            sprite: sprite,
                            direction: DIRECTION_ME,
                            value: this.evaluateItem(sprite)
                        });
                    }
                }
            } else if (sprite instanceof ThiefSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    candidates.push({
                        sprite: sprite,
                        direction: DIRECTION_OPPONENT,
                        value: this.evaluateThief(sprite)
                    });
                }
            } else if (sprite instanceof BombSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    candidates.push({
                        sprite: sprite,
                        direction: DIRECTION_OPPONENT,
                        value: this.evaluateBomb(sprite)
                    });
                }
            }
        }, this);
        var playerSprite = this.get("position") == PLAYER_POSITION_UP ? mainLayer.player2Sprite : mainLayer.player1Sprite;
        if ( playerSprite.canUseItem() ) {
            var value = this.evaluateUseItem(playerSprite.itemSlotSprite.model.get("name"))
            if ( value ) {
                candidates.push({
                    useItem: true,
                    value: value
                });
            }
        }
        if ( candidates.length ) {
            var result = this.pickUpCandidate(candidates);
            if ( result.useItem ) {
                playerSprite.itemSlotSprite.useItem();
            } else {
                this.moveCard(result.sprite, result.direction);
            }
        }
    },
    onGetItem:function(itemName){
    },
    evaluatePokerCard:function(sprite){
        return 1;
    },
    evaluateMoney:function(sprite){
        return 1;
    },
    evaluateItem:function(sprite){
        return 1;
    },
    evaluateThief:function(sprite){
        return 1;
    },
    evaluateBomb:function(sprite){
        return 1;
    },
    evaluateUseItem:function(itemName){
        return 1;
    },
    pickUpCandidate:function(candidates){
        return _.sample(candidates);
    }
})

var SimpleAIPlayerModel = AIPlayerModel.extend({
    onStartNewRound:function(){
    },
    onGetCard:function(cardModel){
    },
    onOpponentGetCard:function(cardModel){
    },
    onStartCountDown:function(){
    },
    evaluatePokerCard:function(sprite){
        var number = sprite.model.get("number");
        if ( number < 10 ) {
            return 1;
        } return number;
    },
    evaluateMoney:function(sprite){
        return sprite.model.get("money");
    },
    evaluateItem:function(sprite){
        var playerSprite = this.get("position") == PLAYER_POSITION_UP ? mainLayer.player2Sprite : mainLayer.player1Sprite;
        return playerSprite.itemSlotSprite.getCurrentItemName() ? 0 : 40;
    },
    evaluateThief:function(sprite){
        return 10;
    },
    evaluateBomb:function(sprite){
        return 45;
    },

    evaluateUseItem:function(itemName){
        var playerSprite, opponentSprite;
        if ( this.get("position") == PLAYER_POSITION_UP ) {
            playerSprite = mainLayer.player2Sprite;
            opponentSprite = mainLayer.player1Sprite;
        } else {
            playerSprite = mainLayer.player1Sprite;
            opponentSprite = mainLayer.player2Sprite;
        }
        var counts = this.countSprite();
        switch ( itemName ) {
            case "ace":case "cloud":case "two":case "dizzy":case "enlarge":case "fast":case "forbid":
            case"leaf":case"shrink":case"slow":case "sniper":case"thief":case"tornado":
                return 30;
            case "bomb":
                return opponentSprite.model.get("hands").length >= 2 ? 30 : 0;
            case "spy":
                return opponentSprite.model.get("hands").length >= 1 ? 30 : 0;
            case "kiss":
                if (!this.get("hands").length >= 4)
                    return 0;
                if ( (counts.j >= 2 && counts.k <= 1) || (counts.j <= 1 && counts.k >= 2) ) {
                    return 30
                } else {
                    return 0;
                }
                break;
            case "diamond":
                if (!this.get("hands").length >= 4)
                    return 0;
                if ( counts.q >= 2 ) {
                    return 30
                } else {
                    return 0;
                }
                break;
            case "magnet":
                if ( counts.money >= 2 ) {
                    return 30
                } else {
                    return 0;
                }
                break;
            case "nuke":
                return opponentSprite.model.get("hands").length > playerSprite.model.get("hands").length + 1 ? 50 : 0;
        }
        return 30;
    },
    pickUpCandidate:function(candidates){
        return _.max(candidates, function (candidate) {
            return candidate.value;
        }, this);
    }
})