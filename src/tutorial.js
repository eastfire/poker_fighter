var showTutorial = function(scene, sceneName, stageName){
    if ( !tutorialPassed[sceneName] ) tutorialPassed[sceneName] = {};
    if ( !tutorialPassed[sceneName][stageName] ) {
        cc.log("aaaaa")
        var layer = new TutorialLayer({
            sceneName : sceneName,
            stageName: stageName
        });

        scene.addChild(layer,200);
        layer.startTutorial();
    }
}

var TutorialLayer = cc.LayerColor.extend({
    ctor: function (options) {
        options = options || {};
        this._super(colors.tutorial);

        this.sceneName = options.sceneName;
        this.stageName = options.stageName;

        //render tutorial

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
                self.stopTutorial();
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

var tutorialMap = {
    "main":{
        "getCard": new TutorialModel()
    }
}