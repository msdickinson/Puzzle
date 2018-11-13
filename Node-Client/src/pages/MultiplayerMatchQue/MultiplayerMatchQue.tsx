import * as React from 'react';
import './MultiplayerMatchQue.css';
import  ServerError from '../../components/ServerError'
import  SerachingForMatch from './components/SerachingForMatch'
import  TimedOut from './components/TimedOut'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Page } from '../../Enums';

interface IState {

}
interface IProps {  
   onPageChange : Function
}
class MultiplayerMatchQue extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        {this.Section()}
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.Multiplayer)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" />
        </button> 
      </React.Fragment>
    );
  }

  public Section = () => {
    if(true){ 
      return  <SerachingForMatch/>
    }
    else if(true){ 
      return  <ServerError/>
    }
    else{ 
      return <TimedOut/>
    }
  
  } 
}

export default MultiplayerMatchQue;
