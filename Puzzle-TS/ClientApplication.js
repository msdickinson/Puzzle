"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ClientSocket_js_1 = require("./ClientSocket.js");
const dataTypes_js_1 = require("./dataTypes.js");
class ClientApplication {
    constructor() {
        this.Room = null;
        this.Player = new dataTypes_js_1.Player();
        this.Connector = new ClientSocket_js_1.ClientSocket();
        this.Connector.Socket.onSocketMessage = function (e) {
            this.OnSocketMessage(e.data);
        };
    }
    JoinGame(name = null) {
        let data = new dataTypes_js_1.JoinGameRequest();
        data.Name = name;
        this.Connector.SendRequest("JoinGame", data);
    }
    LeaveGame() {
        let data = new dataTypes_js_1.LeaveGameRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        this.Connector.SendRequest("LeaveGame", data);
    }
    JoinRoom(roomId = null) {
        let data = new dataTypes_js_1.JoinRoomRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        this.Connector.SendRequest("JoinRoom", data);
    }
    LeaveRoom() {
        let data = new dataTypes_js_1.LeaveRoomRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
            this.Connector.SendRequest("JoinRoom", data);
        }
    }
    UpdateName(name) {
        let data = new dataTypes_js_1.UpdateNameRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        if (name != null && name.length > 0 && name.length <= 56) {
            data.Name = name;
            this.Connector.SendRequest("UpdateName", data);
        }
    }
    SendMessage(message) {
        let data = new dataTypes_js_1.SendMessageRequest();
        if (this.Room != null) {
            data.RoomId = this.Room.Id;
        }
        if (message != null && message.length > 0 && message.length >= 56) {
            data.Message = message;
            this.Connector.SendRequest("SendMessage", data);
        }
    }
    SendLog(logItems) {
        let data = new dataTypes_js_1.SendLogRequest();
        if (this.Room != null && logItems.length > 0) {
            data.RoomId = this.Room.Id;
            data.LogItems = logItems;
            this.Connector.SendRequest("SendLog", data);
        }
    }
    OnSocketMessage(data) {
        var socket = this;
        if (!data)
            return;
        var request = null;
        var requestData = null;
        if (data.indexOf(":") > -1) {
            request = data.split(":")[0];
            requestData = data.substring(data.indexOf(":") + 1);
            //try to phase json
            try {
                requestData = JSON.parse(requestData);
            }
            catch (e) { }
        }
        else {
            request = data;
        }
        switch (request) {
            case "JoinGame": {
                if (requestData instanceof dataTypes_js_1.UpdateLogData) {
                    this.Server_UpdateLog(requestData);
                }
                break;
            }
            case "Start": {
                if (requestData instanceof dataTypes_js_1.StartData) {
                    this.Server_Start(requestData);
                }
                break;
            }
            case "PlayerJoinedRoom": {
                if (requestData instanceof dataTypes_js_1.PlayerJoinedRoomData) {
                    this.Server_PlayerJoinedRoom(requestData);
                }
                break;
            }
            case "PlayerJoinedRoomResponse": {
                if (requestData instanceof dataTypes_js_1.JoinRoomResponse) {
                    this.Server_PlayerJoinedRoomResponse(requestData);
                }
                break;
            }
            case "PlayerLeftRoom": {
                if (requestData instanceof dataTypes_js_1.PlayerLeftRoomData) {
                    this.Server_PlayerLeftRoom(requestData);
                }
                break;
            }
            case "RoomClosed": {
                if (requestData instanceof dataTypes_js_1.RoomClosedData) {
                    this.Server_RoomClosed(requestData);
                }
                break;
            }
            case "GameEnded": {
                if (requestData instanceof dataTypes_js_1.GameEnded) {
                    this.Server_GameEnded(requestData);
                }
                break;
            }
            case "SendMessage": {
                if (requestData instanceof dataTypes_js_1.SendMessageData) {
                    this.Server_SendMessage(requestData);
                }
                break;
            }
            case "UpdatePlayerName": {
                if (requestData instanceof dataTypes_js_1.UpdatePlayerNameData) {
                    this.Server_UpdatePlayerName(requestData);
                }
                break;
            }
            case "JoinGameResponse": {
                if (requestData instanceof dataTypes_js_1.JoinGameRequest) {
                    this.Server_JoinGameResponse(requestData);
                }
                break;
            }
            default: {
                break;
            }
        }
    }
    Server_UpdateLog(data) {
    }
    Server_Start(data) {
        //Load In Players Seed Data
        this.Room.Active = dataTypes_js_1.GameActive.GameRunning;
        //Que Program To Start
    }
    Server_PlayerJoinedRoom(data) {
        if (this.Room != null) {
            this.Room.Players.push(data);
        }
    }
    Server_PlayerJoinedRoomResponse(data) {
        this.Room = new dataTypes_js_1.RoomClient();
        this.Room.Id = data.RoomId;
        this.Room.Spectator = data.Spectator;
        this.Room.Active = data.Active;
        this.Room.Players = data.Players;
    }
    Server_PlayerLeftRoom(data) {
        if (this.Room != null) {
            this.Room.Players = this.Room.Players.filter(e => e.Id != data.Id);
        }
    }
    Server_RoomClosed(data) {
        if (this.Room != null && data.RoomId === this.Room.Id) {
            this.Room = null;
        }
    }
    Server_GameEnded(data) {
        //Pause Game
        //Show Win/Lose
    }
    Server_SendMessage(data) {
        if (this.Room != null && this.Room.Messeages != null) {
            let message = new dataTypes_js_1.Message();
            message.messeage = data.Message;
            message.playerId = data.Id;
            this.Room.Messeages.push(message);
        }
    }
    Server_UpdatePlayerName(data) {
        if (this.Room != null && this.Room.Players != null) {
            let player = this.Room.Players.find(e => e.Id === data.Id);
            if (player != null) {
                player.Name = data.Name;
            }
        }
    }
    Server_JoinGameResponse(data) {
        this.Player.Name = data.Name;
    }
}
exports.ClientApplication = ClientApplication;
//# sourceMappingURL=ClientApplication.js.map