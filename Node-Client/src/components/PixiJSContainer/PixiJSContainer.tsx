import * as React from 'react';
import './PixiJSContainer.css';
import 'bootstrap/dist/css/bootstrap.min.css';
interface IState {

}
interface IProps {  
  pixiDivRefernce : React.RefObject<HTMLDivElement>,
}
class PixiJSContainer extends React.Component<IProps, IState> {
  public render() {
    return (
     <div ref={this.props.pixiDivRefernce}>
     </div>
    );
  }

}

export default PixiJSContainer;
