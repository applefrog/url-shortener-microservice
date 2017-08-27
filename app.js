var express = require("express"),
    mongoose = require("mongoose"),
    shorturl = require("tinyurl");
    
var app = express();
var url = process.env.MONGOLAB_URI;

mongoose.Promise = global.Promise; // use default promise
mongoose.connect(url, {useMongoClient: true});

// MONGOOSE SCHEMA //
var urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String
});

var Url = mongoose.model("url", urlSchema);


// ROUTING //
app.get("/*", function(req, res) {
    
    
    var reqUrl = req.params[0];
    
    // first, find the url in db
    Url.findOne({ shortUrl: reqUrl })
        // mongoose returns null if Url.findOne is not found
        // or [] if Url.find is not found
        .then((result) => {
            if(result !== null) {
                res.json({
                    originalUrl: result.originalUrl,
                    shortUrl: result.shortUrl
                });
            }
            
            // if the given url starts with http or https and includes at least 1 . 
            if( (reqUrl.startsWith("http://") || reqUrl.startsWith("https://")) 
            && reqUrl.includes(".") ) {
                
                addUrl(reqUrl, res);
                
            } else {
                console.log("not a url")
                res.json({error: "this is not a proper url!"})
            }
            
            
        })
});

// FN //
async function addUrl(reqUrl, res) {
    try { /* DO */
        var url0 = await reqUrl;
        var url1 = await shortenUrl(reqUrl);
        
        console.log("got!");
        
        Url.create({
            originalUrl: url0,
            shortUrl: url1
        })
            .then((url) => {
                var id = url._id;
                
                Url.findById(id)
                    .then((urlObj) => {
                        res.json({
                            originalUrl: urlObj.originalUrl,
                            shortUrl: urlObj.shortUrl
                        })
                    })
            })

    }
    catch(err) { /* IF SOMETHING GOES WRONG DURING TRY */
        console.log(err);
    }
}
        
function shortenUrl(url) {
    
    return new Promise(function(resolve, reject) {
        shorturl.shorten(url, function(result) {
            console.log("short url is : " + result);
            resolve(result);
        })
        
    })
}

// SERVER START
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("SERVER STARTED!");
})