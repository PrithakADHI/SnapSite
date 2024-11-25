const express = require('express');
const app = express();
const cors = require('cors')

const imageRoutes = require('./routes/imageRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/api/', imageRoutes);
app.use('/auth', authRoutes)

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
  });

const mongoose = require('mongoose');
const uri = process.env.DATABASE_URI;

const port = 8000

mongoose.connect(uri).then(()=>{
    console.log("Connected to MongoDB");
    app.listen(port, ()=>{
        console.log(`Listening to Port ${port}`);
    })
}).catch((e) => {
    console.error("Connection Failed. Error: ",e);
});