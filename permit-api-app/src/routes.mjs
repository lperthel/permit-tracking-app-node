fastify.route({
  method: "GET",
  url: "/permits",
  schema: {
    querystring: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          hello: { type: "string" },
        },
      },
    },
  },

  handler: function (request, reply) {
    reply.send({ hello: "world" });
  },
});
