function  stripTwitter(){
    if (!location.href.includes("/x.com")){
        return;
    }

    //remove explore page until you do a search
    const timelineExplore = document.querySelector('[aria-label="Timeline: Explore"]');
    hide(timelineExplore);

    //remove trending now on the right
    const trendingNow = document.querySelector('[aria-label="Timeline: Trending now"]');
    hide(trendingNow);

    //remove follow suggestions
    const whoToFollow = document.querySelector('[aria-label="Who to follow"]');
    hide(whoToFollow);

    if (!location.href.includes("/x.com/home")){
        return;
    }
    //find timeline home
    const homeTimeline = document.querySelector('[aria-label="Timeline: Your Home Timeline"]');

    //find "for you" span using xpath
    const spanList = document.getElementsByTagName('span');
    for(var i = 0; i < spanList.length; i++){
        if (spanList[i].innerHTML === 'For you'){
            if (spanList[i].parentNode.parentNode.parentNode.getAttribute('aria-selected')==='true'){
                hide(homeTimeline);
                return;
            }
        }
    }
    if(homeTimeline && homeTimeline.style) homeTimeline.style.display = 'flex';
    

}