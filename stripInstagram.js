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
    console.log(reelsbar);
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
    //hide(explorebar[0].parentNode.parentNode.parentNode.parentNode);

    /*for (var i = 0; i < reelsbar.length; i++){
        if (reelsbar[i].getAttribute('aria-describedby')){
            console.log("-----reelsbar-----");
            console.log(reelsbar[i].getAttribute('aria-describedby'));
            console.log("-----reelsbar-----");
            //hide(reelsbar[i]);
            //#mount_0_0_OT > div > div > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.xvbhtw8.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.x1uhb9sk.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.x1q0g3np.xqjyukv.x1qjc9v5.x1oa3qoh.x1qughib > div.x9f619.xjbqb8w.x78zum5.x168nmei.x13lgxp2.x5pf9jr.xo71vjh.xixxii4.x13vifvy.x1plvlek.xryxfnj.x1c4vz4f.x2lah0s.xdt5ytf.xqjyukv.x1qjc9v5.x1oa3qoh.x1nhvcw1.x1dr59a3.xeq5yr9.x1n327nk > div > div > div > div > div.x1iyjqo2.xh8yej3 > div:nth-child(4) > span
        }
    }   */
}