import * as React from 'react';
import './CreateAccount.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from 'src/Enums';


interface IState {

}
interface IProps {  
   onPageChange : Function,
   onCreateAccount: Function
}
class CreateAccount extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
  <div className="wrapper">
            <div className="form-signin">       
              <h2 className="form-signin-heading">Create Account</h2>
              <input type="text" className="form-control" name="email" placeholder="Email Address" required autoFocus={true} />
              <input type="text" className="form-control" name="username" placeholder="Username" required autoFocus={true} />
              <input type="password" className="form-control" name="password" placeholder="Password" required/>     
              <input type="password" className="form-control" name="passwordRepeat" placeholder="Repeat Password" required/>     
              <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.props.onPageChange.bind(this, Page.CreateAccount)}>Create Account</button>   
              <button className="btn btn-sm btn-primary btn-block" type="submit" onClick={this.props.onPageChange.bind(this, Page.Login)}>Back</button> 
            </div>
        </div>
      </React.Fragment>
    );
  }
}

export default CreateAccount;

