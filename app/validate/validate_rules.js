'use strict';
module.exports = {
  query: {
    pageNumber: {
      type: 'string',
      required: false,
      default: '1',
    },
    pageSize: {
      type: 'string',
      required: false,
      default: '20',
    },
  },
  updateId: {
    id: {
      type: 'string',
      required: false,
    },
  },
  queryId: {
    id: {
      type: 'number',
      required: false,
    },
  },
  deleteId: {
    id: {
      type: 'string',
      required: false,
    },
  },
  actor: {
    insert: {
      name: {
        type: 'string',
        required: false,
      },
      introduce: {
        type: 'string',
        required: false,
      },
      imageId: {
        type: 'string',
        required: false,
      },
    },
  },
  video: {
    content: {
      type: 'string',
      required: false,
    },
    genreId: {
      type: 'number',
      required: false,
    },
    definitionIds: {
      type: 'string',
      required: false,
    },
    actors: {
      type: 'string',
      required: false,
    },
    pictureIds: {
      type: 'string',
      required: false,
    },
  },
  genre: {
    update: {
      name: {
        type: 'string',
        required: false,
      },
    },
  },
  definition: {
    type: {
      type: 'number',
      required: false,
    },
    url: {
      type: 'string',
      required: false,
    },
  },

};
