import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import UUID from 'uuid/v4';
import Store from 'store2';
import Dropzone from 'react-dropzone';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import Onboarding from './Onboarding';
import Dashboard from './Dashboard';

import Auth from '../Auth.js';
import createHistory from 'history/createBrowserHistory';

const auth = new Auth();
const history = createHistory()

class Landing extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { auth } = this.props;
    return (
      <div>
        <h1>Landing Page</h1>
        <Button className="btn btn-default" onClick={auth.login}>Log In/Sign Up</Button>
      </div>
    )
  }
};

class Callback extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }

  componentWillMount() {
    this.handleAuthentication();
  }

  // Mark user as logged in and fetch user's profile information
  handleAuthentication = () => {
    if (/access_token|id_token|error/.test(this.props.location.hash)) {
      // setting up authentication upon login/sign up requires a
      // chain of asynchronous actions; hence a promise chain is used
      auth.getAuthTokens()
        .then(auth.setSession)
        .then(auth.getUserProfile)
        .then(auth.isNewUser)
        .then(auth.createUserAccount)
        .then(this.props.setProfileInfo)
        .catch(err => console.log(err));
    }
  }

  render() {
    return this.props.isLoggedIn ? (
      <Redirect to='/' />
    ) : (
      <div>Loading...</div>
    );
  }
}

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: {
        email: null,
        picture: null
      },
      isLoggedIn: auth.isAuthenticated() ? true : false,
      isNewUser: false
    }
  }

  onLogout = () => {
    this.setState({ isLoggedIn: false });
  }

  setProfileInfo = (profile) => {
    console.log('setting profile info');
    this.setState({
      profile: {
        email: profile.email,
        picture: profile.picture
      },
      isLoggedIn: true,
      // a 'new user' is a user who has signed up and not yet finished onboarding
      isNewUser: profile.is_new_user,
    });
  }

  render() {
    // opens to '/' path at first
    // if already authenticated, redirect to Dashboard component at '/dashboard'
    // if not, show Landing component. After log in/sign up, show Loading component and redirect to Dashboard component at '/dashboard' when ready

    return (
      <BrowserRouter>
        <div>
          <Route exact path='/' render={(props) => {
            if (!auth.isAuthenticated()) {
              return <Landing auth={auth} {...props} />;
            }
            else if (this.state.isNewUser) {
              return <Redirect to='/onboarding'/>;
            }
            else {
              return <Redirect to='/dashboard'/>;
            }
          }}/>
          <Route path='/onboarding' render={(props) => {
            if (this.state.isNewUser) {
              return <Onboarding auth={auth} {...props} />;
            }
            else if (auth.isAuthenticated()) {
              return <Redirect to='/dashboard'/>;
            }
            else {
              return <Redirect to='/'/>;
            }
          }}/>
          <Route path='/dashboard' render={(props) => {
            // mergedProps is the main component's state and the Route component's props merged
            const mergedProps = {...this.state, ...props};
            return <Dashboard auth={auth} {...mergedProps} onLogout={this.onLogout}/>
          }}/>
          <Route path='/callback' render={(props) => {
            const mergedProps = {...this.state, ...props};
            return <Callback auth={auth} {...mergedProps} setProfileInfo={this.setProfileInfo}/>;
          }}/>
        </div>
      </BrowserRouter>
    );
  }
};
