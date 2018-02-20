import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import Pairings from './Pairings';
import Message from './Message';
import Settings from './Settings';

import axios from 'axios';
import Auth from '../Auth.js';
import createHistory from 'history/createBrowserHistory';

const auth = new Auth();
const history = createHistory()

const TABS = { pairings: 0, message: 1, settings: 2 };

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: TABS.pairings, // One of ['pairings', 'message', 'settings']
      message: {
        emailIntro: 'temporary intro',
        saving: false,
        saved: false
      }
    }
  }

  onLogout = () => {
    // THIS DOESN'T WORK NO MORE isLoggedIn STATE!!!!!
    auth.logout(this.props.onLogout);
  }

  onSwitchTabs = (tab) => {
    this.setState({ currentTab: TABS[tab] });
  }

  onSaveText = () => {
    const textBox = document.querySelector('textarea');
    const { message } = this.state;
    this.setState({ message: { ...message, emailIntro: textBox.value, saving: true } });

    axios.post('/club/email_intro', {
      emailIntro: textBox.value,
      clubID: 'abcd'
    })
    .then(() => {
      this.setState({ message: { ...message, saved: true, saving: false } });
      setTimeout(() => {
        this.setState({ message: { ...message, saved: false } });
      }, 2000);
    })
    .catch(err => console.log(err));
  }

  // PROFILE AND EMAIL ARE NULL IF YOU RELOAD PAGE (i.e log in, and then reload / close + open tab)
  render() {
    const { auth, profile } = this.props;
    const { currentTab } = this.state;
    const mergedProps = {...this.state, ...this.props};
    const messageProps = {...this.state.message, ...this.props};
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
        {currentTab === TABS.pairings ? <Pairings {...mergedProps}/> :
         currentTab === TABS.message ? <Message {...messageProps} onSaveText={this.onSaveText}/> :
         currentTab === TABS.settings ? <Settings {...mergedProps}/> : "Error"}
      </div>
    ) : (
      <Redirect to='/'/>
    );
  }
}
