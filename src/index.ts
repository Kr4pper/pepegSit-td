import express from 'express';
import helmet from 'helmet';
import path from 'path';

const app = express();
app.use(helmet());

app.use(express.static(path.join(__dirname, '/assets')));

app.get('/', (req, res) => {
    res.redirect(302, '/td');
});

app.get('/td', (req, res) => {
    res.sendFile(__dirname + '/assets/td.html');
});

app.listen(3000, () => {
    console.log('The application is listening on port 3000!');
});
