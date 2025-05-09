using BookHeaven.Models;
using Microsoft.EntityFrameworkCore;

namespace BookHeaven.Data;

public static class DbSeeder
{
    public static async Task SeedData(AppDbContext context)
    {
        // Check if any admin exists
        var adminExists = await context.Admins.AnyAsync();
        
        if (!adminExists)
        {
            // Create admin user with properly hashed password
            var admin = new Admin
            {
                Email = "admin@bookheaven.com",
                FullName = "System Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234", BCrypt.Net.BCrypt.GenerateSalt(12))
            };

            await context.Admins.AddAsync(admin);
            await context.SaveChangesAsync();
        }
        else
        {
            // Update existing admin's password if needed
            var admin = await context.Admins.FirstOrDefaultAsync();
            if (admin != null)
            {
                admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234", BCrypt.Net.BCrypt.GenerateSalt(12));
                await context.SaveChangesAsync();
            }
        }
    }
} 