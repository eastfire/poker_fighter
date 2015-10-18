var SkillModel = Backbone.Model.extend({
    defaults:function(){
        return {
            name:"no-skill",
            displayName:"无技能",
            charge: 3,
            maxCharge: 3,
            durationTime: 10,
            currentTime: 10,
            maxCoolDown: 10,
            coolDown: 10,
            description:"牛X的人不需要使用技能"
        }
    },
    effect:function(){

    }
})