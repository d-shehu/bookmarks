// List of all bookmarks
console.log('Starting background service worker');

let lsAllBookmarks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get-bookmarks") {  
        console.log("Processing get-bookmarks");
        fetchBookmarks(request).then(sendResponse);
        return true;
    }
});

function fetchBookmarks(request) {
    return new Promise(resolve => {
        //Call Chrome API to get all books
        chrome.bookmarks.getTree(function(tree){
            
            lsAllBookmarks = [];

            //Flatten into a list
            genListBookmarks(tree, lsAllBookmarks, []);
            //Return to caller 
            resolve({bookmarks: lsAllBookmarks});
        });
    })
}

// Recursively scan the tree of bookmarks and build a simple list
function genListBookmarks(bookmarks, lsBookmarks, parents) {
    for (var i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        if (bookmark.url) {
            lsBookmarks.push({
                title: bookmark.title,
                url: bookmark.url,
                parents: parents
            });
            //console.log("bookmark: " + bookmark.title + " ~  " + bookmark.url);
        }
        if (bookmark.children) {
            currParent = [];
            if(parents.length > 0){
                currParent = parents.map((x) => x);
            }
            // Exclude the "Bookmark Bar" (top level) since it adds no context
            if (bookmark.title != "Bookmarks bar"){
              currParent.push(bookmark.title);
            }
            genListBookmarks(bookmark.children, lsBookmarks, currParent);
        }
    }
}
