global.fetch = require('jest-fetch-mock');

global.document = {
  "head": {
    "querySelector": (q) => ({ content: "abcd" })
  }
}
