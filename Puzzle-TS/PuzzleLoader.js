"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PuzzleLoader {
    MergeLogItems(state, logItems) {
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
    AdvanceTicks(puzzle, state, tick, useLog = true) {
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
        }
        ;
        if (!useLog) {
            state.CurrentTick = 0;
        }
    }
    AdvanceToEndOfLog(puzzle, state, startingLogPostion) {
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
                puzzle.Reset(item.ValueOne);
                state.currentLogItem++;
            }
        }
        ;
    }
}
exports.PuzzleLoader = PuzzleLoader;
//# sourceMappingURL=PuzzleLoader.js.map