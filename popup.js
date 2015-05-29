/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // it returns a list of tabs. but only the first one matter
    var tab = tabs[0];
    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}


function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function renderResult(resultText) {
  document.getElementById('result').textContent = resultText;
}


function getList(searchTerm, callback, errorCallback) {
  var searchUrl = 'https://api.github.com/search/repositories?q=' + encodeURIComponent(searchTerm);

  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);

  x.responseType ='json';
  x.onload = function () {
    var response = x.response;
    if (!response || !response.items || response.items.length === 0) {
      errorCallback('No response from Github');
      return;
    }

    var listName = [];
    for (i = 0; i < response.items.length; i++) {
      listName.push(response.items[i].html_url);

      var a = document.createElement('a');
      a.setAttribute('href',response.items[i].html_url);
      a.innerHTML = response.items[i].html_url;
      document.getElementsByTagName('body')[0].appendChild(a);
      var br = document.createElement('br');
      document.getElementsByTagName('body')[0].appendChild(br);
    }
    callback(listName);
  };
    x.onerror = function() {
      errorCallback('Network error.');
    };
    x.send();
}

function parse(url) {
  var parser = document.createElement('a');
  parser.href = url;

  var splitHostName = parser.hostname.split(".");

  if (splitHostName[splitHostName.length - 2] == "co") {
    return splitHostName[splitHostName.length - 3];
  } else {
    return splitHostName[splitHostName.length - 2];
  }
}

/**
 * Avoided Jquery way
 */
function allowClickableLink() {
  window.addEventListener('click',function(e){
    if(e.target.href!==undefined){
      chrome.tabs.create({url:e.target.href});
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  allowClickableLink();
  getCurrentTabUrl(function(url) {
    renderStatus('Performing parse of ' + parse(url));

    getList(parse(url), function(name) {
      renderStatus('Searchterm:' + parse(url) + '\n');
      // renderResult(name); -- not needed for now

    }, function(errorMessage) {
      renderStatus('Cannot display list. ' + errorMessage);
    });

  });
});
