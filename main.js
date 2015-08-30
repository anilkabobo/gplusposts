var gplus = (function() {
  var gplusData, apiUrl, prevData;
  var wrapper = document.getElementById('results');

  function init(apiKey, userId) {
    apiUrl = 'https://www.googleapis.com/plus/v1/people/' + userId +
    '/activities/public?key=' + apiKey;
  }

  function getActivities(maxResults, page, callback) {
    var request = new XMLHttpRequest();
    var newUrl = apiUrl +
      (maxResults ? '&maxResults=' + maxResults : '') +
      (page ? '&pageToken=' + page : '');

    request.open('GET', newUrl, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        gplusData = JSON.parse(request.responseText);
        if (callback) {
          callback(gplusData.items);
        }
      } else {
        console.log('We reached our target server, but it returned an error');
      }
    };

    request.onerror = function() {
       console.log('There was a connection error of some sort');
    };

    request.send();
  }

  function getLastNPosts(n) {
    getActivities(n, 1, renderPosts);
  }

  function getFirstPosts() {
    function checkPosts() {
      if (!prevData || new Date(gplusData.items[0].published) <= new Date(prevData.items[0].published)) {
        prevData = gplusData;
        getActivities(100, gplusData.nextPageToken, checkPosts);
      }
      else {
        renderPosts(prevData.items);
      }
    }

    getActivities(100, null, checkPosts);
  }

  function renderPosts(data) {
    var dataLength = data.length;
    var htmlString = '';

    if(wrapper) {
      for (var i = 0; i < dataLength; i++) {
        htmlString += createOnePost(data[i]);
      };

      wrapper.innerHTML = htmlString;
    }
  }

  function createOnePost(data) {
    return '<li class="list-results-item">' + data.title +
      ' <a class="link" href="' + data.url +
      '" target="_blank">Link</a></li>';
  }

  return {
    init: init,
    getLastNPosts: getLastNPosts,
    getFirstPost: getFirstPost
  }
})();


// Initialization:
// gplus.init(YOUR_API_KEY, USER_ID);

// - Get your latest posts. Only up to 100 posts. Added just for fun.
// gplus.getLastNPosts(5);

// - Will rewrite first result. Also will take some time for making several
// requests.
// gplus.getFirstPosts();
