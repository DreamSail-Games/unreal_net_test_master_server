var express 			= require('express');
var app 				= express();
var gameServerArray 	= new Array();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');




app.get('/', function(request, response) 
{
	response.send("test");
});



app.get('/list-server', function(request, response) 
{
	response.send( JSON.stringify(gameServerArray) );
});





app.post('/join-server', function(request, response) 
{
	var serverToJoin = "";
	
	if(gameServerArray.length > 0)
	{
		serverToJoin = JSON.stringify(gameServerArray[0])
	}
	
	response.send( serverToJoin );
});




app.post('/game-server-heartbeat', function(request, response) 
{
	//TODO: Game servers should have a private key that the master server has a public key version of.
	//When getting a heartbeat check that the heartbeat is properly signed by a trusted Game Server private key.
	
	var jsonString = '';
	
	request.on('data', 
		function(data)
		{
			jsonString = data;
		}
	);
	
	request.on('end', 
		function () 
		{
			var newServerObj 					 = JSON.parse(jsonString);
			newServerObj.lastHeartbeatTimestamp = Date.now();
			newServerObj.httpHeaderIp			= request.connection.remoteAddress;
			
			var isNewServer = true;
			for(var i=0; i < gameServerArray.length; i++)
			{
				var prevServerObj = gameServerArray[i];
				if(prevServerObj.ip == newServerObj.ip)
				{
					prevServerObj.lastHeartbeatTimestamp = Date.now();
					isNewServer = false;
					break;
				}
			}
			
			
			if(isNewServer)
			{
				gameServerArray.push(newServerObj);
			}
			
			response.send("Server Heartbeat received: " + newServerObj.lastHeartbeatTimestamp + " " + newServerObj.ip + " port: " + newServerObj.port);
		}
	);
	
});




app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


