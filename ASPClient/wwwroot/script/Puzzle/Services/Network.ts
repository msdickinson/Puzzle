import {
LogItem, 
JoinGameRequest, LeaveGameRequest, JoinRoomRequest, LeaveRoomRequest, UpdateNameRequest, SendMessageRequest, SendLogRequest
} from '../DataTypes.js'

class Network {
    constructor() {
   
    }

    public ReadRequest(data: string): Object {
        let request = null;
        let requestObject = null;
        if (data.indexOf(":") > -1) {
            request = data.split(":")[0];
            requestObject = data.substring(data.indexOf(":") + 1);
        } else {
            request = data;
        }
        return { Request: request, Data: requestObject }
    }
    public ParseRequest(request: string, data: any) : string {
        return request + ":" + JSON.stringify(data);
    }
    public JoinGame(socket: WebSocket, name: string = null) {
        let data = new JoinGameRequest();
        data.Name = name;
        socket.send(this.ParseRequest("JoinGame", data));
    }
    public LeaveGame(socket: WebSocket, roomId: string = null) {
        let data = new LeaveGameRequest();
        data.RoomId = roomId;
        socket.send(this.ParseRequest("LeaveGame", data));
    }
    public JoinRoom(socket: WebSocket, roomId: string = null) {
        let data = new JoinRoomRequest();
        data.RoomId = roomId;
        socket.send(this.ParseRequest("JoinRoom", data));
    }
    public LeaveRoom(socket: WebSocket, roomId: string = null) {
        let data = new LeaveRoomRequest();
        if (roomId != null){
            data.RoomId = roomId;
            socket.send(this.ParseRequest("LeaveRoom", data));
        }
    }
    public UpdateName(socket: WebSocket, name: string, roomId: string = null) {
        let data = new UpdateNameRequest();

        if (name != null && name.length > 0 && name.length <= 56) {
            data.Name = name;
            data.RoomId = roomId;
            socket.send(this.ParseRequest("UpdateName", data));
        }
    }
    public SendMessage(socket: WebSocket, message: string, roomId: string = null) {
        let data = new SendMessageRequest();
        if (roomId!= null && message != null && message.length > 0 && message.length >= 56) {
            data.Message = message;
            data.RoomId = roomId;
            socket.send(this.ParseRequest("SendMessage", data));
        }
    }
    public SendLog(socket: WebSocket, logItems: LogItem[], roomId: string = null) {
        let data = new SendLogRequest();
        if (roomId != null && logItems.length > 0) {
            data.RoomId = roomId;
            data.LogItems = logItems;
            socket.send(this.ParseRequest("SendLog", data));
        }
    }
}

export { Network };
