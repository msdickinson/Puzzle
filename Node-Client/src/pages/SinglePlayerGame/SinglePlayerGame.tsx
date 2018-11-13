import * as React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';


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
        <div ref={this.props.pixiDivRefernce} />
    );
  }

  componentDidMount() {
    this.props.onHandlePIXIUpdateElement();
  }
}

export default SinglePlayerGame;
