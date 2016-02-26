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

var ITEM_PER_LINE = 5;

var INIT_ITEMS = ["bomb","cloud","diamond", "dizzy","fast","shrink","spy","slow","sniper","katana", "tornado"];
var UNLOCKABLE_ITEMS = ["two","enlarge","kiss","ace","leaf","forbid","vase","shield","magnet","thief","upward","downward","hammer","nuke" ];

var ModeSelectLayer = PlayerRotateLayer.extend({
    ctor:function(options){
        this.options = options || {};
        statistic.useItem = statistic.useItem || {};

        dimens.player2NamePosition.x = dimens.player1NamePosition.x = cc.winSize.width/6-30;
        dimens.player2InitMoneyPosition.x = dimens.player1InitMoneyPosition.x = cc.winSize.width/3;
        dimens.player2TargetMoneyPosition.x = dimens.player1TargetMoneyPosition.x = cc.winSize.width*2/3+40;

        this.initData();

        window.isVsAI = this.options.mode == "vs-ai"
        this._super({disableRotate:isVsAI});

        this.addChild(this.player2Label = this.makeLabel("", dimens.player2NamePosition.x, dimens.player2NamePosition.y,isVsAI ? 20: 28));
        this.addChild(this.player1Label = this.makeLabel(isVsAI ? texts.player : texts.player1, dimens.player1NamePosition.x, dimens.player1NamePosition.y, 28));

        this.renderAIDifficulty();

        var tokenSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-green.png"));
        tokenSprite.attr({
            x: dimens.player2InitMoneyPosition.x - 40,
            y: dimens.player2InitMoneyPosition.y
            });
        this.addChild(tokenSprite);

        var tokenSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-green.png"));
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




        this.addChild(this.makeLabel(texts.deck, dimens.usingDeckPosition.x, dimens.usingDeckPosition.y,28));

        var offset = 30;
        var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("token-green.png"))
        sprite.attr({
            x: cc.winSize.width/2 - 215+offset,
            y: dimens.flyingMoney.y
        });
        this.addChild(sprite);

        var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("card-item.png"))
        sprite.attr({
            x: cc.winSize.width/2 - 215+offset,
            y: dimens.flyingItem.y
        });
        this.addChild(sprite);

        this.render();
        if ( !isTutorialPassed("modeSelect","modeSelectIntro") ) {
            showTutorial(this, "modeSelect", "modeSelectIntro")
        } else {
            if (isVsAI && !isTutorialPassed("modeSelect", "changeAI")) {
                showTutorial(this, "modeSelect", "changeAI")
            }
        }
    },
    render:function(){
        this.renderAIDifficulty();
        this.renderPlayerInitMoney(0);
        this.renderPlayerInitMoney(1);
        this.renderPlayerTargetMoney(0);
        this.renderPlayerTargetMoney(1);
        this.renderDeckSetting();
        this.renderTokenAppear();
        this.renderItemAppear();
        this.renderItemMenus();
    },
    renderAIDifficulty:function(){
        this.player2Label.setString(isVsAI ? texts.aiLevel[setting.aiDifficulty] : texts.player2);
    },
    initData:function(){
        this.defaultSetting = {
            playerInitMoney : [DEFAULT_INIT_MONEY,DEFAULT_INIT_MONEY],
            playerTargetMoney : [DEFAULT_TARGET_MONEY,DEFAULT_TARGET_MONEY],
            deck: 8,
            tokenAppearRate: 0.2,
            itemAppearRate: 0.5,
            mode: "vs",
            itemOff: {},
            aiDifficulty : AI_DIFFICULTY_NORMAL
        };
        var store = cc.sys.localStorage.getItem("prevSetting");
        if ( store != null ) {
            setting = JSON.parse(store);
            setting.itemOff = setting.itemOff || {};
            if ( setting.aiDifficulty === undefined ) setting.aiDifficulty = AI_DIFFICULTY_NORMAL
        } else {
            this.useDefaultSetting();
        }
        this.itemMenus = []

        this.initItems = INIT_ITEMS;
        this.unlockableItems = UNLOCKABLE_ITEMS;
        this.allItems = _.union( this.initItems, this.unlockableItems  )
        this.initLockedItems();
    },
    initLockedItems:function(){
        this.lockedItems = {};
        _.each(this.unlockableItems,function(item){
            this.lockedItems[item] = CHECK_UNLOCKED_FUNC_MAP[item]();
        },this)
    },
    useDefaultSetting:function(){
        setting = JSON.parse(JSON.stringify(this.defaultSetting));
    },
    initMenu:function(){
        this.playerInitMoneyLeft = [];
        this.playerInitMoneyRight = [];

        this.playerInitMoneyLeft[0] = this.renderNumberArrow(dimens.player1InitMoneyPosition.x, dimens.player1InitMoneyPosition.y, false, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerInitMoney[0] > MIN_INIT_MONEY ) {
                setting.playerInitMoney[0] -= MONEY_STEP;
                setting.playerTargetMoney[0] = setting.playerTargetMoney[1] = setting.playerInitMoney[0]+setting.playerInitMoney[1];
                this.renderPlayerInitMoney(0);
                this.renderPlayerTargetMoney(0);
                this.renderPlayerTargetMoney(1);
            }
        });
        this.playerInitMoneyRight[0] = this.renderNumberArrow(dimens.player1InitMoneyPosition.x+90, dimens.player1InitMoneyPosition.y, true, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerInitMoney[0] < MAX_INIT_MONEY ) {
                setting.playerInitMoney[0] += MONEY_STEP;
                setting.playerTargetMoney[0] = setting.playerTargetMoney[1] = setting.playerInitMoney[0]+setting.playerInitMoney[1];
                this.renderPlayerInitMoney(0);
                this.renderPlayerTargetMoney(0);
                this.renderPlayerTargetMoney(1);
            }
        });
        this.playerInitMoneyLeft[1] = this.renderNumberArrow(dimens.player2InitMoneyPosition.x, dimens.player2InitMoneyPosition.y, false, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerInitMoney[1] > MIN_INIT_MONEY ) {
                setting.playerInitMoney[1] -= MONEY_STEP;
                setting.playerTargetMoney[0] = setting.playerTargetMoney[1] = setting.playerInitMoney[0]+setting.playerInitMoney[1];
                this.renderPlayerInitMoney(1);
                this.renderPlayerTargetMoney(0);
                this.renderPlayerTargetMoney(1);
            }
        });
        this.playerInitMoneyRight[1] = this.renderNumberArrow(dimens.player2InitMoneyPosition.x+90, dimens.player2InitMoneyPosition.y, true, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerInitMoney[1] < MAX_INIT_MONEY ) {
                setting.playerInitMoney[1] += MONEY_STEP;
                setting.playerTargetMoney[0] = setting.playerTargetMoney[1] = setting.playerInitMoney[0]+setting.playerInitMoney[1];
                this.renderPlayerInitMoney(1);
                this.renderPlayerTargetMoney(0);
                this.renderPlayerTargetMoney(1);
            }
        });

        this.playerTargetMoneyLeft = [];
        this.playerTargetMoneyRight = [];

        this.playerTargetMoneyLeft[0] = this.renderNumberArrow(dimens.player1TargetMoneyPosition.x, dimens.player1TargetMoneyPosition.y, false, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerTargetMoney[0] > setting.playerInitMoney[0]+MONEY_STEP ) {
                setting.playerTargetMoney[0] -= MONEY_STEP;
                this.renderPlayerTargetMoney(0);
            }
        });
        this.playerTargetMoneyRight[0] = this.renderNumberArrow(dimens.player1TargetMoneyPosition.x+90, dimens.player1TargetMoneyPosition.y, true, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerTargetMoney[0] < MAX_TARGET_MONEY ) {
                setting.playerTargetMoney[0] += MONEY_STEP;
                this.renderPlayerTargetMoney(0);
            }
        });
        this.playerTargetMoneyLeft[1] = this.renderNumberArrow(dimens.player2TargetMoneyPosition.x, dimens.player2TargetMoneyPosition.y, false, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerTargetMoney[1] > setting.playerInitMoney[1]+MONEY_STEP ) {
                setting.playerTargetMoney[1] -= MONEY_STEP;
                this.renderPlayerTargetMoney(1);
            }
        });
        this.playerTargetMoneyRight[1] = this.renderNumberArrow(dimens.player2TargetMoneyPosition.x+90, dimens.player2TargetMoneyPosition.y, true, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            if ( setting.playerTargetMoney[1] < MAX_TARGET_MONEY ) {
                setting.playerTargetMoney[1] += MONEY_STEP;
                this.renderPlayerTargetMoney(1);
            }
        });

        this.selectDeck8 = this.renderButtonGroup(dimens.usingDeckPosition.x + 150, dimens.usingDeckPosition.y, 0, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.deck = 8;
            this.renderDeckSetting();
        });
        this.selectDeck2 = this.renderButtonGroup(dimens.usingDeckPosition.x + 150 + 90, dimens.usingDeckPosition.y, 2, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.deck = 2;
            this.renderDeckSetting();
        });
        this.addChild( this.makeLabel("8～A", dimens.usingDeckPosition.x + 150, dimens.usingDeckPosition.y, 25));
        this.addChild( this.makeLabel("2～A", dimens.usingDeckPosition.x + 150+90, dimens.usingDeckPosition.y, 25));

        var offset = 30;
        this.selectToken0 = this.renderButtonGroup( cc.winSize.width/2 - 135+offset, dimens.flyingMoney.y, 0, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL0;
            this.renderTokenAppear();
        });
        this.selectToken1 = this.renderButtonGroup( cc.winSize.width/2 - 45+offset, dimens.flyingMoney.y, 1, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL1;
            this.renderTokenAppear();
        });
        this.selectToken2 = this.renderButtonGroup( cc.winSize.width/2 + 45+offset, dimens.flyingMoney.y, 1, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL2;
            this.renderTokenAppear();
        });
        this.selectToken3 = this.renderButtonGroup( cc.winSize.width/2 + 135+offset, dimens.flyingMoney.y, 2, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.tokenAppearRate = TOKEN_APPEAR_LEVEL3;
            this.renderTokenAppear();
        });

        this.addChild( this.makeLabel(texts.none, cc.winSize.width/2 - 135+offset, dimens.flyingMoney.y, 25));
        this.addChild( this.makeLabel(texts.few, cc.winSize.width/2 - 45+offset, dimens.flyingMoney.y, 25));
        this.addChild( this.makeLabel(texts.normal, cc.winSize.width/2 + 45+offset, dimens.flyingMoney.y, 25));
        this.addChild( this.makeLabel(texts.many, cc.winSize.width/2 + 135+offset, dimens.flyingMoney.y, 25));

        this.selectItem0 = this.renderButtonGroup( cc.winSize.width/2 - 135+offset, dimens.flyingItem.y, 0, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.itemAppearRate = ITEM_APPEAR_LEVEL0;
            this.renderItemAppear();
        });
        this.selectItem1 = this.renderButtonGroup( cc.winSize.width/2 - 45+offset, dimens.flyingItem.y, 1, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.itemAppearRate = ITEM_APPEAR_LEVEL1;
            this.renderItemAppear();
        });
        this.selectItem2 = this.renderButtonGroup( cc.winSize.width/2 + 45+offset, dimens.flyingItem.y, 1, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.itemAppearRate = ITEM_APPEAR_LEVEL2;
            this.renderItemAppear();
        });
        this.selectItem3 = this.renderButtonGroup( cc.winSize.width/2 + 135+offset, dimens.flyingItem.y, 2, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            setting.itemAppearRate = ITEM_APPEAR_LEVEL3;
            this.renderItemAppear();
        });

        this.addChild( this.makeLabel(texts.none, cc.winSize.width/2 - 135+offset, dimens.flyingItem.y, 25));
        this.addChild( this.makeLabel(texts.few, cc.winSize.width/2 - 45+offset, dimens.flyingItem.y, 25));
        this.addChild( this.makeLabel(texts.normal, cc.winSize.width/2 + 45+offset, dimens.flyingItem.y, 25));
        this.addChild( this.makeLabel(texts.many, cc.winSize.width/2 + 135+offset, dimens.flyingItem.y, 25));

        this.renderButtonGroup( 45, dimens.startGame.y, 2, function(){
            cc.director.runScene(new IntroScene());
        });
        this.addChild( this.makeLabel(texts.returnToIntro, 45, dimens.startGame.y, 20));

        var startGame = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("start-game-default.png"),
            cc.spriteFrameCache.getSpriteFrame("start-game-press.png"),
            function(){
                cc.audioEngine.playEffect(res.click_mp3,false);
                this.saveSetting();
                setting.itemPool = _.difference(this.allItems, _.keys(setting.itemOff));
                setting.itemPool = _.difference(setting.itemPool, _.map(this.lockedItems,function(value,item){
                    return this.isItemLocked(item) ? item : null;
                },this))
                setting.mode = this.options.mode;
                setting.isFair = setting.playerInitMoney[0] === setting.playerInitMoney[1] && setting.playerTargetMoney[0] === setting.playerTargetMoney[1]
                cc.director.runScene(new MainScene(setting));
            }, this);
        startGame.attr({
            x: cc.winSize.width/2,
            y: dimens.startGame.y
        });
        this.menuArray.push(startGame);

        this.addChild( this.makeLabel(texts.startGame, cc.winSize.width/2, dimens.startGame.y, 25));

        this.renderButtonGroup( cc.winSize.width - 45, dimens.startGame.y, 0, function(){
            cc.audioEngine.playEffect(res.click_mp3,false);
            this.useDefaultSetting();
            this.render();
            this.saveSetting();
        });
        this.addChild( this.makeLabel(texts.useDefault, cc.winSize.width - 45, dimens.startGame.y, 20));

        var itemX = cc.winSize.width/ITEM_PER_LINE/2;
        var itemY = dimens.itemList.y;
        _.each(this.allItems,function(item){
            if ( this.isItemLocked(item) ) {
                this.itemMenus[item] = new cc.MenuItemImage(
                    cc.spriteFrameCache.getSpriteFrame("locked-item.png"),
                    cc.spriteFrameCache.getSpriteFrame("locked-item.png"),
                    function () {
                        cc.audioEngine.playEffect(res.click_mp3, false);
                        this.showItemDescription("locked", item);
                    }, this);
            } else {
                if (statistic.useItem[item]) {
                    this.itemMenus[item] = new cc.MenuItemImage(
                        cc.spriteFrameCache.getSpriteFrame("item-fg-mask.png"),
                        cc.spriteFrameCache.getSpriteFrame("item-fg-mask.png"),
                        function () {
                            cc.audioEngine.playEffect(res.click_mp3, false);
                            if (!this.isItemOff(item))
                                setting.itemOff[item] = true;
                            else delete setting.itemOff[item];
                            this.renderItemMenu(item);
                            this.showItemDescription(item);
                        }, this);
                    var itemSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-" + item + ".png"))
                    itemSprite.attr({
                        x: this.itemMenus[item].width / 2,
                        y: this.itemMenus[item].height / 2
                    })
                    this.itemMenus[item].addChild(itemSprite)
                } else {
                    this.itemMenus[item] = new cc.MenuItemImage(
                        cc.spriteFrameCache.getSpriteFrame("unknown-item.png"),
                        cc.spriteFrameCache.getSpriteFrame("unknown-item.png"),
                        function () {
                            cc.audioEngine.playEffect(res.click_mp3, false);
                            this.showItemDescription("unknown", item);
                        }, this);
                }
            }
            this.itemMenus[item].attr({
                x: itemX,
                y: itemY
            });

            this.menuArray.push(this.itemMenus[item]);
            itemX += cc.winSize.width/ITEM_PER_LINE;
            if ( itemX > cc.winSize.width ) {
                itemX = cc.winSize.width/ITEM_PER_LINE/2;
                itemY -= dimens.itemList.stepY
            }
        },this);

        if ( this.options.mode == "vs-ai" ) {
            this.aiDifficulty = this.renderButtonGroup(dimens.player2NamePosition.x, dimens.player2NamePosition.y, 1, function () {
                setting.aiDifficulty = (setting.aiDifficulty+1)%4;
                this.player2Label.setString(texts.aiLevel[setting.aiDifficulty])
            });
        }
    },
    isItemOff:function(item){
        return setting.itemOff[item] !== undefined && setting.itemOff[item];
    },
    isItemLocked:function(item){
        return this.lockedItems[item] && typeof this.lockedItems[item] === "string";
    },
    saveSetting:function(){
        cc.sys.localStorage.setItem("prevSetting", JSON.stringify(setting));
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
    },
    renderItemMenu:function(item){
        if ( !statistic.useItem[item] ) return;
        if ( !this.isItemLocked(item) && this.isItemOff(item) ) {
            this.itemMenus[item].attr({
                opacity: 100,
                scaleX: 0.8,
                scaleY: 0.8
            })
        } else {
            this.itemMenus[item].attr({
                opacity: 255,
                scaleX: 1,
                scaleY: 1
            })
        }
    },
    renderItemMenus:function(){
        _.each(this.allItems,function(item) {
            this.renderItemMenu(item);
        },this);
    },
    showItemDescription:function(item, realItem){
        if ( this.itemDescSprite == null ) {
            this.itemDescSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-desc-bg.png"))
            this.itemDescSprite.attr({
                x: cc.winSize.width / 2,
                y: 650
            })
            var self = this;
            cc.eventManager.addListener(cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                onTouchBegan: function (touch, event) {
                    var target = event.getCurrentTarget();
                    var locationInNode = target.convertToNodeSpace(touch.getLocation());
                    var s = target.getContentSize();
                    var rect = cc.rect(0, 0, s.width, s.height);

                    //Check the click area
                    return cc.rectContainsPoint(rect, locationInNode);
                },
                //Trigger when moving touch
                onTouchMoved: function (touch, event) {
                },
                //Process the touch end event
                onTouchEnded: function (touch, event) {
                    self.itemDescSprite.removeFromParent(true);
                    self.itemDescSprite = null;
                }
            }), this.itemDescSprite);
            this.addChild(this.itemDescSprite, 100)
        }

        this.itemDescSprite.removeAllChildren(true);

        var itemSprite;
        var text = "";
        var title = "";

        if ( item === "unknown" ) {
            var itemSprite = new cc.ClippingNode();

            title = texts.items.unknown;
            text = texts.items.unused;
            //itemSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("unknown-item.png"));
            var stencilSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-" + realItem + ".png"));
            stencilSprite.attr({
                x: dimens.itemDescIcon.x,
                y: dimens.itemDescIcon.y
            })
            itemSprite.setAlphaThreshold(0)
            itemSprite.stencil = stencilSprite;

            var mask = new cc.DrawNode();
            mask.drawPoly([cc.p(0, 0), cc.p(cc.winSize.width, 0),
                cc.p(cc.winSize.width, cc.winSize.height),
                cc.p(0, cc.winSize.height)], colors.itemMask, 1, colors.itemMask);
            itemSprite.addChild(mask);
        } else if ( item === "locked" ) {
            var itemSprite = new cc.ClippingNode();

            title = texts.items.locked;
            text = CHECK_UNLOCKED_FUNC_MAP[realItem]();
            //itemSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("unknown-item.png"));
            var stencilSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-" + realItem + ".png"));
            stencilSprite.attr({
                x: dimens.itemDescIcon.x,
                y: dimens.itemDescIcon.y
            })
            itemSprite.setAlphaThreshold(0)
            itemSprite.stencil = stencilSprite;

            var mask = new cc.DrawNode();
            mask.drawPoly([cc.p(0, 0), cc.p(cc.winSize.width, 0),
                cc.p(cc.winSize.width, cc.winSize.height),
                cc.p(0, cc.winSize.height)], colors.itemMask, 1, colors.itemMask);
            itemSprite.addChild(mask);
        } else {
            itemFGSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-fg-mask.png"))
            itemFGSprite.attr({
                x: dimens.itemDescIcon.x,
                y: dimens.itemDescIcon.y
            })
            this.itemDescSprite.addChild(itemFGSprite)

            title = texts.items[item].name
            text = texts.items[item].desc;
            var model = new ITEM_MODEL_CLASS_MAP[item]();
            if ( model.get("maxCharge") !== 1 ) {
                text += "\n"+texts.items.charge_before+model.get("maxCharge")+texts.items.charge_after;
            }
            itemSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("item-" + item + ".png"));

            var itemStatusLabel = new cc.LabelTTF(this.isItemOff(item)?texts.items.off:texts.items.on, null, 22);
            itemStatusLabel.attr({
                color: this.isItemOff(item)?colors.itemOff: colors.itemOn,
                x: dimens.itemDescIcon.x,
                y: 175,
                anchorX: 0.5,
                anchorY: 1
            });
            this.itemDescSprite.addChild(itemStatusLabel)
            itemSprite.attr({
                x: dimens.itemDescIcon.x,
                y: dimens.itemDescIcon.y
            })
        }

        this.itemDescSprite.addChild(itemSprite)
        var titleLabel = new cc.LabelTTF(title, null, 30);
        titleLabel.attr({
            color: colors.tableLabel,
            x: 240,
            y: 250,
            anchorX: 0.5,
            anchorY: 1
        });
        this.itemDescSprite.addChild(titleLabel)

        var descLabel = new cc.LabelTTF(text, null, 24);
        descLabel.attr({
            color: colors.tableLabel,
            x: 100,
            y: 210,
            anchorX: 0,
            anchorY: 1,
            textAlign: cc.TEXT_ALIGNMENT_LEFT,
            boundingWidth : 300
        });
        this.itemDescSprite.addChild(descLabel)
    },
    onRotate:function(rotation){
        if ( rotation === 180 ) {
            this.player1Label.setString(texts.player2)
            this.player2Label.setString(texts.player1)
        } else {
            this.player1Label.setString(texts.player1)
            this.player2Label.setString(texts.player2)
        }
    }
});

var ModeSelectScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
        this.options = options;
    },
    onEnter:function () {
        this._super();

        var layer = new ModeSelectLayer(this.options);
        this.addChild(layer);
    }
});
