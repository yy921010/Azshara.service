'use strict';
module.exports = {
  query: {
    pageNumber: {
      type: 'string',
      require: false,
    },
    pageSize: {
      type: 'string',
      require: false,
    },
  },
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
};
