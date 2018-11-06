import {
    LogItem, LogState, LogicState
    
} from '../DataTypes.js'
import {
    Logic
} from './Logic.js'

class Log {

    public MergeLogItems(state: LogState, logItems: LogItem[]) {
        if (logItems.length === 0) {
            return;
        }

        if (state.LogId === -1) {
            state.Log = logItems;
        }
        else if (logItems[0].Id === state.LogId + 1) {
            state.Log.concat(logItems);
            state.LogId = state.Log[state.Log.length - 1].Id;
        }
        else if (logItems[0].Id < state.LogId + 1) {
            state.Log = state.Log.filter(e => e.Id < logItems[0].Id);
            state.Log.concat(logItems);
            state.LogId = state.Log[state.Log.length - 1].Id;
        }

        //Determine Total Ticks;
    }
    public AdvanceTicks(puzzle: Logic, logicState: LogicState, logState: LogState, tick: number, useLog: boolean = true) {
        let log;
        if (tick === 0) {
            return;
        }
        else if (useLog) {
            log = logState.Log;
            if (tick < 0) {
                if ((logState.CurrentTick + tick) < 0) {
                    tick = 0;
                }
                else {
                    tick = logState.CurrentTick + tick;
                }
                logState.CurrentTick = 0;
                logState.currentLogItem = 0;
                logState.currentLogItemCount = 0;
            }
        }
        else if (!useLog && logState.Log && tick < 0) {
            if ((logicState.Ticks.Puzzle + tick) < 0) {
                tick = 0;
            }
            else {
                tick = logicState.Ticks.Puzzle + tick;
            }

            log = JSON.parse(JSON.stringify(logicState.LogItems));

            logState.CurrentTick = 0;
            logState.currentLogItem = 0;
            logState.currentLogItemCount = 0;
        }
        else if (!useLog) {
            for (let i = 0; i < tick; i++) {
                puzzle.Tick(logicState);
            }
            return;
        }
        else {
            return;
        }
        let goalTick = logState.CurrentTick + tick;
        while (logState.CurrentTick != goalTick && log.length != logState.currentLogItem) {
            let item = log[logState.currentLogItem];

            if (item.Action === "Tick") {
                puzzle.Tick(logicState);
                logState.CurrentTick++;
                logState.currentLogItemCount++;
                if (item.ValueOne == logState.currentLogItemCount) {
                    logState.currentLogItem++;
                    logState.currentLogItemCount = 0;
                }
            }
            else if (item.Action === "RequestMoveSelector") {
                puzzle.RequestMoveSelector(logicState, item.ValueOne, item.ValueTwo);
                logState.currentLogItem++;
            }
            else if (item.Action === "RequestSwitch") {
                puzzle.RequestSwitch(logicState);
                logState.currentLogItem++;
            }
            else if (item.Action === "Seed") {
                puzzle.Reset(item.ValueOne);
                logState.currentLogItem++;
            }

        };

        if (!useLog) {
            logState.CurrentTick = 0;
        }

    }
    public AdvanceToEndOfLog(puzzle: Logic, logicState: LogicState, logState: LogState, startingLogPostion: number) {
      
        let log = logState.Log;

        while (log.length != logState.currentLogItem) {
            let item = log[logState.currentLogItem];

            if (item.Action === "Tick") {
                puzzle.Tick(logicState);
                logState.CurrentTick++;
                logState.currentLogItemCount++;
                if (item.ValueOne == logState.currentLogItemCount) {
                    logState.currentLogItem++;
                    logState.currentLogItemCount = 0;
                }
            }
            else if (item.Action === "RequestMoveSelector") {
                puzzle.RequestMoveSelector(logicState, item.ValueOne, item.ValueTwo);
                logState.currentLogItem++;
            }
            else if (item.Action === "RequestSwitch") {
                puzzle.RequestSwitch(logicState);
                logState.currentLogItem++;
            }
            else if (item.Action === "Seed") {
                puzzle.Reset(<any>item.ValueOne);
                logState.currentLogItem++;
            }

        };
    }

}

export { Log };