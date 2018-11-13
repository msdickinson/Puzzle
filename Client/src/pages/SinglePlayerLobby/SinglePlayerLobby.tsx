import * as React from 'react';
import './SinglePlayerLobby.css';
import { Page } from '../../Enums'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
interface IState {

}
interface IProps {  
   onPageChange : Function
}
class SinglePlayerLobby extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
          <ul className="dList">
            <li>
              <button type="button" className="d1-btn myBtn" onClick={this.props.onPageChange.bind(this, Page.SinglePlayerGame)}>
                Easy
              </button>
            </li>
            <li>
            <button type="button" className="d2-btn myBtn" onClick={this.props.onPageChange.bind(this, Page.SinglePlayerGame)}>
              Normal
            </button>
            </li>
            <li>
            <button type="button" className="d3-btn myBtn" onClick={this.props.onPageChange.bind(this, Page.SinglePlayerGame)}>
              Hard
            </button>
            </li>
            <li>
            <button type="button" className="d4-btn myBtn" onClick={this.props.onPageChange.bind(this, Page.SinglePlayerGame)}>
              Ninja
            </button>
            </li>
          </ul>
          <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Home)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" />
        </button> 
      </React.Fragment>
    );
  }
}

export default SinglePlayerLobby;
