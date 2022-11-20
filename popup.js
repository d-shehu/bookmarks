
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

  var searchStr = document.getElementById("searchTerms").value.toLowerCase()

  doTokenize=false
  if( document.getElementById("searchTypeAny").checked ){
    searchStr = searchStr.replaceAll(" ", "|"); //pipe treats tokens as or
  }
  else if ( document.getElementById("searchTypeExact").checked ) {
    searchStr = '="' + searchStr + '"';
  }
  else{
    doTokenize=true
  }

  // Otherwise leave as is with spaces acting as "AND"
  console.log("Search term:" + searchStr)
  
  const options = {
    includeScore: true,
    isCaseSensitive: false,
    minMatchCharLength: 3,
    useExtendedSearch: true,
    ignoreLocation: true,
    tokenize: doTokenize,
    threshold: 0.1,
    // Search in `author` and in `tags` array
    keys: ['title', 'parents']
  };

  const fuse = new Fuse(lsRes, options);

  jsonMatches = fuse.search(searchStr);

  var lsMatches = []
  for(var iMatch = 0; iMatch < jsonMatches.length; iMatch++){
    match = jsonMatches[iMatch];
    item = match["item"]
    console.log(match)
    lsMatches.push({title: item["title"], url: item["url"], tags: item["parents"], score: match["score"]});
  }

  return lsMatches;
}



function addToSearchResults(lsMatches){
  var searchResults = document.getElementById("searchResultsTable")

  tableInner = ""

  maxTags=0;
  for(i = 0; i<lsMatches.length; i++){
    if(lsMatches[i].tags.length > maxTags){
      maxTags=lsMatches[i].tags.length-1
    }
  }

  //Add table header up to maximum depth
  tableInner += "<tr><th>Score</th><th>Bookmark</th>"
  for(i = 0; i < maxTags; i++){
    tableInner += "<th>" + "L" + i + "</th>"
  }
  tableInner+= "</tr>"

  for(i = 0; i<lsMatches.length; i++){
    tableInner += "<tr>";

    //Print score
    var score = lsMatches[i].score;
    tableInner += "<td>" + score.toFixed(3) + "</td>";
    //Print link to bookmark
    tableInner += "<td>";
    tableInner += "<a href='" + lsMatches[i].url + "'>" + lsMatches[i].title + "</a><br>";
    tableInner += "</td>";
    //Print tags
    for(j = 0; j<lsMatches[i].tags.length; j++){
      if(lsMatches[i].tags[j] != ""){
        tableInner += "<td><div class='chip'>" + lsMatches[i].tags[j] +
            "<span class='closebtn'>&times;</span></div></td>";
      }
    }
    tableInner += "</tr>";
  }

  searchResults.innerHTML = tableInner
}

// Get all bookmarks and filter by search term
document.getElementById("searchBookmarksButton").onclick = function() {
  console.log("Sending message to get bookmarks")
  const handler = chrome.runtime.sendMessage({action: "get-bookmarks"}, response => {

    var searchStr = document.getElementById("searchTerms").value
    lsMatches = getMatches(response.bookmarks, searchStr)
    //console.log("Matches:" + lsMatches)
    addToSearchResults(lsMatches)

    //Save search results
    chrome.storage.local.set({ "searchMatches": lsMatches }, function(){
      console.log("Saving last search" + lsMatches)
  });
  })
}

document.getElementById("loadSearchResults").onclick = function() {

  console.log("Load search results in tabs");
  chrome.storage.local.get(["searchMatches"], function(result) {
      console.log('Fetching last search' + result.searchMatches);

      //let tabsIds = [];

      //console.log("Curr: " + lsCurrRes.length)
      //for(i=0; i<lsCurrRes.length; i++){
      //  const tab = chrome.tabs.create({ url: lsCurrRes[i].url, active: false, selected: false })
      //  tabsIds.push(tab.id);
      //}

      //const groupId = await chrome.tabs.group({tabIds: tabsIds});
      for(var i=0; i<result.searchMatches.length; i++){
        chrome.tabs.create({
          url: result.searchMatches[i].url
        });
      }
    });
}

// Tree view control (cleanup)
var toggler = document.getElementsByClassName("caret");
var i;

for (i = 0; i < toggler.length; i++) {
  toggler[i].addEventListener("click", function() {
    this.parentElement.querySelector(".nested").classList.toggle("active");
    this.classList.toggle("check-box");
  });
}
