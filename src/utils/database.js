const mongodb = require("mongodb"); //package
const MongoClient = mongodb.MongoClient; //package.MongoClient

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://omarabouromia:omarabouromia@cluster0.o7ijlhi.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
    .then((client) => {
      console.log("DataBase Connected!");
      callback(client);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = mongoConnect;
