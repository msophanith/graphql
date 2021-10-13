const { query } = require("express");
const graphql = require("graphql");
const axios = require("axios");
// const lodash = require("lodash"); //help us to find users by specific id
const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

// const users = [
//     {id: '001', firstName: 'Test', age:20},
//     {id: '002', firstName: 'Test01', age:21},
//     {id: '003', firstName: 'Test02', age:22}

// ]

const CompanyType = new GraphQLObjectType({
    name: "Company",
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        desc: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then((res) => res.data);
            },
        },
    }),
});

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/companies/${parentValue.companyId}`) //Nested users with company
                    .then((res) => res.data);
            },
        },
    }),
});

const RootQuery = new GraphQLObjectType({
    //To Store data and make it can communicate with our application
    name: "RootQueryType",
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                // return lodash.find(users, {id: args.id})
                //Find specific user in array
                return axios
                    .get(`http://localhost:3000/users/${args.id}`)
                    .then((res) => res.data);
            },
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/companies/${args.id}`)
                    .then((res) => res.data);
            },
        },
    },
});

//Using Mutation to add data, delete data, update data
const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, { firstName, age, companyId }) {
                return axios
                    .post("http://localhost:3000/users", { firstName, age, companyId })
                    .then((res) => res.data);
            },
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { id }) {
                return axios
                    .delete(`http://localhost:3000/users/${id}`)
                    .then((res) => res.data);
            },
        },
        editUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, args) {
                return axios
                    .patch(`http://localhost:3000/users/${args.id}`, args)
                    .then((res) => res.data);
            },
        },
    },
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation,
});