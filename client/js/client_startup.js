/*
 * geoserve - Ronaldo Barbachano June 2013
 * http://redcapmedia.com
 */

Meteor.startup(function(){
    createMap();
    // continually refresh feed
    if(Meteor.userId()){
        Meteor.setInterval(function(){
            Session.set('user_self',false);
            }        ,60 * 60 * 30);
                                     Session.set('markerSort',undefined);

    }
    
    var access_token = window.location.href.split("#");
    
    if(access_token.length > 1 && !doesHaveAccess){
        access_token = access_token[1].split("=")[1];
        Session.set('access_token', access_token);
        var doesHaveAccess = Session.get('access_token');

    }

    Deps.autorun(function(){
        if(Meteor.userId()){
            // also use this reactive source to determine interface elements in templates...
            instaGramPosts = Meteor.subscribe("userInstaGrams");
            var instaGram = Session.get('user_self');
        }
        
   
        
        if(Meteor.userId() && Session.get('access_token') && !Session.get('user_self')){
            var access_token = Session.get('access_token');
             if(access_token){
                // set this to true so deps doesn't re run while its waiting for the response...
                 Session.set('user_self',true);

                 Meteor.call('user_self',access_token,
                    function(error,result){
                        if(typeof error =='undefined'){
                            Session.set('user_self',result);
                        }else{
                            console.log(error);
                    }});
            }
        }
    });
      
});