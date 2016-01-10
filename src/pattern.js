var DIVIDE_TIME = 0.6;

var PatternModel = Backbone.Model.extend({
    defaults:function(){
        return {
            type: "fly",
            list: this.generateList()
        }
    },
    initialize:function(){
        _.each( this.get("list"), function(entry) {
            var dx = entry.end.x - entry.start.x;
            var dy = entry.end.y - entry.start.y;
            var distance = Math.sqrt( dx * dx + dy * dy );
            var speed = distance / entry.moveTime;
            entry.speedX = speed / distance * dx;
            entry.speedY = speed / distance * dy;
        },this);
    },
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4,5],function(i){
            time += DIVIDE_TIME;
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

var TutorialPatternModel = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return [ {
                time: 0,
                start : {
                    x: -dimens.card_size.width,
                    y: 250
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 250
                },
                moveTime: 3.5
            } ]
    }
});

var Pattern2Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4,5],function(i){
            time += DIVIDE_TIME;
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
            time += DIVIDE_TIME;
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
            time += DIVIDE_TIME;
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
                time : i*DIVIDE_TIME,
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
                time : i*DIVIDE_TIME,
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
                time : i*DIVIDE_TIME,
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
                time : i*DIVIDE_TIME,
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

var Pattern7Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4],function(i){
            time += DIVIDE_TIME+0.1;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 50 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 50 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern8Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4],function(i){
            time += DIVIDE_TIME+0.1;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 50 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 50 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern9Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4],function(i){
            time += DIVIDE_TIME+0.1;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 50 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 50 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern10Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3,4],function(i){
            time += DIVIDE_TIME+0.1;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 50 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 50 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern11Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        ret.push({
            time : 2*(DIVIDE_TIME+0.1),
            start : {
                x: -dimens.card_size.width,
                y: 250
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 250
            },
            moveTime: 3.5
        });
        for ( var i = 0; i < 2; i++ ) {
            ret.push({
                time : i*(DIVIDE_TIME+0.1),
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 50 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 50 * i
                },
                moveTime: 3.5
            });
            ret.push({
                time : i*(DIVIDE_TIME+0.1),
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 50 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 50 * i
                },
                moveTime: 3.5
            });
        }
        return ret;
    }
});

var Pattern12Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        ret.push({
            time : 0,
            start : {
                x: -dimens.card_size.width,
                y: 250
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 250
            },
            moveTime: 3.5
        });
        for ( var i = 0; i < 2; i++ ) {
            ret.push({
                time : (i+1)*(DIVIDE_TIME+0.1),
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 50 * (1-i)
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 50 * (1-i)
                },
                moveTime: 3.5
            });
            ret.push({
                time : (i+1)*(DIVIDE_TIME+0.1),
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 50 * (1-i)
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 50 * (1-i)
                },
                moveTime: 3.5
            });
        }
        return ret;
    }
});

var Pattern13Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3],function(i){
            time += DIVIDE_TIME+0.15;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 66 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 66 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern14Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3],function(i){
            time += DIVIDE_TIME+0.15;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 66 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 66 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern15Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3],function(i){
            time += DIVIDE_TIME+0.15;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 66 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 66 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern16Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2,3],function(i){
            time += DIVIDE_TIME+0.15;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 66 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 66 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern17Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        for ( var i = 0; i < 2; i++ ) {
            ret.push({
                time : (1+i)*(DIVIDE_TIME+0.15),
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 40 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 40 * i
                },
                moveTime: 3.5
            });
            ret.push({
                time : (1+i)*(DIVIDE_TIME+0.15),
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 40 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 40 * i
                },
                moveTime: 3.5
            });
        }
        return ret;
    }
});

var Pattern18Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        for ( var i = 0; i < 2; i++ ) {
            ret.push({
                time : i*(DIVIDE_TIME+0.15),
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 40 * (1-i)
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 40 * (1-i)
                },
                moveTime: 3.5
            });
            ret.push({
                time : i*(DIVIDE_TIME+0.15),
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 40 * (1-i)
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 40 * (1-i)
                },
                moveTime: 3.5
            });
        }
        return ret;
    }
});

var Pattern19Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            time += DIVIDE_TIME+0.25;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 100 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 100 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern20Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            time += DIVIDE_TIME+0.25;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 100 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 100 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern21Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            time += DIVIDE_TIME+0.25;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 350 - 100 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150 + 100 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern22Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            time += DIVIDE_TIME+0.25;
            return {
                time: time,
                start : {
                    x: -dimens.card_size.width,
                    y: 150 + 100 * i
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350 - 100 * i
                },
                moveTime: 3.5
            }
        });
    }
});

var Pattern23Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        ret.push({
            time : 0,
            start : {
                x: -dimens.card_size.width,
                y: 250
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 250
            },
            moveTime: 3.5
        });
        ret.push({
            time : DIVIDE_TIME+0.25,
            start : {
                x: -dimens.card_size.width,
                y: 150
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 150
            },
            moveTime: 3.5
        });
        ret.push({
            time : DIVIDE_TIME+0.25,
            start : {
                x: -dimens.card_size.width,
                y: 350
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 350
            },
            moveTime: 3.5
        });

        return ret;
    }
});

var Pattern24Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        var ret = [];
        ret.push({
            time : DIVIDE_TIME+0.25,
            start : {
                x: -dimens.card_size.width,
                y: 250
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 250
            },
            moveTime: 3.5
        });
        ret.push({
            time : 0,
            start : {
                x: -dimens.card_size.width,
                y: 150
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 150
            },
            moveTime: 3.5
        });
        ret.push({
            time : 0,
            start : {
                x: -dimens.card_size.width,
                y: 350
            },
            end : {
                x: cc.winSize.width+dimens.card_size.width,
                y: 350
            },
            moveTime: 3.5
        });

        return ret;
    }
});

var Pattern25Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            return {
                time : i*(DIVIDE_TIME+0.25),
                start : {
                    x: -dimens.card_size.width,
                    y: 250
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 250
                },
                moveTime: 3.5
            }
        })
        return ret;
    }
});

var Pattern26Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            return {
                time : i*(DIVIDE_TIME+0.25),
                start : {
                    x: -dimens.card_size.width,
                    y: 150
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 150
                },
                moveTime: 3.5
            }
        })
        return ret;
    }
});

var Pattern27Model = PatternModel.extend({
    generateList:function(){
        var time = 0;
        return _.map([0,1,2],function(i){
            return {
                time : i*(DIVIDE_TIME+0.25),
                start : {
                    x: -dimens.card_size.width,
                    y: 350
                },
                end : {
                    x: cc.winSize.width+dimens.card_size.width,
                    y: 350
                },
                moveTime: 3.5
            }
        })
        return ret;
    }
});

var ItemPatternModel = Backbone.Model.extend({
    initialize:function(){
        var entry = this.get("pattern");
        var dx = entry.end.x - entry.start.x;
        var dy = entry.end.y - entry.start.y;
        var distance = Math.sqrt( dx * dx + dy * dy );
        var speed = distance / entry.time;
        entry.speedX = speed / distance * dx;
        entry.speedY = speed / distance * dy;
    }
});

var ItemPattern1Model = ItemPatternModel.extend({
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

var ItemPattern2Model = ItemPatternModel.extend({
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

var ItemPattern3Model = ItemPatternModel.extend({
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

var ItemPattern4Model = ItemPatternModel.extend({
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