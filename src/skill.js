var SkillModel = Backbone.Model.extend({
    defaults:function(){
        return {
            name:"no-skill",
            displayName:"无技能",
            charge: 3,
            coolDown: 10,
            description:"牛X的人不需要使用技能"
        }
    },
    effect:function(){

    }
})