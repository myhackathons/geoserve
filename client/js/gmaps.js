/* BEGIN GMAPS
 *
 *
 */

gmapsMarkers = [];

infoWindows = [];

locationsMarkers = [];

closeInfoWindows = function(){if(infoWindows.length > 0)
            return infoWindows.filter(function(arr){
               arr.close();
               return false;
            });}

createMap = function(latLng) {
    var mapOptions = {
        disableDoubleClick: true,
        streetViewControl: false,
        scrollwheel: false,
        zoom: 15,
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
};

placeNavMarker = function(latLng,data) {
    var image = data.image_low,likes = data.likes ,
        tags = (data.tags.length > 0  ? '\n' + data.tags.join(', ')  :false),

    
        title = data.caption;
    
    var new_marker = new google.maps.Marker({
        position: latLng,
        map: map,
        'title': title,
        icon: { url:image ,scaledSize: new google.maps.Size(50,50)} }
        );
    var infoWindow = new google.maps.InfoWindow({
        content: '<div class="infoWindow"><img src="'+image+'"/><p><b>'+data.username+'</b><strong>' + likes + '</strong>' + (title ? '<b class="instaTitle">' + title + '</b>' : '') + (tags ? '<em>' + tags + '</em>' : '' ) + '</p></div>'
    });
    
    infoWindows.push(infoWindow);
    
    google.maps.event.addListener(new_marker, 'click', function() {
        closeInfoWindows();
        // how to issue template event?
 
         if(typeof new_marker.wasClicked == 'undefined' && typeof data.locations == 'undefined') {
            // find stuff near it ..
            var access_token = Session.get('access_token');
            
            if(access_token){
                Meteor.call('locations_search',access_token,data.lat,data.lon,this._id,
                            function(error,result){
                                if(typeof error =='undefined' && typeof result != 'undefined'){
                                   if(typeof map != 'undefined'){
                                        if(result.length > 0){
                                            result.filter(function(arr){
                                                placeLocationMarker(new google.maps.LatLng(arr.latitude,arr.longitude),arr.name,arr.id);
                                            });
                                        }
                                        else
                                            console.log('no nearby markers in search..');
                                    }
                                    // do default call for user feed ... to populate map with markers...
                                    // set the interval to continually fetch new results ??
                                }else{
                                    new_marker.wasClicked = false;
                                    console.log('Please reclick to retry locations search');
                                    // maybe attempt to make call again?
                                }
                            }
                );
               
            }
            new_marker.wasClicked = true;
        }else if(typeof new_marker.wasClicked == 'undefined' && typeof data.locations != 'undefined'){
        
            insta_locations.find({id : {"$in" : data.locations}}).fetch().filter(function(arr){
                    var lId = parseInt(arr.id);
                    var location_feed = insta_locations_grams.findOne({id: lId});
                    if(location_feed && typeof location_feed.data != 'undefined'){
                        if(location_feed.data.length > 0)
                    // pass data to build info window to place location marker...
                            placeLocationMarker(new google.maps.LatLng(arr.latitude,arr.longitude),arr.name,lId,location_feed.data);
                        else
                            console.log('no location data');
                    }else{
                        console.log('problem with insta_locations_grams.findOne() query');
                    }
            });
            new_marker.wasClicked = true;

        }

        infoWindow.open(map,new_marker);
    });
    
    if(typeof map == 'undefined')
        console.log('no map for marker...');

    gmapsMarkers.push(new_marker);
       

};

placeLocationMarker = function(latLng,title,theId,theData){
     if(typeof latLng == 'object' && typeof title != 'undefined' && theId != 'undefined'){
        lMarkerExists = false;
        locationsMarkers.filter(function(arr){
            if(arr.instaId == theId){
                lMarkerExists = true;
                return;
            }
        });
        // hmm
        if(!lMarkerExists && typeof theData != 'undefined'){
            var theInfoWindow = '<ul class="locInfoContainer"><li class="title"><h1>' + title + '</h1></li>';
                theData.filter(function(arr){
                    // DRY !!!
                    /*
                    var created_time = parseInt(arr.created_time);
                    var r = {
                        id : arr.id,
                        username : arr.user.username,
                        link : arr.link,
                        created_time : parseInt(arr.created_time),
                        last_hit : created_time,
                        image_low : arr.images.low_resolution.url,
                        image_standard : arr.images.standard_resolution.url,
                        image_thumb : arr.images.thumbnail.url,
                        type : arr.type
                    };
                    
                    if(arr.caption != null){
                        r.caption = arr.caption.text,
                        r.caption_id = parseInt(arr.caption.id);
                    }
                    
                    if(arr.tags != null){
                        r.tags = arr.tags;
                    }
                    
                    if(arr.likes != null){
                         r.likes = arr.likes.count;
                    }
                    r.lat = arr.location.latitude;
                    r.lon = arr.location.longitude;
                    */
                        theInfoWindow = theInfoWindow + '<li class="locInfoWindow"><a href="'+arr.link+'" target="_new"><img alt="image" src="'+arr.images.low_resolution.url+'"/></a><div id="'+arr.id+'" class="instaLocPost"><h5>'+arr.user.username+ ' ' + arr.likes.count+ '</h5>' + (arr.caption != null && typeof arr.caption.text != 'undefined' && arr.caption.text != '' ? "<p>" + arr.caption.text + "</p>" : "") + '</div></li>';
                    
                });
                var infoWindow2 = new google.maps.InfoWindow({
                    content: theInfoWindow + "</ul>"
                });
            infoWindows.push(infoWindow2);
            
            var new_marker2 = new google.maps.Marker({
                instaId : theId,
                position: latLng,
                map: map,
                'title': title }
                );
            // do back end call to search for location markers?
            /*
            Meteor.call('locations_media_recent',Session.get('access_token'),theId,function(error,result){
                if(typeof error == 'undefined'){
                    console.log(result);
                }
            });
            */
            
            google.maps.event.addListener(new_marker2, 'click', function() {
                closeInfoWindows();
                infoWindow2.setOptions({maxWidth:615});

                infoWindow2.open(map,new_marker2);
            });
            
            //console.log(insta_locations_grams.findOne({id:parseInt(theId)},{data:1}));
            locationsMarkers.push(new_marker2);
        }else if(lMarkerExists){
            console.log('avoiding duplicate marker');
        }else{
        // look up data ???
            //console.log(insta_locations.findOne({id : theId}));
            var locationGrams = insta_locations_grams.findOne({id : theId},{data:1});
            if(locationGrams && typeof locationGrams.data != 'undefined' && locationGrams.data.length > 0)
                placeLocationMarker(latLng,title,theId,locationGrams.data)
            else
                console.log('problem with insta_locations_grams query or length is zero');
        }
    }
// just use default markers these are for when people click on an image and want nearby things...
}

setMapCenter = function(q){
    map.setCenter(new google.maps.LatLng(q[0],q[1]));
}
 
/*
 *
 * END GMAPS
 *
 */
