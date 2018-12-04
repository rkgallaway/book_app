'use strict';

const express = require('express');
const superagent = require('superagent');
const app = express();
const methodOverride = require('method-override');

require('dotenv').config();
const PORT = process.env.PORT;

// Set the view engine for templating
app.set('view engine', 'ejs');

//showing app where to find resources
app.use(express.static('./public'));
app.use(express.urlencoded( {extended: true} ));

// Middleware to handle PUT and DELETE requests
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// route for home view
app.get('/', getDbBooks);

// route for nav button that sends the user to the search page
app.get('/new_search', ((request, response) => {
  console.log('search route hit');
  response.render('pages/searches/new.ejs');
}));

//handler for POST request to /searches
app.get('/books/:id', getOneDbBookDetails); // load the detail view (from home page)
app.put('/books/:id', editBookDetails ) // update book (from detail page)
app.delete('/books/:id', deleteBook) // delete book (from detail page)

app.post('/searches', createSearch);
app.put('/books', saveBook);
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Database stuff
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', (err) => handleError(err) );

// Better logging:
// replaces [object Object] with real info, use as follows: util.inspect( <object> )
const util = require('util');



// ++++++++++++ MODELS ++++++++++++++++
let allBooks = [];

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.volumeInfo.title || 'No title available';
  this.isbn = info.volumeInfo.industryIdentifiers ? info.volumeInfo.industryIdentifiers[0].identifier || info.volumeInfo.industryIdentifiers[1].identifier : 'No ISBN available';
  this.image_url = info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.smallThumbnail || info.volumeInfo.imageLinks.thumbnail : placeholderImage;
  this.author = info.volumeInfo.authors ? info.volumeInfo.authors : 'No author available';
  this.description = info.volumeInfo ? info.volumeInfo.description : 'No description available';
  Book.bookshelf = 'not yet assigned';
  allBooks.push(this);
}

Book.bookshelf = 'not yet assigned';

// ++++++++++++ HANDLERS ++++++++++++++++

// Error handler
function handleError(error, response) {
  console.error(error);
  response.render('pages/error', {error: error});

}

// No API key required
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (request.body.searchRadio === 'title') { url += `+intitle:${request.body.searchTerm}&maxResults=20`; }
  if (request.body.searchRadio === 'author') { url += `+inauthor:${request.body.searchTerm}&maxResults=20`; }
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult)))
    .then(results => response.render('pages/searches/show', {searchResults: results}))
    .catch(error => handleError(error, response))
}

//loads all saved books on page load
function getDbBooks(request, response){
  let SQL = 'SELECT * from books;';
  return client.query(SQL)
    .then( (results) => {
      response.render('pages/', {showDbBooks: results.rows});
    })
    .catch( (error) => handleError(error) );

}
function getOneDbBookDetails(request, response) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then( (result) => response.render('pages/books/show', {bookObj: result.rows[0]}) )
    .catch(err => handleError(err, response));
}



//sourced template from to-do app
function saveBook(request, response) {
  let {title, isbn, image_url, author, description, bookshelf} = request.body;
  let SQL = 'INSERT INTO books(title, isbn, image_url, author, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [title, isbn, image_url, author, description, bookshelf];
  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}


function editBookDetails(request, response) {
  let SQL = `UPDATE books SET title=$1, isbn=$2, image_url=$3, author=$4, description=$5, bookshelf=$6 WHERE id=${request.params.id};`;
  let values = [
    request.body.title,
    request.body.isbn,
    request.body.image_url,
    request.body.author,
    request.body.description,
    request.body.bookshelf];
  client.query(SQL, values)
    .then( () => {
      response.redirect(`/`); 
    })
    .catch(err => handleError(err, response));
  return;
}

function deleteBook(request, response) {
  let SQL = 'DELETE FROM books WHERE id=$1;';
  let values = [request.params.id];
  return client.query(SQL, values)
    .then( () => {
      response.redirect('/');
    })
    .catch(err => handleError(err, response));
}
