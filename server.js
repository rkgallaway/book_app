'use strict';

const express = require('express')
const app = express ();
const PORT = process.env.PORT || 3000;

// Set the view engine for templating
app.set('view engine', 'ejs');

//showing app where to find resources 
app.use(express.static('./public'));

//from template
// 'use strict';

// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 4000;

// // Set the view engine for templating
// app.set('view engine', 'ejs');


// app.get('/', (request, response) => {
//     response.render('index');
//   })

//route for home view
app.get('/', (request, response) =>{
  response.render('pages/index.ejs');
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
