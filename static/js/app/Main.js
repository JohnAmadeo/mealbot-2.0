import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import UUID from 'uuid/v4';
import Store from 'store2';
import Dropzone from 'react-dropzone';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import { Button } from 'react-bootstrap';

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


class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: true
    };
  }

  onLogout = () => {
    auth.logout(() => { this.setState({ loggedIn: false }) });
  }

  render() {
    return this.state.loggedIn ? (
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
    this.state = {
      isLoggedIn: false
    };
  }

  handleAuthentication = () => {
    if (/access_token|id_token|error/.test(this.props.location.hash)) {
      auth.handleAuthentication(() => { this.setState({ isLoggedIn: true}) });
    }
  }

  render() {
    this.handleAuthentication();
    return this.state.isLoggedIn ? (
      <Redirect to='/dashboard' />
    ): (
      <div>Loading...</div>
    );
  }
}

export default class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // opens to '/' path at first
    // if already authenticated, redirect to Dashboard component at '/dashboard'
    // if not, show Landing component. After log in/sign up, show Loading component and redirect to Dashboard component at '/dashboard' when ready
    return (
      <BrowserRouter>
        <div>
          <Route exact path='/' render={(props) => {
            return auth.isAuthenticated() ?
              <Redirect to='/dashboard'/> :
              <Landing auth={auth} {...props} />;
          }}/>
          <Route path='/onboarding' render={(props) => <Onboarding auth={auth} {...props} />}/>
          <Route path='/dashboard' render={(props) => <Dashboard auth={auth} {...props} />}/>
          <Route path='/callback' render={(props) => <Callback auth={auth} {...props}/>}/>
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
