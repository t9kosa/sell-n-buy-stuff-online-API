# sell-n-buy-stuff-online-API

the git code is installed to work on heruko: https://sell-n-buy-used-stuff.herokuapp.com/

if you want to use it for the localhost you have to uncommet the last part in the server.js code where it says localhost:3000 

/*LOCALHOST 3000*/
let serverInstance = null;

module.exports = {
  start: function() {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
  },
  close: function() {
    serverInstance.close();
  }
}

and comment the part above it 

/* TO ACTIVATE HEROKU 
let serverInstance = null;

module.exports = {
  start: function() {
    serverInstance = app.listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    })
  },
  close: function() {
    serverInstance.close();
  }
}
*/

