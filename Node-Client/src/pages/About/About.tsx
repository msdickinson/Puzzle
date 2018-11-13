import * as React from 'react';
import './About.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class About extends React.Component {
  public render() {
    return (
      <React.Fragment>
        <p>Puzzle Game</p>
        <p>Mark Dickinson</p>
        <p>Contact: marksamdickinson@gmail.com</p>
        <p>Open Source: https://github.com/msdickinson/Puzzle</p>
      </React.Fragment>
    );
  }
}

export default About;

