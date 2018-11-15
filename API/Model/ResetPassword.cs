using System;
using System.Collections.Generic;

namespace API.Model
{
    public partial class ResetPassword
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedDatetime { get; set; }
        public string Key { get; set; }
    }
}
