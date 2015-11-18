/**
 * Created by 赢潮 on 2015/11/8.
 */
var MIN_INIT_MONEY = 100;
var MONEY_STEP = 100;
var MAX_INIT_MONEY = 1000;
var MAX_TARGET_MONEY = 2000;

var TOKEN_APPEAR_LEVEL0 = 0;
var TOKEN_APPEAR_LEVEL1 = 0.1;
var TOKEN_APPEAR_LEVEL2 = 0.2;
var TOKEN_APPEAR_LEVEL3 = 0.4;

var ITEM_APPEAR_LEVEL0 = 0;
var ITEM_APPEAR_LEVEL1 = 0.25;
var ITEM_APPEAR_LEVEL2 = 0.5;
var ITEM_APPEAR_LEVEL3 = 0.9;

var setting = {};

var ModeSelectLayer = PlayerRotateLayer.extend({
    ctor:function(){
        dimens.player2NamePosition.x = dimens.player1NamePosition.x = cc.winSize.width/6;
        dimens.player2InitMoneyPosition.x = dimens.player1InitMoneyPosition.x = cc.winSize.width/3 + 40;
        dimens.player2TargetMoneyPosition.x = dimens.player1TargetMoneyPosition.x = cc.winSize.width*2/3+40;

        this._super();

        this.initData();

        this.addChild(this.player2Label = this.makeLabel(texts.player2, dimens.player2NamePosition.x, dimens.player2NamePosition.y, 28));
        this.addChild(this.player1Label = this.makeLabel(texts.player1, dimens.player1NamePosition.x, dimens.player1NamePosition.y, 28));

        var tokenSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-black.png"));
        tokenSprite.attr({
            x: dimens.player2InitMoneyPosition.x - 40,
            y: dimens.player2InitMoneyPosition.y
            });
        this.addChild(tokenSprite);

        var tokenSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-black.png"));
        tokenSprite.attr({
            x: dimens.player1InitMoneyPosition.x - 40,
            y: dimens.player1InitMoneyPosition.y
        });
        this.addChild(tokenSprite);

        this.playerInitMoneyLabel = [];
        this.addChild(this.playerInitMoneyLabel[0] = this.makeLabel("", dimens.player1InitMoneyPosition.x+45, dimens.player1InitMoneyPosition.y));
        this.addChild(this.playerInitMoneyLabel[1] = this.makeLabel("", dimens.player2InitMoneyPosition.x+45, dimens.player2InitMoneyPosition.y));

        var tokenSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-win.png"));
        tokenSprite.attr({
            x: dimens.player1TargetMoneyPosition.x - 40,
            y: dimens.player1TargetMoneyPosition.y + 10
        });
        this.addChild(tokenSprite);

        var tokenSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-win.png"));
        tokenSprite.attr({
            x: dimens.player2TargetMoneyPosition.x - 40,
            y: dimens.player2TargetMoneyPosition.y + 10
        });
        this.addChild(tokenSprite);

        this.playerTargetMoneyLabel = [];
        this.addChild(this.playerTargetMoneyLabel[0] = this.makeLabel("", dimens.player1TargetMoneyPosition.x+45, dimens.player1TargetMoneyPosition.y));
        this.addChild(this.playerTargetMoneyLabel[1] = this.makeLabel("", dimens.player2TargetMoneyPosition.x+45, dimens.player2TargetMoneyPosition.y));


        this.renderPlayerInitMoney(0);
        this.renderPlayerInitMoney(1);
        this.renderPlayerTargetMoney(0);
        this.renderPlayerTargetMoney(1);

        this.addChild(this.makeLabel(texts.deck, dimens.usingDeckPosition.x, dimens.usingDeckPosition.y,28));

        var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-green.png"))
        sprite.attr({
            x: cc.winSize.width/2 - 215,
            y: dimens.flyingMoney.y
        });
        this.addChild(sprite);

        var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("card-item.png"))
        sprite.attr({
            x: cc.winSize.width/2 - 215,
            y: dimens.flyingItem.y
        });
        this.addChild(sprite);

        this.renderDeckSetting();

        this.renderTokenAppear();

        this.renderItemAppear();
    },
    makeLabel:function(text, x, y, fontSize){
        var fontSize = fontSize || 30;
        var label = new ccui.Text(text, "Arial", fontSize );
        label.enableOutline(colors.tableLabelOutline, 2);
        label.setTextColor(colors.tableLabel);
        label.attr({
            x: x,
            y: y,
            zIndex: 50,
            anchorY: 0.5
        });
        return label;
    },
    initData:function(){
        this.defaultSetting = {
            playerInitMoney : [500,500],
            playerTargetMoney : [1000,1000],
            deck: 8,
            tokenAppearRate: 0.2,
            itemAppearRate: 0.5,
            mode: "vs"
        };
        var store = cc.sys.localStorage.getItem("prevSetting");
        if ( store != null ) {
            setting = JSON.parse(store);
        } else {
            setting = this.defaultSetting;
        }
    },
    initMenu:function(){
        this._super();
        this.playerInitMoneyLeft = [];
        this.playerInitMoneyRight = [];

        this.playerInitMoneyLeft[0] = this.renderNumberArrow(dimens.player1InitMoneyPosition.x, dimens.player1InitMoneyPosition.y, false, function(){
            if ( setting.playerInitMoney[0] > MIN_INIT_MONEY ) {
                setting.playerInitMoney[0] -= MONEY_STEP;
                setting.playerTargetMoney[0] = setting.playerInitMoney[0]*2;
                this.renderPlayerInitMoney(0);
                this.renderPlayerTargetMoney(0);
            }
        });
        this.playerInitMoneyRight[0] = this.renderNumberArrow(dimens.player1InitMoneyPosition.x+90, dimens.player1InitMoneyPosition.y, true, function(){
            if ( setting.playerInitMoney[0] < MAX_INIT_MONEY ) {
                setting.playerInitMoney[0] += MONEY_STEP;
                setting.playerTargetMoney[0] = setting.playerInitMoney[0]*2;
                this.renderPlayerInitMoney(0);
                this.renderPlayerTargetMoney(0);
            }
        });
        this.playerInitMoneyLeft[1] = this.renderNumberArrow(dimens.player2InitMoneyPosition.x, dimens.player2InitMoneyPosition.y, false, function(){
            if ( setting.playerInitMoney[1] > MIN_INIT_MONEY ) {
                setting.playerInitMoney[1] -= MONEY_STEP;
                setting.playerTargetMoney[1] = setting.playerInitMoney[1]*2;
                this.renderPlayerInitMoney(1);
                this.renderPlayerTargetMoney(1);
            }
        });
        this.playerInitMoneyRight[1] = this.renderNumberArrow(dimens.player2InitMoneyPosition.x+90, dimens.player2InitMoneyPosition.y, true, function(){
            if ( setting.playerInitMoney[1] < MAX_INIT_MONEY ) {
                setting.playerInitMoney[1] += MONEY_STEP;
                setting.playerTargetMoney[1] = setting.playerInitMoney[1]*2;
                this.renderPlayerInitMoney(1);
                this.renderPlayerTargetMoney(1);
            }
        });

        this.playerTargetMoneyLeft = [];
        this.playerTargetMoneyRight = [];

        this.playerTargetMoneyLeft[0] = this.renderNumberArrow(dimens.player1TargetMoneyPosition.x, dimens.player1TargetMoneyPosition.y, false, function(){
            if ( setting.playerTargetMoney[0] > setting.playerInitMoney[0]+MONEY_STEP ) {
                setting.playerTargetMoney[0] -= MONEY_STEP;
                this.renderPlayerTargetMoney(0);
            }
        });
        this.playerTargetMoneyRight[0] = this.renderNumberArrow(dimens.player1TargetMoneyPosition.x+90, dimens.player1TargetMoneyPosition.y, true, function(){
            if ( setting.playerTargetMoney[0] < MAX_TARGET_MONEY ) {
                setting.playerTargetMoney[0] += MONEY_STEP;
                this.renderPlayerTargetMoney(0);
            }
        });
        this.playerTargetMoneyLeft[1] = this.renderNumberArrow(dimens.player2TargetMoneyPosition.x, dimens.player2TargetMoneyPosition.y, false, function(){
            if ( setting.playerTargetMoney[1] > setting.playerInitMoney[1]+MONEY_STEP ) {
                setting.playerTargetMoney[1] -= MONEY_STEP;
                this.renderPlayerTargetMoney(1);
            }
        });
        this.playerTargetMoneyRight[1] = this.renderNumberArrow(dimens.player2TargetMoneyPosition.x+90, dimens.player2TargetMoneyPosition.y, true, function(){
            if ( setting.playerTargetMoney[1] < MAX_TARGET_MONEY ) {
                setting.playerTargetMoney[1] += MONEY_STEP;
                this.renderPlayerTargetMoney(1);
            }
        });

        this.selectDeck8 = this.renderButtonGroup(dimens.usingDeckPosition.x + 150, dimens.usingDeckPosition.y, 0, function(){
            setting.deck = 8;
            this.renderDeckSetting();
        });
        this.selectDeck2 = this.renderButtonGroup(dimens.usingDeckPosition.x + 150 + 90, dimens.usingDeckPosition.y, 2, function(){
            setting.deck = 2;
            this.renderDeckSetting();
        });
        this.addChild( this.makeLabel("8～A", dimens.usingDeckPosition.x + 150, dimens.usingDeckPosition.y, 25));
        this.addChild( this.makeLabel("2～A", dimens.usingDeckPosition.x + 150+90, dimens.usingDeckPosition.y, 25));

        this.selectToken0 = this.renderButtonGroup( cc.winSize.width/2 - 135, dimens.flyingMoney.y, 0, function(){
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL0;
            this.renderTokenAppear();
        });
        this.selectToken1 = this.renderButtonGroup( cc.winSize.width/2 - 45, dimens.flyingMoney.y, 1, function(){
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL1;
            this.renderTokenAppear();
        });
        this.selectToken2 = this.renderButtonGroup( cc.winSize.width/2 + 45, dimens.flyingMoney.y, 1, function(){
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL2;
            this.renderTokenAppear();
        });
        this.selectToken3 = this.renderButtonGroup( cc.winSize.width/2 + 135, dimens.flyingMoney.y, 2, function(){
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL3;
            this.renderTokenAppear();
        });

        this.addChild( this.makeLabel(texts.none, cc.winSize.width/2 - 135, dimens.flyingMoney.y, 25));
        this.addChild( this.makeLabel(texts.few, cc.winSize.width/2 - 45, dimens.flyingMoney.y, 25));
        this.addChild( this.makeLabel(texts.normal, cc.winSize.width/2 + 45, dimens.flyingMoney.y, 25));
        this.addChild( this.makeLabel(texts.many, cc.winSize.width/2 + 135, dimens.flyingMoney.y, 25));

        this.selectItem0 = this.renderButtonGroup( cc.winSize.width/2 - 135, dimens.flyingItem.y, 0, function(){
            setting.itemAppearRate = ITEM_APPEAR_LEVEL0;
            this.renderItemAppear();
        });
        this.selectItem1 = this.renderButtonGroup( cc.winSize.width/2 - 45, dimens.flyingItem.y, 1, function(){
            setting.itemAppearRate = ITEM_APPEAR_LEVEL1;
            this.renderItemAppear();
        });
        this.selectItem2 = this.renderButtonGroup( cc.winSize.width/2 + 45, dimens.flyingItem.y, 1, function(){
            setting.itemAppearRate = ITEM_APPEAR_LEVEL2;
            this.renderItemAppear();
        });
        this.selectItem3 = this.renderButtonGroup( cc.winSize.width/2 + 135, dimens.flyingItem.y, 2, function(){
            setting.itemAppearRate = ITEM_APPEAR_LEVEL3;
            this.renderItemAppear();
        });

        this.addChild( this.makeLabel(texts.none, cc.winSize.width/2 - 135, dimens.flyingItem.y, 25));
        this.addChild( this.makeLabel(texts.few, cc.winSize.width/2 - 45, dimens.flyingItem.y, 25));
        this.addChild( this.makeLabel(texts.normal, cc.winSize.width/2 + 45, dimens.flyingItem.y, 25));
        this.addChild( this.makeLabel(texts.many, cc.winSize.width/2 + 135, dimens.flyingItem.y, 25));

        var startGame = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("start-game-default.png"),
            cc.spriteFrameCache.getSpriteFrame("start-game-press.png"),
            function(){
                //TODO save setting


                cc.director.runScene(new MainScene(setting));
            }, this);
        startGame.attr({
            x: cc.winSize.width/2,
            y: 40
        });
        this.menuArray.push(startGame);

        this.addChild( this.makeLabel(texts.startGame, cc.winSize.width/2, 40, 25));
    },
    renderPlayerInitMoney:function(playerPosition){
        var value = setting.playerInitMoney[playerPosition];
        this.playerInitMoneyLabel[playerPosition].setString(value);

        this.playerInitMoneyLeft[playerPosition].setVisible(value > MIN_INIT_MONEY)
        this.playerInitMoneyRight[playerPosition].setVisible(value < MAX_INIT_MONEY)
    },
    renderPlayerTargetMoney:function(playerPosition){
        var value = setting.playerTargetMoney[playerPosition];
        this.playerTargetMoneyLabel[playerPosition].setString(value);

        this.playerTargetMoneyLeft[playerPosition].setVisible(value > setting.playerInitMoney[playerPosition]+MONEY_STEP)
        this.playerTargetMoneyRight[playerPosition].setVisible(value < MAX_TARGET_MONEY)
    },
    renderNumberArrow:function(x,y,flipX,callback){
        var arrow = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("left-default.png"),
            cc.spriteFrameCache.getSpriteFrame("left-press.png"),
            callback, this);
        arrow.attr({
            scaleX: flipX ? -1 : 1,
            x: x,
            y: y
        });
        this.menuArray.push(arrow);
        return arrow;
    },
    renderButtonGroup:function(x,y,position, callback){
        var scaleX = 1;
        var img;
        if ( position == 0 || position == 2 ) {
            img = "left-button-group";
            if ( position == 2 ) {
                scaleX = -1;
            }
        } else {
            img = "middle-button-group";
        }
        var button = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame(img+"-default.png"),
            cc.spriteFrameCache.getSpriteFrame(img+"-press.png"),
            callback, this);
        button.attr({
            scaleX: scaleX,
            x: x,
            y: y
        });
        this.menuArray.push(button);
        return button;
    },
    renderDeckSetting:function(){
        if ( setting.deck === 8 ) {
            this.selectDeck8.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"))
            this.selectDeck2.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"))
        } else if ( setting.deck === 2 ) {
            this.selectDeck8.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"))
            this.selectDeck2.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"))
        }
    },

    renderTokenAppear:function(){
        this.selectToken0.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
        this.selectToken1.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-default.png"));
        this.selectToken2.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-default.png"));
        this.selectToken3.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
        switch ( setting.tokenAppearRate ) {
            case TOKEN_APPEAR_LEVEL0:
                this.selectToken0.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"))
                break;
            case TOKEN_APPEAR_LEVEL1:
                this.selectToken1.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-selected-default.png"))
                break;
            case TOKEN_APPEAR_LEVEL2:
                this.selectToken2.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-selected-default.png"))
                break;
            case TOKEN_APPEAR_LEVEL3:
                this.selectToken3.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"))
                break;
        }
    },
    renderItemAppear:function(){
        this.selectItem0.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
        this.selectItem1.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-default.png"));
        this.selectItem2.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-default.png"));
        this.selectItem3.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-default.png"));
        switch ( setting.itemAppearRate ) {
            case ITEM_APPEAR_LEVEL0:
                this.selectItem0.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"))
                break;
            case ITEM_APPEAR_LEVEL1:
                this.selectItem1.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-selected-default.png"))
                break;
            case ITEM_APPEAR_LEVEL2:
                this.selectItem2.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("middle-button-group-selected-default.png"))
                break;
            case ITEM_APPEAR_LEVEL3:
                this.selectItem3.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("left-button-group-selected-default.png"))
                break;
        }
    }
});

var ModeSelectScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        var layer = new ModeSelectLayer();
        this.addChild(layer);
    }
});