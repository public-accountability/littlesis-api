import * as api from './index';

beforeEach(() => fetch.resetMocks());

describe('qs', () =>{
  test('appends ? to strings', () => {
    expect(api.qs('foo=bar')).toEqual('?foo=bar');
  });

  test('converts object', () => {
    expect(api.qs({foo: 'bar', number: 1})).toEqual('?foo=bar&number=1');
  });

  test('returns blank string otherwise', () => {
    expect(api.qs(null)).toEqual('');
  });
  
});

describe('http requests', () => {
  test('get submits fetch get request', () => {
    fetch.mockResponseOnce(JSON.stringify({ a: '1'}));
    api.get("https://example.com", {foo: 'bar'});
    expect(fetch.mock.calls[0][0]).toEqual('https://example.com?foo=bar')
    expect(fetch.mock.calls[0][1].method).toEqual('GET');
    expect(fetch.mock.calls.length).toEqual(1)
  });

  test('post submits post with CSRF token', ()=>{
    fetch.mockResponseOnce(JSON.stringify({ a: '1'}));
    api.post("https://example.com", {foo: 'bar'});
    expect(fetch.mock.calls[0][1].method).toEqual('POST');
    expect(fetch.mock.calls[0][1].headers['X-CSRF-Token']).toEqual('abcd');
    expect(fetch.mock.calls.length).toEqual(1)
  });
});


describe('client', () =>{
  test('submits fetch with correct url', () => {
    fetch.mockResponseOnce(JSON.stringify({ a: '1'}));
    api
      .client("https://example.org")
      .get('api/entities/1')
    expect(fetch.mock.calls[0][0]).toEqual('https://example.org/api/entities/1')
  });

  test('uses littlesis.org by default', () => {
    fetch.mockResponseOnce(JSON.stringify({ a: '1'}));
    api.client()
      .get('api/entities/1')
    expect(fetch.mock.calls[0][0]).toEqual('https://littlesis.org/api/entities/1')

  })
})
