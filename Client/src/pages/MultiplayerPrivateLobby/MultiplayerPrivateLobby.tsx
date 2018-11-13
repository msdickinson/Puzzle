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
class MultiplayerPrivateLobby extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        <span>Multiplayer Lobby</span>
        <span>Join Link: http://puzzlejs.dickinsonbros.com?roomId=1e875979-94ef-4bc2-b7f7-7277c606313e </span>
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.MultiplayerPrivateGame)}>
          Start
        </button> 
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Multiplayer)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" /> {' '} Leave Room
        </button> 
      </React.Fragment>
    );
  }
}

export default MultiplayerPrivateLobby;
