using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        // GET api/values
        [HttpGet]
        public ActionResult<string> HighScores()
        {
            return "";
        }

        [HttpGet]
        public ActionResult<string> Ladder()
        {
            return "";
        }

        [HttpGet]
        public ActionResult<string> Game(int id)
        {
            return "value";
        }

        [HttpGet]
        public ActionResult<string> SubmitRankedGame(string game)
        {
            return "value";
        }

    }
}
