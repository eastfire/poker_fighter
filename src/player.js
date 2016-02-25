var ALL_NUMBERS = [2,3,4,5,6,7,8,9,10,11,12,13,14];

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
var ACTION_TAG_RATATE = 110;
var ACTION_TAG_MOVING = 111;
var ACTION_TAG_FLIPPING = 112;

var PLAYER_TYPE_PLAYER = 0;
var PLAYER_TYPE_AI = 1;

var DEFAULT_INIT_MONEY = 300;
var DEFAULT_TARGET_MONEY = DEFAULT_INIT_MONEY*2;

var SHIELD_STEP_X = 110.4;
var SHIELD_DEFAULT_OPACITY = 65;
var SHIELD_HIT_OPACITY = 215;

var PlayerModel = Backbone.Model.extend({
    defaults:function(){
        return {
            type: PLAYER_TYPE_PLAYER,
            money : DEFAULT_INIT_MONEY,
            targetMoney: DEFAULT_TARGET_MONEY,
            hands: [],
            speedDown: 0,
            speedUp: 0,
            sizeUp: 0,
            sizeDown: 0,
            dizzy: 0,
            shield: 0,
            tornado: 0,
            spy: 0,
            forbid: 0,
            needItem: true,
            item: null
        }
    },
    addHand:function(cardModel){
        cardModel._owned = true
        var cards = this.get("hands");
        cards.push(cardModel);
        this.sortHand();
        this.onGetCard(cardModel);
        gameModel.getOpponentPlayer(this).onOpponentGetCard(cardModel);
    },
    discardRandomCard:function(){
        var hands = this.get("hands");
        if ( hands.length === 0 ) return;
        var cardModel = _.sample( hands );
        var index = _.indexOf(hands, cardModel);
        hands.splice(index,1);
        gameModel.destroyCard(cardModel);

        statistic.destroyCard = statistic.destroyCard || 0;
        statistic.destroyCard++;

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
        if ( v === SUIT_NUMBER_BLANK ) return false;
        for ( var i = 1; i < cards.length ; i++ ){
            if ( v != cards[i].get("suit") || cards[i].get("suit") === SUIT_NUMBER_BLANK)
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
                suit: SUIT_NUMBER_BLANK
            }))
        }

        var power, type, theCard, rate;
        if ( this.is5ofAKind(cards) ) {
            power = 11000 + cards[0].get("number") * 20// + (19 - cards[0].get("suit"));
            type = "five-of-a-kind"
            rate = 100;
            cc.sys.localStorage.setItem("fiveOfAKindAppeared",true);
        } else if ( this.isFlushStraight(cards) ) {
            power = 10000 + cards[0].get("number") * 20// + (19 - cards[0].get("suit"));
            type = "straight-flush"
            rate = 50;
        } else if ( theCard = this.is4ofAKind(cards) ) {
            power = 9000 + theCard.get("number") * 20// + (19 - theCard.get("suit"));
            type = "four-of-a-kind";
            rate = 40;
        } else if ( theCard = this.isFullHouse(cards) ) {
            power = 8000 + theCard.get("number") * 20// + (19 - theCard.get("suit"));
            type = "full-house";
            rate = 30;
        } else if ( this.isFlush(cards) ) {
            power = 7000 + cards[0].get("number") * 20// + (19 - cards[0].get("suit"));
            type = "flush";
            rate = 20;
        } else if ( this.isStraight(cards) ) {
            power = 6000 + cards[0].get("number") * 20// + (19 - cards[0].get("suit"));
            type = "straight";
            rate = 15;
        } else if ( theCard = this.is3ofAKind(cards) ) {
            power = 5000 + theCard.get("number") * 20// + (19 -theCard.get("suit"));
            type = "three-of-a-kind";
            rate = 10;
        } else if ( theCard = this.is2Pair(cards) ) {
            power = 4000 + theCard.get("number") * 20// + (19 -theCard.get("suit"));
            type = "two-pair";
            rate = 4;
        } else if ( theCard = this.isPair(cards) ) {
            power = 3000 + theCard.get("number") * 20// + (19 -theCard.get("suit"));
            type = "one-pair";
            rate = 2;
        } else if ( cards[0].get("number") > 0 ) {
            power = 2000 + cards[0].get("number") * 20// + (19 -cards[0].get("suit"));
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
        _.each( ["speedUp","speedDown","sizeUp","sizeDown","dizzy","spy","forbid","blockSight","tornado", "shield"],function(attr){
            var value = this.get(attr);
            if ( value > 0 ) {
                this.set(attr, value - 1);
            }
        },this );
    },
    cleanStatus:function(){
        this.set({
            showHand: false,
            sizeUp: 0,
            sizeDown: 0,
            speedUp: 0,
            speedDown: 0,
            dizzy: 0,
            blockSight: 0,
            tornado: 0,
            shield: 0,
            spy: 0,
            forbid: 0
        })
    },

    onStartNewRound:function(){
    },
    onGetCard:function(cardModel){
    },
    onOpponentGetCard:function(cardModel){
    },
    onAskStrategy:function(){
    },
    onGetItem:function(itemName){
    },
    onStartCountDown:function(){
    },
    calculateWantAndHate:function(){
        var hands = this.get("hands");
        this.wantNumber = [];
        this.reallyWantNumber = [];
        this.wantSuit = [];
        this.hateNumber = [];
        this.hateSuit = [];
        if ( hands.length === 2 ) {
            var number0 = hands[0].get("number");
            var number1 = hands[1].get("number");
            var suit0 = hands[0].get("suit");
            var suit1 = hands[1].get("suit");
            if ( number0 === number1 ) {
                this.wantNumber.push(number0)
            } else if ( number0 - number1 <= 4) {//顺子潜力
                for ( var i = number0 - 4; i <= number1 + 4; i++) {
                    this.wantNumber.push(i)
                }
                this.reallyWantNumber.push(number0)
                this.reallyWantNumber.push(number1)
                this.hateNumber = _.union(this.hateNumber, _.without(ALL_NUMBERS, this.wantNumber ))
            } else { //散牌
                this.wantNumber.push(number0)
                this.wantNumber.push(number1)
            }
            if ( suit0 === suit1 && suit0 !== SUIT_NUMBER_BLANK ) {
                this.wantSuit.push(suit0);
            }
        } else if ( hands.length === 3 ) {
            var number0 = hands[0].get("number");
            var number1 = hands[1].get("number");
            var number2 = hands[2].get("number");
            var suit0 = hands[0].get("suit");
            var suit1 = hands[1].get("suit");
            var suit2 = hands[2].get("suit");
            if ( number0 === number1 && number0 === number2) { //三张
                this.wantNumber.push(number0)
            } else if ( number0 === number1 || number1 === number2) { //有一对
                this.wantNumber.push(number0)
                this.wantNumber.push(number2)
                if ( number0 === number1 )
                    this.reallyWantNumber.push(number0)
                else
                    this.reallyWantNumber.push(number2)
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber )
            } else if ( number0 - number2 <= 4) {//顺子潜力
                for ( var i = number0 - 4; i <= number2 + 4; i++) {
                    if ( i !== number0 && i !== number1 && i !== number2 )
                        this.wantNumber.push(i)
                }
                this.reallyWantNumber.push(number0)
                this.reallyWantNumber.push(number1)
                this.reallyWantNumber.push(number2)
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber)
            } else { //散牌
                this.wantNumber.push(number0)
                this.wantNumber.push(number1)
                this.wantNumber.push(number2)
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber)
            }
            if ( suit0 === suit1 && suit0 === suit2 && suit0 !== SUIT_NUMBER_BLANK) {
                this.wantSuit.push(suit0);
                this.hateSuit = _.without(ALL_SUIT_NUMBERS, suit0)
            }
        } else if ( hands.length === 4 ) {
            var number0 = hands[0].get("number");
            var number1 = hands[1].get("number");
            var number2 = hands[2].get("number");
            var number3 = hands[3].get("number");
            var suit0 = hands[0].get("suit");
            var suit1 = hands[1].get("suit");
            var suit2 = hands[2].get("suit");
            var suit3 = hands[3].get("suit");
            if ( number0 === number1 && number0 === number2 && number0 === number3) { //四条
                this.wantNumber.push(number0)
            } else if ( ( number0 === number1 && number0 === number2 )||
                ( number1 === number2 && number1 === number3 ) ||
                ( number0 === number1 && number2 === number3 ) ) { //三条或两对
                this.wantNumber.push(number0)
                this.wantNumber.push(number3)
                if ( number0 === number1 && number0 === number2 ) {
                    this.reallyWantNumber.push(number0)
                } else if ( number1 === number2 && number1 === number3 ) {
                    this.reallyWantNumber.push(number1)
                }
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber )
            } else if (  number0 === number1 ) { //一对
                this.wantNumber.push(number0)
                this.wantNumber.push(number2)
                this.wantNumber.push(number3)
                this.reallyWantNumber.push(number0)
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber )
            } else if ( number1 === number2 ) { //一对
                this.wantNumber.push(number0)
                this.wantNumber.push(number1)
                this.wantNumber.push(number3)
                this.reallyWantNumber.push(number1)
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber )
            } else if ( number2 === number3 ) { //一对
                this.wantNumber.push(number0)
                this.wantNumber.push(number1)
                this.wantNumber.push(number2)
                this.reallyWantNumber.push(number2)
                this.hateNumber = _.without(ALL_NUMBERS, this.wantNumber )
            } else if ( number0 - number3 <= 4) {//顺子潜力
                for ( var i = number0 - 4; i <= number3 + 4; i++) {
                    if ( i !== number0 && i !== number1 && i !== number2 && i !== number3)
                        this.wantNumber.push(i)
                }
                this.hateNumber = _.union(this.hateNumber, _.without(ALL_NUMBERS, this.wantNumber))
            } else { //散牌
                this.wantNumber.push(number0)
                this.wantNumber.push(number1)
                this.wantNumber.push(number2)
                this.wantNumber.push(number3)
                this.hateNumber = _.union(this.hateNumber, _.without(ALL_NUMBERS, this.wantNumber ))
            }
            if ( suit0 === suit1 && suit0 === suit2 && suit0 === suit3 && suit0 !== SUIT_NUMBER_BLANK) {
                this.wantSuit.push(suit0);
                this.hateSuit = _.without(ALL_SUIT_NUMBERS, suit0)
            }
        }
    }
});

var PlayerSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super();
        this.model = options.model;
        this.isAI = this.model.get("type") === PLAYER_TYPE_AI;

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
        var offsetX = 30;
        var moneySprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-black.png"))
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            moneySprite.attr({
                x: 30+(isWebIOS ? offsetX : 0),
                y: 60
            });
        } else {
            moneySprite.attr({
                x: isWebIOS?(30+offsetX):(cc.winSize.width-30),
                y: cc.winSize.height-60
            });
        }
        this.addChild(moneySprite);
        var moneySprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-red.png"))
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            moneySprite.attr({
                x: 30+(isWebIOS ? offsetX : 0),
                y: 65
            });
        } else {
            moneySprite.attr({
                x: isWebIOS?(30+offsetX):(cc.winSize.width-30),
                y: cc.winSize.height-65
            });
        }
        this.addChild(moneySprite);
        var moneySprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-green.png"))
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            moneySprite.attr({
                x: 30+(isWebIOS ? offsetX : 0),
                y: 70
            });
        } else {
            moneySprite.attr({
                x: isWebIOS?(30+offsetX):(cc.winSize.width-30),
                y: cc.winSize.height-70
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
                    x: isWebIOS?(cc.winSize.width - 45):45,
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
                x: 45+(isWebIOS?offsetX:0),
                y: 65
            });
        } else {
            this.moneyLabel.attr({
                //color: colors.tableLabel,
                x: isWebIOS?(45+offsetX):(cc.winSize.width - 45),
                y: cc.winSize.height - 65 - (this.isAI?10:0),
                rotation: this.isAI ? 0:180
            });
        }
        this.addChild(this.moneyLabel, 0);

        var targetMoneySprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-win.png"))
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            targetMoneySprite.attr({
                x: 30+(isWebIOS?offsetX:0),
                y: 20,
                scaleX: 0.5,
                scaleY: 0.5
            });
        } else {
            targetMoneySprite.attr({
                x: isWebIOS?(30+offsetX):(cc.winSize.width-30),
                y: cc.winSize.height-20,
                scaleX: 0.5,
                scaleY: 0.5,
                rotation: this.isAI ? 0:180
            });
        }
        this.addChild(targetMoneySprite);

        this.targetMoneyLabel = new ccui.Text(this.model.get("targetMoney"), "Arial", 30 );
        this.targetMoneyLabel.enableOutline(cc.color.WHITE, 1);
        this.targetMoneyLabel.setTextColor(cc.color.BLACK);
        if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
            this.targetMoneyLabel.attr({
                //color: colors.tableLabel,
                x: 70+(isWebIOS?offsetX:0),
                y: 15
            });
        } else {
            this.targetMoneyLabel.attr({
                //color: colors.tableLabel,
                x: isWebIOS?(70+offsetX):(cc.winSize.width - 70),
                y: cc.winSize.height - 15 - (this.isAI?10:0),
                rotation: this.isAI ? 0:180
            });
        }
        this.addChild(this.targetMoneyLabel, 0);

        var self = this;
        cc.eventManager.addListener( cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if ( self.isAI ) return false;
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
        this.model.on("change:forbid",this.onForbidChange,this);
        this.model.on("change:tornado",this.onTornadoChange,this);
        this.model.on("change:shield",this.onShieldChange,this);
    },
    closeEvent:function(){
        this.model.off("change:hands",this.onHandChange);
        this.model.off("change:money",this.onMoneyChange);
        this.model.off("change:spy",this.onSpyChange);
        this.model.off("change:showHand",this.onShowHandChange);
        this.model.off("change:forbid",this.onForbidChange);
        this.model.off("change:tornado",this.onTornadoChange);
        this.model.off("change:shield",this.onShieldChange);
    },
    renderMoney:function(){
        var prevMoney = this.model.previous("money");
        var money = this.model.get("money");
        if ( money >= this.model.get("targetMoney") && prevMoney < this.model.get("targetMoney") ) {
            this.moneyLabel.setColor(cc.color.RED);
            if ( !this.moneyLabelAction ) {
                this.moneyLabelAction = cc.sequence(cc.scaleTo(0.4, 1.2, 1.2),cc.scaleTo(0.4, 1, 1)).repeatForever();
                this.moneyLabel.runAction(this.moneyLabelAction);
            }
        } else if ( money < this.model.get("targetMoney") && prevMoney >= this.model.get("targetMoney") ) {
            this.moneyLabel.setColor(cc.color.WHITE);
            if ( this.moneyLabelAction ) {
                this.moneyLabel.stopAction(this.moneyLabelAction);
                this.moneyLabelAction = null;
            }
        }
        if ( prevMoney < money ) {
            this.moneyLabel.runAction(cc.sequence(
                cc.scaleTo(0.1,1.2,1.2),
                cc.scaleTo(0.05,1,1)
            ))
        } else if ( prevMoney < money ) {
            this.moneyLabel.runAction(cc.sequence(
                cc.scaleTo(0.1,0.8,0.8),
                cc.scaleTo(0.05,1,1)
            ))
        }

        this.moneyLabel.setString(money);
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
    onForbidChange:function(){
        var prev = this.model.previous("forbid");
        var current = this.model.get("forbid");
        if ( !prev && current ) {
            this.forbidSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("forbid.png"));
            this.forbidSprite.attr({
                x: this.itemSlotSprite.x,
                y: this.itemSlotSprite.y,
                scaleX: 2,
                scaleY: 2,
                zIndex: 100
            })
            this.addChild(this.forbidSprite);
            this.forbidSprite.runAction(cc.spawn(cc.fadeIn(times.forbid), cc.scaleTo(times.forbid, 1.5,1.5)));
        } else if ( prev && !current ) {
            this.forbidSprite.removeFromParent(true);
            this.forbidSprite = null;
        }
    },
    onTornadoChange:function(){
        var prev = this.model.previous("tornado");
        var current = this.model.get("tornado");
        if ( !prev && current ) {
            var y;
            var rotation;
            if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
                y = dimens.player1Y ;
                rotation = 0;
            } else {
                y = dimens.player2Y ;
                rotation = 180;
            }

            this.tornadoSprites = [];
            for ( var i = 0; i < MAX_TORNADO_NUMBER; i++ ) {
                var x = (0.1 + 0.8 * Math.random()) * cc.winSize.width;
                var tornadoSprite = new TornadoSprite();
                tornadoSprite.attr({
                    x: x,
                    y: y,

                    rotation: rotation
                });
                tornadoSprite.moveRandomly();
                this.addChild(tornadoSprite);
                this.tornadoSprites[i] = tornadoSprite;
            }

        } else if ( prev && !current ) {
            if ( this.tornadoSprites ) {
                _.each(this.tornadoSprites, function (tornadoSprite) {
                    tornadoSprite.runAction(cc.sequence(cc.fadeOut(0.3), cc.callFunc(function () {
                        tornadoSprite.removeFromParent(true);
                        tornadoSprite = null;
                    }, this)));
                }, this);
                this.tornadoSprites = [];
            }
        }
    },
    onShieldChange:function(){
        var prev = this.model.previous("shield");
        var current = this.model.get("shield");
        if ( !prev && current ) {
            var y;
            var rotation;
            if ( this.model.get("position") == PLAYER_POSITION_DOWN ) {
                y = dimens.player1Y - 30 ;
                rotation = 0;
            } else {
                y = dimens.player2Y + 30 ;
                rotation = 180;
            }

            this.shieldSprites = [];
            var x = 0;
            var stepX = SHIELD_STEP_X;
            var count = Math.ceil(cc.winSize.width/ stepX)+1;
            var totalTime = 0.8;
            var fadeInTime = 0.2;
            var waitTime = (totalTime - fadeInTime) / count;
            for ( var i = 0; i < count; i++ ) {
                var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("shield.png"));
                sprite.attr({
                    x: x,
                    y: y,
                    rotation: rotation,
                    opacity: 0
                });

                this.addChild(sprite);
                sprite.runAction(cc.sequence(
                    cc.delayTime( i*waitTime),
                    cc.fadeTo(fadeInTime,SHIELD_DEFAULT_OPACITY)
                ))
                this.shieldSprites[i] = sprite;
                x+= stepX;
            }
        } else if ( prev && !current ) {
            var count = this.shieldSprites.length;
            var i = 0;
            var totalTime = 0.5;
            var fadeOutTime = 0.15;
            var waitTime = (totalTime - fadeOutTime) / count;
            _.each(this.shieldSprites,function(sprite){
                sprite.runAction(cc.sequence(
                    cc.delayTime( i*waitTime),
                    cc.fadeTo(fadeOutTime,0),
                    cc.removeSelf(true)
                ))
                i++;
            });
            this.shieldSprites = [];
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
                    sprite.contentSprite.stopActionByTag(ACTION_TAG_FLIPPING);
                    sprite.contentSprite.runAction(sprite.getFlipToFrontSequence(times.quickFlip)).setTag(ACTION_TAG_FLIPPING);

                }
            }, this);
        } else {
            _.each(cards,function(cardModel){
                var sprite = this.getParent().getChildByName(cardModel.cid);
                if ( sprite != null ) {
                    sprite.contentSprite.stopActionByTag(ACTION_TAG_FLIPPING);
                    sprite.contentSprite.runAction(sprite.getFlipToBackSequence(times.quickFlip)).setTag(ACTION_TAG_FLIPPING);

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
                    sprite.contentSprite.stopActionByTag(ACTION_TAG_RATATE);
                    sprite.runAction(new cc.MoveTo(times.card_sort, realX, realY)).setTag(ACTION_TAG_MOVING);
                    sprite.contentSprite.runAction(new cc.RotateTo(times.card_sort, cardAngle, cardAngle)).setTag(ACTION_TAG_RATATE);
                    if ( sprite.isNewHand ) {
                        if ( !this.isHandVisible() ) {
                            sprite.contentSprite.stopActionByTag(ACTION_TAG_FLIPPING);
                            sprite.contentSprite.runAction(sprite.getFlipToBackSequence()).setTag(ACTION_TAG_FLIPPING);
                        } else {
                            sprite.contentSprite.runAction(cc.scaleTo(times.flip,1,1));
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
            if ( !sprite.numberSprite.isVisible() ) sprite.contentSprite.runAction(sprite.getFlipToFrontSequence());
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
    },
    checkBlowAway:function(sprite) {
        if ( !this.model.get("tornado") ) return false;
        if ( this.tornadoSprites ) {
            var x = sprite.x;
            return _.any(this.tornadoSprites,function(tornado){
                if ( x >= tornado.x - tornado.width/2 && tornado.x + tornado.width/2 >= x ) {
                    sprite.blowAway(tornado.x, tornado.width );
                    return true;
                }
                return false;
            },this);
        } else return false;
    },
    checkShield:function(sprite){
        if ( !this.model.get("shield") ) return false;
        if ( sprite.lastTouchBy !== this.model.get("position") ) {
            var number = Math.floor((sprite.x+138*2/5) / SHIELD_STEP_X);
            if ( this.shieldSprites && this.shieldSprites.length > number && this.shieldSprites[number] ) {
                this.shieldSprites[number].runAction(
                    cc.sequence(
                        cc.fadeTo(0.3, SHIELD_HIT_OPACITY),
                        cc.fadeTo(0.4, SHIELD_DEFAULT_OPACITY)
                    )
                )
            }
            sprite.bounceBackByShield();
            return true;
        }
    },
    canUseItem:function(){
        return this.itemSlotSprite.canPressItem() && !this.model.get("forbid");
    }
})

var MAX_TORNADO_NUMBER = 4;
var TornadoSprite = cc.Sprite.extend({
    ctor:function(){
        this._super();

        this.attr({
            scaleX: 1,
            scaleY: 1
        })
        var animateFrames = [];
        for (var i = 0; i < 8; i++) {
            var frame = cc.spriteFrameCache.getSpriteFrame("tornado-"+i+".png");
            animateFrames.push(frame);
        }
        var animation = new cc.Animation(animateFrames, 0.1,true);
        var tornadoAction = new cc.Animate(animation);
        this.runAction(tornadoAction.repeatForever());

    },
    moveRandomly:function(){
        var actions = [];
        var y = this.y;
        var padding = 50;
        var movement = 200;
        for ( i = 0; i < 10; i++ ) {
            var time = Math.random()*0.5;
            var scale = Math.random()*0.5+1;
            actions.push(cc.delayTime(time));
            var newx = Math.random()*movement - movement/2 + this.x;
            newx = Math.min(cc.winSize.width - padding, Math.max( padding, newx ) );
            actions.push(cc.spawn(cc.scaleTo(1-time, scale,scale),cc.moveTo(1-time, newx, y)));
        }
        this.runAction(cc.sequence(actions));
    }
});
