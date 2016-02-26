var DIRECTION_ME = 0;
var DIRECTION_OPPONENT = 1;
var DIRECTION_OUT = 2;

var AI_DIFFICULTY_EASY = 0;
var AI_DIFFICULTY_NORMAL = 1;
var AI_DIFFICULTY_HARD = 2;
var AI_DIFFICULTY_MAD = 3;

var AIPlayerModel = PlayerModel.extend({
    initialize:function(options){
        options = options || {};
        this.scheduleLength = 1.5;
        this.scheduleLengthRange = 0.5;
        this.difficulty = AI_DIFFICULTY_EASY;
        this.set({
            dizzyMistakeRate: 0.9,
            blockSightMistakeRate: 0.9,
            shrinkMistakeRate: 0.9
        })
        this.pushToOpponentSpeed = NATURE_SPEED/2;
    },
    moveCard:function(cardSprite, direction){
        cardSprite.lastTouchBy = this.get("position");
        if ( direction === DIRECTION_ME ) {
            cardSprite.speedX = 0;
            cardSprite.speedY = this.get("position") === PLAYER_POSITION_UP ? NATURE_SPEED*2 : -NATURE_SPEED*2;
        } else if ( direction === DIRECTION_OPPONENT ) {
            cardSprite.speedX = (Math.random()-0.5)*NATURE_SPEED/8;
            cardSprite.speedY = this.get("position") === PLAYER_POSITION_UP ? -this.pushToOpponentSpeed : this.pushToOpponentSpeed;
        } else if ( direction === DIRECTION_OUT ) {
            cardSprite.speedY = 0;
            cardSprite.speedX = Math.random()>0.5?NATURE_SPEED:-NATURE_SPEED;
        }
        var finger = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("finger.png"));
        finger.attr({
            x: cardSprite.width/2,
            y: cardSprite.height/2,
            anchorY: 1,
            rotation: this.get("position") === PLAYER_POSITION_UP ? 180 : 0
        })
        cardSprite.addChild(finger);
        finger.runAction(cc.sequence(
            cc.delayTime(0.5),
            cc.removeSelf(true)
        ))
        cardSprite.__finger = finger;
        cardSprite.onTouchRelease();

        //check break vase
        var location = cardSprite.getPosition()
        mainLayer.eachManagedItemSprite(function(sprite){
            if ( sprite instanceof VaseSprite ){
                sprite.checkBreak(location);
            }
        })
    },
    checkMovable:function(sprite) {
        if ( sprite.alreadyTaken || sprite.lastTouchBy === this.get("position")) return false;
        var midY = cc.winSize.height/2;
        var padding = 40;
        return ( this.get("position") === PLAYER_POSITION_UP && sprite.y > midY+padding || this.get("position") === PLAYER_POSITION_DOWN && sprite.y < midY-padding ) &&
            ( sprite.x > dimens.card_size.width/2 && sprite.x < cc.winSize.width - dimens.card_size.width/2 ) ;
    },
    countMidSprite:function(){
        var isDown = this.get("position") === PLAYER_POSITION_DOWN;
        var offsetY = 80;
        return _.countBy( mainLayer.getChildren(), function(sprite) {
            if (sprite.x < 0 || sprite.x > cc.winSize.width)
                return "nothing";
            if (sprite instanceof NormalCardSprite &&
            ( ( isDown && sprite.y >= dimens.player1Y + offsetY && sprite.y <= cc.winSize.height/2 - offsetY ) ||
            ( !isDown && sprite.y >= cc.winSize.height/2 + offsetY && sprite.y <= dimens.player2Y - offsetY )) ) {
                if (!sprite.alreadyTaken) {
                    return "count";
                }
            }
            return "nothing";
        });
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
        this.calculateWantAndHate();
        var opponent = gameModel.getOpponentPlayer(this)
        opponent.calculateWantAndHate();
        var candidates = [];
        _.each( mainLayer.getChildren(), function(sprite) {
            if (sprite instanceof PokerCardSprite ) {
                if ( this.checkMovable(sprite) && this.canTakeCard() ) {
                    var statusEffect = this.checkStatusEffect();
                    if ( statusEffect ) return statusEffect;
                    var result = this.evaluatePokerCard(sprite, opponent);
                    candidates.push({
                        sprite: sprite,
                        direction: result.direction,
                        value: result.value
                    });
                }
            } else if (sprite instanceof MoneySpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    var statusEffect = this.checkStatusEffect();
                    if ( statusEffect ) return statusEffect;
                    candidates.push({
                        sprite: sprite,
                        direction: DIRECTION_ME,
                        value: this.evaluateMoney(sprite)
                    });
                }
            } else if (sprite instanceof ItemSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    var statusEffect = this.checkStatusEffect();
                    if ( statusEffect ) return statusEffect;
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
                    var statusEffect = this.checkStatusEffect();
                    if ( statusEffect ) return statusEffect;
                    candidates.push({
                        sprite: sprite,
                        direction: DIRECTION_OPPONENT,
                        value: this.evaluateThief(sprite)
                    });
                }
            } else if (sprite instanceof BombSpecialCardSprite ) {
                if ( this.checkMovable(sprite) ) {
                    var statusEffect = this.checkStatusEffect();
                    if ( statusEffect ) return statusEffect;
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
            if ( result.value <= 0 ) return;
            if ( result.useItem ) {
                playerSprite.itemSlotSprite.useItem();
            } else {
                this.moveCard(result.sprite, result.direction);
            }
        }
    },
    onGetItem:function(itemName){
    },
    evaluatePokerCard:function(sprite, opponent){
        return {
            direction:DIRECTION_ME,
            value:1
        };
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
    },
    checkStatusEffect:function(){
        if ( this.get("dizzy") && Math.random() < this.get("dizzyMistakeRate") ) {
            return {
                direction: DIRECTION_OPPONENT,
                value:0
            }
        }
        if ( this.get("blockSight") && Math.random() < this.get("blockSightMistakeRate") ) {
            return {
                direction: DIRECTION_OPPONENT,
                value:0
            }
        }
        if ( this.get("shrink") && Math.random() < this.get("shrinkMistakeRate") ) {
            return {
                direction: DIRECTION_OPPONENT,
                value:0
            }
        }
        return null;
    }
})


var EasyAIPlayerModel = AIPlayerModel;

var HardAIPlayerModel = AIPlayerModel.extend({
    initialize:function(options){
        options = options || {};
        this.scheduleLength = 0.75;
        this.scheduleLengthRange = 0.3;
        this.difficulty = AI_DIFFICULTY_HARD;
        this.set({
            dizzyMistakeRate: 0.25,
            blockSightMistakeRate: 0.5,
            shrinkMistakeRate: 0.25
        })
        this.pushToOpponentSpeed = NATURE_SPEED;
    },
    onStartNewRound:function(){
    },
    onGetCard:function(cardModel){
    },
    onOpponentGetCard:function(cardModel){
    },
    onStartCountDown:function(){
    },
    evaluatePokerCard:function(sprite, opponent){
        var number = sprite.model.get("number");
        var suit = sprite.model.get("suit");
        var value = 0;
        if (_.contains(this.wantNumber,number)) {
            value += 40;
        } else if (_.contains(this.hateNumber,number)) {
            value -= 50;
        }
        if (_.contains(this.reallyWantNumber,number)) {
            value += 40;
        }
        if (_.contains(this.wantSuit,suit)) {
            value += 80;
        } else if (_.contains(this.hateSuit,suit)) {
            value -= 50;
        }
        if ( value === 0 ) {
            if (number < 10) {
                return {
                    direction: DIRECTION_ME,
                    value:0
                };
            }
        }

        if ( value < 0 ) {
            if (_.contains(opponent.wantNumber,number) ||
                _.contains(opponent.wantSuit,suit) ||
                number >= 10 ) {
                return {
                    direction: DIRECTION_OUT,
                    value:Math.abs(value)
                };
            } else {
                if ( opponent.canTakeCard() ) {
                    return {
                        direction: DIRECTION_OPPONENT,
                        value: Math.abs(value)
                    };
                } else {
                    return {
                        direction: DIRECTION_OUT,
                        value:Math.abs(value)
                    };
                }
            }
        } else {
            return {
                direction: DIRECTION_ME,
                value:number
            };
        }
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
            case"leaf":case"shrink":case"slow":case "sniper":case"thief":case"tornado":case"hammer":
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
            case "katana":
                var midCount = this.countMidSprite();
                if ( midCount.count >= 2 ) return 30
                else return 0;
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
            case "upward":
                var myFeature = this.getFeature();
                var opponentFeature = opponentSprite.model.getFeature();
                return myFeature.power > opponentFeature.power ? 50 : 0;
            case "downward":
                var myFeature = this.getFeature();
                var opponentFeature = opponentSprite.model.getFeature();
                return myFeature.power < opponentFeature.power ? 50 : 0;
        }
        return 30;
    },
    pickUpCandidate:function(candidates){
        return _.max(candidates, function (candidate) {
            return candidate.value;
        }, this);
    }
})

var NormalAIPlayerModel = HardAIPlayerModel.extend({
    initialize: function (options) {
        options = options || {};
        this.scheduleLength = 1.2;
        this.scheduleLengthRange = 0.4;
        this.difficulty = AI_DIFFICULTY_NORMAL;
        this.set({
            dizzyMistakeRate: 0.5,
            blockSightMistakeRate: 0.7,
            shrinkMistakeRate: 0.35
        })
        this.pushToOpponentSpeed = NATURE_SPEED/2;
    }
});

var MadAIPlayerModel = HardAIPlayerModel.extend({
    initialize: function (options) {
        options = options || {};
        this.scheduleLength = 0.4;
        this.scheduleLengthRange = 0.15;
        this.difficulty = AI_DIFFICULTY_MAD;
        this.set({
            dizzyMistakeRate: 0.1,
            blockSightMistakeRate: 0.1,
            shrinkMistakeRate: 0
        })
        this.pushToOpponentSpeed = NATURE_SPEED*2;
    }
});
