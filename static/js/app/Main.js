import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import UUID from 'uuid/v4';
import Store from 'store2';
import Dropzone from 'react-dropzone';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';

// import Onboarding from './Onboarding';

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

class Onboarding extends Component {

  render() {
    return (
      <h1>Onboarding</h1>
    );
  }

}

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: true
    };
  }

  onLogout = () => {
    auth.logout(() => { this.setState({ isLoggedIn: false }) });
  }

  render() {
    const { auth } = this.props;
    return this.state.isLoggedIn ? (
      <div>
        <h1>Dashboard</h1>
        <Button className="btn btn-default" onClick={this.onLogout}>Log Out</Button>
      </div>
    ) : (
      <Redirect to='/'/>
    );
  }
}

class Callback extends Component {
  constructor(props) {
    super(props);
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
      isLoggedIn: false,
      isNewUser: false
    }
  }

  setProfileInfo = (profile) => {
    this.setState({
      profile: {
        email: profile.email,
        picture: profile.picture
      },
      isLoggedIn: true,
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
          <Route path='/onboarding' render={(props) => <Onboarding auth={auth} {...props} />}/>
          <Route path='/dashboard' render={(props) => <Dashboard auth={auth} {...props} />}/>
          <Route path='/callback' render={(props) =>
            <Callback auth={auth} {...props} isLoggedIn={this.state.isLoggedIn} setProfileInfo={this.setProfileInfo}/>}
          />
        </div>
      </BrowserRouter>
    );
  }
};


// class Main extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       files: [],
//       accessToken: null
//     };
//   }
//
//   render() {
//     return (
//       <div>
//         <button type="button" className="btn btn-default">Basic</button>
//         <button type="button" className="btn btn-default">Basic</button>
//       </div>
//     )
//   }

  // onDrop(files) {
  //   this.setState({
  //     files
  //   });
  // }
  //
  // render() {
  //   return (
  //     <div className='Main'>
  //       Hello World!
  //       <Dropzone onDrop={this.onDrop.bind(this)}>
  //         <p>Try dropping some files here, or click to select files to upload.</p>
  //       </Dropzone>
  //     </div>
  //   )
  // }
// }
//
// module.exports = Main;
//
// class Basic extends React.Component {
//   constructor() {
//     super()
//     this.state = { files: [] }
//   }
//
//   onDrop(files) {
//     console.log(files);
//     if (!isValidUpload(files)) {
//       console.log('Error!!!! File uploaded is not a ".csv"');
//       return;
//     }
//
//     var options = {
//       method: 'POST',
//       uri: '/names',
//       formData: {
//         file: {
//           value: fs.createReadStream(files[0].name),
//           options: {
//             filename: files[0].name,
//             contentType:'/csv'
//           }
//         }
//       }
//     }
//
//     // Request(options)
//
//
//     this.setState({
//       files: files
//     });
//   }
//
//   isValidUpload(files) {
//     return file[0].name.endsWith('.csv')
//   }
//
//   render() {
//     return (
//       <section>
//         <div className="dropzone">
//           <Dropzone multiple={false} onDrop={this.onDrop.bind(this)}>
//             <p>Try dropping some files here, or click to select files to upload.</p>
//           </Dropzone>
//         </div>
//         <aside>
//           <h2>Dropped files</h2>
//           <ul>
//             {
//               this.state.files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)
//
//             }
//           </ul>
//         </aside>
//       </section>
//     );
//   }
// }
//
// module.exports = Main;
