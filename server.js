'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express ();
const PORT = process.env.PORT || 3000;

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

// ++++++++++++ MODELS ++++++++++++++++
function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.volumeInfo.title || 'No title available';
  this.isbn = info.industryIdentifiers[0].identifier || info.industryIdentifiers[1].identifier|| 'No ISBN available';
  this.image_url = info.imageLinks.small|| placeholderImage;
  this.author = info.volumeInfo.authors || 'No author available';
  this.description = info.description || 'No description available';
}

// ++++++++++++ HANDLERS ++++++++++++++++
function newSearch(request, response) {
  response.render('pages/index');
}

// Error handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('Sorry, something went wrong');
}


// No API key required
// Console.log request.body and request.body.search
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  // console.log('hello');
  // console.log('request: ', request);
  // console.log('response: ', response);
  // console.log('request.body: ', request.body);
  // console.log('request.body: ', response.body);
  // console.log('request.body.search: ', request.body['search-term']);

  console.log('~~~~~~~~~~~~~~~~~~');
  console.log('request.body: ', request.body);
  

  if (request.body.searchRadio === 'title') { url += `+intitle:${request.body.searchTerm}`; }
  if (request.body.searchRadio === 'author') { url += `+inauthor:${request.body.searchTerm}`; }

  console.log('url: ' , url);
  console.log('~~~~~~~~~~~~~~~~~~');
  superagent.get(url)
    .then(apiResponse => {
      console.log('we got a response');
      // console.log('response: ', response);
      console.log('response:', apiResponse.body.items);
      apiResponse.body.items.map(bookResult => new Book(bookResult));

    })
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    .catch(error => handleError(error, response));
}
