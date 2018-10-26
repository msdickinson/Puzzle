
import { ClientSocket } from './ClientSocket.js';
import {
    Player, GameActive,  LogItem,  Message,
    JoinGameRequest, LeaveGameRequest, JoinRoomRequest, LeaveRoomRequest, UpdateNameRequest, SendMessageRequest, SendLogRequest,
    JoinRoomResponse,
    PlayerJoinedRoomData, PlayerLeftRoomData, UpdatePlayerNameData, SendMessageData, UpdateLogData, StartData, RoomClosedData,  GameEnded, RoomClient,
} from './dataTypes.js'
import { Resolver } from 'dns';

class ClientApplication {
    public Connector: ClientSocket;
    private Player: Player;
    private Room: RoomClient = null;
    constructor() {
        this.Player = new Player();
        this.Connector = new ClientSocket();
        this.Connector.Socket.onSocketMessage = function (e) {
            this.OnSocketMessage(e.data);
        };    
    }

    public JoinGame(name: string = null) {
        let data = new JoinGameRequest();
        data.Name = name;
        this.Connector.SendRequest("JoinGame", data);
    }
    public LeaveGame() {
        let data = new LeaveGameRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        this.Connector.SendRequest("LeaveGame", data);
    }
    public JoinRoom(roomId: string = null) {
        let data = new JoinRoomRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
  
        this.Connector.SendRequest("JoinRoom", data);
    }
    public LeaveRoom() {
        let data = new LeaveRoomRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
            this.Connector.SendRequest("JoinRoom", data);
        }
    }
    public UpdateName(name: string) {
        let data = new UpdateNameRequest();

        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        if (name != null && name.length > 0 && name.length <= 56) {
            data.Name = name;
            this.Connector.SendRequest("UpdateName", data);
        }

    }
    public SendMessage(message: string) {
        let data = new SendMessageRequest();

        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        if (message != null && message.length > 0 && message.length >= 56) {
            data.Message = message;
            this.Connector.SendRequest("SendMessage", data);
        }
    }
    public SendLog(logItems: LogItem[]) {
        let data = new SendLogRequest();
        if (this.Room != null && logItems.length > 0) {
            data.RoomId = this.Room.Id;
            data.LogItems = logItems;
            this.Connector.SendRequest("SendLog", data);
        }
    }

    public OnSocketMessage(data) {
        var socket: any = this;
        if (!data) return;

        var request = null;
        var requestData = null;
        if (data.indexOf(":") > -1) {
            request = data.split(":")[0];
            requestData = data.substring(data.indexOf(":") + 1);
            //try to phase json
            try {
                requestData = JSON.parse(requestData);
            } catch (e) { }
        } else {
            request = data;
        }


        switch (request) {
            case "JoinGame": {
                if (requestData instanceof UpdateLogData) {
                    this.Server_UpdateLog(requestData);
                }
                break;
            }
            case "Start": {
                if (requestData instanceof StartData) {
                    this.Server_Start(requestData);
                }
                break;
            }
            case "PlayerJoinedRoom": {
                if (requestData instanceof PlayerJoinedRoomData) {
                    this.Server_PlayerJoinedRoom(requestData);
                }
                break;
            }
            case "PlayerJoinedRoomResponse": {
                if (requestData instanceof JoinRoomResponse) {
                    this.Server_PlayerJoinedRoomResponse(requestData);
                }
                break;
            }
            case "PlayerLeftRoom": {
                if (requestData instanceof PlayerLeftRoomData) {
                    this.Server_PlayerLeftRoom(requestData);
                }
                break;
            }
            case "RoomClosed": {
                if (requestData instanceof RoomClosedData) {
                    this.Server_RoomClosed(requestData);
                }
                break;
            }
            case "GameEnded": {
                if (requestData instanceof GameEnded) {
                    this.Server_GameEnded(requestData);
                }
                break;
            }
            case "SendMessage": {
                if (requestData instanceof SendMessageData) {
                    this.Server_SendMessage(requestData);
                }
                break;
            }
            case "UpdatePlayerName": {
                if (requestData instanceof UpdatePlayerNameData) {
                    this.Server_UpdatePlayerName(requestData);
                }
                break;
            }
            case "JoinGameResponse": {
                if (requestData instanceof JoinGameRequest) {
                    this.Server_JoinGameResponse(requestData);
                }
                break;
            }
            default: {
                break;
            }
        }

    }
    public Server_UpdateLog(data: UpdateLogData) {

    }
    public Server_Start(data: StartData) {
        //Load In Players Seed Data

        this.Room.Active = GameActive.GameRunning;

        //Que Program To Start
    }
    public Server_PlayerJoinedRoom(data: PlayerJoinedRoomData) {
        if (this.Room != null) {
            this.Room.Players.push(data);
        }
    }
    public Server_PlayerJoinedRoomResponse(data: JoinRoomResponse) {
        this.Room = new RoomClient();
        this.Room.Id = data.RoomId;
        this.Room.Spectator = data.Spectator;
        this.Room.Active = data.Active;
        this.Room.Players = data.Players;
    }
    public Server_PlayerLeftRoom(data: PlayerLeftRoomData) {
        if (this.Room != null) {
            this.Room.Players = this.Room.Players.filter(e => e.Id != data.Id);
        }
    }
    public Server_RoomClosed(data: RoomClosedData) {
        if (this.Room != null && data.RoomId === this.Room.Id) {
            this.Room = null;
        }
    }
    public Server_GameEnded(data: GameEnded) {
        //Pause Game
        //Show Win/Lose
    }
    public Server_SendMessage(data: SendMessageData) {
        if (this.Room != null && this.Room.Messeages != null) {
            let message = new Message();
            message.messeage = data.Message;
            message.playerId = data.Id;
            this.Room.Messeages.push(message);
        }
    }  
    public Server_UpdatePlayerName(data: UpdatePlayerNameData){
        if (this.Room != null && this.Room.Players != null) {
            let player = this.Room.Players.find(e => e.Id === data.Id);
            if (player != null) {
                player.Name = data.Name;
            }
        }
    }
    public Server_JoinGameResponse(data: JoinGameRequest) {
        this.Player.Name = data.Name;
    }


}


export { ClientApplication };
