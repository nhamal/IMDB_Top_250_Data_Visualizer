// Runs in browser to display and update data
// it has access to 4 additional variables imported in top250.js:
//   top250 (JS object with all movie data)
//   actors (list of actors that appear more then once in the list)
//   directors (list of directors)
//   genres (list of genres)


var allMovies =Object.keys(top250);

//movies currently selected with given filters
var selectedMovies;
//variables for general Info
//tuples containing movie name and runtime
var shortestRuntime;
var longestRuntime;
// used to calculate avg runtime
var totalRuntime;
var numOfSelectedWithRuntimes;


//used to draw the histogram
var histogramData;
var earliestMovie;
var mostRecentMovie;


//used to generate the top genres list
var genreTotals;
var genreTop10;

//used to draw rating pie chart
var ratedTotals;
var ratingColorKey= {
    "G": "#1EFF00",
    "PG": "#13A600",
    "PG_13": "#D47B00",
    "R" : "#E33707",
    "UNRATED" : "#B0B0B0"
}

//used to create top actors list
var actorAppearances;
var actorTop10;

//used to create top directors list
var directorAppearances;
var directorTop10;


//adds functionality to the filter menu in the topleft
//uses jqueryUI for autocomplete
function setupFilters(){
    genres.forEach(function(g){
        $("#genre-filter").append($("<option>").html(g));
    })
    //whenever a filter changes, we want update the list of movies
    $(".filter").change(filterMovies);

    // enables autocomplete, takes an object with
    // source : array to autocomplete with
    // minlength : number of chars needed to show possible options
    // select: callback function once an option has been selected
    $( "#actor-filter" ).autocomplete({
      source: actors,
      minLength: 2,
      //select lets us call filter when an actor is chosen.
      select: function( event, ui ) {
        $( "#actor-filter" ).val(ui.item.label);    
        filterMovies();
      }
    });
    $( "#director-filter" ).autocomplete({
      source: directors,
      minLength: 2,
      select: function( event, ui ) {
        $( "#director-filter" ).val(ui.item.label);
        filterMovies();
      }
    });
}

//called every time a filter changes, and once when the page loads
// iterates through the top 250 and selects all movies that match 
// the current filters. Then calls the functions that update the
// DOM to match the currently selected movies
function  filterMovies(){
    var rating   = $('#rating-filter').val();
    var genre    = $('#genre-filter').val();
    var actor    = $('#actor-filter').val();
    var director = $('#director-filter').val();
    selectedMovies=[];
    //select matching movies
    allMovies.forEach(function(m){
        if((top250[m]["rated"]===rating
            || rating === "")
        && (top250[m]["genres"].indexOf(genre) !== -1
            || genre === "")
        && (top250[m]["actors"].indexOf(actor) !== -1
            || actor === "")
        && (top250[m]["directors"].indexOf(director) !== -1
            || director === "")
            ){
            selectedMovies.push(m);
        }
    });
    //updates DOM element that lists selected movies
    refreshMovieList();
    //only call data update and display if there is atleast one movie
    //selected
    if(selectedMovies.length>0){
        refreshInformation();
        refreshInformationView();
    }
    //if there are no matchin movies, show an error 
    else{
        noMoviesSelected();
    }
}


// changes the list of movies on the left to reflect the current filters
function refreshMovieList(){
    $('#list-holder').hide();
    $("#selected-movies").html("");
    selectedMovies.forEach(function(m){
        var movie = $("<li>");
        movie.html(m);
        $("#selected-movies").append(movie);
    });
    $('#list-holder').slideDown("slow");
}

// iterates through the selected movies, and updates all of the data
// used to display information to the user.
function refreshInformation(){
    resetSelectionInfo();
    selectedMovies.forEach(function(movie){

        // runtime data
        // generate:
        // shortestruntime, longestruntime
        // totalruntime, numOfSelectedWithRuntimes
        if(top250[movie]["runtime"]!== null){
            var currentRuntime = parseInt(top250[movie]["runtime"]); 
            if(shortestRuntime === null
                || currentRuntime < parseInt(shortestRuntime[1])){
                shortestRuntime = [movie,top250[movie]["runtime"]];
            }
            if(longestRuntime === null
                || currentRuntime > parseInt(longestRuntime[1])){
                longestRuntime = [movie,top250[movie]["runtime"]];
            }
            if(totalRuntime === null){
                totalRuntime = 0;
                numOfSelectedWithRuntimes =0;
            }
            //not all movies have runtime data, so we can't divide
            //by the length of selected movies
            numOfSelectedWithRuntimes+=1;
            totalRuntime += currentRuntime;
        }

        // genre data
        // generate object genreTotals
        // genre -> int
        if(top250[movie]["genres"]!==null){
            top250[movie]["genres"].forEach(function(g){
                if(genreTotals[g]===undefined){
                    genreTotals[g]=0;
                }
                genreTotals[g]+=1;
            });
        }

        // histogram data
        // genreate histogramData
        // year -> int
        if(top250[movie]["year"]!==null){
            if(earliestMovie === null
                || earliestMovie > top250[movie]["year"]){
                earliestMovie = top250[movie]["year"];
            }
            if(mostRecentMovie === null
                || mostRecentMovie < top250[movie]["year"]){
                mostRecentMovie = top250[movie]["year"];
            }
            if(histogramData[""+top250[movie]["year"]] === undefined){
                histogramData[""+top250[movie]["year"]] = 0;
            }
            histogramData[""+top250[movie]["year"]]+=1
        }

        // rating data
        // generate ratedTotals
        // rating -> int
        if(top250[movie]["rated"]!== null){
            if(ratedTotals[top250[movie]["rated"]] === undefined){
                ratedTotals[top250[movie]["rated"]] = 0;
            }
            ratedTotals[""+top250[movie]["rated"]]+=1
        }

        // most prolific actors/directors
        // generate actorAppearances
        // actor -> int
        if(top250[movie]["actors"]!== null){
            top250[movie]["actors"].forEach(function(a){
                if(actorAppearances[a]===undefined){
                    actorAppearances[a]=0;
                }
                actorAppearances[a]+=1;
            });

        }
        // generate directorAppearances
        // director -> int
        if(top250[movie]["directors"]!== null){
            top250[movie]["directors"].forEach(function(d){
                if(directorAppearances[d]===undefined){
                    directorAppearances[d]=0;
                }
                directorAppearances[d]+=1;
            });

        }
    });

    //generating top10s for actors directors and genres
    for(var actor in actorAppearances){
        actorTop10.push([actor,actorAppearances[actor]]);
    }
    for(var director in directorAppearances){
        directorTop10.push([director,directorAppearances[director]]);
    }
    for(var genre in genreTotals){
        genreTop10.push([genre,genreTotals[genre]]);
    }    
    actorTop10=createTop10FromArray(actorTop10);
    directorTop10 = createTop10FromArray(directorTop10);
    genreTop10 = createTop10FromArray(genreTop10); 

}


// sorts an array of tuples and then takes the front 10
// if there are more than 10 elements
function createTop10FromArray(arr){
    arr.sort(function(a,b) {return b[1]-a[1];});
    if(arr.length>10){
        arr= arr.slice(0,10);
    }
    return arr;
}

// resets all of the information used to show the data for selected
// movies
function resetSelectionInfo(){
    shortestRuntime = null;
    totalRuntime = null;
    numOfSelectedWithRuntimes = null;
    longestRuntime = null;
    histogramData = {};
    earliestMovie = null;
    mostRecentMovie =null;
    genreTotals = {};
    ratedTotals ={};
    actorAppearances = {};
    directorAppearances = {};
    actorTop10 = [];
    directorTop10 =[];
    genreTop10 = [];
}

//shows the error message for when no movies are selected
function noMoviesSelected(){
    // an element must be hidden for it to be animated
    $("#data-holder").hide();
    //hide data
    $("#left-info").hide();
    $("#right-info").hide();
    //show error
    $("#none-selected").show();
    //animation
    $("#data-holder").slideDown();
}


// updates the DOM to show the newly gathered information about 
// the currently selected movies
function refreshInformationView(){
    // clear previous data display
    var left      = $("#left-info");
    var right     = $("#right-info");
    left.html("");
    right.html("");

    // an element must be hidden for it to be animated
    $("#data-holder").hide();
    // in the screen currently shows the error
    left.show();
    right.show();
    $("#none-selected").hide();

    //generate and add the genre div
    var genresDiv = $("<ul>").addClass("sub-info-box box-right").append("Genres");
    genreTop10.forEach(function(g){
        genresDiv.append($("<li>").addClass("info-div").html(g[0]+": "
            + g[1]));
    });
    right.append(genresDiv);


    //generate and add the runtime information div
    var runtimeDiv = $("<div>").addClass("sub-info-box box-right").append("Runtimes");
    var shortestruntimeDiv = $("<div>").addClass("info-div");
    var longestRuntimeDiv  = $("<div>").addClass("info-div");
    var avgRuntimeDiv      = $("<div>").addClass("info-div");
    shortestruntimeDiv.html("Shortest Runtime: "+ shortestRuntime[1]+", "+
        shortestRuntime[0]);
    longestRuntimeDiv.html("Longest Runtime: "+ longestRuntime[1]+", "+
        longestRuntime[0]);
    avgRuntimeDiv.html("Average Runtime: "+ 
        Math.round(totalRuntime/ numOfSelectedWithRuntimes) +" min")
    runtimeDiv.append(shortestruntimeDiv);
    runtimeDiv.append(longestRuntimeDiv);
    runtimeDiv.append(avgRuntimeDiv);
    right.append(runtimeDiv);


    // generate and add the histogram div
    var histogramDiv = $("<div>").addClass("sub-info-box box-left").html("Histogram<br>");
    histogramDiv.append("<canvas id='histogramCanvas'"+
        " width='200' height='220'></canvas>");
    left.append(histogramDiv);
    //function that draws a custom histogram on the canvas
    drawHistogram();

    // generate and add the ratings div
    var ratedDiv = $("<div>").addClass("sub-info-box box-left").html("Ratings<br>");
    ratedDiv.append("<canvas id='ratedCanvas'"+
        " width='200' height='220'></canvas>");
    left.append(ratedDiv);
    //function that draws a custom pie chart on the canvas
    drawRatedPieChart();


    //  generate and add the actors div
    var topActorsDiv = $("<ul>").addClass("sub-info-box box-left").append("Most Acting Appearances");
    actorTop10.forEach(function(actorIntPair){
        topActorsDiv.append($("<li>").addClass("info-div")
            .html(actorIntPair[1]+" | " +actorIntPair[0]));
    });
    left.append(topActorsDiv);

    // generate and add the directors div
    var topDirectorsDiv = $("<ul>").addClass("sub-info-box box-left").append("Most Directing Appearances");
    directorTop10.forEach(function(drectorIntPair){
        topDirectorsDiv.append($("<li>").addClass("info-div")
            .html(drectorIntPair[1]+"\t | " +drectorIntPair[0]));
    });
    left.append(topDirectorsDiv);

    // animate the transition
    $("#data-holder").slideDown();
}


// draws a pie chart on the pie chart canvas
function drawRatedPieChart(){
    var canvas = document.getElementById("ratedCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var lastEndAngle = 0;
    var keyoffset=0;
    ctx.font = "14px Arial";
    for(var rating in ratedTotals){
        var nextEndAngle = (ratedTotals[rating]/selectedMovies.length)*
            Math.PI*2+lastEndAngle;
        ctx.fillStyle= ratingColorKey[rating];
        ctx.beginPath();
        ctx.moveTo(130,120);
        ctx.arc(130,120,70,lastEndAngle,
            nextEndAngle,false);
        ctx.closePath();
        ctx.fill();
        ctx.fillText(rating, 0, keyoffset+60);
        keyoffset+= 30;
        lastEndAngle=nextEndAngle;
    }
}


// draws a histogram on the histogram canvas
function drawHistogram(){
    var canvas = document.getElementById("histogramCanvas");
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var domain = mostRecentMovie - earliestMovie;
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = "green";
    ctx.font = "16px Arial";
    for(var year in histogramData){
        drawLine(ctx,
            (parseInt(year)-earliestMovie)/domain*160+20,
            190,
            (parseInt(year)-earliestMovie)/domain*160+20,
            190 - (histogramData[year]*15));
    }
    ctx.fillText(""+earliestMovie,0,210);
    ctx.fillText(""+mostRecentMovie,160,210);
}

// used in draw histogram
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


function formatView(){
    $(document).ready(function(){
        $("#centered-container").css("margin-left",""+($(window).width()-970)/2 +"px");
        $('#list-holder').height(
            $("#movie-selector").height()-$("#filters").height()-50);
        $('#selected-movies').height(
            $("#movie-selector").height()-$("#filters").height()-50);
    });
    $(window).resize(function(){
        $("#centered-container").css("margin-left",""+($(window).width()-970)/2 +"px");
        $('#list-holder').height(
            $("#movie-selector").height()-$("#filters").height()-50);
        $('#selected-movies').height(
            $("#movie-selector").height()-$("#filters").height()-50);

    });
    $("#none-selected").hide();
    setupFilters();
}



formatView();
$(document).ready(filterMovies);