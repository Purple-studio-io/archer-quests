var loadedBookmarks = new Map();
var filters = [];
var inputFilter;
const AND_CHARACTER = "<";
const OR_CHARACTER = "|";

document.addEventListener("DOMContentLoaded", function() {
  inputFilter = document.getElementById("filter");
  inputFilter.focus();

  inputFilter.onkeyup = function(e) {
    if (e.keyCode == 13) {
      if (loadedBookmarks.size == 1) {
        var key = loadedBookmarks.keys().next().value;
        chrome.tabs.create({
          url: loadedBookmarks.get(key),
          active: true
        });
      }
    } else if (e.keyCode >= 46 || e.keyCode == 8) {
      loadedBookmarks = new Map();
      filters = createFilters();
      chrome.bookmarks.getTree(handleBookmarkSearch);
    }
  };

  var resultContainer = document.getElementById("result-container");

  resultContainer.addEventListener("keyup", event => {
    if (event.keyCode == 13) {
      chrome.tabs.create({
        url: loadedBookmarks.get(document.activeElement.id),
        active: true
      });
    }
  });
});

function createFilters() {
  return inputFilter.value.split(OR_CHARACTER);
}

function handleBookmarkSearch(tree) {
  document.getElementById("result").innerHTML = "";
  loadedBookmarks = new Map();
  resultBookmarks = readGoogleBookmarkTree(tree, 0);
}

function readGoogleBookmarkTree(tree, rank) {
  var result = [];
  rank = rank != null && typeof rank != "undefined" ? rank : 0;
  for (var i = 0; i < tree.length; i++) {
    if (tree[i].url != null && typeof tree[i].url != "undefined") {
      var match = false;
      var cpt = 0;
      while (cpt < filters.length && match == false) {
        if (filters[cpt] != "") {
          var andFilters = filters[cpt].split(AND_CHARACTER);
          var andMatch = true;
          var cptAndFilters = 0;
          while (cptAndFilters < andFilters.length && andMatch == true) {
            if (andFilters[cptAndFilters] != "") {
              andMatch =
                tree[i].title
                  .toUpperCase()
                  .includes(andFilters[cptAndFilters].toUpperCase()) ||
                tree[i].url
                  .toUpperCase()
                  .includes(andFilters[cptAndFilters].toUpperCase());
            }
            cptAndFilters++;
            match = andMatch;
          }
        }
        cpt++;
      }
      if (match) {
        document.getElementById("result").innerHTML += createBookmarkDiv(
          tree[i].title,
          tree[i].url,
          tree[i].id
        );
        loadedBookmarks.set(tree[i].id, tree[i].url);
      }
    } else {
      result += readGoogleBookmarkTree(tree[i].children, rank + 1);
    }
  }
  return result;
}

function createBookmarkDiv(title, url, idGoogle) {
  var imgUrl =
    "https://www.google.com/s2/favicons?domain=" +
    url.match(/:\/\/(.[^/]+)/)[1];

  return (
    "<div tabindex='0' id='" +
    idGoogle +
    "' style='border:1px solid #EEE; padding:10px;'><div><img src='" +
    imgUrl +
    "' /></div><div style='position:abolute;margin-left:20px;margin-top:-18px;'><b>" +
    title +
    "</b></div></div>"
  );
}
