import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Page } from '../../Enums';

interface IState {

}
interface IProps {  
   onPageChange : Function
}
class MultiplayerPrivateGame extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        <span>Multiplayer Private Game</span>
     
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.MultiplayerPrivateLobby)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" /> {' '} Forfit
        </button> 
      </React.Fragment>
    );
  }
}

export default MultiplayerPrivateGame;
