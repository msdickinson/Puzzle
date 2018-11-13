import * as React from 'react';
import './HomePage.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGamepad } from '@fortawesome/free-solid-svg-icons'
import { Page } from '../../Enums'
interface IState {

}
interface IProps {  
   onPageChange : Function
}
class HomePage extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
          <div className="col-md-2">
            <button type="button" className="w-100 btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.SinglePlayerLobby)}>
              <FontAwesomeIcon icon={faGamepad}  size="5x" /> 
            </button>
          </div>
       
          <div className="col-md-2">
            <button type="button" className="w-100 btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Multiplayer)}>
              <FontAwesomeIcon icon={faGamepad}  size="5x"/>{' '}
              <FontAwesomeIcon icon={faGamepad}  size="5x"/> 
            </button>
          </div>
      </React.Fragment>
    );
  }
}

export default HomePage;
