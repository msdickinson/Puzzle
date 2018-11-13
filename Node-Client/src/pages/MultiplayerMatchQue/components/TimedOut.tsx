import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle} from '@fortawesome/free-solid-svg-icons'
class TimedOut extends React.Component {
  public render() {
    return (
      <React.Fragment>
           <div className="col-md-2">
              <FontAwesomeIcon icon={faExclamationTriangle}  size="5x" /> 
              <h2 className="ConnectingText">Server Timed Out</h2>
           </div>
      </React.Fragment>
    );
  }
}

export default TimedOut;
