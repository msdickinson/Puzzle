using System;
using Puzzle;
using System.Diagnostics;
namespace Console
{
    class Program
    {
        static void Main(string[] args)
        {
            Stopwatch sw = new Stopwatch();

       
            Game game = new Game(200, false);

            sw.Start();
            //game.RequestSwitch(0, 3);
            for (int i = 0; i < (60 * 180); i++)
            {
                game.Tick();
                game.RequestSwitch(0, 0);
            }
            sw.Stop();
            System.Console.WriteLine("Console={0}", sw.Elapsed);

            sw.Start();
            var data = File.Read(@"C:\Users\mdickinson\Desktop\Learning Projects\Puzzle\Logs\log_1538431432.json");
            sw.Stop();
            System.Console.WriteLine("Read + Parse={0}", sw.Elapsed);
            sw.Reset();

            sw.Start();
            File.Replay(game, data);
            sw.Stop();
            System.Console.WriteLine("Run Game={0}", sw.Elapsed);
        }
    }
}
