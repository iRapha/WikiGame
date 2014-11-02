var wiki = require('./wiki.min.js');
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var visitedPages = {};
var after = require("after");

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

function getPageLinks(page, cb) {
    page.links(function(err, links) {
        if(err || !links) {
            console.log("ERROR 1: " + JSON.stringify(err));
        }
        cb(err, links);
    });
}

function visitAllLinks(pageName, cb, depth) {
    if(!depth) {
        depth = standartDepth;
    }

    console.log("PAGE = " + pageName + "\t\t\t DEPTH = " + (standartDepth - depth));

    if(visitedPages[pageName]) {
        console.log("VISITED PAGE: " + pageName + "\t\t CURRENT DEPTH: " + visitedPages[pageName].depth);

        if(visitedPages[pageName].depth > (standartDepth - depth)) {
            console.log("NEW DEPTH FOR " + pageName + "\t\t FROM " + visitedPages[pageName].depth + " TO " + (standartDepth - depth));
            visitedPages[pageName].depth = standartDepth - depth;
        } else {
            console.log("returning");
            cb();
            return;
        }
    }

    visitPage(pageName, function(err, page) {
        if(err || !page) {
            console.log("ERROR 2: " + JSON.stringify(err));
            cb();
            return;
        }

        visitedPages[pageName] = {
            "page": page,
            "depth": standartDepth - depth
        };

        console.log("VISITING: " + pageName + "\t\t\t DEPTH " + visitedPages[pageName].depth);

        getPageLinks(page, function(err, links) {
            if(err || !links) {
                console.log("ERROR 3: " + JSON.stringify(err));
                cb();
                return;
            }

            if(depth > 0) {
                next = after(links.length, cb);
                for(var i = 0; i < links.length; i++) {
                    console.log("VISITING ALL LINKS IN THE PAGE OF NAME: " + links[i]);
                    visitAllLinks(links[i], next, (depth - 1));
                }
            }else {
                console.log("#######   ########   ########\t\t\t\t\t\t\tCALLBACK BEING CALLED");
                cb();
            }
        });
    });
}

function visitPage(pageName, cb) {
    wiki.page(pageName, function(err, page) {
        cb(err, page);
    });
}

function getPageRelatedTo(query, cb) {
    wiki.search(query, 25, function(err, results, suggestion) {
        var i = Math.floor((Math.random()*26) + 1);
        wiki.page(results[i], function(err, page) {
            if(err || !page) {
                console.log("ERROR 4: " + JSON.stringify(err));
            }
            cb(err, page);
        });
    });
}



/** IGNORE
Usage

Load in library

var Wiki = require("wikijs");

Search Wikipedia for articles

/**
 * @param {string} query - The search query.
 * @param {number} limit - The number of results. (Optional: Default is 10)
 * @param {boolean} suggestion - Allow  Wikipedia to return a suggested article (Optional: Default is true)
 * @param {function} callback - Callback with parameters (error, results, suggestion)

Wiki.search("joker comics", 3, function(err, results){
    // results = ['Joker (comics)', 'Joker (comic book)', 'DC Comics']
});

Obtain random articles

/**
 * @param {number} pages - The number of random articles. (Optional: Default is 1)
 * @param {function} callback - Callback with parameters (error, results)

Wiki.random(function(err, results){
    // results = ['Star Wars']
});

Get page from article title

/**
 * @param {string} title - Article title
 * @param {boolean} autoSuggest - Allow Wikipedia to return a suggested article (Optional: Default is true
 * @param {function} callback - Callback with parameters (error, page)

Wiki.page("Batman", function(err, page){
    // page = WikiPage object for 'Batman' article
});

Search for articles by geographical coordinates

/**
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Radial search distance in meters (Optional: Default is 1km)
 * @param {function} callback - Callback with parameters (error, results)

Wiki.geoSearch(36.109,-115.178, function(err, results){
    // results = ['Las Vegas']
});

Page methods

page.html(function(err, html){
    // html of the article
});

page.content(function(err, content){
    // content of the article
});

page.summary(function(err, summary){
    // summary of the article
});

page.images(function(err, images){
    // list of image URL's in the article
});

page.references(function(err, references){
    // list of reference URL's in the article
});

/**
 * @param {number} limit - Number of results (Optional: Default is max)

page.links(function(err, links){
    // list of links in the article
});

/**
 * @param {number} limit - Number of results (Optional: Default is max)

page.categories(function(err, categories){
    // list of categories the article belongs to
});

/**
 * @param {string} category - Category to check

page.withinCategory(function(err, result){
    // result of category check
});

page.coordinates(function(err, coordinates){
    // get the geographical coordinates of the article, if any
});

page.infobox(function(err, info){
    // get a JSON object filled with data from the article's infobox
});

/**
 * @param {number} limit - Number of results (Optional: Default is max)

page.backlinks(function(err, backlinks){
    // list of backlink URL's in the article
});
*/
