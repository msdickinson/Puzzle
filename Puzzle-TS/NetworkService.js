"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataTypes_js_1 = require("./dataTypes.js");
class NetworkService {
    constructor() {
    }
    ReadRequest(data) {
        let request = null;
        let requestObject = null;
        if (data.indexOf(":") > -1) {
            request = data.split(":")[0];
            requestObject = data.substring(data.indexOf(":") + 1);
        }
        else {
            request = data;
        }
        return { Request: request, Data: requestObject };
    }
    ParseRequest(request, data) {
        return request + ":" + JSON.stringify(data);
    }
    JoinGame(socket, name = null) {
        let data = new dataTypes_js_1.JoinGameRequest();
        data.Name = name;
        socket.send(this.ParseRequest("JoinGame", data));
    }
    LeaveGame(socket, roomId = null) {
        let data = new dataTypes_js_1.LeaveGameRequest();
        data.RoomId = roomId;
        socket.send(this.ParseRequest("LeaveGame", data));
    }
    JoinRoom(socket, roomId = null) {
        let data = new dataTypes_js_1.JoinRoomRequest();
        data.RoomId = roomId;
        socket.send(this.ParseRequest("JoinRoom", data));
    }
    LeaveRoom(socket, roomId = null) {
        let data = new dataTypes_js_1.LeaveRoomRequest();
        if (roomId != null) {
            data.RoomId = roomId;
            socket.send(this.ParseRequest("LeaveRoom", data));
        }
    }
    UpdateName(socket, name, roomId = null) {
        let data = new dataTypes_js_1.UpdateNameRequest();
        if (name != null && name.length > 0 && name.length <= 56) {
            data.Name = name;
            data.RoomId = roomId;
            socket.send(this.ParseRequest("UpdateName", data));
        }
    }
    SendMessage(socket, message, roomId = null) {
        let data = new dataTypes_js_1.SendMessageRequest();
        if (roomId != null && message != null && message.length > 0 && message.length >= 56) {
            data.Message = message;
            data.RoomId = roomId;
            socket.send(this.ParseRequest("SendMessage", data));
        }
    }
    SendLog(socket, logItems, roomId = null) {
        let data = new dataTypes_js_1.SendLogRequest();
        if (roomId != null && logItems.length > 0) {
            data.RoomId = roomId;
            data.LogItems = logItems;
            socket.send(this.ParseRequest("SendLog", data));
        }
    }
}
exports.NetworkService = NetworkService;
//# sourceMappingURL=NetworkService.js.map