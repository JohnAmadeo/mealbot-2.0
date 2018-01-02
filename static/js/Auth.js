import auth0 from 'auth0-js';
import createHistory from 'history/createBrowserHistory';
import axios from 'axios';

const history = createHistory()

export default class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: 'mealbot.auth0.com',
      clientID: 'TIkxy4xgE3b1nC3RmT0keaHnEBus3E9l',
      redirectUri: 'http://0.0.0.0:5000/callback',
      audience: 'https://mealbot.auth0.com/userinfo',
      responseType: 'token id_token',
      scope: 'openid profile email'
    });
    this.userProfile = null;
  }

  // immediately resolves if the user is now new and no user account
  // needs to be created
  createUserAccount = (profile) => {
    console.log('createUserAccount: profile.is_new_user = ' + profile.is_new_user);
    if (!profile.is_new_user) {
      return profile;
    }
    else {
      return new Promise((resolve, reject) => {
        // create new user; user ID is determined on the backend
        axios.post('/user', {
          email: profile.email
        })
        .then((response) => {
          resolve(profile);
        })
        .catch((err) => {
          reject(err);
        });
      });
    }
  }

  // resolves a user profile object that has information indicating
  // whether the user is new
  isNewUser = (profile) => {
    console.log(profile);
    return new Promise((resolve, reject) => {
      // resolve(profile);
      axios.get('/user', {
        params: {
          email: profile.email
        }
      })
      .then((response) => {
        profile.is_new_user = false;
        resolve(profile);
      })
      .catch((error) => {
        const { status, data } = error.response;
        if (status === 404 && data === 'User not found') {
          console.log('isNewUser: resolving to profile');
          profile.is_new_user = true;
          resolve(profile);
        }
        else {
          reject(error);
        }
      });
    });
  }

  getAccessToken = () => {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        throw new Error('No access token found');
      }
      return accessToken;
    }

  getUserProfile = () => {
    let accessToken = this.getAccessToken();
    return new Promise((resolve, reject) => {
      this.auth0.client.userInfo(accessToken, (err, profile) => {
        if (profile) {
          this.userProfile = profile;
          resolve(profile);
        }
        else {
          reject(err);
        }
      });
    });
  }

  getAuthTokens = () => {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        console.log('fetched auth tokens');
        if (authResult && authResult.accessToken && authResult.idToken) {
          resolve(authResult);
        }
        else {
          reject(err);
        }
      })
    });
  }

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  login = () => {
    this.auth0.authorize();
  }

  logout = (onSuccess) => {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    onSuccess();
    history.replace('/');
  }

  setSession = (authResult) => {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    return true;
    // navigate to the home route
    // history.replace('/');
  }
}
