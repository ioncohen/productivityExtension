function stripReddit(){
    if (!location.href.includes("reddit.com")){
        return;
    }
    const leftSidebar = document.getElementById("left-sidebar-container");
    hide(leftSidebar);
    const rightSidebar = document.getElementById("right-sidebar-container");
    hide(rightSidebar);
    
    //TODO: fix bug where this also gets rid of posts.
    //const subredditPage = document.getElementsByClassName("subgrid-container");
    //hideAll(subredditPage);
}