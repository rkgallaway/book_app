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

// route for home view
app.get('/', getDbBooks);

// route for nav button that sends the user to the search page
app.get('/new_search', ((request, response) => {
  console.log('search route hit');
  response.render('pages/searches/new.ejs');
}));

// app.get('/search', (request, response) => testRenderFromDB(request, response));
// app.get('/', (request, response) => getDatabaseBooks(request, response));

//handler for POST request to /searches
app.get('/books/:id', getOneDbBookDetails); // detail view
app.post('/searches', createSearch);
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

  console.log('~~~~~~~~~~~~~~~~~~');
  // console.log('request.body: ', request.body);

  if (request.body.searchRadio === 'title') { url += `+intitle:${request.body.searchTerm}&maxResults=20`; }
  if (request.body.searchRadio === 'author') { url += `+inauthor:${request.body.searchTerm}&maxResults=20`; }

  console.log('url: ' , url);
  console.log('~~~~~~~~~~~~~~~~~~');
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
      console.log('adding books to the home page from the DB');
      // console.log(util.inspect(results.rows));
      response.render('pages/', {showDbBooks: results.rows});
    })
    .catch( (error) => handleError(error) );
}

//shows details of saved books on user click ///not working began 11 am at 11:25 need to eat
//refrenced from to-do app ---see pendingForIndex.html file for other pieces possible of code for the index.ejs file
function getOneDbBookDetails(request, response) {
  // console.log('in book detail route');
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then( (result) => response.render('pages/books/show', {bookObj: result.rows[0]}) )
    .catch(err => handleError(err, response));
}

// fill allBooks with 20 fake books //maybe useful kept for later, but not being used
function makeFakeData() {

  allBooks = [];
  const fakeBook = {
    title: 'How to Do Everything Kindle Fire',
    isbn: '9780071793605',
    image_url: 'http://books.google.com/books/content?id=i4E0wOgHR4QC&printsec=frontcover&img=1&zoom=5&source=gbs_api',
    author: [ 'Jason Rich' ],
    description: 'Presents information on setting up and using the Kindle Fire, covering such topics as navigating Kindle books, connecting to the Internet, listening to music, managing Facebook and Twitter accounts, and downloading apps.'
  }

  for (let i = 0; i < 20; i++){
    allBooks.push(fakeBook);
  }
}

function testRenderFromDB(request, response) {
  
  const SQL = 'SELECT * FROM books WHERE title= $1;';
  const values = ['How to Do Everything Kindle Fire'];
  console.log(`SQL: ${SQL}`);
  console.log(`values: ${values}`);

  client.query(SQL, values)
    .then((dbRes) => {
      console.log(`dbRes.rows[0]: ${util.inspect(dbRes.rows[0])}`);

      response.render('pages/index.ejs', {bookObj: dbRes.rows[0]});  //as is, bookObj does not exist in index.ejs on page load
    })
    // .then( () => {
    //   // render pag
    // })
    .catch( (err) => handleError(err) );

}
