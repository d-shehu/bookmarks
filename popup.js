
//Simple matching function
function isMatch(searchStr, res){
  title = res.title.toLowerCase()
  if(searchStr == "" || title.search(searchStr) >= 0){
    return true
  }
  //Check parents(tags)
  else if(searchStr != ""){
    for(j = 0; j<res.parents.length; j++){
      if(res.parents[j] != ""){
        tag=res.parents[j].toLowerCase()
        if(tag.search(searchStr) >= 0){
          return true
        }
      }
    }
  }

  return false
}

function getMatches(lsRes, searchStr){

  if( document.getElementById("searchTypeAny").checked ){
    searchStr = searchStr.replaceAll(" ", "|") //pipe treats tokens as or
  }
  else if ( document.getElementById("searchTypeExact").checked ) {
    searchStr = '="' + searchStr + '"'
  }
  console.log(searchStr)
  // Otherwise leave as is with spaces acting as "AND"

  const options = {
    includeScore: true,
    isCaseSensitive: false,
    minMatchCharLength: 3,
    useExtendedSearch: true,
    threshold: 0.3,
    // Search in `author` and in `tags` array
    keys: ['title', 'parents']
  }

  const fuse = new Fuse(lsRes, options)

  return fuse.search(searchStr)
}



function addToSearchResults(lsMatches){
  var searchResults = document.getElementById("searchResultsTable")

  var searchStr = document.getElementById("searchTerms").value.toLowerCase()
  console.log("Search term:" + searchStr)

  tableInner = ""

  maxParents=0;
  for(i = 0; i<lsMatches.length; i++){
    if(lsMatches[i].parents.length > maxParents){
      maxParents=lsMatches[i].parents.length
    }
  }

  //Add table header up to maximum depth
  tableInner += "<tr><th>Bookmark</th>"
  for(i = 0; i < maxParents; i++){
    tableInner += "<th>" + "L" + i + "</th>"
  }
  tableInner+= "</tr>"

  for(i = 0; i<lsMatches.length; i++){
    console.log(title)
    tableInner += "<tr>"

    tableInner += "<td>"
    tableInner += "<a href='" + lsMatches[i].url + "'>" + lsMatches[i].title + "</a><br>"
    tableInner += "</td>"

    for(j = 0; j<lsMatches[i].parents.length; j++){
      if(lsMatches[i].parents[j] != ""){
        tableInner += "<td><div class='chip'>" + lsMatches[i].parents[j] +
            "<span class='closebtn'>&times;</span></div></td>"
      }
    }
    tableInner += "</tr>"
  }

  searchResults.innerHTML = tableInner
}

// Get all bookmarks and filter by search term
document.getElementById("searchBookmarksButton").onclick = function() {
  console.log("Sending message to get bookmarks")
  const handler = chrome.runtime.sendMessage({action: "get-bookmarks"})

  handler.then(function(response){
    console.log("Received bookmarks:" + response.bookmarks);

    var searchStr = document.getElementById("searchTerms").value
    lsMatches = getMatches(response.bookmarks, searchStr)
    console.log("Matches:" + lsMatches)
    addToSearchResults(lsMatches)
  },
  function(error) {
    console.log("Error: " + error)
  });
}

document.querySelector('#loadSearchResults').addEventListener("onclick", async () => {

  let tabsIds = [];

  console.log("Curr: " + lsCurrRes.length)
  for(i=0; i<lsCurrRes.length; i++){
    const tab = chrome.tabs.create({ url: lsCurrRes[i].url, active: false, selected: false })
    tabsIds.push(tab.id);
  }

  const groupId = await chrome.tabs.group({tabIds: tabsIds});
});

// Tree view control (cleanup)
var toggler = document.getElementsByClassName("caret");
var i;

for (i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("check-box");
  });
}
