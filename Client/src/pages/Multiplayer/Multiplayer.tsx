import * as React from 'react';
import './Multiplayer.css';
import  ServerConnecting from './components/ServerConnecting'
import  ServerError from '../../components/ServerError'
import  MainMenu from './components/MainMenu'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Page } from '../../Enums';

interface IState {

}
interface IProps {  
   onPageChange : Function
}
class Multiplayer extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        {this.Section()}
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Home)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" />
        </button> 
      </React.Fragment>
    );
  }

  public Section = () => {
    if(false){ 
      return  <ServerConnecting /> 
    }
    else if(false){ 
      return  <ServerError />
    }
    else{ 
      return <MainMenu  onPageChange={this.props.onPageChange}/>
    }
  
  } 
}

export default Multiplayer;
