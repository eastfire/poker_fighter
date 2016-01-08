var showTutorial = function(scene, sceneName, stepName){
    if ( !tutorialMap ) initTutorialMap();

    if ( !tutorialPassed[sceneName] ) tutorialPassed[sceneName] = {};

    var tutorialModel;
    if ( tutorialMap[sceneName] && (tutorialModel = tutorialMap[sceneName][stepName]) ) {
        if (!tutorialPassed[sceneName][stepName]) {

            var layer = new TutorialLayer({
                sceneName: sceneName,
                stepName: stepName,
                model: tutorialModel,
                callback: function () {
                    tutorialPassed[sceneName][stepName] = true;
                    saveTutorial();
                    var next = tutorialModel.get("next")
                    if ( next ) {
                        showTutorial(scene, next.sceneName, next.stepName )
                    }
                }
            });

            scene.addChild(layer, 200);
            layer.startTutorial();
        } else {
            var next = tutorialModel.get("next")
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
                var scene = self.getParent()
                self.stopTutorial();
                if ( self.callback ) {
                    self.callback.call();
                }
            }
        }), this);
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
        mask.drawPoly([cc.p(0, 0), cc.p(cc.winSize.width, 0),
            cc.p(cc.winSize.width, cc.winSize.height),
            cc.p(0, cc.winSize.height)], colors.tutorial, 1, colors.tutorial);
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
                color: labelEntry.color || cc.color.BLACK,
                x:this.getValue(labelEntry,"x"),
                y:this.getValue(labelEntry,"y"),
                anchorX: this.getValue(labelEntry,"anchorX") || 0.5,
                anchorY: this.getValue(labelEntry,"anchorY") || 0.5,
                rotation: this.getValue(labelEntry,"rotation") || 0
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

var TutorialSprite = cc.Sprite.extend({
    ctor: function (options) {
        this._super();

        if ( options.position === PLAYER_POSITION_UP )
            this.rotation = 180;

        this.model = options.model;

        _.each( this.model.get("points"),function(point){

        })
        _.each( this.model.get("labels"),function(label){

        })
    }
});

var TutorialModel = Backbone.Model.extend({
    defaults:function(){
        return {
            labels: [],
            images: [],
            points: [],
            passCondition: "touch" //touch
        }
    }
})

var tutorialMap = null;
var initTutorialMap = function(){
    tutorialMap = {
        "main":{
            "initMoney": new TutorialModel({
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
                    sceneName:"main",
                    stepName:"targetMoney"
                }
            }),
            "targetMoney": new TutorialModel({
                points:[
                    {
                        x: mainLayer.player1Sprite.targetMoneyLabel.x,
                        y: mainLayer.player1Sprite.targetMoneyLabel.y,
                        width: mainLayer.player1Sprite.targetMoneyLabel.width,
                        height: mainLayer.player1Sprite.targetMoneyLabel.height
                    }
                ],
                labels: [
                    {
                        x: cc.winSize.width/2,
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
                next: null
            })
        }
    }
}

