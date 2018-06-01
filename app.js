const PORT = process.env.PORT || 3000;

const express = require('express');

const app = express();
const http = require('http').Server(app);

http.listen(PORT, () => console.log(`Listening on port ${PORT}`));

app.use((req, res, next) => {
  // Don't redirect in development
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host') + req.url}`);
  } else {
    next();
  }
});

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

app.use('/', express.static('public/'));

//Universal redirect
app.get("*", (req, res) => {
  res.redirect("/");
});