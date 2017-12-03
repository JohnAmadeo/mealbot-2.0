import React from 'react';
import ReactDOM from 'react-dom'
import UUID from 'uuid/v4';
import Store from 'store2';
import Dropzone from 'react-dropzone';
import Request from 'react-promise';

class Main extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className='Main'>
        <Basic/>
      </div>
    )
  }
}

module.exports = Main;

class Basic extends React.Component {
  constructor() {
    super()
    this.state = { files: [] }
  }

  onDrop(files) {
    console.log(files);
    if (!isValidUpload(files)) {
      console.log('Error!!!! File uploaded is not a ".csv"');
      return;
    }

    var options = {
      method: 'POST',
      uri: '/names',
      formData: {
        file: {
          value: fs.createReadStream(files[0].name),
          options: {
            filename: files[0].name,
            contentType:'/csv'
          }
        }
      }
    }

    Request(options)


    this.setState({
      files: files
    });
  }

  isValidUpload(files) {
    return file[0].name.endsWith('.csv')
  }

  render() {
    return (
      <section>
        <div className="dropzone">
          <Dropzone multiple={false} onDrop={this.onDrop.bind(this)}>
            <p>Try dropping some files here, or click to select files to upload.</p>
          </Dropzone>
        </div>
        <aside>
          <h2>Dropped files</h2>
          <ul>
            {
              this.state.files.map(f => <li key={f.name}>{f.name} - {f.size} bytes</li>)

            }
          </ul>
        </aside>
      </section>
    );
  }
}
