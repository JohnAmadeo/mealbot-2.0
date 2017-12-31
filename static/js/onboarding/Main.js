import React from 'react';
import ReactDOM from 'react-dom'
import UUID from 'uuid/v4';
import Store from 'store2';
import Dropzone from 'react-dropzone';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = { files: [] };
  }

  onDrop(files) {
    this.setState({
      files
    });
  }

  render() {
    return (
      <div className='Main'>
        Hello World!
        <Dropzone onDrop={this.onDrop.bind(this)}>
          <p>Try dropping some files here, or click to select files to upload.</p>
        </Dropzone>
      </div>
    )
  }
}

module.exports = Main;

// react-router
Next, grab the link component to link to a new location:const App = () => (
  <div>
    <nav>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
  </div>
)

Finally, render a Route to show some UI when the user visits /dashboard.const App = () => (
  <div>
    <nav>
      <Link to="/dashboard">Dashboard</Link>
    </nav>
    <div>
      <Route path="/dashboard" component={Dashboard}/>
    </div>
  </div>
)
