import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserFriends, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Page } from '../../../Enums';

interface IState {

}
interface IProps {  
   onPageChange : Function
}
class MainMenu extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
       <div className="col-md-2">
            <button onClick={this.props.onPageChange.bind(this, Page.MultiplayerMatchQue)} type="button" className="w-150 btn btn-primary btn-lg ml-3 align-middl">
              <FontAwesomeIcon icon={faSearch}  size="5x" /> {' '} <span>Find A Match</span>
            </button>
          </div>
          <div className="col-md-2">
            <button onClick={this.props.onPageChange.bind(this, Page.MultiplayerPrivateLobby)} type="button" className="w-150 btn btn-primary btn-lg ml-3 align-middl">
              <FontAwesomeIcon icon={faUserFriends}  size="5x"/>{' '} <span>Play With Freind</span>
            </button>
          </div>

      </React.Fragment>
    );
  }
}

export default MainMenu;
