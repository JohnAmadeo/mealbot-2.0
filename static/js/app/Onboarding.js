import React, { Component } from 'react';
import { BrowserRouter, Route, Link, Redirect } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import { Button } from 'react-bootstrap';

import history from 'history';
import axios from 'axios';

// After onboarding, need to set isNewUser to false
class Onboarding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clubCreationSucceeded: false,
      clubID: 'abcd', // temporary dummy clubID!
      // clubID: ''
      memberState: {
        uploaded: false,
        showError: false,
        showSuccess: false,
      },
      // temporary; should be 1, use consts instead of numbers that are hard to understand
      onboardingStep: 2,
    }
  }

  onGoToNext = () => {
    const { onboardingStep, memberState } = this.state;
    switch (onboardingStep) {
      case 2:
        if (memberState.uploaded) {
          this.setState({
            onboardingStep: 3
          })
        }
        break;
    }
  }

  onUploadMembers = (files) => {
    const { clubID, memberState } = this.state;
    // From react-dropzone docs, "CSV files, for example, are reported as
    // text/plain under macOS but as application/vnd.ms-excel under Windows"
    // hence manual checking is needed and can't be offloaded to react-dropzone
    if (!this.isValidUpload(files)) {
      // communicate error state w/ UI
      console.log('Error! File uploaded is not valid');
      return;
    }

    let formData = new FormData();
    let file = files[0];
    formData.append('file', file);
    // for (var pair of formData.entries()) {
    //   console.log(pair);
    // } //.map(keyval => console.log(keyval));

    axios.post('/club/members', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: {
        'club_id': clubID
      }
    })
      .then(response => {
        this.setState({
          memberState: {
            ...memberState,
            showError: false,
            showSuccess: true,
            uploaded: true
          }
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          memberState: {
            ...memberState,
            showError: true,
            showSuccess: false,
            uploaded: false
          }
        });
      });
  }

  isValidUpload = (files) => {
    return files[0].name.endsWith('.csv') ||
      files[0].name.endsWith('.xls') ||
      files[0].name.endsWith('.xlsx');
  }

  // check if club already exists (which is fine -
  // just means the user got through club creation
  // but quit before onboarding completed)
  renderClubCreation = () => {
    return (
      <div>1</div>
    )
  }

  renderMemberUpload = () => {
    const { memberState } = this.state;
    console.log(memberState);
    return (
      <section>
        <h1>2</h1>
        <div className="dropzone">
          <Dropzone multiple={false} onDrop={this.onUploadMembers}>
            <p>Click/Drag to upload files.</p>
          </Dropzone>
        </div>
        {memberState.showError && <div>Error! Try again</div>}
        {memberState.showSuccess && <div>Upload completed</div>}
        <Button className="btn btn-default" onClick={this.onGoToNext}>Next</Button>
      </section>
    );
  }

  renderEmailTiming = () => {
    return <div><h1>3</h1></div>;
  }

  render() {
    const { onboardingStep } = this.state;
    switch(onboardingStep) {
      // create club
      case 1:
        return this.renderClubCreation();
      // upload members
      case 2:
        return this.renderMemberUpload();
      // select time of weekly emails
      case 3:
        return this.renderEmailTiming();
      // // tutorial on dashboard features
      // case 4:
      //   return renderDashboardTutorial();
    }
  }

}

export default Onboarding;
