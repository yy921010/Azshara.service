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
