DROP TABLE IF EXISTS books;

CREATE TABLE books(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    isbn VARCHAR(255),
    image_url VARCHAR(255),
    author VARCHAR(255),
    description VARCHAR(255),
    bookshelf VARCHAR(255)
    );

INSERT INTO books (id, title, isbn, image_url, author, description, bookshelf)
Values (
1,
'How to Do Everything Kindle Fire',
9780071793605,
'http://books.google.com/books/content?id=i4E0wOgHR4QC&printsec=frontcover&img=1&zoom=5&source=gbs_api',
'Jason Rich',
'Presents information on setting up and using the Kindle Fire, covering such topics as navigating Kindle books, connecting to the Internet, listening to music, managing Facebook and Twitter accounts, and downloading apps.',
'Not assigned'
);

INSERT INTO books (id, title, isbn, image_url, author, description, bookshelf)
Values (
2,
'Boom',
8675309,
'http://books.google.com/books/content?id=i4E0wOgHR4QC&printsec=frontcover&img=1&zoom=5&source=gbs_api',
'Book Writer',
'Its fun',
'Not assigned'
);