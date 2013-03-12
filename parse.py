# cleans up the text copied from imdb
# i copied and pasted the result into generate top250
# which i used to make requests to imdbapi.org

f = open('movies.txt', 'r')
lines = f.readlines()

for i in lines:
	firstPeriod = i.index(".")
	secondPeriod = i[firstPeriod+1:].index(".")
	firstParen  = i.index("(")
	print i[firstPeriod+4+secondPeriod:firstParen]
