using System;
using System.Collections.Generic;

namespace API.Model
{
    public partial class Game
    {
        public int Id { get; set; }
        public TimeSpan LengthOfGame { get; set; }
        public bool Single { get; set; }
        public int UserIdOne { get; set; }
        public int? UserIdTwo { get; set; }
        public string UserOneScore { get; set; }
        public string UserTwoScore { get; set; }
        public string PlayerOneGame { get; set; }
        public string PlayerTwoGame { get; set; }
        public bool Ranked { get; set; }
    }
}
