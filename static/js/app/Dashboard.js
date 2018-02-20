import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import Auth from '../Auth.js';
import createHistory from 'history/createBrowserHistory';

const auth = new Auth();
const history = createHistory()

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  onLogout = () => {
    // THIS DOESN'T WORK NO MORE isLoggedIn STATE!!!!!
    auth.logout(this.props.onLogout);
  }

  render() {
    const { auth, profile } = this.props;
    console.log('Dashboard');
    console.log(this.props);
    return this.props.isLoggedIn ? (
      <div>
        <h1>Dashboard</h1>
        <div>
          {profile.email}
          <img src={profile.picture}/>
        </div>
        <Button className="btn btn-default" onClick={this.onLogout}>Log Out</Button>
      </div>
    ) : (
      <Redirect to='/'/>
    );
  }
}
