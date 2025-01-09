// code to strip recommendations and distractions out of youtube. 
// Only strips things that can't be effectively blocked using the blocklist (but what about outside of sessions?)

function stripYoutube(){
    //redirect site if its a short.
    if (!location.href.includes("youtube.com")){
        return;
    }
    if (location.href.includes("/shorts/")){
        location.href = location.href.replace("/shorts/", "/watch/");
    }

    
    
    //code to block channel page. Maybe remove, because people can choose to block channels themselves?
    if (location.href.includes("youtube.com/@")){
        document.querySelectorAll('audio, video').forEach(el => el.pause());
        const channelContents = document.querySelector('ytd-two-column-browse-results-renderer[page-subtype=channels]');
        hide(channelContents);
    }
    

    //rip out content bar/suggested videos
    const contentBar = document.querySelectorAll('[id=secondary]');
    //console.log(contentBar.length);
    hideAll(contentBar);
    
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
    if (location.href.endsWith('youtube.com/')){
        //this line only selects the currently visible primary content div
        const homeScreen = document.querySelector('ytd-browse[role=main]');
        console.log("removing the main thing!");
        hide(homeScreen);
        //for(var i = 0; i < homeScreen.length; i++){
        //    if (homeScreen[i].id === "primary" && homeScreen[i].tagName === "DIV" ){
         //       homeScreen[i].style.setProperty('display', 'none', 'important');
         //   }
        //}
    }
}

function hideAll(htmlCollection){
    for (var i = 0; i < htmlCollection.length; i++){
        htmlCollection[i].style.setProperty('display', 'none', 'important');
    }
}
function hide(htmlElement){
    if (htmlElement){
        htmlElement.style.setProperty('display', 'none', 'important');
    }
}