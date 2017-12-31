import auth0 from 'auth0-js';
import createHistory from 'history/createBrowserHistory';

const history = createHistory()

export default class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: 'mealbot.auth0.com',
      clientID: 'TIkxy4xgE3b1nC3RmT0keaHnEBus3E9l',
      redirectUri: 'http://0.0.0.0:5000/callback',
      audience: 'https://mealbot.auth0.com/userinfo',
      responseType: 'token id_token',
      scope: 'openid'
    });
  }

  handleAuthentication = (onSuccess) => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        // check if new or old user (if old user, skip onboarding)
        history.replace('/dashboard');
        console.log('auth successful');
        onSuccess();
      } else if (err) {
        history.replace('/dashboard');
        console.log(err);
      }
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
    // navigate to the home route
    history.replace('/');
  }
}
