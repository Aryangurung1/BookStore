using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BookHeaven.Data;
using BookHeaven.DTOs.Auth;
using BookHeaven.Models;
using BookHeaven.Services.Interfaces;

namespace BookHeaven.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<string> LoginAsync(LoginDto dto)
        {
            var member = await _context.Members.FirstOrDefaultAsync(m => m.Email == dto.Email);
            if (member != null && BCrypt.Net.BCrypt.Verify(dto.Password, member.PasswordHash))
            {
                var token = GenerateJwtToken(member.Email, member.FullName, "Member", member.MemberId);
                return token;
            }

            var admin = await _context.Admins.FirstOrDefaultAsync(a => a.Email == dto.Email);
            if (admin != null && BCrypt.Net.BCrypt.Verify(dto.Password, admin.PasswordHash))
            {
                var token = GenerateJwtToken(admin.Email, admin.FullName, "Admin");
                return token;
            }

            var staff = await _context.Staffs.FirstOrDefaultAsync(s => s.Email == dto.Email);
            if (staff != null && BCrypt.Net.BCrypt.Verify(dto.Password, staff.PasswordHash))
            {
                var token = GenerateJwtToken(staff.Email, staff.FullName, "Staff", staff.StaffId);
                return token;
            }

            throw new Exception("Invalid email or password");
        }

        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (await _context.Members.AnyAsync(m => m.Email == dto.Email) ||
                await _context.Staffs.AnyAsync(s => s.Email == dto.Email) ||
                await _context.Admins.AnyAsync(a => a.Email == dto.Email))
            {
                throw new Exception("Email already exists");
            }

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            switch (dto.Role.ToLower())
            {
                case "member":
                    var member = new Member
                    {
                        Email = dto.Email,
                        FullName = dto.FullName,
                        PasswordHash = hashedPassword,
                        MembershipId = Guid.NewGuid().ToString()
                    };
                    _context.Members.Add(member);
                    break;

                case "admin":
                    var admin = new Admin
                    {
                        Email = dto.Email,
                        FullName = dto.FullName,
                        PasswordHash = hashedPassword
                    };
                    _context.Admins.Add(admin);
                    break;

                case "staff":
                    var staff = new Staff
                    {
                        Email = dto.Email,
                        FullName = dto.FullName,
                        PasswordHash = hashedPassword,
                        Position = "New Staff"
                    };
                    _context.Staffs.Add(staff);
                    break;

                default:
                    throw new Exception("Invalid role specified");
            }

            await _context.SaveChangesAsync();
            return "Registration successful";
        }

        private string GenerateJwtToken(string email, string fullName, string role, int? memberOrStaffId = null)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT Secret Key is not configured"));
            var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer is not configured");
            var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience is not configured");

            var tokenHandler = new JwtSecurityTokenHandler();
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Name, fullName),
                new Claim(ClaimTypes.Role, role)
            };
            if ((role == "Member" || role == "Staff") && memberOrStaffId.HasValue)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, memberOrStaffId.Value.ToString()));
            }
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = issuer,
                Audience = audience
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
