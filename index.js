/*
This api client requires and implemention of fetch.
If using node, you'll have to pollyfill fetch with node-fetch or another library.

Assumes all responses are json.

*/
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';

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

export function getCsrfToken () {
  return document.head
		 .querySelector('meta[name="csrf-token"]')
		 .content;
}

export function callToken() {
  return getCsrfToken() + "!!!!";
}

/**
 * Converts object to query parameter string for HTTP get requests
 *
 * @param {String|Object} queryParams
 * @returns {String} 
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
