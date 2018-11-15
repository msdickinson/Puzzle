using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace API.Model
{
    public partial class PuzzleContext : DbContext
    {
        public PuzzleContext()
        {
        }

        public PuzzleContext(DbContextOptions<PuzzleContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Freinds> Freinds { get; set; }
        public virtual DbSet<Game> Game { get; set; }
        public virtual DbSet<ResetPassword> ResetPassword { get; set; }
        public virtual DbSet<User> User { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(AppSettings.DatabaseConnection);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Freinds>(entity =>
            {
                entity.Property(e => e.Id).ValueGeneratedNever();
            });

            modelBuilder.Entity<Game>(entity =>
            {
                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.Property(e => e.LengthOfGame).HasColumnName("lengthOfGame");

                entity.Property(e => e.PlayerOneGame)
                    .IsRequired()
                    .HasColumnName("playerOneGame")
                    .IsUnicode(false);

                entity.Property(e => e.PlayerTwoGame)
                    .HasColumnName("playerTwoGame")
                    .IsUnicode(false);

                entity.Property(e => e.Ranked).HasColumnName("ranked");

                entity.Property(e => e.Single).HasColumnName("single");

                entity.Property(e => e.UserIdOne).HasColumnName("userIdOne");

                entity.Property(e => e.UserIdTwo).HasColumnName("userIdTwo");

                entity.Property(e => e.UserOneScore)
                    .IsRequired()
                    .HasColumnName("userOneScore")
                    .IsUnicode(false);

                entity.Property(e => e.UserTwoScore)
                    .HasColumnName("userTwoScore")
                    .IsUnicode(false);
            });

            modelBuilder.Entity<ResetPassword>(entity =>
            {
                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.Property(e => e.CreatedDatetime)
                    .HasColumnName("createdDatetime")
                    .HasColumnType("datetime");

                entity.Property(e => e.Key)
                    .IsRequired()
                    .HasColumnName("key")
                    .IsUnicode(false);

                entity.Property(e => e.UserId).HasColumnName("userId");
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Id).ValueGeneratedNever();

                entity.Property(e => e.CreatedDatetime)
                    .HasColumnName("createdDatetime")
                    .HasColumnType("datetime");

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasColumnName("email")
                    .IsUnicode(false);

                entity.Property(e => e.Password)
                    .IsRequired()
                    .HasColumnName("password")
                    .IsUnicode(false);

                entity.Property(e => e.Salt)
                    .IsRequired()
                    .HasColumnName("salt");

                entity.Property(e => e.Username)
                    .IsRequired()
                    .HasColumnName("username")
                    .IsUnicode(false);
            });
        }
    }
}
