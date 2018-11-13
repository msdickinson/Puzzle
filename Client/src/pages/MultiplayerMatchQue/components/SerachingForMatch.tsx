import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner} from '@fortawesome/free-solid-svg-icons'
class SerachingForMatch extends React.Component {
  public render() {
    return (
      <React.Fragment>
           <div className="col-md-2">
              <FontAwesomeIcon icon={faSpinner} spin={true}  size="5x" /> 
              <h2 className="ConnectingText">Finding Players</h2>
           </div>
      </React.Fragment>
    );
  }
}

export default SerachingForMatch;
