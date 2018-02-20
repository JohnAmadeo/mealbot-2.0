import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import Pairings from './Pairings';
import Message from './Message';
import Settings from './Settings';

import Auth from '../Auth.js';
import createHistory from 'history/createBrowserHistory';

const auth = new Auth();
const history = createHistory()

const TABS = { pairings: 0, message: 1, settings: 2 };

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: TABS.pairings // One of ['pairings', 'message', 'settings']
    }
  }

  onLogout = () => {
    // THIS DOESN'T WORK NO MORE isLoggedIn STATE!!!!!
    auth.logout(this.props.onLogout);
  }

  onSwitchTabs = (tab) => {
    this.setState({ currentTab: TABS[tab] });
  }

  render() {
    const { auth, profile } = this.props;
    const { currentTab } = this.state;
    return this.props.isLoggedIn ? (
      <div>
        <h1>Dashboard</h1>
        <div>
          {profile.email}
          <img src={profile.picture}/>
        </div>
        <ul>
          {Object.keys(TABS).map(tab => {
            const capitalizedTab = tab.charAt(0).toUpperCase() + tab.slice(1);
            return <li key={tab}><Button onClick={this.onSwitchTabs.bind(this, tab)}>{capitalizedTab}</Button></li>
          })}
        </ul>
        <Button onClick={this.onLogout}>Log Out</Button>
        {currentTab}
        {currentTab === TABS.pairings ? <Pairings {...this.props}/> :
         currentTab === TABS.message ? <Message {...this.props}/> :
         currentTab === TABS.settings ? <Settings {...this.props}/> : "Error"}
      </div>
    ) : (
      <Redirect to='/'/>
    );
  }
}
