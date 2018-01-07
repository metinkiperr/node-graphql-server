const { GraphQLServer } = require('graphql-yoga')
const { Graphcool } = require('graphcool-binding')

const resolvers = {
  Query: {
    feed(parent, args, ctx, info) {
      return ctx.db.query.posts({ where: { isPublished: true } }, info)
    },
  },
  Mutation: {
    createDraft(parent, { title, text }, ctx, info) {
      return ctx.db.mutation.createPost(
        // TODO remove `isPublished` in favour of default value
        { data: { title, text, isPublished: false } },
        info,
      )
    },
    publish(parent, { id }, ctx, info) {
      return ctx.db.mutation.updatePost(
        {
          where: { id },
          data: { isPublished: true },
        },
        info,
      )
    },
  },
}

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Graphcool({
      typeDefs: 'src/generated/database.graphql',
      endpoint: process.env.GRAPHCOOL_ENDPOINT,
      secret: process.env.GRAPHCOOL_SECRET,
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))
