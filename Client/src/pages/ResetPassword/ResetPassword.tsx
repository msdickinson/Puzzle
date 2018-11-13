import * as React from 'react';
import './ResetPassword.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from 'src/Enums';


interface IState {

}
interface IProps {  
   onPageChange : Function,
   onResetPassword: Function
}
class ResetPassword extends React.Component<IProps, IState>  {
  public render() {
    return (
      <React.Fragment>
        <div className="wrapper">
            <div className="form-signin">       
              <h2 className="form-signin-heading">Reset Password</h2>
              <input type="text" className="form-control" name="username" placeholder="Email Address" required autoFocus={true} />
              <button className="btn btn-lg btn-primary btn-block"  onClick={this.props.onResetPassword.bind(this, "")}>Reset</button>   
              <button className="btn btn-sm btn-primary btn-block"  onClick={this.props.onPageChange.bind(this, Page.Login)}>Back</button> 
            </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ResetPassword;

