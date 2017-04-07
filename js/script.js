/* 
 * Return base url based on language chosen.
 * 
 * All Wikimedia wikis have endpoints that follow this pattern:
 *      https://en.wikipedia.org/w/api.php      # English Wikipedia API
 *      https://nl.wikipedia.org/w/api.php      # Dutch Wikipedia API
 * 
 * For more information, visit @Link:
 *      https://www.mediawiki.org/wiki/API:Main_page#The_endpoint
 * 
 * FIXME : Better handling of exceptions
 */
function getBaseUrl(lang)
{
    try {
        switch(lang) {
            case "en":
                return "https://en.wikipedia.org/w/api.php";
                break;
            case "de": /* German */
                return "https://de.wikipedia.org/w/api.php";
                break;
            case "fr": /* French */
                return "https://fr.wikipedia.org/w/api.php";
                break;
            case "es": /* Spanish */
                return "https://es.wikipedia.org/w/api.php";
                break;
            case "no": /* Norwegian */
                return "https://no.wikipedia.org/w/api.php";
                break;
            case "el": /* Greek */
                return "https://el.wikipedia.org/w/api.php";
                break;
            case "ar": /* Arabic */
                return "https://ar.wikipedia.org/w/api.php";
                break;
            case "hi": /* Hindi */
                return "https://hi.wikipedia.org/w/api.php";
                break;
            case "th": /* Thai */
                return "https://th.wikipedia.org/w/api.php";
                break;
            case "ja": /* Japanese */
                return "https://ja.wikipedia.org/w/api.php";
                break;
            default: /* Any other language */
                throw "We are sorry! No such language is supported.";
                break;
        }
    }
    catch(exception) {
        $('#target').html(exception); 
    }
}

/* 
 * Return url in the form of
 *      https://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?
 * 
 * More information:
 * @Link: https://www.mediawiki.org/wiki/API:Main_page#A_simple_example
 * 
 */
function getRemoteUrl(lang)
{
    var baseUrl = getBaseUrl(lang);
    var remoteUrl = baseUrl.concat("?action=parse&format=json&callback=?");
    return remoteUrl;
}

/*
 * Fetches content using MediaWiki API
 * @Link: https://en.wikipedia.org/w/api.php
 */

function fetchContentFromWikipedia(title, remoteUrl)
{
    $.ajax({
        url: remoteUrl,
        data: {page: title},
        type: "GET",
        headers: { 'Api-User-Agent': 'Wikipedia_Mockup'},
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            
            /* clear target */
            $('#target').html("");
            
            /* check if there's error : missingtitle */
            if (data.error && data.error.code == "missingtitle") {
                $('#target').html("Page Doesn't Exist! Please Try Again <br><br>");
                $('#target').append("Code: " + data.error.code + "<br>");
                $('#target').append("Info: " + data.error.info + "<br>");
                return;
            }
            
            /* get the html code and parse it */
            var markup = data.parse.text["*"];
            var html_code = $('<div></div>').html(markup);
            
            /* 
             * check for redirect
             * If there's a redirect, "data" contains a <ul> with .redirectText as its class
             * .redirectText > li > a gives the title of the redirect page
             * 
             * We simply make another query with redirectName to fetch and show the content
             */
            var redirectName = html_code.find('.redirectText > li > a').text();
            if (redirectName != '') {
                fetchContentFromWikipedia(redirectName, remoteUrl);
            }
            
            /* display content */
            document.getElementById("heading").innerHTML = title; //set heading
            $('#target').html($(html_code).find('p')); // content. (.find('p') is used to show only text
        },
        error: function (errorMessage) {
            $('#target').html(errorMessage); 
        }
    });
}

/*
 * search() controls the process of fetching content from wikipedia
 */
function search()
{ 
    /* get field values */
    var title = document.getElementById("searchValue").value;
    var ele_lang = document.getElementById("lang");
    var lang = ele_lang.options[ele_lang.selectedIndex].value;
    
    /* get remote url */
    var remoteUrl = getRemoteUrl(lang);
    
    console.log(title, lang, remoteUrl); //debug
    
    /* fetch content from wikipedia */
    fetchContentFromWikipedia(title, remoteUrl);
}

