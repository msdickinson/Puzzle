import * as React from 'react';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from 'src/Enums';

interface IState {

}
interface IProps {  
   onPageChange : Function,
   onLogin : Function,
   onGuestLogin : Function
}

class Login extends React.Component<IProps, IState>  {
  public render() {
    return (
      <React.Fragment>
	  <div className="wrapper">
            <div className="form-signin">       
              <h2 className="form-signin-heading">Login</h2>
              <input type="text" className="form-control" name="email" placeholder="Email Address" required autoFocus={true} />
              <input type="password" className="form-control" name="password" placeholder="Password" required/>      
              <label className="checkbox">
                <input type="checkbox" value="remember-me" id="rememberMe" name="rememberMe"/> Remember me 
              </label>
              <button className="btn btn-lg btn-primary btn-block" type="submit" onClick={this.props.onLogin.bind(this, "", "")}>Submit</button>   
              <button className="btn btn-sm btn-primary btn-block" type="submit" onClick={this.props.onPageChange.bind(this, Page.Home)}>Play As Guest</button> 
              <div className="links">
                <a  href="#" onClick={this.props.onPageChange.bind(this, Page.CreateAccount)}>Create account</a> or <a href="#" onClick={this.props.onPageChange.bind(this, Page.ResetPassword)}>reset password</a>
              </div>
            </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Login;

