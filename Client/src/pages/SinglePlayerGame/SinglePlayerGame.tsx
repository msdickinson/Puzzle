import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from 'src/Enums';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


interface IState {

}
interface IProps {  
   onPageChange : Function,
   onHandlePIXIUpdateElement: Function
   pixiDivRefernce : React.RefObject<HTMLDivElement>
}
class SinglePlayerGame extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        <div ref={this.props.pixiDivRefernce} />
        <button type="button" className="btn btn-primary btn-lg ml-3 align-middl" onClick={this.props.onPageChange.bind(this, Page.SinglePlayerLobby)}>
          <FontAwesomeIcon icon={faArrowLeft}  size="2x" />
        </button> 
      </React.Fragment>
    );
  }

  componentDidMount() {
    this.props.onHandlePIXIUpdateElement();
  }
}

export default SinglePlayerGame;
