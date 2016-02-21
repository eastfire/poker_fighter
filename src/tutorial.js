var tutorialPassed;

var loadTutorial = function(){
    var store = cc.sys.localStorage.getItem("poker_fighter.tutorial");
    if ( store ) {
        tutorialPassed = JSON.parse(store);
    } else {
        tutorialPassed = {}
    }
}

var saveTutorial = function(){
    cc.sys.localStorage.setItem("poker_fighter.tutorial",JSON.stringify(tutorialPassed));
}

var clearTutorial = function(){
    cc.sys.localStorage.removeItem("poker_fighter.tutorial");
    tutorialPassed = {}
}

var isTutorialPassed = function(sceneName, stepName){
    if ( tutorialPassed.off ) return true;
    if ( !tutorialPassed[sceneName] ) tutorialPassed[sceneName] = {};
    return tutorialPassed[sceneName][stepName];
}

var showTutorial = function(scene, sceneName, stepName){
    if ( !tutorialMap ) {
        initTutorialMap();
    }

    if ( !tutorialPassed[sceneName] ) tutorialPassed[sceneName] = {};

    var tutorialModel;
    if ( tutorialMap[sceneName] && (tutorialModel = tutorialMap[sceneName][stepName]) ) {
        if (!tutorialPassed[sceneName][stepName]) {

            if ( typeof tutorialModel === "function") tutorialModel = tutorialModel.call();
            var layer = new TutorialLayer({
                sceneName: sceneName,
                stepName: stepName,
                model: tutorialModel,
                callback: function () {
                    tutorialPassed[sceneName][stepName] = true;
                    var sameAs = tutorialModel.get("sameAs");
                    if ( sameAs ) {
                        cc.log(sameAs)
                        if ( sameAs.sceneName ) {
                            if ( !tutorialPassed[sameAs.sceneName] ) tutorialPassed[sameAs.sceneName] = {};
                            if ( sameAs.stepName ) {
                                tutorialPassed[sameAs.sceneName][sameAs.stepName] = true;
                            } else {
                                tutorialPassed[sameAs.sceneName][stepName] = true;
                            }
                        } else {
                            if ( sameAs.stepName ) {
                                tutorialPassed[sceneName][sameAs.stepName] = true;
                            }
                        }
                    }
                    saveTutorial();
                    var next = tutorialModel.getNext()
                    if ( next ) {
                        showTutorial(scene, next.sceneName, next.stepName )
                    }
                }
            });

            scene.addChild(layer, 200);
            layer.startTutorial();
        } else {
            var next = tutorialModel.getNext()
            if ( next ) {
                showTutorial(scene, next.sceneName, next.stepName )
            }
        }
    }
}

var TutorialLayer = cc.Layer.extend({
    ctor: function (options) {
        options = options || {};
        this.model = options.model;
        this._super();

        this.sceneName = options.sceneName;
        this.stepName = options.stepName;
        this.callback = options.callback;

        //render tutorial
        this.renderPoints();
        this.renderLabels();
        this.renderImages();

        var self = this;
        var condition = this.model.get("condition") || "touchAny";
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            //Trigger when moving touch
            onTouchMoved: function (touch, event) {
            },
            //Process the touch end event
            onTouchEnded: function (touch, event) {
                if ( condition !== "touchAny" ) {
                    var target = event.getCurrentTarget();
                    var padding = 0;
                    var locationInNode = target.convertToNodeSpace(touch.getLocation());
                    _.any( self.pointSprites, function(sprite){
                        var rect = cc.rect(sprite.x-sprite.width/2+padding, sprite.y-sprite.height/2+padding, sprite.width-2*padding,sprite.height-2*padding);

                        //Check the click area
                        if (cc.rectContainsPoint(rect, locationInNode)){
                            sprite.touched = true
                            if ( condition === "touchAllPoints" ) {
                                if (_.all(self.pointSprites,function(sprite){
                                    return sprite.touched;
                                })){
                                    self.__tutorialEnd.call(self);
                                }
                            } else {
                                self.__tutorialEnd.call(self);
                            }
                            return true;
                        }
                        return false;
                    });
                } else {
                    self.__tutorialEnd.call(self);
                }
            }
        }), this);
    },
    __tutorialEnd:function(){
        var scene = this.getParent()
        this.stopTutorial();
        if ( this.model.get("callback") ) {
            this.model.get("callback").call();
        }
        if ( this.callback ) {
            this.callback.call();
        }
    },
    startTutorial: function(){
        cc.director.getScheduler().pauseTarget(this.getParent());
        this.pausedTargets = this.getParent().getActionManager().pauseAllRunningActions();


    },
    stopTutorial: function(){
        this.getParent().getActionManager().resumeTargets(this.pausedTargets);
        cc.director.getScheduler().resumeTarget(this.getParent());
        this.removeFromParent(true);
    },
    getValue:function(pointEntry, valueName){
        var value = pointEntry[valueName];
        if ( value === null ) return null;
        if ( typeof value === "number" || typeof value === "string" ) return value;
        if ( typeof value === "function") return value.call();
        return null;
    },
    renderPoints:function(){
        var points = this.model.get("points");
        var mask = new cc.DrawNode();
        this.pointSprites = [];
        mask.drawPoly([cc.p(0, 0), cc.p(cc.winSize.width, 0),
            cc.p(cc.winSize.width, cc.winSize.height),
            cc.p(0, cc.winSize.height)], colors.tutorialMask, 1, colors.tutorialMask);
        if ( points.length ) {
            var clipper = new cc.ClippingNode();
            var stencilSprite = new cc.Sprite();
            _.each(points,function(pointEntry){
                var pointSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("tutorial-point.png"))
                pointSprite.attr({
                    x:this.getValue(pointEntry,"x"),
                    y:this.getValue(pointEntry,"y"),
                    scaleX:this.getValue(pointEntry,"width")/pointSprite.width,
                    scaleY:this.getValue(pointEntry,"height")/pointSprite.height
                })
                stencilSprite.addChild(pointSprite)
                this.pointSprites.push(pointSprite)
            },this);

            clipper.stencil = stencilSprite;
            clipper.attr({
                x: 0,
                y: 0
            })
            clipper.setInverted(true);
            this.addChild(clipper);
            clipper.setAlphaThreshold(0);

            clipper.addChild(mask);
        } else {
            this.addChild(mask);
        }
    },
    renderLabels:function(){
        var labels = this.model.get("labels");
        _.each(labels,function(labelEntry){
            var labelSprite = new cc.LabelTTF(this.getValue(labelEntry,"text") , null, this.getValue(labelEntry,"fontSize") || 22);
            labelSprite.attr({
                color: labelEntry.color || colors.tutorialLabel,
                x:this.getValue(labelEntry,"x"),
                y:this.getValue(labelEntry,"y"),
                anchorX: this.getValue(labelEntry,"anchorX") || 0.5,
                anchorY: this.getValue(labelEntry,"anchorY") || 0.5,
                rotation: this.getValue(labelEntry,"rotation") || 0,
                textAlign: cc.TEXT_ALIGNMENT_CENTER
            })
            this.addChild(labelSprite,200);
        },this);
    },
    renderImages:function(){
        var images = this.model.get("images");
        _.each(images,function(imageEntry){
            var imageSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(imageEntry.image || "arrow.png"));
            imageSprite.attr({
                x:this.getValue(imageEntry,"x"),
                y:this.getValue(imageEntry,"y"),
                scaleX: this.getValue(imageEntry,"scaleX") || 1,
                scaleY: this.getValue(imageEntry,"scaleY") || 1,
                anchorX: this.getValue(imageEntry,"anchorX") || 0.5,
                anchorY: this.getValue(imageEntry,"anchorY") || 0.5,
                rotation: this.getValue(imageEntry,"rotation") || 0
            })
            this.addChild(imageSprite,200);
        },this);
    }
})

var TutorialModel = Backbone.Model.extend({
    defaults:function(){
        return {
            labels: [],
            images: [],
            points: [],
            condition: "touchAny" //touch
        }
    },
    getNext:function(){
        var next = this.get("next")
        if ( typeof next === "function" ) {
            next = next.call();
        }
        return next;
    }
})

var tutorialMap = null;

var initTutorialMap = function(){
    tutorialMap = {
        "modeSelect":{
            "modeSelectIntro":new TutorialModel({
                points:[],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: cc.winSize.height / 2,
                        text: texts.tutorials.modeSelectIntro
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"modeSelect",
                    stepName:"selectInitMoney"
                }
            }),
            "selectInitMoney":new TutorialModel({
                points:[{
                    x: cc.winSize.width/3+45,
                    y: dimens.player1InitMoneyPosition.y,
                    width: 150,
                    height: 50
                },{
                    x: cc.winSize.width/3+45,
                    y: dimens.player2InitMoneyPosition.y,
                    width: 150,
                    height: 50
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 600,
                        text: texts.tutorials.selectInitMoney
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"modeSelect",
                    stepName:"selectTargetMoney"
                }
            }),
            "selectTargetMoney":new TutorialModel({
                points:[{
                    x: cc.winSize.width*2/3+40+45,
                    y: dimens.player1InitMoneyPosition.y,
                    width: 150,
                    height: 50
                },{
                    x: cc.winSize.width*2/3+40+45,
                    y: dimens.player2InitMoneyPosition.y,
                    width: 150,
                    height: 50
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 600,
                        text: texts.tutorials.selectTargetMoney
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"modeSelect",
                    stepName:"selectDeck"
                }
            }),
            "selectDeck":new TutorialModel({
                points:[{
                    x: cc.winSize.width / 2,
                    y: dimens.usingDeckPosition.y,
                    width: 450,
                    height: 50
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 540,
                        text: texts.tutorials.selectDeck
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"modeSelect",
                    stepName:"selectToken"
                }
            }),
            "selectToken":new TutorialModel({
                points:[{
                    x: cc.winSize.width / 2,
                    y: dimens.flyingMoney.y,
                    width: 450,
                    height: 60
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 500,
                        text: texts.tutorials.selectToken
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"modeSelect",
                    stepName:"selectItem"
                }
            }),
            "selectItem":new TutorialModel({
                points:[{
                    x: cc.winSize.width / 2,
                    y: dimens.flyingItem.y,
                    width: 450,
                    height: 60
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 450,
                        text: texts.tutorials.selectItem
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"modeSelect",
                    stepName:"selectEachItem"
                }
            }),
            "selectEachItem":new TutorialModel({
                points:[{
                    x: cc.winSize.width / 2,
                    y: 300,
                    width: 700,
                    height: 400
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 550,
                        text: texts.tutorials.selectEachItem
                    }
                ],
                images: [
                ],
                next: function () {
                    if (isVsAI) {
                        return {
                            sceneName: "modeSelect",
                            stepName: "changeAI"
                        }
                    } else return null;
                }
            }),
            "changeAI":new TutorialModel({
                points:[{
                    x: dimens.player2NamePosition.x,
                    y: dimens.player2NamePosition.y,
                    width: 100,
                    height: 50
                }],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: dimens.player2NamePosition.y - 100,
                        text: texts.tutorials.changeAI
                    }
                ],
                images: [
                ]
            })
        },
        "main-vs-ai":{
            "takeCard": new TutorialModel({
                points:[
                    {
                        x: function(){
                            return _.find(mainLayer.getChildren(),function(sprite){
                                return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height/2
                            }).x
                        },
                        y: function(){
                            return _.find(mainLayer.getChildren(),function(sprite){
                                return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height/2
                            }).y
                        },
                        width: function(){
                            return _.find(mainLayer.getChildren(),function(sprite){
                                return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height/2
                            }).contentSprite.width*1.4
                        },
                        height: function(){
                            return _.find(mainLayer.getChildren(),function(sprite){
                                return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height/2
                            }).contentSprite.height*1.4
                        }
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 340,
                        text: texts.tutorials.touchThisCard
                    }
                ],
                images: [
                ],
                callback:function(){
                    _.each(mainLayer.getChildren(),function(sprite){
                        if ( sprite instanceof PokerCardSprite ) {
                            if ( sprite.y < cc.winSize.height/2){
                                sprite.speedY = -NATURE_SPEED;
                                sprite.speedX = 0;
                                sprite.lastTouchBy = PLAYER_POSITION_DOWN;
                                sprite.onTouchRelease()
                            }
                        }
                    })
                },
                condition: "touchAllPoints",
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "showCard": new TutorialModel({
                points: [
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 200,
                        text: texts.tutorials.showYourCard
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width / 2 + 50,
                        y: 120,
                        scaleY: -0.8,
                        scaleX: 0.8
                    }
                ],
                next: {
                    sceneName:"main-vs-ai",
                    stepName:"cardCollect"
                },
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "cardCollect": new TutorialModel({
                points: [
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 200,
                        text: texts.tutorials.collectYourCard
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs-ai",
                    stepName:"initMoney"
                },
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "initMoney":function(){
                return new TutorialModel({
                    points:[
                        {
                            x: mainLayer.player1Sprite.moneyLabel.x,
                            y: mainLayer.player1Sprite.moneyLabel.y,
                            width: mainLayer.player1Sprite.moneyLabel.width,
                            height: mainLayer.player1Sprite.moneyLabel.height
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width/2,
                            y: mainLayer.player1Sprite.moneyLabel.y + 110,
                            text: texts.tutorials.thisIsYourMoney
                        }
                    ],
                    images: [
                        {
                            x: mainLayer.player1Sprite.moneyLabel.x + 80,
                            y: mainLayer.player1Sprite.moneyLabel.y + 50,
                            scaleY: -1
                        }
                    ],
                    next: {
                        sceneName:"main-vs-ai",
                        stepName:"targetMoney"
                    },
                    sameAs:{
                        sceneName:"main-vs"
                    }
                })
            },
            "targetMoney": function() {
                return new TutorialModel({
                    points: [
                        {
                            x: mainLayer.player1Sprite.targetMoneyLabel.x,
                            y: mainLayer.player1Sprite.targetMoneyLabel.y,
                            width: mainLayer.player1Sprite.targetMoneyLabel.width,
                            height: mainLayer.player1Sprite.targetMoneyLabel.height
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.player1Sprite.targetMoneyLabel.y + 120,
                            text: texts.tutorials.thisIsYourTarget
                        }
                    ],
                    images: [
                        {
                            x: mainLayer.player1Sprite.targetMoneyLabel.x + 80,
                            y: mainLayer.player1Sprite.targetMoneyLabel.y + 50,
                            scaleY: -1
                        }
                    ],
                    next: function () {
                        if (isWebIOS) {
                            return {
                                sceneName: "main-vs-ai",
                                stepName: "forbidLine"
                            }
                        } else return null;
                    },
                    sameAs: {
                        sceneName: "main-vs"
                    }
                })
            },
            "forbidLine": new TutorialModel({
                points:[
                    {
                        x: 15,
                        y: cc.winSize.height/2,
                        width: 30,
                        height: cc.winSize.height
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 200,
                        text: texts.tutorials.thisIsForbidLine
                    }
                ],
                images: [
                    {
                        x: 80,
                        y: 300
                    }
                ],
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "countDown": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height/2,
                        width: 200,
                        height: 200
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 200,
                        text: texts.tutorials.thisIsCountDown
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width/2+120,
                        y: 300
                    }
                ],
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "compareHands": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 270,
                        text: texts.tutorials.compareHands
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs-ai",
                    stepName:"compareHands2"
                },
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "compareHands2": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 270,
                        text: texts.tutorials.compareHands2
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs-ai",
                    stepName:"compareHands3"
                },
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "compareHands3": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 270,
                        text: texts.tutorials.compareHands3
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs-ai",
                    stepName:"betHelp"
                },
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "betHelp": function() {
                return new TutorialModel({
                    points: [
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.betMoneyLabel1.y,
                            width: 350,
                            height: 50
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: cc.winSize.height / 2,
                            width: 100,
                            height: 100
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width / 2,
                            y: 260,
                            text: texts.tutorials.betHelp
                        }
                    ],
                    images: [
                        {
                            x: cc.winSize.width / 2 + 100,
                            y: cc.winSize.height / 2 - 10,
                            anchorX: 0,
                            anchorY: 1
                        }
                    ],
                    next: {
                        sceneName: "main-vs-ai",
                        stepName: "handHelp"
                    },
                    sameAs: {
                        sceneName: "main-vs"
                    }
                })
            },
            "handHelp": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width,
                        y: cc.winSize.height/2,
                        width: 80,
                        height: 80
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 250,
                        text: texts.tutorials.handHelp
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width - 140,
                        y: cc.winSize.height/2 - 10,
                        anchorX:1,
                        anchorY:1,
                        scaleY: 1,
                        scaleX: -1
                    }
                ],
                callback:function(){
                    mainLayer.showHelp();
                },
                condition: "touchAllPoints",
                sameAs:{
                    sceneName:"main-vs"
                }
            }),
            "betRateIncrease": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height/2,
                        width: 100,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 300,
                        text: texts.tutorials.betRateIncrease
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width/2 + 100,
                        y: cc.winSize.height/2 - 10,
                        anchorX:0,
                        anchorY:1
                    }
                ],
                sameAs:{
                    sceneName:"main-vs"
                }
            })
        },
        "main-vs":{
            "takeCard": function() {
                return new TutorialModel({
                    points: [
                        {
                            x: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height / 2
                                }).x
                            },
                            y: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height / 2
                                }).y
                            },
                            width: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height / 2
                                }).contentSprite.width * 1.4
                            },
                            height: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y < cc.winSize.height / 2
                                }).contentSprite.height * 1.4
                            }
                        },
                        {
                            x: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y > cc.winSize.height / 2
                                }).x
                            },
                            y: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y > cc.winSize.height / 2
                                }).y
                            },
                            width: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y > cc.winSize.height / 2
                                }).contentSprite.width * 1.4
                            },
                            height: function () {
                                return _.find(mainLayer.getChildren(), function (sprite) {
                                    return sprite instanceof PokerCardSprite && sprite.y > cc.winSize.height / 2
                                }).contentSprite.height * 1.4
                            }
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width / 2,
                            y: 340,
                            text: texts.tutorials.touchThisCard
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: cc.winSize.height - 340,
                            text: texts.tutorials.touchThisCard,
                            rotation: 180
                        }
                    ],
                    images: [
                    ],
                    callback: function () {
                        _.each(mainLayer.getChildren(), function (sprite) {
                            if (sprite instanceof PokerCardSprite) {
                                if (sprite.y < cc.winSize.height / 2) {
                                    sprite.speedY = -NATURE_SPEED;
                                    sprite.speedX = 0;
                                    sprite.lastTouchBy = PLAYER_POSITION_DOWN;
                                    sprite.onTouchRelease()
                                } else {
                                    sprite.speedY = NATURE_SPEED;
                                    sprite.speedX = 0;
                                    sprite.lastTouchBy = PLAYER_POSITION_UP;
                                    sprite.onTouchRelease()
                                }
                            }
                        })
                    },
                    condition: "touchAllPoints",
                    sameAs: {
                        sceneName: "main-vs-ai"
                    }
                })
            },
            "showCard": new TutorialModel({
                points: [
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 200,
                        text: texts.tutorials.showYourCard
                    },
                    {
                        x: cc.winSize.width / 2,
                        y: cc.winSize.height - 200,
                        text: texts.tutorials.showYourCard,
                        rotation: 180
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width / 2 + 50,
                        y: 120,
                        scaleY: -0.8,
                        scaleX: 0.8
                    },
                    {
                        x: cc.winSize.width / 2 - 50,
                        y: cc.winSize.height - 120,
                        scaleY: 0.8,
                        scaleX: -0.8
                    }
                ],
                next: {
                    sceneName:"main-vs",
                    stepName:"cardCollect"
                },
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "cardCollect": new TutorialModel({
                points: [
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width / 2,
                        y: 200,
                        text: texts.tutorials.collectYourCard
                    },
                    {
                        x: cc.winSize.width / 2,
                        y: cc.winSize.height - 200,
                        text: texts.tutorials.collectYourCard,
                        rotation: 180
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs",
                    stepName:"initMoney"
                },
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "initMoney": function() {
                return new TutorialModel({
                    points: [
                        {
                            x: mainLayer.player1Sprite.moneyLabel.x,
                            y: mainLayer.player1Sprite.moneyLabel.y,
                            width: mainLayer.player1Sprite.moneyLabel.width,
                            height: mainLayer.player1Sprite.moneyLabel.height
                        },
                        {
                            x: mainLayer.player2Sprite.moneyLabel.x,
                            y: mainLayer.player2Sprite.moneyLabel.y,
                            width: mainLayer.player2Sprite.moneyLabel.width,
                            height: mainLayer.player2Sprite.moneyLabel.height
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.player1Sprite.moneyLabel.y + 110,
                            text: texts.tutorials.thisIsYourMoney
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.player2Sprite.moneyLabel.y - 110,
                            text: texts.tutorials.thisIsYourMoney,
                            rotation: 180
                        }
                    ],
                    images: [
                        {
                            x: mainLayer.player1Sprite.moneyLabel.x + 80,
                            y: mainLayer.player1Sprite.moneyLabel.y + 50,
                            scaleY: -1
                        },
                        {
                            x: mainLayer.player2Sprite.moneyLabel.x + (isWebIOS ? 80 : -80),
                            y: mainLayer.player2Sprite.moneyLabel.y - 50,
                            scaleX: isWebIOS ? 1 : -1
                        }
                    ],
                    next: {
                        sceneName: "main-vs",
                        stepName: "targetMoney"
                    },
                    sameAs: {
                        sceneName: "main-vs-ai"
                    }
                    //condition: "touchAny" // touchAny, touchAnyPoint, touchAllPoints
                })
            },
            "targetMoney": function() {
                return new TutorialModel({
                    points: [
                        {
                            x: mainLayer.player1Sprite.targetMoneyLabel.x,
                            y: mainLayer.player1Sprite.targetMoneyLabel.y,
                            width: mainLayer.player1Sprite.targetMoneyLabel.width,
                            height: mainLayer.player1Sprite.targetMoneyLabel.height
                        },
                        {
                            x: mainLayer.player2Sprite.targetMoneyLabel.x,
                            y: mainLayer.player2Sprite.targetMoneyLabel.y,
                            width: mainLayer.player2Sprite.targetMoneyLabel.width,
                            height: mainLayer.player2Sprite.targetMoneyLabel.height
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.player1Sprite.targetMoneyLabel.y + 120,
                            text: texts.tutorials.thisIsYourTarget
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.player2Sprite.targetMoneyLabel.y - 120,
                            text: texts.tutorials.thisIsYourTarget,
                            rotation: 180
                        }
                    ],
                    images: [
                        {
                            x: mainLayer.player1Sprite.targetMoneyLabel.x + 80,
                            y: mainLayer.player1Sprite.targetMoneyLabel.y + 50,
                            scaleY: -1
                        },
                        {
                            x: mainLayer.player2Sprite.targetMoneyLabel.x + (isWebIOS ? 80 : -80),
                            y: mainLayer.player2Sprite.targetMoneyLabel.y - 50,
                            scaleX: isWebIOS ? 1 : -1
                        }
                    ],
                    next: function () {
                        if (isWebIOS) {
                            return {
                                sceneName: "main-vs",
                                stepName: "forbidLine"
                            }
                        } else return null;
                    },
                    sameAs: {
                        sceneName: "main-vs-ai"
                    }
                })
            },
            "forbidLine": new TutorialModel({
                points:[
                    {
                        x: 15,
                        y: cc.winSize.height/2,
                        width: 30,
                        height: cc.winSize.height
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 200,
                        text: texts.tutorials.thisIsForbidLine
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 200,
                        text: texts.tutorials.thisIsForbidLine,
                        rotation: 180
                    }
                ],
                images: [
                    {
                        x: 80,
                        y: 300
                    },
                    {
                        x: 80,
                        y: cc.winSize.height - 300,
                        scaleY: -1
                    }
                ],
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "countDown": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height/2,
                        width: 200,
                        height: 200
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 200,
                        text: texts.tutorials.thisIsCountDown
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 200,
                        text: texts.tutorials.thisIsCountDown,
                        rotation: 180
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width/2+120,
                        y: 300
                    },
                    {
                        x: cc.winSize.width/2-120,
                        y: cc.winSize.height - 300,
                        scaleY: -1,
                        scaleX: -1
                    }
                ],
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "compareHands": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 270,
                        text: texts.tutorials.compareHands
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 270,
                        text: texts.tutorials.compareHands,
                        rotation: 180
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs",
                    stepName:"compareHands2"
                },
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "compareHands2": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 270,
                        text: texts.tutorials.compareHands2
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 270,
                        text: texts.tutorials.compareHands2,
                        rotation: 180
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs",
                    stepName:"compareHands3"
                },
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "compareHands3": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 120,
                        width: cc.winSize.width * 350/600,
                        height: 60
                    },
                    {
                        x: cc.winSize.width/2,
                        y: 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 50,
                        width: cc.winSize.width * 350/600,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 270,
                        text: texts.tutorials.compareHands3
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 270,
                        text: texts.tutorials.compareHands3,
                        rotation: 180
                    }
                ],
                images: [
                ],
                next: {
                    sceneName:"main-vs",
                    stepName:"betHelp"
                },
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "betHelp": function() {
                return new TutorialModel({
                    points: [
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.betMoneyLabel1.y,
                            width: 350,
                            height: 50
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: mainLayer.betMoneyLabel2.y,
                            width: 350,
                            height: 50
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: cc.winSize.height / 2,
                            width: 100,
                            height: 100
                        }
                    ],
                    labels: [
                        {
                            x: cc.winSize.width / 2,
                            y: 260,
                            text: texts.tutorials.betHelp
                        },
                        {
                            x: cc.winSize.width / 2,
                            y: cc.winSize.height - 260,
                            text: texts.tutorials.betHelp,
                            rotation: 180
                        }
                    ],
                    images: [
                        {
                            x: cc.winSize.width / 2 + 100,
                            y: cc.winSize.height / 2 - 10,
                            anchorX: 0,
                            anchorY: 1
                        },
                        {
                            x: cc.winSize.width / 2 - 100,
                            y: cc.winSize.height / 2 + 10,
                            anchorX: 0,
                            anchorY: 1,
                            scaleY: -1,
                            scaleX: -1
                        }
                    ],
                    next: {
                        sceneName: "main-vs",
                        stepName: "handHelp"
                    },
                    sameAs: {
                        sceneName: "main-vs-ai"
                    }
                })
            },
            "handHelp": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width,
                        y: cc.winSize.height/2,
                        width: 80,
                        height: 80
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 250,
                        text: texts.tutorials.handHelp
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 250,
                        text: texts.tutorials.handHelp,
                        rotation: 180
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width - 140,
                        y: cc.winSize.height/2 - 10,
                        anchorX:1,
                        anchorY:1,
                        scaleY: 1,
                        scaleX: -1
                    },
                    {
                        x: cc.winSize.width - 140,
                        y: cc.winSize.height/2 + 10,
                        anchorX:1,
                        anchorY:1,
                        scaleY: -1,
                        scaleX: -1
                    }
                ],
                callback:function(){
                    mainLayer.showHelp();
                },
                condition: "touchAllPoints",
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            }),
            "betRateIncrease": new TutorialModel({
                points:[
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height/2,
                        width: 100,
                        height: 100
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
                        y: 300,
                        text: texts.tutorials.betRateIncrease
                    },
                    {
                        x: cc.winSize.width/2,
                        y: cc.winSize.height - 300,
                        text: texts.tutorials.betRateIncrease,
                        rotation: 180
                    }
                ],
                images: [
                    {
                        x: cc.winSize.width/2 + 100,
                        y: cc.winSize.height/2 - 10,
                        anchorX:0,
                        anchorY:1
                    },
                    {
                        x: cc.winSize.width/2 - 100,
                        y: cc.winSize.height/2 + 10,
                        anchorX:0,
                        anchorY:1,
                        scaleY: -1,
                        scaleX: -1
                    }
                ],
                sameAs:{
                    sceneName:"main-vs-ai"
                }
            })
        }
    }
}

