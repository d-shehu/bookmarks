// List of all bookmarks
console.log('Starting background service worker');

let lsAllBookmarks = []

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "get-bookmarks") {
        chrome.bookmarks.getTree(function(tree) {
          console.log("Tree:" + tree)
          genListBookmarks(tree, lsAllBookmarks, []);
          console.log("Bookmarks:" + lsAllBookmarks)
          sendResponse({ bookmarks: lsAllBookmarks });
        });
    }
});

// Recursively scan the tree of bookmarks and build a simple list
function genListBookmarks(bookmarks, lsBookmarks, parents) {
    for (let i = 0; i < bookmarks.length; i++) {
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
            // Exclude the "Bookmark Bar" (top level) since it adds no context
            if (bookmark.title != "Bookmarks Bar"){
              currParent = []
              if(parents.length > 0){
                currParent = parents.map((x) => x);
              }
              currParent.push(bookmark.title)
            }
            genListBookmarks(bookmark.children, lsBookmarks, currParent);
        }
    }
}
