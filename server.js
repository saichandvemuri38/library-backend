const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = 5000;
const api = require('./routes/api')

const app = express();
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(bodyParser.json({limit: '50mb'}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// route.use('/route',route)
app.use('/api',api)
app.use(cors());
app.options('*', cors());
app.get('/',function(req,res){
res.send("Hello");
})

exports.server = app.listen(PORT,function(){
    console.log("server"+PORT);
})
