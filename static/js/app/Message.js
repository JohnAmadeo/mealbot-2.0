import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

class Message extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    console.log(this.props);
    const { emailIntro, saved, saving } = this.props;
    return (
      <div>
        <h1>Message</h1>
        <textarea className="intro" placeholder="Start typing..." defaultValue={emailIntro}/>
        <div>
          <p>Your match this week is:<br/>
          [RECIPIENT NAME]<br/>
          [MATCH NAME]<br/>
          </p>

          <p>{"Feel free to reply all in this thread for scheduling. I'm a robot, so I can only read 1's and 0's."}</p>

          <p>Blessings,<br/>
          [CLUB NAME] Meal Bot
          </p>

          <p>P.S. If you would like to unsubscribe from this, or if you are matched to the same person twice in a row, send [ADMIN NAME] an email at [ADMIN EMAIL]!</p>
        </div>
        <Button onClick={this.props.onSaveText}>{saving ? "DISABLE SAVE BUTTON" : "Save"}</Button>
        {saving && "Saving..."}
        {saved && "Saved succesfully"}
      </div>
    );
  }

}

export default Message;
