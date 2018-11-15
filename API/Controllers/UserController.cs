using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Threading.Tasks;
using API.Model;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.Extensions.Configuration;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {

        PuzzleContext dbContext = new PuzzleContext();
        [AllowAnonymous]
        [HttpPost("Login")]
        public ActionResult Login([FromBody]Login login)
        {
            if (dbContext.User.Any(e => e.Email == login.Email))
            {
                User user = dbContext.User.First(e => e.Email == login.Email);
                if (PasswordHasher.Compare(user.Password, login.Password, user.Salt))
                {
                    Request.HttpContext.Response.Headers.Add("Authentication", JwtBearerDefaults.AuthenticationScheme + " " + TokenService.GenerateToken(user));
                    return StatusCode((int)HttpStatusCode.OK);
                }
                else
                {
                    return StatusCode((int)HttpStatusCode.Unauthorized);
                }
            }
            else
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            //return StatusCode((int)HttpStatusCode.ServiceUnavailable);
        }

        [AllowAnonymous]
        [HttpPost("CreateAccount")]
        public ActionResult CreateAccount(CreateAccount createAccount)
        {
            try
            {
                if (!dbContext.User.Any(e => e.Email == createAccount.Email || e.Username == createAccount.Username))
                {
                    var result = PasswordHasher.Hash(createAccount.Password);

                    User user = new User();
                    user.CreatedDatetime = DateTime.Now;
                    user.Email = createAccount.Email;
                    user.Username = createAccount.Username;
                    user.Password = result.password;
                    user.Salt = result.salt;

                    dbContext.User.Add(user);

                    dbContext.SaveChanges();
                    return StatusCode((int)HttpStatusCode.OK);
                }
                else
                {
                    if (dbContext.User.Any(e => e.Email == createAccount.Email))
                    {
                        Request.HttpContext.Response.StatusCode = (int)HttpStatusCode.Conflict;
                        return Content("Email");
                    }
                    else
                    {
                        Request.HttpContext.Response.StatusCode = (int)HttpStatusCode.Conflict;
                        return Content("Username");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode((int)HttpStatusCode.ServiceUnavailable);
            }

        }

        [HttpPost("UpdateUserName")]
        public ActionResult UpdateUserName([FromBody]string username)
        {
            int id = Convert.ToInt32(HttpContext.User.Claims.Where(e => e.Type == "Id").First().Value);
            if (String.IsNullOrWhiteSpace(username))
            {
                return StatusCode((int)HttpStatusCode.BadRequest);
            }
            else if (dbContext.User.Any(e => e.Username == username && e.Id != id))
            {
                return StatusCode((int)HttpStatusCode.Conflict);
            }
            else
            {
                dbContext.User.First(e => e.Id == id).Username = username;
                dbContext.SaveChanges();
                return StatusCode((int)HttpStatusCode.OK);
            }
        }

        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public async Task<ActionResult<bool>> ForgotPassword([FromBody]string email)
        {
            if (!dbContext.User.Any(e => e.Username == email))
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }
            else
            {
                if (dbContext.User.Any(e => e.Email == email))
                {
                    User user = dbContext.User.First(e => e.Email == email);
                    if (dbContext.ResetPassword.Any(e => e.UserId == user.Id))
                    {
                        ResetPassword resetPassword = dbContext.ResetPassword.First(e => e.UserId == user.Id);
                        resetPassword.Key = RandomNumberGenerator.Create().ToString();
                        resetPassword.CreatedDatetime = DateTime.Now;
                        dbContext.SaveChanges();
                    }
                    else
                    {
                        ResetPassword resetPassword = new ResetPassword();
                        resetPassword.UserId = user.Id;
                        resetPassword.Key = RandomNumberGenerator.Create().ToString();
                        resetPassword.CreatedDatetime = DateTime.Now;
                        dbContext.ResetPassword.Add(resetPassword);
                        dbContext.SaveChanges();
                    }

                    var apiKey = "";
                    var client = new SendGridClient(apiKey);
                    var from = new EmailAddress("noreply@puzzleJS.com", "PuzzleJS");
                    var subject = "Dickinsonbros Password Reset";
                    var to = new EmailAddress(email, user.Username);
                    var htmlContent = "<a>Reset Password</a>";
                    var msg = MailHelper.CreateSingleEmail(from, to, subject, "", htmlContent);
                    var response = await client.SendEmailAsync(msg);
                    return response.StatusCode == System.Net.HttpStatusCode.Accepted;

                }
                return StatusCode((int)HttpStatusCode.OK);
            }
        }

    }
    

    public class Login
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
    public class CreateAccount
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }
    public class UploadGame
    {
        public Game Game { get; set; }
        public string Key { get; set; }
        public string Password { get; set; }
    }
}
