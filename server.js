'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT;

// Set the view engine for templating
app.set('view engine', 'ejs');

//showing app where to find resources
app.use(express.static('./public'));
app.use(express.urlencoded( {extended: true} ));

//route for home view
app.get('/', (request, response) =>{
  response.render('pages/index.ejs');
})

//handler for POST request to /searches
app.post('/searches', createSearch);

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
let allBooks = [];

// ++++++++++++ MODELS ++++++++++++++++
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.volumeInfo.title || 'No title available';
  this.isbn = info.volumeInfo.industryIdentifiers[0].identifier || info.volumeInfo.industryIdentifiers[1].identifier || 'No ISBN available';
  this.image_url = info.volumeInfo.imageLinks.smallThumbnail|| placeholderImage;
  this.author = info.volumeInfo.authors || 'No author available';
  this.description = info.volumeInfo.description || 'No description available';

  allBooks.push(this);
}

// ++++++++++++ HANDLERS ++++++++++++++++

// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}

// No API key required
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.searchRadio === 'title') { url += `+intitle:${request.body.searchTerm}&maxResults=40`; }
  if (request.body.searchRadio === 'author') { url += `+inauthor:${request.body.searchTerm}&maxResults=40`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult)))
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    .catch(error => handleError(error, response));
}
