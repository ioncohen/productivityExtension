function  stripTwitter(){
    if (!location.href.includes("/x.com")){
        return;
    }
    const timelineExplore = document.querySelector('[aria-label="Timeline: Explore"]');
    hide(timelineExplore);

    const trendingNow = document.querySelector('[aria-label="Timeline: Trending now"]');
    hide(trendingNow);

    const whoToFollow = document.querySelector('[aria-label="Who to follow"]');
    hide(whoToFollow);
}