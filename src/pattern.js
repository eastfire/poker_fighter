var PatternModel = Backbone.Model.extend({
    defaults:function(){
        return {
            type: "fly",
            list: this.generateList()
        }
    },
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4,5],function(i){
            time += 0.5;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 40 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 40 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern2Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4,5],function(i){
            time += 0.5;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 40 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 40 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern3Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4,5],function(i){
            time += 0.5;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 40 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 40 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern4Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4,5],function(i){
            time += 0.5;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 40 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 40 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern5Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        for ( var i = 0; i < 3; i++ ) {
            ret.push({
                time : i*0.5,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 30 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 30 * i
                },
                moveTime: 3.5
            });
            ret.push({
                time : i*0.5,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 30 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 30 * i
                },
                moveTime: 3.5
            });
        }
        return ret;
    }
});

var Pattern6Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        for ( var i = 0; i < 3; i++ ) {
            ret.push({
                time : i*0.5,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 30 * (2-i)
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 30 * (2-i)
                },
                moveTime: 3.5
            });
            ret.push({
                time : i*0.5,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 30 * (2-i)
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 30 * (2-i)
                },
                moveTime: 3.5
            });
        }
        return ret;
    }
});

var ItemPatternModel = Backbone.Model.extend({
    defaults: function () {
        return {
            pattern:{
                isOnlyOne: false,
                time : 2.5,
                start : {
                    x: -dimens.card_size.width,
                    y: 350
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350
                }
            }
        }
    }
});

var ItemPattern2Model = Backbone.Model.extend({
    defaults: function () {
        return {
            pattern: {
                isOnlyOne: false,
                time: 2.5,
                start: {
                    x: -dimens.card_size.width,
                    y: 350
                },
                end: {
                    x: cc.winSize.width + dimens.card_size.width,
                    y: 150
                }
            }
        }
    }
});

var ItemPattern3Model = Backbone.Model.extend({
    defaults: function () {
        return {
            pattern: {
                isOnlyOne: false,
                time: 2.5,
                start: {
                    x: -dimens.card_size.width,
                    y: 150
                },
                end: {
                    x: cc.winSize.width + dimens.card_size.width,
                    y: cc.winSize.height - 150
                }
            }
        }
    }
});

var ItemPattern4Model = Backbone.Model.extend({
    defaults: function () {
        return {
            pattern: {
                isOnlyOne: true,
                time: 2.5,
                start: {
                    x: -dimens.card_size.width,
                    y: cc.winSize.height/2
                },
                end: {
                    x: cc.winSize.width + dimens.card_size.width,
                    y: cc.winSize.height/2
                }
            }
        }
    }
});