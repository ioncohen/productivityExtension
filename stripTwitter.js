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
}