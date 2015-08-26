var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request-json');
var client = request.createClient("");

app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

// Get an OAuth token from https://www.eventbrite.com/myaccount/apps/
// Create a new app, then expand the expandy-thingy and copy out the
// 'Your personal OAuth token' value.
var EVENTBRITE_OAUTH_TOKEN = '';

// # Should look something like https://hooks.slack.com/services/.../...
var SLACK_URL = 'https://hooks.slack.com/services/...';
var SLACK_USERNAME = 'Eventbrite';
var SLACK_ICON = ':moneybag:';

function messageFromOrderInfo(orderInfo) {
  return orderInfo.email + ' ordered ' + orderInfo.attendees.length + ' ticket' + ((orderInfo.attendees.length == 1 ? '' : 's')) + ' for ' + orderInfo.costs.gross.display;
}

function sendToSlack(orderInfo, response) {
  client.post(SLACK_URL, {
    username: SLACK_USERNAME,
    text: messageFromOrderInfo(orderInfo),
    icon_emoji: SLACK_ICON
  }, function(err, res, body) {
    return response.send(res.statusCode);
  });
}

app.post('/', function(request, response) {
  var message = request.body;
  var apiUrl = message.api_url + '?token=' + EVENTBRITE_OAUTH_TOKEN + '&expand=event,event.ticket_classes,attendees';
  client.get(apiUrl, function (err, res, body) {
    if (err) {
      console.log(err);
      response.send(500);
    } else {
      sendToSlack(body, response);
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
