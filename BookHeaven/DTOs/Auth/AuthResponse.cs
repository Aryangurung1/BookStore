namespace BookHeaven.DTOs.Auth;

public class AuthResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required string Role { get; set; }
    public required string Token { get; set; }
}
