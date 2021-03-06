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

var PlayerModel = Backbone.Model.extend({
    defaults:function(){
        return {
            money : 1000,
            hands: []
        }
    },
    addHand:function(cardModel){
        cardModel._owned = true
        var cards = this.get("hands");
        cards.push(cardModel);
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
                suit: 4 + i
            }))
        }

        var power, type, theCard, rate;
        if ( this.isFlushStraight(cards) ) {
            power = 10000 + cards[0].get("number") * 10 + (10 - cards[0].get("suit"));
            type = "同花顺";
            rate = 100;
        } else if ( theCard = this.is4ofAKind(cards) ) {
            power = 9000 + theCard.get("number") * 10 + (10 - theCard.get("suit"));
            type = "四条";
            rate = 80;
        } else if ( theCard = this.isFullHouse(cards) ) {
            power = 8000 + theCard.get("number") * 10 + (10 - theCard.get("suit"));
            type = "满堂红";
            rate = 60;
        } else if ( this.isFlush(cards) ) {
            power = 7000 + cards[0].get("number") * 10 + (10 - cards[0].get("suit"));
            type = "同花";
            rate = 50;
        } else if ( this.isStraight(cards) ) {
            power = 6000 + cards[0].get("number") * 10 + (10 - cards[0].get("suit"));
            type = "顺子";
            rate = 40;
        } else if ( theCard = this.is3ofAKind(cards) ) {
            power = 5000 + theCard.get("number") * 10 + (10 -theCard.get("suit"));
            type = "三条";
            rate = 20;
        } else if ( theCard = this.is2Pair(cards) ) {
            power = 4000 + theCard.get("number") * 10 + (10 -theCard.get("suit"));
            type = "两对";
            rate = 5;
        } else if ( theCard = this.isPair(cards) ) {
            power = 3000 + theCard.get("number") * 10 + (10 -theCard.get("suit"));
            type = "一对";
            rate = 2;
        } else if ( cards[0].get("number") > 0 ) {
            power = 2000 + cards[0].get("number") * 10 + (10 -cards[0].get("suit"));
            type = "散牌";
            rate = 1;
        } else {
            power = 0;
            type = "没牌";
            rate = 1;
        }
        return {
            power: power,
            type: type,
            rate: rate
        }
    }
});

var PlayerSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super();
        this.model = options.model;

        this.showHand = false;
        this.lookHand = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("show-hand.png"));
        var y;
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            y = dimens.player1Y/2;
        } else {
            y = (dimens.player2Y + cc.winSize.height)/2;
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

        this.moneyLabel = new ccui.Text(this.model.get("money"), "Arial", 40 );
        this.moneyLabel.enableOutline(colors.tableLabelOutline, 2);
        this.moneyLabel.setTextColor(colors.tableLabel);
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            this.moneyLabel.attr({
                x: 45,
                y: 25
            });
        } else {
            this.moneyLabel.attr({
                x: 405,
                y: 775,
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
                    //target.opacity = 180;
                    return true;
                }
                return false;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                self.toggleHand();
            }
        }), this.lookHand);
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
    },
    closeEvent:function(){
        this.model.off("change:hands",this.onHandChange);
        this.model.off("change:money",this.onMoneyChange);
    },
    renderMoney:function(){
        this.moneyLabel.setString(this.model.get("money"));
    },
    onMoneyChange:function(){
        this.renderMoney();
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
        if ( estimateWidth < dimens.hand_line_width ) {
            x = ( dimens.hand_line_width - estimateWidth ) / 2 + dimens.card_size.width/2;
            stepX = dimens.card_size.width + dimens.hand_line_card_padding;
        } else {
            x = dimens.card_size.width/2;
            stepX = ( dimens.hand_line_width - dimens.card_size.width ) / (cards.length - 1);
        }

        var i = 0;
        var r = 400;
        _.each(cards,function(cardModel){
            var sprite = this.getParent().getChildByName(cardModel.cid);
            var realX, realY, angle, cardAngle;
            if ( needCurve ) {
                angle = ( x - cc.winSize.width / 2 ) /r;
                realX = Math.sin(angle) * r + cc.winSize.width / 2;
                realY = Math.cos(angle) * r + y - r + 20;
                cardAngle = angle * 50;
                if ( this.model.get("position") == PLAYER_POSITION_UP ) {
                    realY = cc.winSize.height - realY;
                    realX = cc.winSize.width - realX;
                    cardAngle = cardAngle + 180;
                }
            } else {
                angle = 0;
                realX = x;
                realY = y;
            }
            if ( sprite ) {
                if ( sprite.x != x || sprite.y != y) {
                    if ( sprite.movingAction ) sprite.stopAction(sprite.movingAction);
                    sprite.movingAction = new cc.spawn(new cc.moveTo(times.card_sort, realX, realY), new cc.rotateTo(times.card_sort, cardAngle));
                    if ( sprite.isNewHand ) {
                        if ( !this.showHand ) {
                            sprite.runAction(sprite.getFlipToBackSequence());
                        }
                        sprite.isNewHand = false;
                    }
                    sprite.runAction(sprite.movingAction);
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

        this.showHand = !this.showHand;
        var cards = this.model.get("hands");

        _.each(cards,function(cardModel){
            var sprite = this.getParent().getChildByName(cardModel.cid);
            if ( this.showHand ) {
                sprite.runAction(sprite.getFlipToFrontSequence());
            } else {
                sprite.runAction(sprite.getFlipToBackSequence());
            }
        }, this);
    },
    forceShowHand:function(){
        var cards = this.model.get("hands");
        _.each(cards,function(cardModel){
            var sprite = this.getParent().getChildByName(cardModel.cid);
            if ( !sprite.numberSprite.isVisible() ) sprite.runAction(sprite.getFlipToFrontSequence());
        }, this);
    },
    render:function(){

    }
})