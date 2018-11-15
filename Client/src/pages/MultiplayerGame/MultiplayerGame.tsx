import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from '../../Enums';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface IState {

}
interface IProps {  
   onPageChange : Function
}
class Multiplayer extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        <span>Multiplayer Game</span>
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Multiplayer)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" /> {' '} Exit
        </button> 
      </React.Fragment>
    );
  }
}

export default Multiplayer;
