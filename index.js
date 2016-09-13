var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var online_num=0;
var online_user=[];

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
    if(err) { return console.dir(err); }

    var collection = db.collection('test');
    collection.drop();
    collection = db.collection('test');
    /*var doc1 = {'hello':'doc1'};
    var doc2 = {'hello':'doc2'};
    var lotsOfDocs = [{'hello':'doc3'}, {'hello':'doc4'}];

    collection.insert(doc1);

    collection.insert(doc2,  function(err, result) {});

    collection.insert(lotsOfDocs, function(err, result) {});*/
    var stream = collection.find({}).stream();
    stream.on("data", function(item) {console.log(item)});
    stream.on("end", function() {});

});


var info;

io.on('connection', function(socket){
    socket.emit('open');  //通知客户端已连接
    for (x in online_user)
    {
        if (online_user[x])
            socket.emit('user addin',x);
    }
    MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
        if(err) { return console.dir(err); }

        var collection = db.collection('test');
    var stream = collection.find({}).toArray(function(err,item)
    {

        for (x in item)
        {
            socket.emit('chat user', item[x].Date + ' ' + item[x].User);
            socket.emit('chat message', item[x].Msg);
        }

    });});

    var client= {
        socket: socket,
        name: 'Anonymous'
    }
    socket.on('user dup',function (msg)
    {
        if (online_user[msg] == msg)
        {
            socket.emit('user do dup',msg);
        }
        else
        {
            socket.emit('user not dup',msg);
        }


    });
    socket.on('chat message', function(msg){
        if (client.name == 'Anonymous')
        {

            if (online_user[msg] == msg)
            {
                socket.emit('chat user', new Date() + ':' + 'system');
                socket.emit('chat message', 'The nickname '+ msg + 'has been used. Try another one.');
            }
            else {
                client.name = msg;
                online_num++;
                online_user[msg] = msg;

                io.emit("user addin", msg);
                io.emit('chat user', new Date() + ':' + 'system');
                socket.emit('chat message', 'Your nickname is:' + msg + ' now online: ' + online_num);
                socket.broadcast.emit('chat message', msg + ' has come into this chatroom, now online: ' + online_num);
                MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
                    var collection = db.collection('test');
                    info = {
                        'Date': Date(),
                        'User': 'system',
                        "Msg": msg + ' has come into this chatroom, now online: ' + online_num
                    };
                    collection.insert(info);
                });
            }
        }
        else
        {
            socket.broadcast.emit('chat user',new Date() + ':' +  client.name);
            socket.emit('chat user',new Date() + ':' +  'you');
            socket.broadcast.emit('chat message', client.name + ':' + msg);
            socket.emit('chat message', 'you:'+ msg);
            MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
                var collection = db.collection('test');
                info = {'Date': Date(), 'User': client.name, "Msg": msg};
                collection.insert(info);
            });
        }

    });
    socket.on('disconnect',function() {
        if (online_user[client.name] == client.name) {
            io.emit('user leave',client.name);
            online_num--;
            online_user[client.name] = false;
            socket.broadcast.emit('chat user', new Date() + ':' + 'system');
            socket.broadcast.emit('chat message', client.name + ' has left this chatroom, now online: ' + online_num);
            MongoClient.connect("mongodb://localhost:27017/test", function(err, db) {
                var collection = db.collection('test');
            info = {'Date':Date(),'User':client.name,"Msg": client.name + ' has left this chatroom, now online: ' + online_num};
            collection.insert(info);});
        }
    });

});


http.listen(3000, function(){
    console.log('listening on *:3000');
});