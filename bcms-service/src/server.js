const express = require('express');
const indexRouter = require('../routes/index');
const adminRouter = require('../routes/admin');
const Logger = require('./logger');
const app = express();

const hostname = '127.0.0.1';
const port = 3000;

app.set('views', '../views');
app.set('view engine', 'hbs');

app.use(express.static('../static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Logger.initRequestLogger(app);

app.use('/', indexRouter);
app.use('/admin', adminRouter);

app.use('*', (req, res) => {
    res.status(404).render('404', {url:req.originalUrl});
});

app.use((err, req, res, next) => {
    console.error(err.static);
    res.status(500).render('500');
})

app.listen(port, () => {
    console.log(`Server running as http://${hostname}:${port}/`);
});