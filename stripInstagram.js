function stripInstagram(){
    //redirect reels to post
    if (!location.href.includes("instagram.com")){
        return;
    }
    if (location.href.includes("/reels/")){
        location.href = location.href.replace("/reels/", "/p/");
    }   

    //remove suggested posts from post page
    const suggestedPosts = document.getElementsByClassName("x1qjc9v5 x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1lliihq xdt5ytf x2lah0s xln7xf2 xk390pu xdj266r x11i5rnm xat24cr x1mh8g0r x4uap5 x18d9i69 xkhd6sd x24vp2c x1n2onr6 x11njtxf"); 
    hideAll(suggestedPosts);

    //todo: fix bug where going to home doesnt trigger a reaction I think?
    const reelsbar = document.querySelector('[aria-label="Reels"]');
    //console.log(reelsbar);
    hide(reelsbar);
    if (reelsbar){
        var nodeparent = reelsbar;
        for (var i = 0; i < 4; i++){
            if (nodeparent.parentElement){
                nodeparent = nodeparent.parentElement;
            }
        }
        hide(nodeparent);
    }
    //hide(reelsbar[0].parentNode.parentNode.parentNode.parentNode);
    const explorebar = document.querySelector('[aria-label="Explore"]');
    //console.log(reelsbar);
    hide(explorebar);
    if (explorebar){
        var nodeparent = explorebar;
        for (var i = 0; i < 4; i++){
            if (nodeparent.parentElement){
                nodeparent = nodeparent.parentElement;
            }
        }
        hide(nodeparent);
    }
}