using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace Puzzle
{
    public static class File
    {
        public static void Write(string filePath, List<LogItem> objects)
        {
            string json = JsonConvert.SerializeObject(objects.ToArray());
            String timeStamp = new DateTimeOffset(DateTime.UtcNow).ToUnixTimeSeconds().ToString();
            System.IO.File.WriteAllText(filePath + @"\log_"+ timeStamp + ".json", json);
        }
        public static List<LogItem> Read(string path)
        {
            string json = System.IO.File.ReadAllText(path);
            return Parse(json);
        }
        public static List<LogItem> Parse(string json)
        {
            List<LogItem> logItems = new List<LogItem>();
            dynamic dynJson = JsonConvert.DeserializeObject(json);
            foreach (var item in dynJson)
            {
                if (item.Type == "Ticks")
                {
                    logItems.Add(new Ticks((int)item.Count));
                }
                else if (item.Type == "RequestSwitch")
                {
                    logItems.Add(new RequestSwitch((int)item.Row, (int)item.Col));
                }
                if (item.Type == "Pause")
                {
                    logItems.Add(new Pause());
                }
                if (item.Type == "Reset")
                {
                    logItems.Add(new Reset((int)item.Seed));
                }
            }
            return logItems;
        }
        public static void Replay(Game game, List<LogItem> logItems)
        {
            foreach(LogItem item in logItems)
            {
                if(item is Ticks)
                {
                    Ticks tick = (Ticks)item;
                    for(int i = 0; i < tick.Count; i++)
                    {
                        game.Tick();
                    }
                }
                else if (item is RequestSwitch)
                {
                    RequestSwitch requestSwitch = (RequestSwitch)item;
                    game.RequestSwitch(requestSwitch.Col, requestSwitch.Row);
                }
                else if (item is Reset)
                {
                    Reset reset = (Reset)item;
                    game.Reset(reset.Seed);
                }
                else if (item is RequestSwitch Pause)
                {
                    Pause pause = (Pause)item;
                    //No Pause Function Exist
                }
            }
        }
    }
    public class Ticks : LogItem
    {
        public Ticks(int Count)
        {
            this.Count = Count;
        }
        public new string Type = "Ticks";
        public int Count;
    }
    public class RequestSwitch : LogItem
    {
        public RequestSwitch(int row, int col)
        {
            this.Type = "RequestSwitch";
            this.Row = row;
            this.Col = col;
        }
        public int Row;
        public int Col;
    }
    public class Pause : LogItem
    {
        public Pause()
        {
            this.Type = "Pause";
        }
    }
    public class Reset : LogItem
    {
        public Reset(int seed)
        {
            this.Type = "Reset";
            this.Seed = seed;
        }
        public int Seed;
    }
    public class LogItem
    {
        public string Type;
    }


}
