/*
  This api client uses fetch.
  Assumes all responses are json.
*/
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';

const defaultBaseUrl = "https://littlesis.org";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json"
};

const defaultFetchOptions = {
  "credentials": 'same-origin',
  "headers": jsonHeaders
}

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

function getCsrfToken () {
  return document.head
		 .querySelector('meta[name="csrf-token"]')
		 .content;
}

/**
 * Converts object to query parameter string for HTTP get requests
 */
export function qs(queryParams) {
  if (isString(queryParams) && queryParams.includes('=')) {
    return `?${queryParams}`;
  }

  if (isPlainObject(queryParams)) {
    let urlSearchParams = new URLSearchParams();

    for (var key in queryParams) {
      urlSearchParams.set(key, queryParams[key]);
    }

    return '?' + urlSearchParams.toString();
  }

  return '';
};

// get() and post() take the full url as the first parameter.

export function get(url, params) {
  return fetch(url + qs(params),
	       merge(defaultFetchOptions, { "method": "GET"}))
    .then(validateResponse)
    .then(response => response.json());
}

export function post(url, data) {
  let token = getCsrfToken();
  let headers = merge(jsonHeaders, { 'X-CSRF-Token': token });

  return fetch(url, {
    "method": "POST",
    "credentials": 'same-origin',
    "headers": headers,
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
  }

  return {
    "get": (path, params) => get(toUrl(path), params),
    "post": (path, data) => post(toUrl(path), data)
  }
}
