/*
  This api client uses fetch.
  Assumes all responses are json.
*/
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';
import merge from 'lodash/merge';

const defaultBaseUrl = "https://littlesis.org";

function validateResponse(res) {
  if (res.status >= 200 && res.status < 300) { return res; }
  throw `response failed with status code: ${res.status}`;
};

function transformPostData(data) {
  if (isString(data)) {
    return data;
  } else if (isPlainObject(data)) {
    return JSON.stringify(data);
  } else {
    throw "Post must be a plain object or a string";
  }
}

function getCsrfToken() {
  return document.head
		 .querySelector('meta[name="csrf-token"]')
		 .content;
}

function postHeaders() {
  return {
    'Content-Type': "application/json",
    'Accept': "application/json",
    'X-CSRF-Token': getCsrfToken()
  };
}

/**
 * Converts object to query parameter string for HTTP get requests
 * Handles submission of one-dimensional arrays
 */
export function qs(queryParams) {
  if (isString(queryParams) && queryParams.includes('=')) {
    return `?${queryParams}`;
  }

  if (isPlainObject(queryParams)) {
    let urlSearchParams = new URLSearchParams();

    for (var key in queryParams) {
      let val = queryParams[key];

      if (isArray(val)) {
        let arrayKey = key + "[]";
        val.forEach(v => urlSearchParams.append(arrayKey, v));
      } else {
        urlSearchParams.set(key, val);
      }
    }

    return '?' + urlSearchParams.toString();
  }

  return '';
};

const getFetchOptions = {
  'method': "GET",
  'credentials': "same-origin",
  'headers': { "Accept": "application/json" }
};

// get() and post() take the full url as the first parameter.

export function get(url, params) {
  return fetch(url + qs(params), getFetchOptions)
    .then(validateResponse)
    .then(response => response.json());
}

export function post(url, data) {
  return fetch(url, {
    "method": "POST",
    "credentials": 'same-origin',
    "headers": postHeaders(),
    "body": transformPostData(data)
  })
    .then(validateResponse)
    .then(response => response.json());
}

// Creates an object with versions get() and post() that accept
// a relative path (i.e. /api/entities/123) using/ the `baseUrl`
//
//   client("https://example.com").get("/foo/bar")
//   is equivalent to get("https://example.com/foo/bar")
//
// baseUrl defaults to LittleSis.org
export function client(baseUrl) {
  const toUrl = path => {
    let url = new URL(baseUrl || defaultBaseUrl);
    url.pathname = path;
    return url.toString();    
  };

  return {
    "get": (path, params) => get(toUrl(path), params),
    "post": (path, data) => post(toUrl(path), data)
  };
}
