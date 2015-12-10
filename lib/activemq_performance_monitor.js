/**
 * This script was developed by Guberni and is part of Tellki's Monitoring Solution
 *
 * July, 2015
 * 
 * Version 1.0
 * 
 * DESCRIPTION: Monitor ActiveMQ Performance
 *
 * SYNTAX: node activemq_performance_monitor.js <METRIC_STATE> <HOST> <ADMIN_PORT> <BROKER> <FILTER> <USERNAME> <PASSWORD>
 * 
 * EXAMPLE: node activemq_performance_monitor.js "1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1" "10.10.2.5" "8161" "localhost" "topic1;queue2" "username" "password"
 *
 * README:
 *    <METRIC_STATE> is generated internally by Tellki and it's only used by Tellki default monitors: 1 - metric is on; 0 - metric is off
 *    <HOST> ActiveMQ ip address or hostname
 *    <ADMIN_PORT> ActiveMQ admin port
 *    <BROKER> ActiveMQ broker name
 *    <FILTER> ActiveMQ Topic/queue filter
 *    <USERNAME> ActiveMQ username
 *    <PASSWORD> ActiveMQ password
 */

var http = require('http');
 
/**
 * Metrics.
 */
var metrics = [];

// Broker
metrics.push({ id: '1769:Uptime:4',                state: false, type: 1, get: function(o) { return (o['value']['UptimeMillis'] / 1000 / 60 / 60).toFixed(2); } });
metrics.push({ id: '1770:Memory Usage:6',          state: false, type: 1, get: function(o) { return (o['value']['MemoryPercentUsage']); } });
metrics.push({ id: '1771:Store Usage:6',           state: false, type: 1, get: function(o) { return (o['value']['StorePercentUsage']); } });
metrics.push({ id: '1772:Temp Usage:6',            state: false, type: 1, get: function(o) { return (o['value']['TempPercentUsage']); } });
metrics.push({ id: '1773:Total Connections:4',     state: false, type: 1, get: function(o) { return (o['value']['TotalConnectionsCount']); } });
metrics.push({ id: '1774:Current Connections:4',   state: false, type: 1, get: function(o) { return (o['value']['CurrentConnectionsCount']); } });
metrics.push({ id: '1775:Average Message Size:4',  state: false, type: 1, get: function(o) { return (o['value']['AverageMessageSize']); } });
metrics.push({ id: '1776:Total Messages:4',        state: false, type: 1, get: function(o) { return (o['value']['TotalMessageCount']); } });
metrics.push({ id: '1777:Dequeue Messages:4',      state: false, type: 1, get: function(o) { return (o['value']['TotalDequeueCount']); } });
metrics.push({ id: '1778:Enqueue Messages:4',      state: false, type: 1, get: function(o) { return (o['value']['TotalEnqueueCount']); } });
metrics.push({ id: '1779:Total Producers:4',       state: false, type: 1, get: function(o) { return (o['value']['TotalProducerCount']); } });
metrics.push({ id: '1780:Total Consumers:4',       state: false, type: 1, get: function(o) { return (o['value']['TotalConsumerCount']); } });
metrics.push({ id: '1781:Total Queues:4',          state: false, type: 1, get: function(o) { return (o['value']['Queues'].length); } });
metrics.push({ id: '1782:Total Topics:4',          state: false, type: 1, get: function(o) { return (o['value']['Topics'].length); } });

// Queues/Topics
metrics.push({ id: '1783:Memory Usage:6',          state: false, type: 2, get: function(o) { return (o['value']['MemoryPercentUsage']); } });
metrics.push({ id: '1784:Queue Size:4',            state: false, type: 2, get: function(o) { return (o['value']['QueueSize']); } });
metrics.push({ id: '1785:Max Enqueue Time:4',      state: false, type: 2, get: function(o) { return (o['value']['MaxEnqueueTime']); } });
metrics.push({ id: '1786:Average Enqueue Time:4',  state: false, type: 2, get: function(o) { return (o['value']['AverageEnqueueTime']); } });
metrics.push({ id: '1787:Total Blocked Time:4',    state: false, type: 2, get: function(o) { return (o['value']['TotalBlockedTime']); } });
metrics.push({ id: '1788:Min Enqueue Time:4',      state: false, type: 2, get: function(o) { return (o['value']['MinEnqueueTime']); } });
metrics.push({ id: '1789:Average Blocked Time:4',  state: false, type: 2, get: function(o) { return (o['value']['AverageBlockedTime']); } });
metrics.push({ id: '1790:Blocked Sends:4',         state: false, type: 2, get: function(o) { return (o['value']['BlockedSends']); } });
metrics.push({ id: '1791:Average Message Size:4',  state: false, type: 2, get: function(o) { return (o['value']['AverageMessageSize']); } });
metrics.push({ id: '1792:Max Message Size:4',      state: false, type: 2, get: function(o) { return (o['value']['MaxMessageSize']); } });
metrics.push({ id: '1793:Enqueue Messages:4',      state: false, type: 2, get: function(o) { return (o['value']['EnqueueCount']); } });
metrics.push({ id: '1794:Forward Messages:4',      state: false, type: 2, get: function(o) { return (o['value']['ForwardCount']); } });
metrics.push({ id: '1795:Expired Messages:4',      state: false, type: 2, get: function(o) { return (o['value']['ExpiredCount']); } });
metrics.push({ id: '1796:In Flight Messages:4',    state: false, type: 2, get: function(o) { return (o['value']['InFlightCount']); } });
metrics.push({ id: '1797:Dispatch Messages:4',     state: false, type: 2, get: function(o) { return (o['value']['DispatchCount']); } });
metrics.push({ id: '1798:Dequeue Messages:4',      state: false, type: 2, get: function(o) { return (o['value']['DequeueCount']); } });
metrics.push({ id: '1799:Total Consumers:4',       state: false, type: 2, get: function(o) { return (o['value']['ConsumerCount']); } });
metrics.push({ id: '1800:Total Producers:4',       state: false, type: 2, get: function(o) { return (o['value']['ProducerCount']); } });


var RequestURLs = {
  broker : '/api/jolokia/read/org.apache.activemq:type=Broker,brokerName={BROKER_NAME}',
  object : '/api/jolokia/read/{OBJECT_NAME}'
}
 
var inputLength = 7;
 
/**
 * Entry point.
 */
(function() {
  try
  {
    monitorInput(process.argv);
  }
  catch(err)
  { 
    if(err instanceof InvalidParametersNumberError)
    {
      console.log(err.message);
      process.exit(err.code);
    }
    else if(err instanceof UnknownHostError)
    {
      console.log(err.message);
      process.exit(err.code);
    }
    else
    {
      console.log(err.message);
      process.exit(1);
    }
  }
}).call(this);

// ############################################################################
// PARSE INPUT

/**
 * Verify number of passed arguments into the script, process the passed arguments and send them to monitor execution.
 * Receive: arguments to be processed
 */
function monitorInput(args)
{
  args = args.slice(2);
  if(args.length != inputLength)
    throw new InvalidParametersNumberError();
  
  //<METRIC_STATE>
  var tokens = args[0].replace('"', '').split(',');
  for (var i = 0; i < tokens.length; i++)
    metrics[i].state = (tokens[i] === '1');
  
  //<HOST> 
  var hostname = args[1];
  
  //<PORT> 
  var port = args[2];
  if (port.length === 0)
    port = '8161';

  //<HOST> 
  var broker = args[3];

  // <FILTER>
  var arg = args[4].replace(/\"/g, '');
  var filter = arg.length === 0 ? [] : arg.split(';');

  // <USER_NAME>
  var username = args[5];
  username = username.length === 0 ? '' : username;
  username = username === '\"\"' ? '' : username;
  if(username.length === 1 && username === '\"')
    username = '';
  
  // <PASS_WORD>
  var passwd = args[6];
  passwd = passwd.length === 0 ? '' : passwd;
  passwd = passwd === '\"\"' ? '' : passwd;
  if(passwd.length === 1 && passwd === '\"')
    passwd = '';
  
  if(username === '{0}')
    username = passwd = '';

  // Create request object to be executed.
  var request = new Object()
  request.hostname = hostname;
  request.port = port;
  request.broker = broker;
  request.filter = filter;
  request.username = username;
  request.passwd = passwd;
  
  // Get metrics.
  processRequest(request);
}

// ############################################################################
// GET METRICS

/**
 * Retrieve metrics information
 * Receive: object request containing configuration
 */
function processRequest(request) 
{
  getResponse(RequestURLs.broker.replace(/\{BROKER_NAME\}/g, request.broker), request, function (data)
  {
	if (data.indexOf('javax.management.InstanceNotFoundException') !== -1)
		errorHandler(new UnknownHostError());
	
    var metricsObj = [];
    data = JSON.parse(data);
	console.log(data);
    getMetrics(data, metricsObj, 1);
    getTopicsAndQueuesMetrics(data, metricsObj, request);
  });
}

function getMetrics(data, metricsObj, type, object)
{
  for (var i = 0; i < metrics.length; i++)
  {
    if (metrics[i].state && metrics[i].type === type)
    {
      var metric = new Object();
      metric.id = metrics[i].id;
      metric.val = metrics[i].get(data);
      if (object !== undefined)
        metric.object = object;
      metricsObj.push(metric);
    }
  }
}

function getTopicsAndQueuesMetrics(data, metricsObj, request)
{
  var objects = [];
  data['value']['Queues'].forEach(function(item) {
    objects.push(item);
  });
  data['value']['Topics'].forEach(function(item) {
    objects.push(item);
  });

  var processObject = function(data)
  {
    if (data !== undefined)
    {
      data = JSON.parse(data);
      getMetrics(data, metricsObj, 2, data['value']['Name']);
    }

    if (objects.length === 0)
    {
      output(metricsObj);
    }
    else
    {
      var object = objects.pop();

      var res = object.objectName.match(/destinationName=(.*?),/);
      var objectName = res[1];

      if (match(objectName, request.filter))
        getResponse(RequestURLs.object.replace(/\{OBJECT_NAME\}/g, object.objectName), request, processObject);
      else
        processObject(undefined); // Skip current object.
    }
  }

  processObject();
}

function getResponse(path, request, callback)
{
  // Create HTTP request options.
  var options = {
    method: 'GET',
    hostname: request.hostname,
    port: request.port,
    path: path
  };

  if (request.username !== '')
    options.auth = request.username + ':' + request.passwd;

  // Do HTTP request.
  var req = http.request(options, function (res) {
    var code = res.statusCode;
    var data = '';

    if (code != 200)
    {
      if (code == 401)
      {
        errorHandler(new InvalidAuthenticationError());
      }
      else
      {
        var exception = new HTTPError();
        exception.message = 'Response error (' + code + ').';
        errorHandler(exception);
      }
    }
    
    res.setEncoding('utf8');
    
    // Receive data.
    res.on('data', function (chunk) {
      data += chunk;
    });
    
    // On HTTP request end.
    res.on('end', function (res) {
      callback(data);
    });
  });
  
  // On Error.
  req.on('error', function (e) {
    if(e.code === 'ENOTFOUND' || e.code === 'ECONNREFUSED')
      errorHandler(new UnknownHostError());
    else
      errorHandler(e);
  });

  req.end();
}

function match(matchValue, matchList)
{
  if (matchList.length === 0)
    return true;
  
  for (var i = 0; i < matchList.length; i++)
  {
    var match = matchList[i];
    
    if (matchValue.trim().toLowerCase().indexOf(match.trim().toLowerCase()) !== -1)
    {
      return true;
    }
  }
  
  return false;
}

// ############################################################################
// OUTPUT METRICS

/**
 * Send metrics to console
 * Receive: metrics list to output
 */
function output(metrics)
{
  for (var i in metrics)
  {
    var out = '';
    var metric = metrics[i];
    
    out += metric.id;
    out += '|';
    out += metric.val;
    out += '|';
    if (metric.object !== undefined)
      out += metric.object;
    out += '|';
    
    console.log(out);
  }
}

// ############################################################################
// ERROR HANDLER

/**
 * Used to handle errors of async functions
 * Receive: Error/Exception
 */
function errorHandler(err)
{
  if (err instanceof InvalidAuthenticationError)
  {
    console.log(err.message);
    process.exit(err.code);
  }
  else if (err instanceof UnknownHostError)
  {
    console.log(err.message);
    process.exit(err.code);
  }
  else if (err instanceof MetricNotFoundError)
  {
    console.log(err.message);
    process.exit(err.code);   
  }
  else
  {
    console.log(err.message);
    process.exit(1);
  }
}

// ############################################################################
// EXCEPTIONS

/**
 * Exceptions used in this script.
 */
 function InvalidAuthenticationError() {
    this.name = 'InvalidAuthenticationError';
    this.message = 'Invalid authentication.';
  this.code = 2;
}
InvalidAuthenticationError.prototype = Object.create(Error.prototype);
InvalidAuthenticationError.prototype.constructor = InvalidAuthenticationError;

function InvalidParametersNumberError() {
    this.name = 'InvalidParametersNumberError';
    this.message = 'Wrong number of parameters.';
  this.code = 3;
}
InvalidParametersNumberError.prototype = Object.create(Error.prototype);
InvalidParametersNumberError.prototype.constructor = InvalidParametersNumberError;

function UnknownHostError() {
    this.name = 'UnknownHostError';
    this.message = 'Unknown host.';
  this.code = 28;
}
UnknownHostError.prototype = Object.create(Error.prototype);
UnknownHostError.prototype.constructor = UnknownHostError;

function UnknownHostError() {
    this.name = 'UnknownBrokerError';
    this.message = 'Unknown broker.';
  this.code = 32;
}
UnknownHostError.prototype = Object.create(Error.prototype);
UnknownHostError.prototype.constructor = UnknownHostError;

function MetricNotFoundError() {
    this.name = 'MetricNotFoundError';
    this.message = '';
  this.code = 8;
}
MetricNotFoundError.prototype = Object.create(Error.prototype);
MetricNotFoundError.prototype.constructor = MetricNotFoundError;