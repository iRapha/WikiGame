//https://www.npmjs.org/package/mediawiki-api
var mediawikiapi = require("mediawiki-api");
var wikiBot = new mediawikiapi('wikipedia.org');

var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var visitedPages = {};
var after = require("after");
var async = require("async");

var standartDepth = 6;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(process.env.PORT || 3000);

app.get("/", function (req, res) {
    getPageRelatedTo("dog", function(err, firstPage) {
        getPageRelatedTo("star wars", function(err, secondPage) {
            visitAllLinks("Cat", function() {
                res.status(200).send(JSON.stringify(visitedPages));
            });
        });
    });
});

function getPageLinks(rawPage, cb) {
    cb(
        rawPage.match(/(?:\[\[)(.*?)(?:\]\])/g)
            .map(function(str) {
                str = (str.slice(2, str.length - 2));
                if(str.indexOf('|') > -1) {
                    return str.slice(0, str.indexOf('|'));
                }
                return str;
            })
    );
}

function visitAllLinks(pageName, cb, depth) {
    if(!depth) {
        depth = standartDepth;
    }

    console.log("CURRENT PAGE = " + pageName + "\t[DEPTH = " + (standartDepth - depth) + "]");

    if(visitedPages[pageName]) {
        console.log("\tFOUND VISITED PAGE: " + pageName + "\t[CURRENT DEPTH: " + visitedPages[pageName].depth + "]");

        if(visitedPages[pageName].depth > (standartDepth - depth)) {
            console.log("\t\tNEW DEPTH FOR " + pageName + "\tFROM " + visitedPages[pageName].depth + " TO " + (standartDepth - depth));
            visitedPages[pageName].depth = standartDepth - depth;
        } else {
            console.log("\t\tNO NEW DEPTH. RETURNING.");
            cb();
            return;
        }
    }

    visitPage(pageName, function(err, page) {
        if(err || !page) {
            console.log("### ERROR 2: " + JSON.stringify(err) + ". COULDN'T VISIT PAGE " + pageName + "\t[DEPTH: " + (standartDepth - depth) + "]");
            cb();
            return;
        }

        visitedPages[pageName] = {
            "depth": standartDepth - depth
        };

        console.log("\tVISITING: " + pageName + "\t[DEPTH " + visitedPages[pageName].depth + "]");

        getPageLinks(page, function(links) {
            if(err || !links) {
                console.log("### ERROR 3: " + JSON.stringify(err));
                cb();
                return;
            }

            if(depth > 0) {
                next = after(links.length, cb);

                for(var i = 0; i < links.length; i++) {
                    console.log("\tVISITING ALL LINKS IN THE PAGE OF NAME: " + links[i] + " FOUND INSIDE " + pageName);
                    visitAllLinks(links[i], next, (depth - 1));
                }

                // async.each(links, function(link, callback) {
                //     console.log("BEING CALLED NOW ON LINK " + link);
                //     visitAllLinks(link, function() {
                //         console.log("LINK " + link + " THINKS IT'S DONE");
                //         next();
                //         callback();
                //     }, (depth - 1));
                // });

            }else {
                console.log("~ ~ CALLBACK BEING CALLED ~ ~");
                cb();
            }
        });
    });
}

function visitPage(pageName, cb) {
    wikiBot.getArticleContents(pageName)
    .on("complete", function(err, rawPage) {
        cb(err, rawPage);
    });
}

function getPageRelatedTo(query, cb) {
    wikiBot.search(query, {
        "limit": 25,
        "what": "text"
    })
    .on("complete", function(err, articles) {
        var i = Math.floor((Math.random()*25) + 1);
        (!articles) ? cb(err) : cb(false, articles[i].title);
    });
}
