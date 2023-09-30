const express = require("express")
const dotenv = require ("dotenv")
dotenv.config();
const cors = require("cors")
const mongoose = require("mongoose");
const AuthenticationRoutes = require('./routes/Auth')

const port = process.env.PORT || 5001;
const app = express()
app.use(express.json())
app.use(cors())

//CONNECT MONGODB
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Connected to mongodb')
}).catch((error)=>{
    console.error(error)
})

app.get('/', (req, res)=>{
    res.send({message:"new project"})
})

app.use('/auth', AuthenticationRoutes)



app.listen(port, ()=>{
    console.log(`App is listening on ${port}`)
})