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
                moveTime: 2.5
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
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 40 * i
                },
                end : {
                    x: -dimens.card_size.width,
                    y: 150 + 40 * i
                },
                moveTime: 2.5
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
                    y: 350 - 40 * i
                },
                moveTime: 2.5
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
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 40 * i
                },
                end : {
                    x: -dimens.card_size.width,
                    y: 350 - 40 * i
                },
                moveTime: 2.5
            }
        });
    }
});