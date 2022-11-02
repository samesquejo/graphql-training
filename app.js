const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLList,
    GraphQLInt,
    GraphQLString
} = require('graphql')
const app = express()
const port = 4000
const path = require('path')

let books = require(path.resolve(__dirname, 'data/books.json')) 
const authors = require(path.resolve(__dirname, 'data/authors.json'))

const BookType = new GraphQLObjectType({
    name: 'BookType',
    description: 'Book details',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        authorId: { type: GraphQLInt },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find( authors => authors.id === book.authorId )
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'AuthorType',
    description: 'Author details',
    fields: () => ({
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => books.filter( book => book.authorId === author.id )
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'RootQueryType',
    description: 'Root Query',
    fields: () => ({
        getAllBooks: {
            type: new GraphQLList(BookType),
            description: 'List of all Books',
            resolve: () => books
        },
        getOneBook: {
            type: BookType,
            description: 'Fetch single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find( book => book.id === args.id)
        },
        getAllAuthors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all Authors',
            resolve: () => authors
        },
        getOneAuthor: {
            type: AuthorType,
            description: 'Fetch single author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find( author => author.id === args.id)
        },
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        createBook: {
            type: BookType,
            args: {
                name: { type: GraphQLString },
                authorId: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        updateBook: {
            type: BookType,
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString },
                authorId: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                const bookData = {
                    name: args.name,
                    authorId: args.authorId
                }
                books = books.map( book => {
                    if (book.id == args.id) {
                        return {
                            ...book,
                            ...bookData
                        }
                    }
                    return book
                })
                return bookData
            }
        },
        deleteBook: {
            type: BookType,
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                const bookKey = books.findIndex( book => book.id === args.id )
                books.splice(bookKey, 1)

                return 1
            }
        }
    }
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
}))

app.listen(port, () => {
    console.log('Server is running')
})