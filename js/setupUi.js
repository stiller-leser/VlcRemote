function setupUi(){

	/*
    * Configure swipe events for the menu
    */

    $(document).off('swipeleft').on('swipeleft', 'section[data-role="page"]', function(event){    
        if(event.handled !== true) // This will prevent event triggering more then once
        {    
            var nextpage = $.mobile.activePage.next('section[data-role="page"]');
            // swipe using id of next page if exists
            if (nextpage.length > 0) {
                $.mobile.changePage(nextpage, "slide", true, true);
            } else  {
                $.mobile.changePage("#player","slide", true, true);
            }
            event.handled = true;
        }
        return false;         
    });

    $(document).off('swiperight').on('swiperight', 'section[data-role="page"]', function(event){   
        if(event.handled !== true) // This will prevent event triggering more then once
        {      
            var prevpage = $.mobile.activePage.prev('section');
            if (prevpage.length > 0) {
                $.mobile.changePage(prevpage, "slide", true, true);
            }  else  {
                $.mobile.changePage("#settings","slide", true, true);
            }
            event.handled = true;
        }
        return false;            
    });
};

function setupButtonUi(){

 	//Do it like this to have the persistent buttons work everywhere

    //Configure Home-Button
    $("body").on("click", "#home", function(event){
        event.preventDefault();
        $.mobile.changePage("#player", "slide", true, true);        
    });

    //Configure Player-Buttons
    $("body").on("click", ".playpause", function(){
        console.log("plData.state" + plData.state);
        if(plData.state === "playing"){
    		$(this).removeClass("pause").addClass("play");
    		player.pause();
    	} else {
    		$(this).removeClass("play").addClass("pause");
    		player.play();
    	}
    });

    $("body").on("click", "#stop", function(event){
    	event.preventDefault();
        $(".pause").removeClass("pause").addClass("play");
    	player.stop();
    });

    $("body").on("click", "#forward", function(event){
    	event.preventDefault();
    	player.forward();
    });

    $("body").on("click", "#previous", function(event){
    	event.preventDefault();
    	player.previous();
    });

    //Configure buttons on Player-Site
    $("body").on("click", "#repeat", function(event){
        event.preventDefault();
        player.repeat();
    });

    $("body").on("click", "#repeat-all", function(event){
        event.preventDefault();
        player.repeatAll();
    });

    $("body").on("click", "#random", function(event){
        event.preventDefault();
        player.random();
    });

    $("body").on("click", "#volume-up", function(event){
        event.preventDefault();
        player.volume(1);
    });

	$("body").on("click", "#volume", function(event){
		event.preventDefault();
		player.mute();
	});

    $("body").on("click", "#volume-down", function(event){
        event.preventDefault();
        player.volume(-1);
    });

    //Configure position slider
    $("#positionSlider").on("slidestop", function(){
        player.jumpTo($(this).val());
    });

    //Configure buttons on Playlist-Site
    $("body").on("click", "#options", function(event){
        event.preventDefault();
        if($("#playlistPopup").css("display") === "none"){
            $("#playlistPopup").css("display","block");
        } else {
            $("#playlistPopup").css("display","none");
        }
    });

    //Configure Popups on Playlist-Site

    $("body").on("click", "#playlistPopup", function(event){
        event.preventDefault();
        $("#playlistPopup").css("display","none");
    });

    $("body").on("click", "#playlistItemPopup", function(event){
        event.preventDefault();
        $("#playlistItemPopup").css("display","none");
    });

    $("body").on("click", "#clearPlaylist", function(event){
        event.preventDefault();
        player.clearPlaylist();
    });

    //Configure Popup on Library-Site

    $("body").on("click", "#itemPopup", function(event){
        event.preventDefault();
        $("#itemPopup").css("display","none");
    }); //Button is configure when taphold is bound in player.js


    //Configure buttons on Settings-Site
    $("body").on("click", "#saveSettings", function(event){
        event.preventDefault();
        player.getSettings();
    });

    //Configure buttons on Settings-Site
    $("body").on("click", "#clearSettings", function(event){
        event.preventDefault();
        player.clearSettings();
    });
}