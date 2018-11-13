import * as React from 'react'
import NavBar from './components/NavBar/NavBar';
import HomePage from './pages/Home/HomePage';
import Multiplayer from './pages/Multiplayer/Multiplayer';
import MultiplayerMatchQue from './pages/MultiplayerMatchQue/MultiplayerMatchQue';
import MultiplayerGame from './pages/MultiplayerGame/MultiplayerGame';
import MultiplayerPrivateLobby from './pages/MultiplayerPrivateLobby/MultiplayerPrivateLobby';
import MultiplayerPrivateGame from './pages/MultiplayerPrivateGame/MultiplayerPrivateGame';
import MultiplayerLobby from './pages/MultiplayerLobby/MultiplayerLobby';
import SinglePlayerGame from './pages/SinglePlayerGame/SinglePlayerGame';
import SinglePlayerLobby from './pages/SinglePlayerLobby/SinglePlayerLobby';
import Ladder from './pages/Ladder/Ladder';
import HowToPlay from './pages/HowToPlay/HowToPlay';
import Login from './pages/Login/Login';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import CreateAccount from './pages/CreateAccount/CreateAccount';
import Achievements from './pages/Achievements/Achievements';
import HighScores from './pages/HighScores/HighScores';
import Loading from './pages/Loading/Loading';
import About from './pages/About/About'
import PixiJSContainer from './components/PixiJSContainer/PixiJSContainer'
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Page } from './Enums';
import { App as PuzzleApp} from "./Puzzle/App"

interface IState {
  page: Page;
  loggedIn: boolean;
  userId: string | null;
  puzzleAppLoaded: boolean;
  modeLoaded: boolean;
  pixiDivRefernce: React.RefObject<HTMLDivElement>;

}
interface IProps {}
class App extends React.Component<IProps, IState> {
  private PuzzleApp: PuzzleApp;
  constructor(props: any){
    super(props);

    this.state = {
      page: Page.Loading,
      loggedIn: false,
      userId: null,
      puzzleAppLoaded: false,
      modeLoaded: false,
      pixiDivRefernce: React.createRef<HTMLDivElement>()
    };
    let ApplicationPromise = new Promise(function (resolve, reject) {
      this.PuzzleApp = new PuzzleApp(document, resolve);
    }.bind(this));
    window['MainLoop'].setUpdate(this.PuzzleApp.Tick.bind(this.PuzzleApp)).setDraw(this.PuzzleApp.UpdateView.bind(this.PuzzleApp)).start();
    ApplicationPromise.then((res) => {
      this.setState({puzzleAppLoaded: true, page: Page.Login});
    });


  }
  public render() {
    return (
      <div className="App">
        <NavBar onPageChange={this.HandlePageChange} onLogout={this.HandleLogout} loggedIn={this.state.loggedIn}/> 
        <div className="Page">
          {this.Page()}
        </div>
        
      </div>
    );
  }
  
  public Page = () => {
    if(this.state.page === Page.Home){ 
      return <HomePage onPageChange={this.HandlePageChange}/>
    }
    else if(this.state.page === Page.SinglePlayerGame){ 
      return <SinglePlayerGame onHandlePIXIUpdateElement={this.HandlePIXIUpdateElement} pixiDivRefernce={this.state.pixiDivRefernce} onPageChange={this.HandlePageChange} />
    }
    else if(this.state.page === Page.SinglePlayerLobby){ 
      return <SinglePlayerLobby onPageChange={this.HandlePageChange}/>
    }
    else if(this.state.page === Page.Multiplayer){ 
      return <Multiplayer onPageChange={this.HandlePageChange} />
    }
    else if(this.state.page === Page.MultiplayerGame){ 
      return <MultiplayerGame onPageChange={this.HandlePageChange} />
    }
    else if(this.state.page === Page.MultiplayerLobby){ 
      return <MultiplayerLobby onPageChange={this.HandlePageChange}/>
    }
    else if(this.state.page === Page.MultiplayerPrivateLobby){ 
      return <MultiplayerPrivateLobby onPageChange={this.HandlePageChange}/>
    }
    else if(this.state.page === Page.MultiplayerPrivateGame){ 
      return <MultiplayerPrivateGame onPageChange={this.HandlePageChange}/>
    }
    else if(this.state.page === Page.Loading){ 
      return <Loading/>
    }
    else if(this.state.page === Page.HighScores){ 
      return <HighScores/>
    }
    else if(this.state.page === Page.Ladder){ 
      return <Ladder/>
    }
    else if(this.state.page === Page.HowToPlay){ 
      return <HowToPlay/>
    }
    else if(this.state.page === Page.About){ 
      return <About/>
    }
    else if(this.state.page === Page.Login){ 
      return <Login onPageChange={this.HandlePageChange} onLogin={this.HandleLogin} onGuestLogin={this.HandleGuestLogin}/>
    }
    else if(this.state.page === Page.ResetPassword){ 
      return <ResetPassword onPageChange={this.HandlePageChange} onResetPassword={this.HandleResetPassword}/>
    }
    else if(this.state.page === Page.CreateAccount){ 
      return <CreateAccount onPageChange={this.HandlePageChange} onCreateAccount={this.HandleCreateAccount}/>
    }
    else if(this.state.page === Page.Achievements){ 
      return <Achievements/>
    }
    else if(this.state.page === Page.MultiplayerMatchQue){ 
      return <MultiplayerMatchQue onPageChange={this.HandlePageChange}/>
    }
    
    else {
      return <HomePage onPageChange={this.HandlePageChange}/>
    }
  }
  public HandlePageChange = (page: Page) => {
    if(page === Page.SinglePlayerGame){
      let appModePromise = new Promise(function (resolve, reject) {
        this.setState({modeLoaded: false });
        this.PuzzleApp.Mode("SinglePlayer", resolve, reject);
      }.bind(this));


      appModePromise.then(() => {
        this.setState({page: Page.SinglePlayerGame, modeLoaded: true});
        this.PuzzleApp.UpdateView();
        this.PuzzleApp.Start();
      })

    }
    this.setState({page: page});
  }
  public HandleLogin = (email: string, password: string) => {
    this.setState({page: Page.Home, loggedIn: true});
  }
  public HandleLogout = (email: string, password: string) => {
    this.setState({page: Page.Login, loggedIn: false});
  }
  public HandleGuestLogin = () => {
    this.setState({page: Page.Home});
  }
  public HandleCreateAccount = () => {

  }
  public HandleResetPassword = () => {
   
  }
  public HandleFindMatch = (page: Page) => {
    this.setState({page: page});
  }
  public HandleCreatePrivateRoom = (page: Page) => {
    this.setState({page: page});
  }
  public HandleStartSinglePlayer = (page: Page) => {
    this.setState({page: page});
  }
  public HandleSinglePlayerUploadMatch = (page: Page) => {
    this.setState({page: page});
  }
  public HandleLeaveGame = (page: Page) => {
    this.setState({page: page});
  }

  public HandlePIXIUpdateElement = (element: HTMLDivElement) => {
    this.PuzzleApp.SetContainer(this.state.pixiDivRefernce.current);
  }
}

export default App;
