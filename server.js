const express = require('express');
const { graphqlHTTP } = require('express-graphql');
//New version of express-graphql we use graphqlHTTP instead of expressGraphQL
const schema = require('./Schema/schema');

const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});