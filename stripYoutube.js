function stripYoutube(){
    //redirect site if its a short.
    if (location.href.includes("/shorts/")){
        location.href = location.href.replace("/shorts/", "/watch/");
    }


    //rip out content bar/suggested videos
    const contentBar = document.getElementById("secondary");
    if (contentBar){
        contentBar.style.setProperty('display', 'none', 'important');
    }
    //rip out comment Section
    const commentSection = document.getElementsByClassName("style-scope ytd-comments");
    hideAll(commentSection);
    
    //rip out endscreen content
    const endScreen = document.getElementsByClassName("ytp-endscreen-content");
    hideAll(endScreen);

    //rip out inner guide content
    const guideInner = document.getElementById("guide-inner-content");
    if(guideInner){
        guideInner.style.setProperty('display', 'none', 'important');
    }

    //rip out video end card "ce-elements"
    const ceElements = document.getElementsByClassName("ytp-ce-element");
    hideAll(ceElements);

    //rip out home screen
    const homeScreen = document.getElementsByClassName("style-scope ytd-two-column-browse-results-renderer");
    for(var i = 0; i < homeScreen.length; i++){
        if (homeScreen[i].id === "primary" && homeScreen[i].tagName === "DIV" ){
            console.log(homeScreen[i]);
            homeScreen[i].style.setProperty('display', 'none', 'important');
        }
    }
    
}

function hideAll(htmlCollection){
    for (var i = 0; i < htmlCollection.length; i++){
        htmlCollection[i].style.setProperty('display', 'none', 'important');
    }
}