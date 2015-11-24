var STRAIGHT_MAP = {
    "14-3-2":true,
    "4-3-2":true,
    "5-4-3":true,
    "6-5-4":true,
    "7-6-5":true,
    "8-7-6":true,
    "9-8-7":true,
    "10-9-8":true,
    "11-10-9":true,
    "12-11-10":true,
    "13-12-11":true,
    "14-13-12":true,

    "14-4-3-2":true,
    "5-4-3-2":true,
    "6-5-4-3":true,
    "7-6-5-4":true,
    "8-7-6-5":true,
    "9-8-7-6":true,
    "10-9-8-7":true,
    "11-10-9-8":true,
    "12-11-10-9":true,
    "13-12-11-10":true,
    "14-13-12-11":true,

    "14-5-4-3-2":true,
    "6-5-4-3-2":true,
    "7-6-5-4-3":true,
    "8-7-6-5-4":true,
    "9-8-7-6-5":true,
    "10-9-8-7-6":true,
    "11-10-9-8-7":true,
    "12-11-10-9-8":true,
    "13-12-11-10-9":true,
    "14-13-12-11-10":true
};

var PLAYER_POSITION_DOWN = 0;
var PLAYER_POSITION_UP = 1;

var MAX_HAND = 5;
var ACTION_TAG_MOVING = 111;
var ACTION_TAG_FLIPPING = 112;

var PLAYER_TYPE_PLAYER = 0;
var PLAYER_TYPE_AI = 1;

var PlayerModel = Backbone.Model.extend({
    defaults:function(){
        return {
            type: PLAYER_TYPE_PLAYER,
            money : 500,
            targetMoney: 1000,
            hands: [],
            speedDown: 0,
            speedUp: 0,
            sizeUp: 0,
            sizeDown: 0,
            dizzy: 0,
            spy: 0,
            needItem: true,
            item: null
        }
    },
    addHand:function(cardModel){
        cardModel._owned = true
        var cards = this.get("hands");
        cards.push(cardModel);
        this.sortHand();
    },
    discardRandomCard:function(){
        var hands = this.get("hands");
        if ( hands.length === 0 ) return;
        var cardModel = _.sample( hands );
        var index = _.indexOf(hands, cardModel);
        hands.splice(index,1);
        gameModel.destroyCard(cardModel);
        this.sortHand();
    },
    sortHand:function(){
        var cards = this.get("hands");
        var sortedCards = _.sortBy(cards, function(cardModel){
            var number = cardModel.get("number");
            return (100-number)*100+cardModel.get("suit");
        },this );
        this.set("hands",sortedCards);

        this.trigger("change:hands",this);
    },
    canTakeCard:function(){
        return this.get("hands").length < MAX_HAND;
    },

    is5ofAKind:function(cards) {
        if (cards[0].get("number") === cards[1].get("number") && cards[0].get("number") === cards[2].get("number") && cards[0].get("number") === cards[3].get("number") && cards[0].get("number") === cards[4].get("number") ) {
            return true;
        }
        return false;
    },
    isFlushStraight:function(cards){
        return this.isFlush(cards) && this.isStraight(cards);
    },
    is4ofAKind:function(cards){
        if (cards[0].get("number") === cards[1].get("number") && cards[0].get("number") === cards[2].get("number") && cards[0].get("number") === cards[3].get("number") ) {
            return cards[0];
        } else if ( cards[1].get("number") === cards[2].get("number") && cards[1].get("number") === cards[3].get("number") && cards[1].get("number") === cards[4].get("number") ) {
            return cards[1];
        }
        return false
    },
    isFullHouse:function(cards){
        if (cards[0].get("number") === cards[1].get("number") &&
            cards[0].get("number") === cards[2].get("number") &&
            cards[3].get("number") === cards[4].get("number") ) {
            return cards[0];
        } else if ( cards[0].get("number") === cards[1].get("number") &&
                cards[2].get("number") === cards[3].get("number") &&
                cards[3].get("number") === cards[4].get("number")) {
            return cards[2];
        }
        return false;
    },
    isStraight:function(cards){
        var v = _.map (cards, function(card){
            return card.get("number");
        },this).join("-");
        return STRAIGHT_MAP[v];
    },
    is3ofAKind:function(cards){
        if (cards[0].get("number") === cards[1].get("number") && cards[0].get("number") === cards[2].get("number") ) {
            return cards[0];
        } else if (cards[1].get("number") === cards[2].get("number") && cards[1].get("number") === cards[3].get("number") ) {
            return cards[1];
        } else if (cards[2].get("number") === cards[3].get("number") && cards[2].get("number") === cards[4].get("number") ) {
            return cards[2];
        }
        return false
    },
    isFlush:function(cards){
        var v = cards[0].get("suit");
        for ( var i = 1; i < cards.length ; i++ ){
            if ( v != cards[i].get("suit") )
                return false;
        }
        return true;
    },
    is2Pair: function(cards){
        if ( cards[0].get("number") === cards[1].get("number") && cards[2].get("number") === cards[3].get("number") ) {
            return cards[0];
        } else if ( cards[0].get("number") === cards[1].get("number") && cards[3].get("number") === cards[4].get("number") ) {
            return cards[0];
        } else if ( cards[1].get("number") === cards[2].get("number") && cards[3].get("number") === cards[4].get("number") ) {
            return cards[1];
        }
        return false;
    },
    isPair: function(cards){
        if ( cards[0].get("number") === cards[1].get("number") ){
            return cards[0];
        } else if ( cards[1].get("number") === cards[2].get("number") ){
            return cards[1];
        } else if ( cards[2].get("number") === cards[3].get("number") ){
            return cards[2];
        } else if ( cards[3].get("number") === cards[4].get("number") ){
            return cards[3];
        }
        return false;
    },

    getFeature: function(){
        var hands = this.get("hands");
        var cards = [];
        _.each(hands, function(cardModel){
            cards.push(cardModel);
        },this);
        for ( var i = this.get("hands").length; i < MAX_HAND; i++ ) {
            cards.push( new PokerCardModel({
                number : -i,
                suit: 5 + i
            }))
        }

        var power, type, theCard, rate;
        if ( this.is5ofAKind(cards) ) {
            power = 11000 + cards[0].get("number") * 20 + (19 - cards[0].get("suit"));
            type = "five-of-a-kind"
            rate = 100;
            cc.sys.localStorage.setItem("fiveOfAKindAppeared",true);
        } else if ( this.isFlushStraight(cards) ) {
            power = 10000 + cards[0].get("number") * 20 + (19 - cards[0].get("suit"));
            type = "straight-flush"
            rate = 50;
        } else if ( theCard = this.is4ofAKind(cards) ) {
            power = 9000 + theCard.get("number") * 20 + (19 - theCard.get("suit"));
            type = "four-of-a-kind";
            rate = 40;
        } else if ( theCard = this.isFullHouse(cards) ) {
            power = 8000 + theCard.get("number") * 20 + (19 - theCard.get("suit"));
            type = "full-house";
            rate = 30;
        } else if ( this.isFlush(cards) ) {
            power = 7000 + cards[0].get("number") * 20 + (19 - cards[0].get("suit"));
            type = "flush";
            rate = 20;
        } else if ( this.isStraight(cards) ) {
            power = 6000 + cards[0].get("number") * 20 + (19 - cards[0].get("suit"));
            type = "straight";
            rate = 15;
        } else if ( theCard = this.is3ofAKind(cards) ) {
            power = 5000 + theCard.get("number") * 20 + (19 -theCard.get("suit"));
            type = "three-of-a-kind";
            rate = 10;
        } else if ( theCard = this.is2Pair(cards) ) {
            power = 4000 + theCard.get("number") * 20 + (19 -theCard.get("suit"));
            type = "two-pair";
            rate = 4;
        } else if ( theCard = this.isPair(cards) ) {
            power = 3000 + theCard.get("number") * 20 + (19 -theCard.get("suit"));
            type = "one-pair";
            rate = 2;
        } else if ( cards[0].get("number") > 0 ) {
            power = 2000 + cards[0].get("number") * 20 + (19 -cards[0].get("suit"));
            type = "high-card";
            rate = 1;
        } else {
            power = 0;
            type = "no-card";
            rate = 0;
        }
        return {
            power: power,
            type: type,
            rate: rate
        }
    },

    getSpeedAdjust: function() {
        var speedScale = 1;
        if (this.get("speedUp")) {
            speedScale *= 2;
        }
        if (this.get("speedDown")) {
            speedScale /= 2;
        }
        return speedScale;
    },
    getSizeAdjust: function() {
        var sizeScale = 1.1;
        if ( this.get("sizeUp") ) {
            sizeScale *= 1.5;
        }
        if ( this.get("sizeDown") ) {
            sizeScale /= 1.5;
        }
        return sizeScale;
    },
    maintain:function(){
        _.each( ["speedUp","speedDown","sizeUp","sizeDown","dizzy","spy"],function(attr){
            var value = this.get(attr);
            if ( value > 0 ) {
                this.set(attr, value - 1);
            }
        },this );
    },
    cleanStatus:function(){
        this.set({
            sizeUp: 0,
            sizeDown: 0,
            speedUp: 0,
            speedDown: 0,
            dizzy: 0,
            spy: 0
        })
    }
});

var PlayerSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super();
        this.model = options.model;

        this.model.set("showHand", false);
        this.lookHand = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("show-hand.png"));
        var y;
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            y = dimens.player1Y/2;
            this.effectRect = cc.rect(0, dimens.player1Y, cc.winSize.width, cc.winSize.height/2 - dimens.player1Y - 1);
        } else {
            y = (dimens.player2Y + cc.winSize.height)/2;
            this.effectRect = cc.rect(0, cc.winSize.height/2+1, cc.winSize.width, cc.winSize.height/2 - dimens.player1Y - 1);
        }
        this.lookHand.attr({
            x: cc.winSize.width/2,
            y: y
        });
        this.addChild(this.lookHand,40);

        var bound = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("player-bound.png"));
        var y;
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            y = dimens.player1Y;
        } else {
            y = dimens.player2Y;
        }
        bound.attr({
            x: cc.winSize.width/2,
            y: y
        });
        this.addChild(bound,0);

        var moneySprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("money.png"))
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            moneySprite.attr({
                x: 0,
                y: 0,
                anchorX: 0,
                anchorY: 0
            });
        } else {
            moneySprite.attr({
                x:cc.winSize.width,
                y: cc.winSize.height,
                anchorX: 0,
                anchorY: 0,
                rotation: 180
            });
        }
        this.addChild(moneySprite);

        if ( this.model.get("needItem") ) {
            this.itemSlotSprite = new ItemSlotSprite({ owner : this.model.get("position") });
            if (this.model.get("position") == PLAYER_POSITION_DOWN) {
                this.itemSlotSprite.attr({
                    x: cc.winSize.width - 45,
                    y: 45
                });
            } else {
                this.itemSlotSprite.attr({
                    x: 45,
                    y: cc.winSize.height - 45,
                    rotation: 180
                });
            }
            this.addChild(this.itemSlotSprite, 80);
            if (this.model.get("item")) {
                this.itemSlotSprite.setItemModel(new ITEM_MODEL_CLASS_MAP[this.model.get("item")]())
            } else this.itemSlotSprite.setItemModel(null);
        }

        this.moneyLabel = new ccui.Text(this.model.get("money"), "Arial", 40 );
        this.moneyLabel.enableOutline(cc.color.WHITE, 2);
        this.moneyLabel.setTextColor(cc.color.BLACK);
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            this.moneyLabel.attr({
                //color: colors.tableLabel,
                x: 45,
                y: 25
            });
        } else {
            this.moneyLabel.attr({
                //color: colors.tableLabel,
                x: cc.winSize.width - 45,
                y: cc.winSize.height - 25,
                rotation: 180
            });
        }
        this.addChild(this.moneyLabel, 0);


        var self = this;
        cc.eventManager.addListener( cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();

                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                //Check the click area
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    self.showHand();
                    return true;
                }
                return false;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                self.hideHand();
            }
        }), this.lookHand);
    },
    getEffectRect:function(){
        return this.effectRect;
    },
    isThisSide:function(y){
        return (this.effectRect.y <= y) && (this.effectRect.y+this.effectRect.height) >= y;
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
        this.model.on("change:hands",this.onHandChange, this);
        this.model.on("change:money",this.onMoneyChange, this);
        this.model.on("change:spy",this.onSpyChange,this);
        this.model.on("change:showHand",this.onShowHandChange,this);
    },
    closeEvent:function(){
        this.model.off("change:hands",this.onHandChange);
        this.model.off("change:money",this.onMoneyChange);
        this.model.off("change:spy",this.onSpyChange);
        this.model.off("change:showHand",this.onShowHandChange,this);
    },
    renderMoney:function(){
        this.moneyLabel.setString(this.model.get("money"));
    },
    onMoneyChange:function(){
        this.renderMoney();
    },
    onSpyChange:function(){
        var prev = this.model.previous("spy");
        var current = this.model.get("spy");
        if ( !prev && current ) {
            this.eyeSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("eye.png"));
            var y;
            var rotation;
            if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
                y = dimens.player1Y;
                rotation = 0;
            } else {
                y = dimens.player2Y;
                rotation = 180;
            }
            this.eyeSprite.attr({
                x: cc.winSize.width/2,
                y: y,
                rotation: rotation
            })
            this.addChild(this.eyeSprite);
        } else if ( prev && !current ) {
            this.eyeSprite.removeFromParent(true);
            this.eyeSprite = null;
        }
        prev = prev || this.model.previous("showHand");
        current = current || this.model.get("showHand");
        if ( !prev && current || prev && !current ) {
            this.onHandVisibilityChange();
        }
    },
    isHandVisible:function(){
        return this.model.get("showHand") || this.model.get("spy");
    },
    onShowHandChange:function() {
        var prev = this.model.previous("spy") || this.model.previous("showHand");
        var current = this.model.get("spy") || this.model.get("showHand");
        if ( !prev && current || prev && !current ) {
            this.onHandVisibilityChange();
        }
    },
    onHandVisibilityChange:function() {
        var cards = this.model.get("hands");
        if ( this.isHandVisible() ) {
            _.each(cards,function(cardModel){
                var sprite = this.getParent().getChildByName(cardModel.cid);
                if ( sprite != null ) {
                    sprite.stopActionByTag(ACTION_TAG_FLIPPING);
                    sprite.runAction(sprite.getFlipToFrontSequence()).setTag(ACTION_TAG_FLIPPING);

                }
            }, this);
        } else {
            _.each(cards,function(cardModel){
                var sprite = this.getParent().getChildByName(cardModel.cid);
                if ( sprite != null ) {
                    sprite.stopActionByTag(ACTION_TAG_FLIPPING);
                    sprite.runAction(sprite.getFlipToBackSequence()).setTag(ACTION_TAG_FLIPPING);

                }
            }, this);
        }
    },
    onHandChange:function(){
        var needCurve = true;
        var cards = this.model.get("hands");
        var index = 0;
        if ( cards.length == 0 ) {
            return;
        }
        var y = dimens.player1HandPosition.y;

        var estimateWidth = cards.length * dimens.card_size.width + (cards.length-1) * dimens.hand_line_card_padding;
        var x;
        var stepX;
        if ( estimateWidth < cc.winSize.width ) {
            x = ( cc.winSize.width - estimateWidth ) / 2 + dimens.card_size.width/2;
            stepX = dimens.card_size.width + dimens.hand_line_card_padding;
        } else {
            x = dimens.card_size.width/2;
            stepX = ( cc.winSize.width - dimens.card_size.width ) / (cards.length - 1);
        }

        var i = 0;
        var r = 400;
        _.each(cards,function(cardModel){
            var realX, realY, angle, cardAngle;
            if ( needCurve ) {
                angle = ( x - cc.winSize.width / 2 ) /r;
                realX = Math.sin(angle) * r + cc.winSize.width / 2;
                realY = Math.cos(angle) * r + y - r + 20;
                cardAngle = angle * 50;
                if ( this.model.get("position") == PLAYER_POSITION_UP ) {
                    realY = cc.winSize.height - realY;
                    realX = cc.winSize.width - realX;
                }
            } else {
                angle = 0;
                realX = x;
                realY = y;
            }
            if ( realY > cc.winSize.height/2 ) {
                cardAngle += 180;
            }
            var sprite = this.getParent().getChildByName(cardModel.cid);
            if ( sprite != null ) {
                if ( sprite.x != x || sprite.y != y) {
                    sprite.stopActionByTag(ACTION_TAG_MOVING);
                    sprite.runAction( new cc.Spawn(new cc.MoveTo(times.card_sort, realX, realY), new cc.RotateTo(times.card_sort, cardAngle, cardAngle)) ).setTag(ACTION_TAG_MOVING);
                    if ( sprite.isNewHand ) {
                        if ( !this.isHandVisible() ) {
                            sprite.stopActionByTag(ACTION_TAG_FLIPPING);
                            sprite.runAction(sprite.getFlipToBackSequence()).setTag(ACTION_TAG_FLIPPING);
                        } else {
                            sprite.runAction(cc.scaleTo(times.flip,1,1));
                        }
                        sprite.isNewHand = false;
                    }
                }
            }
            sprite.zIndex = i;
            i++;
            x += stepX;
        },this);

        if ( cards.length == MAX_HAND ) {
            gameModel.trigger("start-countdown", gameModel);
        }
    },
    toggleHand:function(){
        if ( gameModel.get("status") === "compare" )
            return;

        this.model.set("showHand", !this.model.get("showHand"));

    },
    forceShowHand:function(){
        var cards = this.model.get("hands");
        _.each(cards,function(cardModel){
            var sprite = this.getParent().getChildByName(cardModel.cid);
            if ( !sprite.numberSprite.isVisible() ) sprite.runAction(sprite.getFlipToFrontSequence());
        }, this);
    },
    showHand:function(){
        if ( gameModel.get("status") === "compare" )
            return;
        this.model.set("showHand", true);
    },
    hideHand:function(){
        if ( gameModel.get("status") === "compare" )
            return;
        this.model.set("showHand", false);
    },
    render:function(){

    },
    getAnItem:function(){
        this.itemSlotSprite.getAnItem();
    }
})
