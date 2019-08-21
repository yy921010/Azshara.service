'use strict';
module.exports = {
  query: {
    pageNumber: {
      type: 'string',
      require: false,
      default: '1',
    },
    pageSize: {
      type: 'string',
      require: false,
      default: '20',
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
