using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        PuzzleContext dbContext = new PuzzleContext();

        [AllowAnonymous]
        [HttpPost("UploadGame")]
        public void UploadGame(UploadGame uploadGame)
        {
            if (uploadGame.Key == "")
            {
                dbContext.Game.Add(uploadGame.Game);
                dbContext.SaveChanges();
            }
        }
    }
}
