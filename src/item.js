var ItemModel = Backbone.Model.extend({
    defaults:function(){
        return {
            displayName:"",
            maxCharge: 1,
            durationTime: 1,
            maxCoolDown: 1,
            description:"牛X的人不需要使用技能",
            showCharge: false
        }
    },
    initialize:function(){
        this.set({
            charge: this.get("maxCharge"),
            coolDown: 0
        });
    },
    effect:function(){

    },
    canUse:function(){
        return this.get("charge") > 0 && this.get("coolDown") <= 0;
    }
});

var CloudItemModel = ItemModel.extend({
    defaults:function(){
        return {
            name:"cloud",
            displayName:"唤云",
            maxCharge: 5,
            durationTime: 10,
            maxCoolDown: 10,
            description:"召唤云朵干扰对手挑牌",
            showCharge: true
        }
    },
    effect:function(){

    }
});

var ItemSprite = cc.Sprite.extend({
    ctor:function(options) {
        this._super();

        this.chargeLabel = new ccui.Text("", "Arial", 30 );
        this.chargeLabel.enableOutline(cc.color.WHITE, 2);
        this.chargeLabel.setTextColor(cc.color.BLACK);
        this.chargeLabel.attr({
            x: 70,
            y: 10
        })
        this.addChild(this.chargeLabel);

        this.listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();

                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                //Check the click area
                if (cc.rectContainsPoint(rect, locationInNode)) {
                    if ( target.model && target.model.canUse.call(target.model) )
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
                target.useItem.call(target);
            }
        });

        this.initEvent();
    },
    initEvent:function(){
        cc.eventManager.addListener( this.listener, this);
    },
    setItemModel:function(model){
        if ( this.model ) {
            this.model.off();
            delete this.model;
        }

        this.model = model;

        if ( this.model ) {
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("item-" + this.model.get("name") + ".png"));
            this.chargeLabel.setVisible(this.model.get("showCharge"));
            this.renderCharge();
            this.model.on("change:charge", this.renderCharge, this);
        } else {
            this.chargeLabel.setVisible(false);
            this.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("no-item.png"));
        }
    },
    renderCharge:function(){
        this.chargeLabel.setString(this.model.get("charge"));
    },
    useItem:function(){
        this.model.set("coolDown", this.model.get("maxCoolDown") );
        this.model.set("charge", this.model.get("charge") - 1);
        this.model.effect();
        if ( this.model.get("charge") <= 0 ) {
            this.setItemModel(null);
        } else {
            this.setVisible(false);
            this.runAction(new cc.Sequence(new cc.DelayTime(this.model.get("maxCoolDown")),
                new cc.CallFunc(function () {
                    this.setVisible(true);
                }, this)));
        }
    }
});

var ITEM_MODEL_CLASS_MAP = {
    "cloud": CloudItemModel
}
