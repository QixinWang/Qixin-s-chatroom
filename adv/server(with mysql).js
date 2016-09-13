var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
/*
 var Client = require('mysql').Client;
 client = new Client('postgres://brian@localhost/dev'),
 user_database = 'user_name_mysql',
 user_table = 'user_name';
 client.user = 'root';
 client.password = 'pswd';
 client.connect();

 client.query('CREATE DATABASE'+TEST_DATABASE, function(err) {
 if (err && err.number != Client.ERROR_DB_CREATE_EXISTS) {
 throw err;
 }
 });

 client.query('USE ' + user_database);
 client.query(
 'CREATE TABLE '+user_table+
 '(id INT(11) AUTO_INCREMENT, '+
 'title VARCHAR(255), '+
 'name TEXT, '+
 'created DATETIME, '+
 'PRIMARY KEY (id))'
 );*/
/*
 var con = mysql.createConnection({
 host: "localhost",
 port: 8888,
 user: "noname",
 password: "pswd",
 database: "user_database"
 });
 con.connect(function(err){
 if(err){
 console.log('Error connecting to Db');
 console.log(err);
 return;
 }
 console.log('Connection established');
 });
 con.query('CREATE DATABASE'+con.database, function(err) {
 if (err && err.number != con.ERROR_DB_CREATE_EXISTS) {
 throw err;
 }
 });
 con.query('USE ' + con.database);
 con.query(
 'CREATE TABLE '+"user_table"+
 '(id INT(11) AUTO_INCREMENT, '+
 'title VARCHAR(255), '+
 'name TEXT, '+
 'created DATETIME, '+
 'PRIMARY KEY (id))'
 );*/





var online_num=0;
var online_user={};
var open_time = new Date();/*
 var super_user = ['user_name','Anonymous',open_time];
 con.query('INSERT INTO user_table '+'SET title = ?, name = ?, created = ?',
 super_user, function(err,res){
 if(err) throw err;

 console.log('Last insert ID:', res.insertId);

 });*/


io.on('connection', function(socket){

    socket.emit('open');  //通知客户端已连接

    //构造客户端对象
    var client= {
        socket: socket,
        name: 'Anonymous'
    }
    open_time = new Date();

    socket.on('chat message', function(msg){
        now_time = new Date();
        server_time = now_time.getTime() - open_time.getTime();

        server_h = parseInt(server_time/3600000);
        server_m = parseInt((server_time % 3600000)/60000);
        server_s = parseInt((server_time % 60000) / 1000);
        server_ms = parseInt(server_time % 1000);
        show_time = server_h.toString() + ':' + server_m + ':' + server_s +':' + server_ms;
        if (client.name == 'Anonymous')
        {
            /*con.query('SELECT * FROM user_table WHERE '+ 'name = ' + msg,function(err,rows){
             if(err) throw err;
             console.log('Data received from Db:\n');
             console.log(rows);
             });*/
            if (online_user[msg] == msg)
            {
                socket.emit('chat message',  'There is someone using this nickname, please use another one');
            }
            else {
                client.name = msg;
                online_num++;
                online_user[msg] = msg;
                /*con.query('INSERT INTO'+user_table+' '+'SET title = ?, text = ?, created = ?',
                 ['user_name',msg,now_time]);
                 */

                socket.emit('chat message', 'Your nickname is ' + msg);
                socket.broadcast.emit('chat message', show_time + ': ' + msg + ' has come into this chatroom, now online: ' + online_num);
            }
        }
        else
            io.emit('chat message', show_time + ': ' +client.name+":"+msg);
    });
    socket.on('disconnect',function(){
        online_num--;
        online_user[client.name] = false;
        socket.broadcast.emit('chat message', client.name + ' has left this chatroom, now online: ' + online_num);


    });

});

http.listen(8888, function(){
    console.log('listening on *:8888');
});

