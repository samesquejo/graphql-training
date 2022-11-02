

const express = require('express')
const { graphqlHTTP } = require('express-graphql')

const app = express()

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql')

let title = 'Sample title'


const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'MyFirstQuery',
        fields: () => ({
            title: {
                type: GraphQLString,
                resolve: () => {
                    return title
                }
            }
        })
    }),
    mutation: new GraphQLObjectType({
        name: 'MyFirstMutation',
        fields: {
            changeTitle: {
                type: GraphQLString,
                args: {
                    title: { type: GraphQLString },
                },
                resolve: (parent, args) => {
                    title = args.title
                    return title 
                }
            }
        }
    })
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true 
}))


app.listen(4000, () => {
    console.log('Server is online')
})


