using System;
using System.Collections.Generic;

namespace API.Model
{
    public partial class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public DateTime CreatedDatetime { get; set; }
        public string Password { get; set; }
        public byte[] Salt { get; set; }
    }
}
