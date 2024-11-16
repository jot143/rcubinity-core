import { RequestMethod } from "../server/ApiCall";

export const authApi = {
  login: {
    name: 'login',
    method: RequestMethod.POST,
    url: '/auth/login',
    domain: 'https://dummyjson.com'
  }
}


export const dummyLoginCredential = {
  username: 'emilys',
  password: 'emilyspass',
}
