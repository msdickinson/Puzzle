import * as React from 'react';
import './NavBar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from 'src/Enums';
interface IState {

}
interface IProps {  
   onPageChange : Function,
   onLogout: Function,
   loggedIn: boolean
}
class NavBar extends React.Component<IProps, IState> {
  public render() {
    return (
      <React.Fragment>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <span className="navbar-brand default">Puzzle JS</span>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav  mr-auto">
            <li className="nav-item">
              <a className="nav-link" onClick={this.props.onPageChange.bind(this, Page.HowToPlay)}>How To Play</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={this.props.onPageChange.bind(this, Page.HighScores)}>High Scores</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={this.props.onPageChange.bind(this, Page.Ladder)}>Ladder</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" onClick={this.props.onPageChange.bind(this, Page.About)}>About</a>
            </li>
          </ul>
         
          <ul className="navbar-nav  ml-auto">
            <li className="nav-item">
              {this.LoginLogout()}
            </li>
          </ul>         
        </div>
      </nav>
      </React.Fragment>
    );
  }
  public LoginLogout = () => {
   if(this.props.loggedIn){
      return <a className="nav-link" onClick={this.props.onLogout.bind(this)}>Logout</a>;
   }
   else{
      return <a className="nav-link" onClick={this.props.onPageChange.bind(this, Page.Login)}>Login</a>
   }
  } 
}

export default NavBar;
