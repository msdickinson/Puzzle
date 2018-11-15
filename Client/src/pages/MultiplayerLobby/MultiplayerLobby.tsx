import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Page } from '../../Enums';
interface IState {

}
interface IProps {  
   onPageChange : Function
}
class MultiplayerLobby extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        <span>Multiplayer Lobby</span>
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl">
          <FontAwesomeIcon icon={faUser}  size="2x" /> {' '} Player 1
        </button> 
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl">
          <FontAwesomeIcon icon={faUser}  size="2x" /> {' '} Player 2
        </button> 
        <span>15...</span>
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Multiplayer)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" />
        </button> 
      </React.Fragment>
    );
  }
}

export default MultiplayerLobby;
