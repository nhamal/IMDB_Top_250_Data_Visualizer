This is a tool for visualizing IMDb's data for the movies that its users have rated the best of all time.

Outside libraries used:
	jquery
	jqueryUI
	css reset (source cited at the top of the file)

summary of files

	movies.txt: This is copied and pasted directly from imdb's top 250 page, and since it was copied from a table it contains a bunch of information besides movie title.

	parse.py: A simple python script to strip away all none-title information from each line in movies.txt

	generateTop250.js: javascript that makes a request to imdbapi.org for each movie, and puts the parts of the response that we want into a JS object.

	generateTop250.html: webpage that runs generateTop250.html

	Top250.js: This javascript file contains the JS object with all movie information so that we don't have to make 250 requests each time the page loads. It also has 3 arrays that are generated from the movies object.

	main.js: This is the script that runs the webapplication. It updates the information about the selected movies, and also runs the UI.

	index.html: Html for the webpage.

	reset.css: public domain css reset.

	style.css: stylesheet. 