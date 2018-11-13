using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        [HttpPost]
        public ActionResult<string> Login([FromBody] string username, [FromBody] string password)
        {
            return "value";
        }
        [HttpPost]
        public void UpdateUserName([FromBody] string username)
        {
        }
        [HttpPost]
        public void ForgotPassword([FromBody] string username)
        {
        }
        [HttpPost]
        public void UploadGame([FromBody] string game)
        {

        }
        [HttpPost]
        public void AddFreind([FromBody] string game)
        {

        }
        [HttpPost]
        public void RemoveFreind([FromBody] string game)
        {

        }
        [HttpPost]
        public void ViewProfile([FromBody] string game)
        {

        }
    }
}
