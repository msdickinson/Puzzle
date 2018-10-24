import {
    LogItem, PuzzleLogState
    
} from './dataTypes.js'
import {
   PuzzleLogic
} from './puzzleLogic'

class PuzzleLoader {

    public MergeLogItems(state: PuzzleLogState, logItems: LogItem[]) {
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
    public AdvanceTicks(puzzle: PuzzleLogic, state: PuzzleLogState, tick: number, useLog: boolean = true) {
        let log;
        if (tick === 0) {
            return;
        }
        else if (useLog) {
            log = state.Log;
            if (tick < 0) {
                if ((state.CurrentTick + tick) < 0) {
                    tick = 0;
                }
                else {
                    tick = state.CurrentTick + tick;
                }
               state.CurrentTick = 0;
               state.currentLogItem = 0;
               state.currentLogItemCount = 0;
            }
        }
        else if (!useLog && puzzle.State.Log && tick < 0) {
            if ((puzzle.State.Ticks.Puzzle + tick) < 0) {
                tick = 0;
            }
            else {
                tick = puzzle.State.Ticks.Puzzle + tick;
            }

            log = JSON.parse(JSON.stringify(puzzle.State.LogItems));

            state.CurrentTick = 0;
            state.currentLogItem = 0;
            state.currentLogItemCount = 0;
        }
        else if (!useLog) {
            for (let i = 0; i < tick; i++) {
                puzzle.Tick();
            }
            return;
        }
        else {
            return;
        }
        let goalTick = state.CurrentTick + tick;
        while (state.CurrentTick != goalTick && log.length != state.currentLogItem) {
            let item = log[state.currentLogItem];

            if (item.Action === "Tick") {
                puzzle.Tick();
                state.CurrentTick++;
                state.currentLogItemCount++;
                if (item.ValueOne == state.currentLogItemCount) {
                    state.currentLogItem++;
                    state.currentLogItemCount = 0;
                }
            }
            else if (item.Action === "RequestMoveSelector") {
                puzzle.RequestMoveSelector(item.ValueOne, item.ValueTwo);
                state.currentLogItem++;
            }
            else if (item.Action === "RequestSwitch") {
                puzzle.RequestSwitch();
                state.currentLogItem++;
            }
            else if (item.Action === "Seed") {
                puzzle.Reset(item.ValueOne);
                state.currentLogItem++;
            }

        };

        if (!useLog) {
            state.CurrentTick = 0;
        }

    }
    public AdvanceToEndOfLog(puzzle: PuzzleLogic, state: PuzzleLogState, startingLogPostion: number) {
      
        let log = state.Log;

        while (log.length != state.currentLogItem) {
            let item = log[state.currentLogItem];

            if (item.Action === "Tick") {
                puzzle.Tick();
                state.CurrentTick++;
                state.currentLogItemCount++;
                if (item.ValueOne == state.currentLogItemCount) {
                    state.currentLogItem++;
                    state.currentLogItemCount = 0;
                }
            }
            else if (item.Action === "RequestMoveSelector") {
                puzzle.RequestMoveSelector(item.ValueOne, item.ValueTwo);
                state.currentLogItem++;
            }
            else if (item.Action === "RequestSwitch") {
                puzzle.RequestSwitch();
                state.currentLogItem++;
            }
            else if (item.Action === "Seed") {
                puzzle.Reset(<any>item.ValueOne);
                state.currentLogItem++;
            }

        };
    }

}

export { PuzzleLoader };